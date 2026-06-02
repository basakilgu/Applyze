// lib/aiSuggestions.ts
// AI öneri katmanı: başvuru verisinden GİZLİLİĞE UYGUN özet çıkarır
// (şirket adı GÖNDERİLMEZ) ve ai-suggestions Edge Function'ını çağırır.

import { supabase } from "./supabase";

// Edge Function'dan dönen tek bir öneri
export type AiSuggestion = {
  baslik: string;
  metin: string;
};

// Sonuç durumları — UI buna göre ne göstereceğine karar verir
export type AiResult =
  | { status: "ok"; suggestions: AiSuggestion[] }
  | { status: "empty" } // veri az ya da öneri üretilemedi
  | { status: "error"; message: string };

// =============================================================
// Başvuru listesinden gizliliğe uygun SAYISAL özet üret
// =============================================================
// ÖNEMLİ: Buraya şirket adı, kişisel not gibi şeyler ASLA girmez.
// Sadece sayılar, aşamalar, platformlar ve pozisyon başlıkları gider.
function buildSummary(apps: any[]): string {
  if (!apps || apps.length === 0) return "";

  const total = apps.length;
  const now = Date.now();

  // Aşama etiketlerini okunabilir Türkçeye çevir
  const stageLabels: Record<string, string> = {
    applied: "Başvuruldu",
    screening: "Ön Değerlendirme",
    interview: "Mülakat",
    manager: "Yönetici Görüşmesi",
    offer: "Teklif",
    rejected: "Elendi",
  };

  // Mevcut aşamaya göre dağılım
  const stageCounts: Record<string, number> = {};
  // Platforma göre dağılım
  const platformCounts: Record<string, number> = {};
  // Pozisyon başlıkları (şirket DEĞİL)
  const positions: string[] = [];

  // Huni: bir aşamaya en az bir kez "ulaşmış" başvuru sayısı (stage_history'den)
  let reachedScreening = 0;
  let reachedInterview = 0;
  let reachedOffer = 0;
  let rejectedCount = 0;

  let longestSilentDays = 0;

  for (const app of apps) {
    // Mevcut aşama
    const stage = app.current_stage || "applied";
    const label = stageLabels[stage] || stage;
    stageCounts[label] = (stageCounts[label] || 0) + 1;
    if (stage === "rejected") rejectedCount++;

    // Platform
    const platform = app.platform || "diğer";
    platformCounts[platform] = (platformCounts[platform] || 0) + 1;

    // Pozisyon
    if (app.position && typeof app.position === "string") {
      positions.push(app.position);
    }

    // Huni — stage_history içinde hangi aşamalara değmiş?
    const history = Array.isArray(app.stage_history) ? app.stage_history : [];
    const reachedKeys = new Set(history.map((h: any) => h.stage_key));
    // Mevcut aşama da "ulaşılmış" sayılır
    reachedKeys.add(stage);
    if (reachedKeys.has("screening") || reachedKeys.has("interview") || reachedKeys.has("manager") || reachedKeys.has("offer")) {
      reachedScreening++;
    }
    if (reachedKeys.has("interview") || reachedKeys.has("manager") || reachedKeys.has("offer")) {
      reachedInterview++;
    }
    if (reachedKeys.has("offer")) {
      reachedOffer++;
    }

    // En uzun sessizlik (gün)
    const ref = app.updated_at || app.applied_at || app.created_at;
    if (ref) {
      const days = Math.floor((now - new Date(ref).getTime()) / (1000 * 60 * 60 * 24));
      if (days > longestSilentDays) longestSilentDays = days;
    }
  }

  const uniquePositions = Array.from(new Set(positions)).slice(0, 8);

  // Özeti okunabilir metne çevir (Gemini bunu yorumlayacak)
  const lines: string[] = [];
  lines.push(`Toplam başvuru: ${total}`);

  lines.push("Şu anki aşama dağılımı:");
  for (const [label, count] of Object.entries(stageCounts)) {
    lines.push(`  - ${label}: ${count}`);
  }

  lines.push("Huni (bir aşamaya en az bir kez ulaşan başvuru sayısı):");
  lines.push(`  - Başvuruldu: ${total}`);
  lines.push(`  - Ön değerlendirme veya sonrasına ulaşan: ${reachedScreening}`);
  lines.push(`  - Mülakat veya sonrasına ulaşan: ${reachedInterview}`);
  lines.push(`  - Teklif alan: ${reachedOffer}`);
  lines.push(`  - Şu an elenmiş durumda: ${rejectedCount}`);

  lines.push("Platform dağılımı:");
  for (const [platform, count] of Object.entries(platformCounts)) {
    lines.push(`  - ${platform}: ${count}`);
  }

  if (uniquePositions.length > 0) {
    lines.push(`Başvurulan pozisyon türleri: ${uniquePositions.join(", ")}`);
  }

  lines.push(`En uzun süredir güncellenmeyen başvuru: ${longestSilentDays} gün önce`);

  return lines.join("\n");
}

// =============================================================
// Edge Function'ı çağır ve önerileri getir
// =============================================================
export async function fetchAiSuggestions(apps: any[]): Promise<AiResult> {
  const summary = buildSummary(apps);

  // Veri yoksa hiç çağırma — boş döndür
  if (!summary) {
    return { status: "empty" };
  }

  try {
    // supabase.functions.invoke oturum token'ını otomatik ekler
    const { data, error } = await supabase.functions.invoke("ai-suggestions", {
      body: { summary },
    });

    if (error) {
      console.error("ai-suggestions invoke hatası:", error);
      return { status: "error", message: "Öneriler şu an alınamadı." };
    }

    const suggestions = data?.suggestions;
    if (Array.isArray(suggestions) && suggestions.length > 0) {
      return { status: "ok", suggestions };
    }

    // Fonksiyon çalıştı ama öneri yok (parse edilemedi vs.)
    return { status: "empty" };
  } catch (err) {
    console.error("ai-suggestions beklenmeyen hata:", err);
    return { status: "error", message: "Bir şeyler ters gitti." };
  }
}