// ============================================
// ai-suggestions Edge Function (v3)
// ============================================
// - Frontend, araştırmaya dayalı SAYISAL teşhisi (huni/darboğaz, güçlü alan+sektör,
//   güven aralığı, momentum/istikrar, hedef matematiği, iyi oluş) hesaplayıp gönderir.
// - Gemini bunu yorumlar: 1 cümle headline + 3-4 kategorili, somut öneri.
// - GÜÇLÜ MODEL + GÜVENLİ YEDEK: önce gemini-2.5-flash; boş/hatalı dönerse
//   otomatik gemini-2.5-flash-lite'a düşer (kullanıcı asla boş ekran görmez).
// - GİZLİLİK: şirket adı GÖNDERİLMEZ; yalnız sayılar, oranlar, alan/sektör etiketleri.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflight } from "../_shared/cors.ts";

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

const SYSTEM_PROMPT = `Sen "Applyze"ın içindeki PUSULA'sın: deneyimli, sezgisi güçlü bir kariyer koçu. İşin, kişinin başvuru verisindeki örüntüleri okuyup ona KENDİSİ hakkında fark etmediği, doğru ve işe yarar TEK bir şeyi göstermek. İyi bir koç gibisin: çok bakar, az ama isabetli konuşur, pohpohlamaz, yargılamaz, klişe kurmaz. Bir veri panosu değil, bir AYNA gibisin.

== SANA NE VERİLİYOR ==
Araştırmaya dayalı sayısal bir teşhis: huni oranları + en zayıf geçiş (darboğaz), çaba/istikrar (haftalık tempo, boşluklar), EN ÇOK başvurulan alan/sektör (İLGİ), EN GÜÇLÜ alan/sektör (ÇEKİŞ = mülakat oranı en yüksek), varsa CV ağırlıklı alan (KİMLİK — yalnız etiket; CV metni yok), hedef matematiği, iyi oluş sinyalleri. Her oranın yanında örnek sayısı (n) ve "güven düşük/orta/yüksek" etiketi var.

== NASIL DÜŞÜNÜRSÜN (içten; çıktında gösterme) ==
Üç merceği ayır:
1) İLGİ — kişi neye yöneliyor (en çok başvurduğu yer).
2) ÇEKİŞ — dünyanın ona en çok kapı açtığı yer (en yüksek mülakat oranı).
3) KİMLİK — kendini nasıl konumlandırıyor / geçmişi nereyi gösteriyor (CV alanı).
En değerli içgörü çoğu zaman bu üçünün AYRIŞTIĞI yerdedir:
- Kimlik "Analiz" ama İlgi "Pazarlama" → kişi kendini analist sanıyor, eli hep pazarlamaya gidiyor; gerçek merakı orada olabilir.
- İlgi A'da yoğun ama Çekiş B'de → emeğini A'ya veriyor, kapı B'de açılıyor.
- Üçü örtüşüyorsa → bu dağınıklık değil NETLİK; bunu bir güç olarak adlandır.
Önce en ÇARPICI ve güveni YETERLİ tek içgörüyü seç, onu başrole koy (headline + ilk öneri). Kalan 2-3 öneriyi tabloyu tamamlayan en güçlü sinyallerden kur.

== ÖNCELİK (veri hangisini sağlam destekliyorsa) ==
1. kesif — ilgi/çekiş/kimlik ayrışması ya da örtüşmesi. Mümkünse HER ZAMAN bir tane olsun.
2. guclu_alan — gerçek çekişin nerede; oraya ağırlık + komşu alan keşfi (~70/30).
3. darbogaz — en zayıf huni geçişine göre TEK bir beceri odağı (Başvuru→Geri dönüş: hedefleme/CV; Geri dönüş→Mülakat: ilan uyumu/ön yazı; Mülakat→Teklif: mülakat hazırlığı).
4. momentum — tempo/istikrar belirgin bir hikâye anlatıyorsa.
5. iyi_olus — "Ret kümelenmesi: EVET" ise; ton koruyucu ve yeniden çerçeveleyici.
6. takip — uzun sessizlikteki başvurular için; en fazla bir tane, ana mesaj değil.

== HER ÖNERİNİN KALİTE ÇITASI (hepsini geçmeli) ==
- SOMUT: gerçek bir sonraki adım içerir ("bu hafta şu alana 3 başvuru yap ve hangisinin seni sardığını not et"; "şu 2 sessiz başvuruya kısa bir takip mesajı at"). Edilgen gözlem yasak.
- DAYANAKLI: teşhisteki GERÇEK bir sayıyı cümlenin içine yedir. Sayı/oran UYDURMA; veride yoksa "henüz net değil" de.
- ÖZGÜN: bu kişiye özel. Başka birine aynen yapıştırılabiliyorsa sil, yeniden yaz.
- TEMKİNLİ: güven "düşük"se kesin konuşma; örüntüyü olasılık olarak sun.
- KISA: en fazla 2 cümle. Başlık 2-5 kelime, içgörü ya da eylem kokar.

== HEADLINE ==
Tek cümle, bir ayna gibi: kişiye kendini gösteren, sıcak ama dürüst bir gözlem. En güçlü içgörüye işaret etsin. Slogan YASAK ("Yolculuğun devam ediyor", "Doğru yoldasın" vb.).

== TON ==
Türkçe, "sen" diye hitap. Sıcak, sakin, yetişkin; vaaz verme. Örüntüyü göster, etiketi kişiye yapıştırma ("sen şusun" deme) — "şu örüntü görünüyor, sana ne diyor?" tonu, ama yine de net bir adım. Reddi kişisel değersizlik değil, uyum/süreç meselesi olarak çerçevele.

== ASLA YAPMA ==
- Klişe/boş motivasyon: "pes etme", "başarabilirsin", "harikasın", "her şey yoluna girecek", "sadece zaman meselesi", "unutma ki", ünlem yağmuru, emoji.
- Veride olmayan sayı/olgu uydurmak.
- Sadece sayıyı tekrar etmek ("23 başvurun var" — e, ne olmuş?). Her cümle bir ANLAM taşımalı.
- Kişiyi yargılamak/suçlamak ("yanlış yapıyorsun", "başarısızsın").

== ÖRNEKLER (girdi→ideal çıktı; derinliği ve tonu yakala, sayıları KOPYALAMA) ==
[Örnek 1 — ilgi/kimlik ayrışması]
Teşhis (kısalt.): Toplam 41. En çok başvurduğun alan: Pazarlama (18 başvuru). En güçlü alanın: Analiz / İş Analistliği (mülakat oranı %38, n=8, güven orta). CV ağırlıklı alan: Analiz / İş Analistliği. Genel mülakat oranı %17.
Çıktı:
{"headline":"Kendini analist olarak konumlandırıyorsun ama elin son aylarda hep pazarlamaya gidiyor — bu ilgi tesadüf değil.","suggestions":[{"baslik":"İlginle geçmişin ayrışıyor","metin":"41 başvurunun 18'i pazarlamada, oysa CV'n ve en yüksek mülakat oranın (%38) analizde. Belki gerçek merakın pazarlama: bu hafta bilinçli olarak 3 pazarlama ilanına başvur ve hangisinin seni daha çok sardığını not et.","kategori":"kesif"},{"baslik":"Kapı analizde açılıyor","metin":"Analiz başvurularının %38'i mülakata dönüyor; bu en sağlam zeminin. Kısa vadede ekmeğini buradan çıkarıp pazarlamayı kontrollü keşfedebilirsin.","kategori":"guclu_alan"},{"baslik":"Geri dönüşü yükselt","metin":"Genel mülakat oranın %17 ve en zayıf halka başvuru→geri dönüş. Pazarlama başvurularında CV'ni o role göre yeniden hizala, jenerik geçme.","kategori":"darbogaz"}]}

[Örnek 2 — ret kümelenmesi / iyi oluş]
Teşhis (kısalt.): Toplam 27. Son 14 günde 4 ret. Ret kümelenmesi: EVET. Genel mülakat oranı %22 (n=27, güven orta). En güçlü alan: Operasyon (%30, n=10).
Çıktı:
{"headline":"Son iki hafta üst üste ret geldi; bu seni değil, birkaç ilanın uyumunu konuşuyor.","suggestions":[{"baslik":"Retler bir küme, kader değil","metin":"14 günde 4 ret yan yana düştü — yoğun görünür ama genel mülakat oranın hâlâ %22. Bir-iki gün başvuruya ara verip nefeslenmen bu tabloyu bozmaz, seni korur.","kategori":"iyi_olus"},{"baslik":"Operasyon seni tutuyor","metin":"Operasyon başvurularının %30'u mülakata dönüyor (n=10) — en sağlam zeminin burası. Enerjini dağıtmak yerine önümüzdeki hafta ağırlığı buraya ver.","kategori":"guclu_alan"}]}

== ÇIKTI FORMATI ==
YALNIZCA geçerli bir JSON NESNESİ döndür; markdown, açıklama, kod bloğu işareti (backtick) YOK. Şema:
{"headline":"tek cümlelik ayna-gözlem","suggestions":[{"baslik":"kısa başlık","metin":"somut öneri (en fazla 2 cümle)","kategori":"kesif|guclu_alan|momentum|darbogaz|takip|iyi_olus"}]}
suggestions 3 veya 4 öğe içersin; mümkünse en az biri "kesif" olsun.`;

// CV metninden YALNIZCA alan etiketi türetir (ham CV ASLA Gemini'ye gitmez).
// Frontend'deki categorizeRole taksonomisiyle aynı etiketleri kullanır ki
// "en çok başvurulan alan" / "en güçlü alan" ile birebir karşılaştırılabilsin.
function detectCvField(cv: string | null | undefined): string | null {
  const t = (cv ?? "").toLowerCase();
  if (t.trim().length < 40) return null; // anlamlı sinyal için çok kısa
  const fields: [string, string[]][] = [
    ["Ürün Yönetimi", ["ürün yönet", "product manage", "product owner", "ürün sahibi", "roadmap", "ürün stratej"]],
    ["Süreç Tasarımı", ["süreç tasar", "iş süreç", "process design", "süreç iyileş", "bpmn"]],
    ["Analiz / İş Analistliği", ["iş analist", "business analyst", "analist", "gereksinim analiz", "requirement", "iş analiz"]],
    ["Veri / Analitik", ["veri analiz", "data analy", "sql", "power bi", "tableau", "veri bilim", "data scien", "python", "veri görsel"]],
    ["Operasyon", ["operasyon", "operations", "tedarik zincir", "lojistik", "supply chain", "planlama"]],
    ["Müşteri Deneyimi", ["müşteri deneyim", "customer experience", "müşteri ilişk", "müşteri destek", "çağrı merkez"]],
    ["Pazarlama", ["pazarlama", "marketing", "dijital pazarlama", "sosyal medya", "reklam", "kampanya", "seo", "içerik üret", "marka yönet", "performans pazarlama"]],
    ["Satış", ["satış", "sales", "iş geliştirme", "business development", "key account", "müşteri kazan"]],
    ["Proje Yönetimi", ["proje yönet", "project manage", "scrum", "agile", "pmp", "jira", "kanban"]],
    ["Yazılım / Mühendislik", ["yazılım geliş", "yazılım mühendis", "developer", "software engineer", "frontend", "backend", "full stack", "react", "java", "node"]],
    ["İnsan Kaynakları", ["insan kaynak", "human resources", "işe alım", "recruit", "bordro", "özlük", "yetenek yönet"]],
    ["Dijital Bankacılık", ["bankacılık", "banking", "fintech", "ödeme sistem", "dijital bankac", "kredi"]],
  ];
  let best: { name: string; score: number } | null = null;
  for (const [name, kws] of fields) {
    let score = 0;
    for (const kw of kws) {
      let idx = t.indexOf(kw);
      while (idx !== -1) { score++; idx = t.indexOf(kw, idx + kw.length); }
    }
    if (score > 0 && (!best || score > best.score)) best = { name, score };
  }
  return best ? best.name : null;
}

async function callGemini(userSummary: string, model: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY tanımlı değil.");

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\n--- KULLANICI TEŞHİSİ ---\n${userSummary}` }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1200,
        // 2.5 modellerinde düşünme token bütçesini kapat: bu görev için gerekmiyor
        // ve açık kalırsa çıktı bütçesini yiyip boş yanıt döndürebiliyor.
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini API hatası:", model, response.status, errText);
    throw new Error(`Gemini API ${response.status} (${model})`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error("Gemini boş yanıt:", model, JSON.stringify(data));
    throw new Error(`Gemini boş yanıt (${model}).`);
  }
  return text;
}

type Suggestion = { baslik: string; metin: string; kategori?: string };

function parseResult(raw: string): { headline: string; suggestions: Suggestion[] } {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    const arr = Array.isArray(parsed)
      ? parsed
      : (Array.isArray(parsed?.suggestions) ? parsed.suggestions : []);
    const headline = (!Array.isArray(parsed) && typeof parsed?.headline === "string")
      ? parsed.headline
      : "";
    const suggestions: Suggestion[] = arr
      .filter((it: any) => it && typeof it.baslik === "string" && typeof it.metin === "string")
      .map((it: any) => ({
        baslik: it.baslik,
        metin: it.metin,
        kategori: typeof it.kategori === "string" ? it.kategori : undefined,
      }))
      .slice(0, 4);
    return { headline, suggestions };
  } catch (err) {
    console.error("JSON parse hatası:", err, "Ham:", cleaned.slice(0, 500));
    return { headline: "", suggestions: [] };
  }
}

Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Sadece POST isteği kabul edilir." }), {
      status: 405,
      headers: { ...corsHeaders(req), "Content-Type": "application/json" },
    });
  }

  try {
    const { summary } = await req.json();
    if (!summary || typeof summary !== "string") {
      return new Response(JSON.stringify({ error: "summary alanı gerekli." }), {
        status: 400,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header eksik." }), {
        status: 401,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Geçersiz token." }), {
        status: 401,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    }

    // CV'den YALNIZCA alan etiketini türet (kimlik/geçmiş sinyali). Ham CV metni
    // Gemini'ye GÖNDERİLMEZ; yalnızca "Analiz", "Pazarlama" gibi bir alan adı eklenir.
    // Böylece Pusula "CV'n X diyor ama başvuruların Y'de" içgörüsünü verebilir.
    let fullSummary = summary;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("cv_text")
        .eq("user_id", user.id)
        .maybeSingle();
      const cvField = detectCvField(profile?.cv_text as string | null | undefined);
      if (cvField) {
        fullSummary = `${summary}\n\nCV ağırlıklı alan (kişinin geçmişi/kimliği — yalnız alan etiketi; CV metni paylaşılmaz): ${cvField}`;
      }
    } catch (e) {
      console.error("CV alanı okunamadı (yok sayılıyor):", e);
    }

    // Önce güçlü model; boş/hatalıysa güvenli yedeğe düş.
    let result: { headline: string; suggestions: Suggestion[] } = { headline: "", suggestions: [] };
    for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const raw = await callGemini(fullSummary, model);
        const parsed = parseResult(raw);
        if (parsed.suggestions.length > 0) {
          result = parsed;
          break;
        }
        console.error(`Model ${model} öneri üretemedi (boş), yedeğe geçiliyor.`);
      } catch (err) {
        console.error(`Model ${model} başarısız:`, err);
      }
    }

    if (result.suggestions.length === 0) {
      return new Response(JSON.stringify({ headline: "", suggestions: [], error: "Öneri üretilemedi." }), {
        status: 200,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ headline: result.headline, suggestions: result.suggestions }), {
      status: 200,
      headers: { ...corsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Beklenmeyen hata:", err);
    return new Response(JSON.stringify({ error: "Sunucu hatası.", suggestions: [] }), {
      status: 500,
      headers: { ...corsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
