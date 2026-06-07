// ============================================
// analyze-fit Edge Function
// ============================================
// Amaç: Kullanıcının (profilde kayıtlı) CV metni ile yapıştırdığı iş ilanını
// karşılaştırıp uyum analizi döndürmek. CV, kullanıcının kendi token'ıyla
// profiles tablosundan okunur (RLS: sadece kendi satırı).
//
// Çıktı: { skor, guven, eslesme[], eksikler[], ats[], vurgu[] }

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflight } from "../_shared/cors.ts";

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

const SYSTEM_PROMPT = `Sen, bir adayın CV'si ile bir iş ilanı arasındaki uyumu değerlendiren, sakin ve yargısız bir kariyer rehberisin (bir PUSULA gibi). Abartma, sahte umut verme, ama dürüst ve yapıcı ol.

Sana CV metni ve İLAN metni verilecek. Karşılaştır ve YALNIZCA geçerli bir JSON nesnesi döndür (markdown/backtick YOK):
{
  "skor": 0,
  "guven": "düşük|orta|yüksek",
  "eslesme": ["ilanın istediği ve adayda olan güçlü yönler (en fazla 5 madde)"],
  "eksikler": ["ilanın istediği ama CV'de görünmeyen/zayıf noktalar — yargısız, 'geliştirilebilir' tonuyla (en fazla 5 madde)"],
  "ats": ["ilandaki kritik anahtar kelimelerden CV'de eksik/az geçenler (en fazla 6 madde)"],
  "vurgu": ["başvuruda veya ön yazıda bu ilana özel vurgulanması gereken 2-4 somut öneri"]
}
Kurallar:
- skor: 0-100 arası, CV'nin ilana genel uygunluğu. Veri azsa düşük tut.
- guven: CV ya da ilan metni kısa/yetersizse "düşük"; doluysa "orta"/"yüksek".
- Sadece verilen metinlere dayan, bilgi UYDURMA.
- Türkçe, sıcak ama sade. Yargılayıcı olma ("yetersizsin" vb. asla).`;

async function callGemini(cv: string, job: string, model: string): Promise<string> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("GEMINI_API_KEY tanımlı değil.");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n--- CV ---\n${cv}\n\n--- İLAN ---\n${job}` }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 1100, thinkingConfig: { thinkingBudget: 0 } },
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

function parse(raw: string): any | null {
  let c = raw.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  try {
    const o = JSON.parse(c);
    if (!o || typeof o !== "object") return null;
    const arr = (x: any): string[] => Array.isArray(x) ? x.filter((i) => typeof i === "string").slice(0, 6) : [];
    let skor = Number(o.skor);
    if (!Number.isFinite(skor)) skor = 0;
    skor = Math.max(0, Math.min(100, Math.round(skor)));
    const guven = ["düşük", "orta", "yüksek"].includes(o.guven) ? o.guven : "düşük";
    return { skor, guven, eslesme: arr(o.eslesme), eksikler: arr(o.eksikler), ats: arr(o.ats), vurgu: arr(o.vurgu) };
  } catch (err) {
    console.error("JSON parse hatası:", err, "Ham:", c.slice(0, 300));
    return null;
  }
}

Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Sadece POST." }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  try {
    const { job_text } = await req.json();
    if (!job_text || typeof job_text !== "string" || job_text.trim().length < 20) {
      return new Response(JSON.stringify({ error: "Geçerli bir ilan metni gerekli." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header eksik." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Geçersiz token." }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // CV'yi profilden oku (RLS: kendi satırı)
    const { data: profile } = await supabase.from("profiles").select("cv_text").eq("user_id", user.id).maybeSingle();
    const cv = (profile?.cv_text ?? "").trim();
    if (cv.length < 30) {
      return new Response(JSON.stringify({ error: "no_cv" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const job = job_text.trim().slice(0, 8000);
    const cvText = cv.slice(0, 8000);

    let result: any = null;
    for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      try {
        const raw = await callGemini(cvText, job, model);
        result = parse(raw);
        if (result) break;
      } catch (err) {
        console.error(`Model ${model} başarısız:`, err);
      }
    }
    if (!result) {
      return new Response(JSON.stringify({ error: "Analiz üretilemedi." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Beklenmeyen hata:", err);
    return new Response(JSON.stringify({ error: "Sunucu hatası." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
