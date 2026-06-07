// ============================================
// extract-cv Edge Function
// ============================================
// Amaç: Kullanıcının yüklediği CV dosyasından (PDF veya görsel) düz metni çıkarmak.
// Gemini, PDF ve görselleri (taranmış CV dahil, OCR) okuyabilir.
// Çıkan metin frontend'de profiles.cv_text'e kaydedilir ve uyum analizinde kullanılır.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflight } from "../_shared/cors.ts";

const MODEL = "gemini-2.5-flash";
const ALLOWED = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"];

Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Sadece POST." }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  try {
    const { fileBase64, mimeType } = await req.json();
    if (!fileBase64 || typeof fileBase64 !== "string") {
      return new Response(JSON.stringify({ error: "Dosya verisi gerekli." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const mt = typeof mimeType === "string" ? mimeType : "application/pdf";
    if (!ALLOWED.includes(mt)) {
      return new Response(JSON.stringify({ error: "Desteklenmeyen dosya türü. PDF veya görsel yükle." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (fileBase64.length > 9_000_000) {
      return new Response(JSON.stringify({ error: "Dosya çok büyük (en fazla ~6 MB)." }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY tanımlı değil.");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            { text: "Bu dosya bir özgeçmiş (CV). İçindeki TÜM metni, düz metin olarak, olduğu gibi çıkar. Yorum, başlık veya markdown ekleme; yalnızca CV'nin metnini döndür." },
            { inline_data: { mime_type: mt, data: fileBase64 } },
          ],
        }],
        generationConfig: { temperature: 0, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 0 } },
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("Gemini hatası:", resp.status, t);
      return new Response(JSON.stringify({ error: "Dosya okunamadı." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text || text.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Dosyadan metin çıkarılamadı." }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ text: text.trim() }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Beklenmeyen hata:", err);
    return new Response(JSON.stringify({ error: "Sunucu hatası." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
