// ============================================
// check-duplicate Edge Function
// ============================================
// Amaç: Kullanıcının daha önce bu URL ile başvurusu var mı kontrol et.
// Frontend, yeni başvuru formunda URL alanı değiştikçe bu fonksiyonu
// debounce ile çağırır. Eğer duplicate ise modal gösterir.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflight } from "../_shared/cors.ts";

// ============================================
// URL normalize — aynı ilan farklı linklerle gelse de aynı kabul edilsin
// ============================================
// Örnek: https://www.kariyer.net/is/12345?utm_source=email&ref=x
//   →    https://www.kariyer.net/is/12345
function normalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl.trim());
    // Query parametrelerini at (utm, ref, fbclid vs.)
    url.search = "";
    // Sondaki "/" varsa kırp
    let normalized = url.toString();
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized.toLowerCase();
  } catch {
    // Geçersiz URL → ham hali küçük harfli döner
    return rawUrl.trim().toLowerCase();
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
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      },
    );
  }

  try {
    // 3. Body'yi parse et
    const { source_url } = await req.json();

    if (!source_url || typeof source_url !== "string") {
      return new Response(
        JSON.stringify({ error: "source_url alanı gerekli." }),
        {
          status: 400,
          headers: { ...corsHeaders(req), "Content-Type": "application/json" },
        },
      );
    }

    // 4. Authorization header'ından user'ı çöz
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header eksik." }),
        {
          status: 401,
          headers: { ...corsHeaders(req), "Content-Type": "application/json" },
        },
      );
    }

    // 5. Çağıran user'ın kimliğiyle Supabase client oluştur
    // Bu sayede RLS otomatik devreye girer, sadece kendi verilerini görür
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      },
    );

    // 6. User doğrulama
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Geçersiz token." }),
        {
          status: 401,
          headers: { ...corsHeaders(req), "Content-Type": "application/json" },
        },
      );
    }

    // 7. URL'yi normalize et ve sorgu yap
    const normalizedUrl = normalizeUrl(source_url);

    // RLS sayesinde user yalnızca kendi başvurularını arar
    // deleted_at IS NULL → soft-deleted başvurular hariç
    const { data, error } = await supabase
      .from("applications")
      .select("id, company_name, position, applied_at")
      .eq("source_url", normalizedUrl)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("DB sorgu hatası:", error);
      return new Response(
        JSON.stringify({ error: "Veritabanı sorgusu başarısız." }),
        {
          status: 500,
          headers: { ...corsHeaders(req), "Content-Type": "application/json" },
        },
      );
    }

    // 8. Cevabı dön
    if (data) {
      return new Response(
        JSON.stringify({
          is_duplicate: true,
          existing_application_id: data.id,
          existing_company_name: data.company_name,
          existing_position: data.position,
          existing_applied_at: data.applied_at,
        }),
        {
          status: 200,
          headers: { ...corsHeaders(req), "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({ is_duplicate: false }),
      {
        status: 200,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Beklenmeyen hata:", err);
    return new Response(
      JSON.stringify({ error: "Sunucu hatası." }),
      {
        status: 500,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      },
    );
  }
});