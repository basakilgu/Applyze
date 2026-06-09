// ============================================
// send-inactivity-notifications Edge Function
// ============================================
// Amaç: 14 gün boyunca güncellenmemiş, terminal olmayan başvurular için
// kullanıcılara push bildirim gönder.
//
// Çağıran: Supabase cron job (her gün TRT 10:00 = UTC 07:00).
// Auth: Service role key (cron bunu otomatik header'a koyar).
//
// Gizlilik: Bildirim metninde şirket adı YOK. Sadece "Hatırlatıcın var".

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflight } from "../_shared/cors.ts";

// ============================================
// Expo Push API endpoint
// ============================================
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// ============================================
// Aday tipi — DB sorgusundan dönen satır
// ============================================
interface Candidate {
  application_id: string;
  user_id: string;
  expo_push_token: string;
  days_inactive: number;
}

// ============================================
// Expo'ya tek bir push isteği gönder
// ============================================
async function sendExpoPush(token: string, applicationId: string) {
  const payload = {
    to: token,
    sound: "default",
    title: "Applyze",
    body: "Hatırlatıcın var", // ŞİRKET ADI YOK — gizlilik kuralı
    data: {
      type: "inactivity",
      application_id: applicationId,
      // Frontend bu deep link'i parse edip detay ekranına yönlendirir
      url: `applyze://application/${applicationId}`,
    },
    priority: "default",
    channelId: "reminders", // Android için
  };

  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Expo push failed: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  // Expo bazen 200 dönse de "data.status: error" verebilir (token geçersiz vs.)
  if (result.data?.status === "error") {
    throw new Error(`Expo response error: ${result.data.message ?? "unknown"}`);
  }
  return result;
}

// ============================================
// Ana handler
// ============================================
Deno.serve(async (req: Request) => {
  // CORS preflight (cron'dan gelmez ama elle test için)
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  // Sonuçları topla
  const stats = { sent: 0, failed: 0, skipped: 0, errors: [] as string[] };

  try {
    // Service role client — RLS bypass, tüm user'ları görebilir
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // ============================================
    // Adayları bul — tek SQL ile karmaşık filtreleme
    // ============================================
    // Şartlar:
    // - applications: updated_at < now() - interval '14 days'
    // - applications.deleted_at IS NULL
    // - current_stage NOT terminal (Teklif/Elenildi değil)
    // - profiles.notifications_enabled = true
    // - profiles.expo_push_token NOT NULL
    // - Şu an profile'ın saat aralığında (Europe/Istanbul timezone)
    // - Son 24 saatte bu user'a bildirim gönderilmemiş
    //
    // User başına EN ESKİ başvuruyu seç (DISTINCT ON ile).
    const { data: candidates, error: queryError } = await supabase.rpc(
      "find_inactivity_candidates",
    );

    if (queryError) {
      console.error("Aday sorgusu hatası:", queryError);
      return new Response(
        JSON.stringify({ error: "Aday sorgusu başarısız", detail: queryError }),
        {
          status: 500,
          headers: { ...corsHeaders(req), "Content-Type": "application/json" },
        },
      );
    }

    const candidateList = (candidates ?? []) as Candidate[];
    console.log(`Bulunan aday sayısı: ${candidateList.length}`);

    // ============================================
    // Her aday için bildirim gönder ve log düş
    // ============================================
    for (const c of candidateList) {
      try {
        await sendExpoPush(c.expo_push_token, c.application_id);

        const { error: logError } = await supabase
          .from("notifications_log")
          .insert({
            user_id: c.user_id,
            application_id: c.application_id,
            notification_type: "inactivity",
          });

        if (logError) {
          // Push gitti ama log batırıldı — kritik değil ama görelim
          console.error(`Log hatası (user ${c.user_id}):`, logError);
          stats.errors.push(`log:${c.user_id}:${logError.message}`);
        }

        stats.sent++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Push hatası (user ${c.user_id}):`, msg);
        stats.errors.push(`push:${c.user_id}:${msg}`);
        stats.failed++;
      }
    }

    // ============================================
    // Sonuç
    // ============================================
    return new Response(
      JSON.stringify({
        ok: true,
        candidates_found: candidateList.length,
        ...stats,
      }),
      {
        status: 200,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Beklenmeyen hata:", msg);
    return new Response(
      JSON.stringify({ error: "Sunucu hatası", detail: msg }),
      {
        status: 500,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      },
    );
  }
});