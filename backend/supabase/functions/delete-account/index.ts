// ============================================
// delete-account Edge Function
// ============================================
// Amaç: Giriş yapmış kullanıcının KENDİ hesabını ve tüm verisini siler.
// Apple Guideline 5.1.1(v): hesap oluşturan uygulamalar uygulama içi
// hesap silmeyi sunmak zorundadır.
//
// Akış:
//  1) Authorization header'ından çağıran kullanıcıyı DOĞRULA.
//  2) service_role ile auth.admin.deleteUser(user.id) çağır.
//     auth.users silinince applications/stages/notes/profiles/notifications_log
//     ON DELETE CASCADE ile otomatik silinir.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflight } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Sadece POST isteği kabul edilir." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization header eksik." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Çağıran kullanıcıyı doğrula (kendi token'ıyla)
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Geçersiz token." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) service_role ile kullanıcıyı (ve cascade ile tüm verisini) sil
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    const { error: delError } = await admin.auth.admin.deleteUser(user.id);
    if (delError) {
      console.error("Hesap silme hatası:", delError);
      return new Response(JSON.stringify({ error: "Hesap silinemedi." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Beklenmeyen hata:", err);
    return new Response(JSON.stringify({ error: "Sunucu hatası." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
