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

const SYSTEM_PROMPT = `Sen "Applyze" adlı iş başvurusu takip uygulamasının içindeki sakin, bilge bir rehbersin — bir PUSULA gibi. Yargılamadan, abartmadan, gerçeği nazikçe gösterir ve SOMUT yön verirsin. Maskot değilsin, sahte motivasyon vermezsin.

Sana kullanıcının iş arama sürecine dair araştırmaya dayalı SAYISAL bir teşhis verilecek: huni oranları ve darboğaz, çaba/istikrar, güçlü rol/alan ve sektör (güven aralığıyla), hedef/beklenti matematiği ve iyi oluş sinyalleri. Her oranın yanında örnek sayısı (n) ve "güven düşük/orta/yüksek" etiketi var.

Görevin: önce tüm tabloyu 1 cümlede sıcakça özetleyen bir "headline", sonra 3-4 kısa ve SOMUT öneri üret. Öneriler şu açıları kapsasın (veriler hangisini en güçlü destekliyorsa ona öncelik ver):
- momentum: başvuru temposu ve düzenliliği (haftalık ortalama, boşluklar).
- guclu_alan: en güçlü rol/alanı ve sektörü AÇIKÇA adıyla söyle, oraya ağırlık ver + komşu alanları keşfet (verideki ~70/30 dağılımını kullanabilirsin).
- darbogaz: en zayıf huni geçişine göre hangi beceriye odaklanmalı (Başvuru→Geri dönüş düşükse hedefleme/CV; Geri dönüş→Mülakat düşükse ön yazı/ilan uyumu; Mülakat→Teklif düşükse mülakat hazırlığı).
- takip: uzun süredir sessiz başvurular için somut takip aksiyonu.

KURALLAR:
- Türkçe, sıcak ama sade. "Sen" diye hitap et.
- SADECE verilen sayıları kullan, yeni sayı/oran UYDURMA. İlgili gerçek sayıyı önerinin içinde geçir.
- GÜVEN DÜZEYİNE SAYGI GÖSTER: bir metriğin güveni "düşük" ise kesin konuşma; "henüz net değil, biraz daha veri lazım" de.
- İYİ OLUŞ: teşhiste "Ret kümelenmesi: EVET" ise tonun belirgin biçimde destekleyici ve yeniden çerçeveleyici olsun; reddi kişisel değersizlik değil uyum/süreç meselesi olarak çerçevele, "daha çok başvur" baskısı yapma. Gerekirse kategori "iyi_olus" olan bir öneri ekle.
- Her öneri SOMUT bir sonraki adım içersin (edilgen gözlem değil; "şunu yap", "şu mesajı at", "şuna ağırlık ver").
- Her öneri en fazla 2 cümle. Başlık kısa ve eylem odaklı.
- Yargılama yok ("başarısızsın" vb. asla).

ÇIKTI FORMATI: YALNIZCA geçerli bir JSON NESNESİ döndür, başka hiçbir şey yazma. Markdown, açıklama, kod bloğu işareti (backtick) KULLANMA. Şema:
{"headline": "tek cümlelik sıcak genel özet", "suggestions": [ {"baslik": "kısa başlık", "metin": "somut öneri (en fazla 2 cümle)", "kategori": "momentum|guclu_alan|darbogaz|takip|iyi_olus"} ]}
suggestions 3 veya 4 öğe içersin.`;

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

    // Önce güçlü model; boş/hatalıysa güvenli yedeğe düş.
    let result: { headline: string; suggestions: Suggestion[] } = { headline: "", suggestions: [] };
    for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const raw = await callGemini(summary, model);
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
