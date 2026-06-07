// ============================================
// parse-job Edge Function
// ============================================
// Amaç: Kullanıcının yapıştırdığı iş ilanı metninden şirket/pozisyon/şehir/platform
// bilgisini çıkarıp formu otomatik doldurmak. Scraping YOK — kullanıcı metni kendisi
// yapıştırır, biz yapılandırırız. Her sitede çalışır, bot korumasına takılmaz.
//
// Güçlü model + güvenli yedek (flash -> flash-lite).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflight } from "../_shared/cors.ts";

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

const SYSTEM_PROMPT = `Sen bir iş ilanı metninden yapılandırılmış bilgi çıkaran bir asistansın. Sana bir iş ilanının ham metni verilecek. Aşağıdaki alanları çıkar ve YALNIZCA geçerli bir JSON nesnesi döndür (markdown, açıklama, backtick YOK):
{"sirket": "", "pozisyon": "", "sehir": "", "platform": "", "notlar": ""}
Kurallar:
- sirket: ilanı veren şirketin adı. Bulamazsan boş bırak.
- pozisyon: iş/pozisyon başlığı (ör. "Süreç Tasarım Uzmanı"). Bulamazsan boş bırak.
- sehir: çalışma şehri (sadece şehir, ülke değil). Uzaktan/remote ise "Uzaktan". Bulamazsan boş bırak.
- platform: metinde geçen başvuru platformu ipucuna göre tam olarak şu değerlerden biri: "linkedin", "kariyer", "youthall", "anbean". Hiçbiri belli değilse "other".
- notlar: ilandaki ARANAN BAŞLICA NİTELİKLER ve başvuruda dikkat edilmesi gereken noktaların kısa özeti. Madde madde, her satır "- " ile başlasın, en fazla 6 madde. Varsa kıdem seviyesini (junior/orta/senior) ve öne çıkan 3-5 beceriyi de kat. Bulamazsan boş bırak.
- ASLA uydurma; emin olmadığın alanı boş bırak.`;

async function callGemini(jobText: string, model: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY tanımlı değil.");
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n--- İLAN METNİ ---\n${jobText}` }] }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 400,
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
  if (!text) throw new Error(`Gemini boş yanıt (${model}).`);
  return text;
}

type Parsed = { sirket: string; pozisyon: string; sehir: string; platform: string; notlar: string };

function parse(raw: string): Parsed | null {
  let cleaned = raw.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  try {
    const o = JSON.parse(cleaned);
    if (o && typeof o === "object") {
      const valid = ["linkedin", "kariyer", "youthall", "anbean", "other"];
      let platform = typeof o.platform === "string" ? o.platform.toLowerCase().trim() : "";
      if (!valid.includes(platform)) platform = "other";
      return {
        sirket: typeof o.sirket === "string" ? o.sirket.trim() : "",
        pozisyon: typeof o.pozisyon === "string" ? o.pozisyon.trim() : "",
        sehir: typeof o.sehir === "string" ? o.sehir.trim() : "",
        platform,
        notlar: typeof o.notlar === "string" ? o.notlar.trim() : "",
      };
    }
    return null;
  } catch (err) {
    console.error("JSON parse hatası:", err, "Ham:", cleaned.slice(0, 300));
    return null;
  }
}

Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Sadece POST." }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Geçerli bir ilan metni gerekli." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header eksik." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aşırı uzun metni kırp (token tasarrufu)
    const jobText = text.trim().slice(0, 8000);

    let parsed: Parsed | null = null;
    for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const raw = await callGemini(jobText, model);
        parsed = parse(raw);
        if (parsed) break;
      } catch (err) {
        console.error(`Model ${model} başarısız:`, err);
      }
    }

    if (!parsed) {
      return new Response(JSON.stringify({ error: "İlan okunamadı." }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Beklenmeyen hata:", err);
    return new Response(JSON.stringify({ error: "Sunucu hatası." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
