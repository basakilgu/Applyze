// lib/aiSuggestions.ts
// AI öneri katmanı: başvuru verisinden GİZLİLİĞE UYGUN özet çıkarır
// (şirket adı GÖNDERİLMEZ) ve ai-suggestions Edge Function'ını çağırır.

import { supabase } from "./supabase";

// Edge Function'dan dönen tek bir öneri
export type AiSuggestion = {
  baslik: string;
  metin: string;
  kategori?: string;
};

// Sonuç durumları — UI buna göre ne göstereceğine karar verir
export type AiResult =
  | { status: "ok"; suggestions: AiSuggestion[]; headline?: string }
  | { status: "empty" } // veri az ya da öneri üretilemedi
  | { status: "error"; message: string };

// =============================================================
// Başvuru listesinden gizliliğe uygun SAYISAL özet üret
// =============================================================
// ÖNEMLİ: Buraya şirket adı, kişisel not gibi şeyler ASLA girmez.
// Sadece sayılar, aşamalar, platformlar ve pozisyon başlıkları gider.
// Pozisyon başlığından rol/alan kategorisi (şirket bilgisi gerekmez).
function categorizeRole(position: string): string {
  const p = (position || "").toLowerCase();
  if (p.includes("ürün") || p.includes("product")) return "Ürün Yönetimi";
  if (p.includes("süreç") || p.includes("process")) return "Süreç Tasarımı";
  if (p.includes("analist") || p.includes("analiz") || p.includes("analyst")) return "Analiz / İş Analistliği";
  if (p.includes("veri") || p.includes("data")) return "Veri / Analitik";
  if (p.includes("operasyon") || p.includes("operation")) return "Operasyon";
  if (p.includes("müşteri") || p.includes("deneyim") || p.includes("destek")) return "Müşteri Deneyimi";
  if (p.includes("dijital") || p.includes("bankac")) return "Dijital Bankacılık";
  if (p.includes("pazarlama") || p.includes("marketing")) return "Pazarlama";
  if (p.includes("satış") || p.includes("sales")) return "Satış";
  if (p.includes("proje") || p.includes("project")) return "Proje Yönetimi";
  if (p.includes("yazılım") || p.includes("mühendis") || p.includes("developer") || p.includes("engineer")) return "Yazılım / Mühendislik";
  if (p.includes("insan kaynak") || p.includes("hr")) return "İnsan Kaynakları";
  return "Diğer";
}

// Şirket adından sektör kategorisi. SADECE yerel hesaplanır; etiket dışına
// (AI'a) şirket adı GÖNDERİLMEZ — yalnızca sektör adı kullanılır.
function categorizeSector(company: string): string {
  const c = (company || "").toLowerCase();
  if (/(bank|garanti|akbank|yapı kredi|yapi kredi|finansbank|qnb|denizbank|ziraat|halkbank|vak\u0131f|teb|ing|hsbc|papara|param|ininal|\u0131ninal|ödeme|odeme|fintech|sigorta)/.test(c)) return "Bankacılık / Finans";
  if (/(trendyol|hepsiburada|amazon|getir|yemeksepeti|migros|sahibinden|gittigidiyor|n11|çiçeksepeti|banabi|enuygun)/.test(c)) return "E-ticaret / Pazaryeri";
  if (/(insider|peak|dream|games|logo|softtech|turkcell|vodafone|netaş|aselsan|havelsan|teknoloji|yazılım|yazilim|software)/.test(c)) return "Teknoloji / Telekom";
  if (/(lc waikiki|defacto|koton|mavi|boyner|koçtaş|koctas|ikea|perakende)/.test(c)) return "Perakende / Moda";
  if (/(thy|türk hava|turk hava|pegasus|havayoll|havacılık|ulaşım|lojistik|kargo)/.test(c)) return "Havacılık / Ulaşım";
  if (/(holding|sabancı|sabanci|koç |koc |doğuş|dogus|zorlu|arçelik|arcelik|sanayi|otomotiv|enerji)/.test(c)) return "Holding / Sanayi";
  return "Diğer";
}

function buildSummary(apps: any[]): string {
  if (!apps || apps.length === 0) return "";

  const total = apps.length;
  const now = Date.now();
  const dayMs = 1000 * 60 * 60 * 24;

  const stageLabels: Record<string, string> = {
    applied: "Başvuruldu", screening: "Ön Değerlendirme", interview: "Mülakat",
    manager: "Yönetici Görüşmesi", offer: "Teklif", rejected: "Elendi",
  };
  const platformLabelsTr: Record<string, string> = {
    linkedin: "LinkedIn", kariyer: "Kariyer.net", youthall: "Youthall",
    anbean: "Anbean", other: "Diğer",
  };

  const lastActivityMs = (app: any): number => {
    const hist = Array.isArray(app.stage_history) ? app.stage_history : [];
    let ms = new Date(app.applied_at || app.created_at || now).getTime();
    for (const h of hist) {
      if (h?.changed_at) {
        const t = new Date(h.changed_at).getTime();
        if (t > ms) ms = t;
      }
    }
    return ms;
  };

  type Funnel = { applied: number; responded: number; interview: number; offer: number };
  const newFunnel = (): Funnel => ({ applied: 0, responded: 0, interview: 0, offer: 0 });

  const stageCounts: Record<string, number> = {};
  const positions: string[] = [];
  const platformStats: Record<string, Funnel> = {};
  const roleStats: Record<string, Funnel> = {};
  const sectorStats: Record<string, Funnel> = {};

  let respondedCount = 0, reachedInterview = 0, reachedOffer = 0, rejectedCount = 0;
  let appliedLast7 = 0, appliedPrev7 = 0;
  let activeCount = 0, staleActiveCount = 0, activeSilenceDaysSum = 0, longestSilentDays = 0;
  let recentRejections = 0;

  const weeks: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  const appliedTimes: number[] = [];

  for (const app of apps) {
    const stage = app.current_stage || "applied";
    const sLabel = stageLabels[stage] || stage;
    stageCounts[sLabel] = (stageCounts[sLabel] || 0) + 1;

    const platform = app.platform || "other";
    if (!platformStats[platform]) platformStats[platform] = newFunnel();
    platformStats[platform].applied++;

    if (app.position && typeof app.position === "string") positions.push(app.position);

    const history = Array.isArray(app.stage_history) ? app.stage_history : [];
    const reached = new Set<string>(history.map((h: any) => h.stage_key));
    reached.add(stage);

    const didRespond = reached.has("screening") || reached.has("interview") || reached.has("manager") || reached.has("offer");
    const didInterview = reached.has("interview") || reached.has("manager") || reached.has("offer");
    const didOffer = reached.has("offer");
    if (didRespond) { respondedCount++; platformStats[platform].responded++; }
    if (didInterview) { reachedInterview++; platformStats[platform].interview++; }
    if (didOffer) { reachedOffer++; platformStats[platform].offer++; }

    const role = categorizeRole(app.position || "");
    if (!roleStats[role]) roleStats[role] = newFunnel();
    roleStats[role].applied++;
    if (didRespond) roleStats[role].responded++;
    if (didInterview) roleStats[role].interview++;
    if (didOffer) roleStats[role].offer++;

    const sector = categorizeSector(app.company_name || "");
    if (!sectorStats[sector]) sectorStats[sector] = newFunnel();
    sectorStats[sector].applied++;
    if (didRespond) sectorStats[sector].responded++;
    if (didInterview) sectorStats[sector].interview++;
    if (didOffer) sectorStats[sector].offer++;

    const silenceDays = Math.floor((now - lastActivityMs(app)) / dayMs);
    if (silenceDays > longestSilentDays) longestSilentDays = silenceDays;

    if (stage === "rejected") {
      rejectedCount++;
      if (silenceDays <= 14) recentRejections++;
    }

    const isActive = stage !== "offer" && stage !== "rejected";
    if (isActive) {
      activeCount++;
      activeSilenceDaysSum += silenceDays;
      if (silenceDays >= 14) staleActiveCount++;
    }

    const appliedMs = new Date(app.applied_at || now).getTime();
    appliedTimes.push(appliedMs);
    const appliedDays = Math.floor((now - appliedMs) / dayMs);
    if (appliedDays < 7) appliedLast7++;
    else if (appliedDays < 14) appliedPrev7++;
    const wk = Math.floor(appliedDays / 7);
    if (wk >= 0 && wk < 8) weeks[wk]++;
  }

  const pct = (a: number, b: number): number => (b > 0 ? Math.round((a / b) * 100) : 0);
  const wilson = (succ: number, n: number): [number, number] => {
    if (n === 0) return [0, 0];
    const z = 1.96;
    const ph = succ / n;
    const denom = 1 + (z * z) / n;
    const center = ph + (z * z) / (2 * n);
    const margin = z * Math.sqrt((ph * (1 - ph)) / n + (z * z) / (4 * n * n));
    const lo = Math.max(0, Math.round(((center - margin) / denom) * 100));
    const hi = Math.min(100, Math.round(((center + margin) / denom) * 100));
    return [lo, hi];
  };
  const confLabel = (n: number): string => (n >= 10 ? "yüksek" : n >= 5 ? "orta" : "düşük");

  const responseRate = pct(respondedCount, total);
  const interviewRate = pct(reachedInterview, total);
  const avgActiveSilence = activeCount > 0 ? Math.round(activeSilenceDaysSum / activeCount) : 0;

  const c1 = pct(respondedCount, total);
  const c2 = respondedCount > 0 ? pct(reachedInterview, respondedCount) : 0;
  const c3 = reachedInterview > 0 ? pct(reachedOffer, reachedInterview) : 0;
  const steps = [
    { label: "Başvuru → Geri dönüş", rate: c1, denom: total },
    { label: "Geri dönüş → Mülakat", rate: c2, denom: respondedCount },
    { label: "Mülakat → Teklif", rate: c3, denom: reachedInterview },
  ].filter((x) => x.denom >= 3);
  let bottleneck = steps.length > 0 ? steps[0] : null;
  for (const st of steps) if (bottleneck && st.rate < bottleneck.rate) bottleneck = st;

  type Strong = { name: string; rate: number; applied: number; lo: number; hi: number } | null;
  const pickStrong = (stats: Record<string, Funnel>, minN: number): Strong => {
    let best: Strong = null;
    for (const [name, st] of Object.entries(stats)) {
      if (name === "Diğer" || st.applied < minN) continue;
      const rate = pct(st.interview, st.applied);
      const [lo, hi] = wilson(st.interview, st.applied);
      if (!best || rate > best.rate || (rate === best.rate && st.applied > best.applied)) {
        best = { name, rate, applied: st.applied, lo, hi };
      }
    }
    return best;
  };
  const bestRole = pickStrong(roleStats, 3);
  const bestSector = pickStrong(sectorStats, 3);

  const neighbors: Record<string, string[]> = {
    "Süreç Tasarımı": ["İş Analistliği", "Operasyon", "Ürün Yönetimi"],
    "Analiz / İş Analistliği": ["Süreç Tasarımı", "Veri / Analitik", "Ürün Yönetimi"],
    "Ürün Yönetimi": ["İş Analistliği", "Süreç Tasarımı", "Pazarlama"],
    "Veri / Analitik": ["İş Analistliği", "Ürün Yönetimi"],
    "Operasyon": ["Süreç Tasarımı", "Müşteri Deneyimi"],
    "Müşteri Deneyimi": ["Operasyon", "Satış"],
    "Dijital Bankacılık": ["Ürün Yönetimi", "İş Analistliği"],
    "Pazarlama": ["Ürün Yönetimi", "Satış"],
  };

  const appsPerInterview = reachedInterview > 0 ? Math.round(total / reachedInterview) : null;
  const appsPerOffer = reachedOffer > 0 ? Math.round(total / reachedOffer) : null;

  appliedTimes.sort((a, b) => a - b);
  let longestGapDays = 0;
  for (let i = 1; i < appliedTimes.length; i++) {
    const g = Math.floor((appliedTimes[i] - appliedTimes[i - 1]) / dayMs);
    if (g > longestGapDays) longestGapDays = g;
  }
  const activeWeeks = weeks.filter((w) => w > 0).length;
  const last4 = weeks.slice(0, 4).reduce((a, b) => a + b, 0);
  const avgPerWeek4 = Math.round((last4 / 4) * 10) / 10;

  const uniquePositions = Array.from(new Set(positions)).slice(0, 8);

  const lines: string[] = [];
  lines.push(`NOT: Her oranın yanında örnek sayısı (n) ve güven düzeyi var. Güven "düşük" ise kesin iddia ETME; "henüz net değil, biraz daha veri lazım" de.`);
  lines.push(``);
  lines.push(`Toplam başvuru: ${total}`);

  lines.push(`Aşama dağılımı:`);
  for (const [label, count] of Object.entries(stageCounts)) lines.push(`  - ${label}: ${count}`);

  lines.push(`Genel huni:`);
  lines.push(`  - Geri dönüş oranı: yüzde ${responseRate} (${respondedCount}/${total}, güven ${confLabel(total)})`);
  lines.push(`  - Mülakat oranı: yüzde ${interviewRate} (${reachedInterview}/${total}, güven ${confLabel(total)})`);
  lines.push(`  - Teklif: ${reachedOffer} | Elenmiş: ${rejectedCount}`);
  lines.push(`Huni geçiş oranları: Başvuru→Geri dönüş yüzde ${c1}, Geri dönüş→Mülakat yüzde ${c2}, Mülakat→Teklif yüzde ${c3}`);
  if (bottleneck) lines.push(`En zayıf geçiş (darboğaz): ${bottleneck.label} (yüzde ${bottleneck.rate})`);

  lines.push(`Çaba ve istikrar:`);
  lines.push(`  - Son 7 gün: ${appliedLast7} başvuru, önceki 7 gün: ${appliedPrev7}`);
  lines.push(`  - Son 4 hafta ortalaması: ${avgPerWeek4} başvuru/hafta`);
  lines.push(`  - Son 8 haftanın kaçında başvuru var: ${activeWeeks}/8`);
  lines.push(`  - İki başvuru arası en uzun boşluk: ${longestGapDays} gün`);

  lines.push(`Takip ve hareketsizlik:`);
  lines.push(`  - Aktif başvuru: ${activeCount}, 14+ gündür değişmeyen: ${staleActiveCount}`);
  lines.push(`  - Aktiflerde ortalama sessizlik: ${avgActiveSilence} gün, en uzun: ${longestSilentDays} gün`);

  lines.push(`İyi oluş sinyali:`);
  lines.push(`  - Toplam elenme: ${rejectedCount} (son 14 günde ${recentRejections})`);
  lines.push(`  - Ret kümelenmesi (son 14 günde 2+ ret): ${recentRejections >= 2 ? "EVET — tonun destekleyici ve yeniden çerçeveleyici olsun, baskı yapma" : "hayır"}`);

  lines.push(`Platform performansı (başvuru / geri dönüş / mülakat+):`);
  for (const [pf, st] of Object.entries(platformStats)) {
    lines.push(`  - ${platformLabelsTr[pf] || pf}: ${st.applied} / ${st.responded} / ${st.interview} (mülakat oranı yüzde ${pct(st.interview, st.applied)}, güven ${confLabel(st.applied)})`);
  }

  lines.push(`Rol/alan performansı (başvuru / geri dönüş / mülakat+ / teklif):`);
  for (const [r, st] of Object.entries(roleStats)) {
    lines.push(`  - ${r}: ${st.applied} / ${st.responded} / ${st.interview} / ${st.offer} (mülakat oranı yüzde ${pct(st.interview, st.applied)}, güven ${confLabel(st.applied)})`);
  }
  if (bestRole) {
    lines.push(`En güçlü alanın: ${bestRole.name} — mülakat oranı yüzde ${bestRole.rate} (n=${bestRole.applied}, gerçek oran yüzde ${bestRole.lo}-${bestRole.hi} aralığında, güven ${confLabel(bestRole.applied)})`);
    const nb = neighbors[bestRole.name];
    if (nb && nb.length) lines.push(`  Komşu alanlar (keşif için): ${nb.join(", ")}`);
    lines.push(`  Önerilebilecek dağılım: ~yüzde 70 ${bestRole.name} + ~yüzde 30 komşu alan keşfi`);
  } else {
    lines.push(`En güçlü alan: henüz net değil (alan başına yeterli başvuru yok).`);
  }

  lines.push(`Sektör performansı (şirket adı paylaşılmaz; başvuru / geri dönüş / mülakat+ / teklif):`);
  for (const [sec, st] of Object.entries(sectorStats)) {
    lines.push(`  - ${sec}: ${st.applied} / ${st.responded} / ${st.interview} / ${st.offer} (mülakat oranı yüzde ${pct(st.interview, st.applied)}, güven ${confLabel(st.applied)})`);
  }
  if (bestSector) {
    lines.push(`En güçlü sektörün: ${bestSector.name} — mülakat oranı yüzde ${bestSector.rate} (n=${bestSector.applied}, güven ${confLabel(bestSector.applied)})`);
  } else {
    lines.push(`En güçlü sektör: henüz net değil (sektör başına yeterli başvuru yok).`);
  }

  lines.push(`Hedef/beklenti (kişinin kendi oranlarına göre):`);
  lines.push(`  - Bir mülakat için ortalama başvuru: ${appsPerInterview ?? "henüz hesaplanamıyor"}`);
  lines.push(`  - Bir teklif için ortalama başvuru: ${appsPerOffer ?? "henüz veri yok"}`);

  if (uniquePositions.length > 0) {
    lines.push(`Başvurulan pozisyon türleri: ${uniquePositions.join(", ")}`);
  }

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
    const headline = typeof data?.headline === "string" ? data.headline : undefined;
    if (Array.isArray(suggestions) && suggestions.length > 0) {
      return { status: "ok", suggestions, headline };
    }

    // Fonksiyon çalıştı ama öneri yok (parse edilemedi vs.)
    return { status: "empty" };
  } catch (err) {
    console.error("ai-suggestions beklenmeyen hata:", err);
    return { status: "error", message: "Bir şeyler ters gitti." };
  }
}