// ============================================
// ai-suggestions Edge Function
// ============================================
// Amaç: Kullanıcının başvuru ÖZET istatistiklerini (frontend hesaplayıp gönderir)
// alıp, Gemini'ye "pusula felsefesi" ile yorumlatır ve kişiye özel,
// sakin, yargılamayan öneriler döndürür.
//
// GİZLİLİK: Şirket adları ASLA gönderilmez. Sadece sayılar, aşamalar,
// pozisyon tipleri ve platformlar gider.
//
// HALÜSİNASYON ÖNLEME: Sayıları Gemini hesaplamaz — biz veririz.
// Gemini yalnızca yorumlar ve yön gösterir.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflight } from "../_shared/cors.ts";

// ============================================
// Gemini'ye gönderilecek sistem talimatı (pusula felsefesi)
// ============================================
const SYSTEM_PROMPT = `Sen "Applyze" adlı bir iş başvurusu takip uygulamasının içindeki sakin, bilge bir rehbersin. Felsefen bir PUSULA gibi: kullanıcıya yargılamadan, abartmadan, gerçeği nazikçe gösterir ve yön önerirsin. Maskot değilsin, neşelendirmeye çalışmazsın, sahte motivasyon vermezsin.

Sana bir kullanıcının iş başvuru sürecine dair SAYISAL özet verilecek. Görevin bu sayıları yorumlayıp ona 2-3 kısa, somut, uygulanabilir öneri sunmak.

KURALLAR:
- Türkçe yaz, sıcak ama sade bir dille. "Sen" diye hitap et.
- Sana verilen sayıların DIŞINA çıkma, yeni sayı uydurma.
- Her öneri kısa olsun (en fazla 2 cümle).
- Yargılayıcı olma ("başarısızsın" gibi ifadeler asla). Bunun yerine örüntüyü göster ve yön öner.
- Veri azsa (örn. çok az başvuru) bunu dürüstçe söyle, baskı yapma.
- Şirket adı veya kişisel bilgi verilmedi; sadece örüntülerden konuş.

ÇIKTI FORMATI: Yalnızca geçerli bir JSON dizisi döndür, başka hiçbir şey yazma. Markdown, açıklama, kod bloğu işareti (backtick) KULLANMA. Format:
[
  { "baslik": "Kısa başlık", "metin": "Öneri metni" },
  { "baslik": "Kısa başlık", "metin": "Öneri metni" }
]`;

// ============================================
// Gemini API çağrısı
// ============================================
async function callGemini(userSummary: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tanımlı değil.");
  }

  // Gemini 2.5 Flash — ücretsiz katmanda hızlı ve yetenekli model
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      // Sistem talimatı + kullanıcı verisi birlikte gönderilir
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\n--- KULLANICI ÖZETİ ---\n${userSummary}` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Gemini API hatası:", response.status, errText);
    throw new Error(`Gemini API ${response.status} döndü.`);
  }

  const data = await response.json();
  // Gemini cevabı: data.candidates[0].content.parts[0].text
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error("Gemini beklenmeyen cevap:", JSON.stringify(data));
    throw new Error("Gemini'den metin alınamadı.");
  }
  return text;
}

// ============================================
// Gemini'nin döndürdüğü metni güvenli şekilde JSON'a çevir
// ============================================
function parseSuggestions(
  raw: string,
): Array<{ baslik: string; metin: string }> {
  // Bazen model backtick veya "json" etiketi ekleyebilir — temizle
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      // Sadece beklenen alanları al, fazlasını ele
      return parsed
        .filter((item) => item && typeof item.baslik === "string" && typeof item.metin === "string")
        .map((item) => ({ baslik: item.baslik, metin: item.metin }))
        .slice(0, 3); // en fazla 3 öneri
    }
    return [];
  } catch (err) {
    console.error("JSON parse hatası:", err, "Ham metin:", cleaned);
    return [];
  }
}

// ============================================
// Ana handler
// ============================================
Deno.serve(async (req: Request) => {
  // 1. CORS preflight
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  // 2. Sadece POST kabul
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Sadece POST isteği kabul edilir." }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    // 3. Body'yi parse et — frontend'in hesapladığı özet burada gelir
    const { summary } = await req.json();

    if (!summary || typeof summary !== "string") {
      return new Response(
        JSON.stringify({ error: "summary alanı gerekli." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 4. Authorization header kontrolü
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header eksik." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 5. Çağıran user'ı doğrula (sadece giriş yapmış kullanıcılar)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      },
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Geçersiz token." }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 6. Gemini'ye sor
    const rawText = await callGemini(summary);

    // 7. Cevabı temiz JSON'a çevir
    const suggestions = parseSuggestions(rawText);

    if (suggestions.length === 0) {
      // Gemini cevap verdi ama parse edemedik → frontend nazikçe fallback gösterir
      return new Response(
        JSON.stringify({ suggestions: [], error: "Öneri üretilemedi." }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 8. Başarılı cevap
    return new Response(
      JSON.stringify({ suggestions }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Beklenmeyen hata:", err);
    return new Response(
      JSON.stringify({ error: "Sunucu hatası.", suggestions: [] }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});