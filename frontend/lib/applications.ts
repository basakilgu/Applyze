// frontend/lib/applications.ts
//
// Supabase-backed adapter that mimics the mockData.ts API exactly.
// UI code (index.tsx, etc.) imports from here instead of mockData.ts.
// Drop-in replacement: same function signatures, same return shapes.

import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import type {
  Application,
  Note,
  Platform,
  Stage,
  StageHistoryEntry,
  StageKey,
} from "../types/database";

// ============================================================================
// CONSTANTS — mock'tan birebir kopyalandı
// ============================================================================

export const stageDisplayNames: Record<StageKey, string> = {
  applied: "Başvuruldu",
  screening: "İK Görüşmesi",
  interview: "Teknik Mülakat",
  manager: "Yönetici Görüşmesi",
  offer: "Teklif",
  rejected: "Elenildi",
};

export const platformLabels: Record<Platform, string> = {
  linkedin: "LinkedIn",
  kariyer: "Kariyer.net",
  youthall: "Youthall",
  anbean: "Anbean",
  other: "Diğer",
};

export const platformColors: Record<Platform, string> = {
  linkedin: "#0A66C2",
  kariyer: "#FF6600",
  youthall: "#7C3AED",
  anbean: "#059669",
  other: "#8A8278",
};

// URL normalize — check-duplicate Edge Function ile birebir aynı mantık.
// Aynı ilan farklı linklerle (utm/ref parametreleri, sondaki /) gelse de
// aynı kabul edilsin. Geçersiz URL'de ham hali küçük harfli döner.
export function normalizeUrl(raw: string): string {
  try {
    const url = new URL(raw.trim());
    url.search = "";
    let normalized = url.toString();
    if (normalized.endsWith("/")) normalized = normalized.slice(0, -1);
    return normalized.toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

// ============================================================================
// SUPABASE → MOCK SHAPE DÖNÜŞTÜRÜCÜLER
// ============================================================================

type DbApplication = {
  id: string;
  user_id: string;
  company_name: string;
  position: string;
  location: string | null;
  platform: string | null;
  source_url: string | null;
  current_stage_id: string | null;
  applied_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_favorite: boolean | null;
  fit_score: number | null;
  fit_json: any | null;
  fit_basis: string | null;
  fit_at: string | null;
};

type DbStage = {
  id: string;
  user_id: string;
  name: string;
  key: string | null;
  color: string | null;
  order: number;
  is_terminal: boolean;
  is_default: boolean;
};

type DbStageHistory = {
  id: string;
  application_id: string;
  stage_id: string;
  changed_at: string;
};

type DbNote = {
  id: string;
  application_id: string;
  content: string;
  created_at: string;
};

function normalizePlatform(value: string | null): Platform {
  if (!value) return "other";
  const lower = value.toLowerCase();
  if (lower.includes("linkedin")) return "linkedin";
  if (lower.includes("kariyer")) return "kariyer";
  if (lower.includes("youthall")) return "youthall";
  if (lower.includes("anbean")) return "anbean";
  return "other";
}

function dbStageToStageKey(stageId: string | null, stagesById: Map<string, DbStage>): StageKey {
  if (!stageId) return "applied";
  const stage = stagesById.get(stageId);
  if (!stage?.key) return "applied";
  const validKeys: StageKey[] = ["applied", "screening", "interview", "manager", "offer", "rejected"];
  return validKeys.includes(stage.key as StageKey) ? (stage.key as StageKey) : "applied";
}

function buildApplication(
  app: DbApplication,
  stagesById: Map<string, DbStage>,
  historyByAppId: Map<string, DbStageHistory[]>,
  notesByAppId: Map<string, DbNote[]>
): Application {
  const history = (historyByAppId.get(app.id) ?? []).map<StageHistoryEntry>((h) => {
    const stage = stagesById.get(h.stage_id);
    const stageKey = stage?.key as StageKey | undefined;
    return {
      id: h.id,
      application_id: h.application_id,
      stage_key: stageKey ?? "applied",
      stage_name: stage?.name ?? stageDisplayNames[stageKey ?? "applied"],
      changed_at: h.changed_at,
    };
  });

  const notes = (notesByAppId.get(app.id) ?? []).map<Note>((n) => ({
    id: n.id,
    application_id: n.application_id,
    content: n.content,
    created_at: n.created_at,
  }));

  return {
    id: app.id,
    user_id: app.user_id,
    company_name: app.company_name,
    position: app.position,
    location: app.location ?? undefined,
    platform: normalizePlatform(app.platform),
    source_url: app.source_url ?? undefined,
    current_stage: dbStageToStageKey(app.current_stage_id, stagesById),
    stage_history: history,
    notes,
    applied_at: app.applied_at,
    updated_at: app.updated_at,
    deleted_at: app.deleted_at ?? undefined,
    is_favorite: app.is_favorite ?? false,
    fit_score: app.fit_score ?? undefined,
    fit: (app.fit_json as any) ?? undefined,
    fit_basis: app.fit_basis ?? undefined,
    fit_at: app.fit_at ?? undefined,
  };
}

// ============================================================================
// IN-MEMORY CACHE + LISTENERS (mock store ile aynı pattern)
// ============================================================================

let _cache: Application[] = [];
let _stagesCache: Stage[] = [];
let _loaded = false;
let _loading = false;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

async function loadFromSupabase() {
  if (_loading) return;
  _loading = true;

  try {
    const [appsRes, stagesRes, historyRes, notesRes] = await Promise.all([
      supabase
        .from("applications")
        .select("*")
        .is("deleted_at", null)
        .order("applied_at", { ascending: false }),
      supabase.from("stages").select("*"),
      supabase.from("stage_history").select("*"),
      supabase.from("notes").select("*").order("created_at", { ascending: false }),
    ]);

    if (appsRes.error) throw appsRes.error;
    if (stagesRes.error) throw stagesRes.error;
    if (historyRes.error) throw historyRes.error;
    if (notesRes.error) throw notesRes.error;

    const stages = (stagesRes.data ?? []) as DbStage[];
    const stagesById = new Map(stages.map((s) => [s.id, s]));

    const historyByAppId = new Map<string, DbStageHistory[]>();
    for (const h of (historyRes.data ?? []) as DbStageHistory[]) {
      const arr = historyByAppId.get(h.application_id) ?? [];
      arr.push(h);
      historyByAppId.set(h.application_id, arr);
    }

    const notesByAppId = new Map<string, DbNote[]>();
    for (const n of (notesRes.data ?? []) as DbNote[]) {
      const arr = notesByAppId.get(n.application_id) ?? [];
      arr.push(n);
      notesByAppId.set(n.application_id, arr);
    }

    _cache = ((appsRes.data ?? []) as DbApplication[]).map((app) =>
      buildApplication(app, stagesById, historyByAppId, notesByAppId)
    );

    _stagesCache = stages.map<Stage>((s) => ({
      id: s.id,
      name: s.name,
      key: (s.key as StageKey) ?? "applied",
      order: s.order,
      is_terminal: s.is_terminal,
      is_default: s.is_default,
      color: s.color ?? undefined,
    }));

    _loaded = true;
    notify();
  } catch (err) {
    console.error("[applications adapter] load failed:", err);
  } finally {
    _loading = false;
  }
}

// ============================================================================
// PUBLIC STORE — mockStore ile aynı API
// ============================================================================

function findStageIdByKey(key: StageKey): string | undefined {
  return _stagesCache.find((s) => s.key === key)?.id;
}

export const applicationsStore = {
  getAll(): Application[] {
    return _cache.filter((a) => !a.deleted_at);
  },

  getById(id: string): Application | undefined {
    return _cache.find((a) => a.id === id && !a.deleted_at);
  },

  // Verilen URL'ye sahip (silinmemiş) bir başvuru var mı? İki tarafı da
  // normalize ederek eşleştirir; eski/normalize edilmemiş kayıtları da yakalar.
  findByUrl(rawUrl: string): Application | null {
    const target = normalizeUrl(rawUrl);
    if (!target) return null;
    return (
      _cache.find(
        (a) => !a.deleted_at && !!a.source_url && normalizeUrl(a.source_url) === target,
      ) ?? null
    );
  },

  async refresh() {
    await loadFromSupabase();
  },

  async add(input: {
    company_name: string;
    position: string;
    location?: string;
    platform: Platform;
    source_url?: string;
    initial_stage?: StageKey;
    initial_note?: string;
    applied_at?: string;
  }): Promise<Application | null> {
    const stageKey = input.initial_stage ?? "applied";
    const stageId = findStageIdByKey(stageKey);

    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) {
      console.error("[applications adapter] add: no user");
      return null;
    }

    const { data, error } = await supabase
      .from("applications")
      .insert({
        user_id: uid,
        company_name: input.company_name,
        position: input.position,
        location: input.location ?? null,
        platform: input.platform,
        source_url: input.source_url ? normalizeUrl(input.source_url) : null,
        current_stage_id: stageId ?? null,
        ...(input.applied_at ? { applied_at: input.applied_at } : {}),
      })
      .select()
      .single();

    if (error || !data) {
      console.error("[applications adapter] add failed:", error);
      return null;
    }

    if (stageId) {
      await supabase.from("stage_history").insert({
        application_id: data.id,
        stage_id: stageId,
        ...(input.applied_at ? { changed_at: input.applied_at } : {}),
      });
    }

    if (input.initial_note) {
      await supabase.from("notes").insert({
        application_id: data.id,
        content: input.initial_note,
      });
    }

    await loadFromSupabase();
    return _cache.find((a) => a.id === data.id) ?? null;
  },

  async update(id: string, updates: Partial<Application>): Promise<void> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.company_name !== undefined) dbUpdates.company_name = updates.company_name;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.location !== undefined) dbUpdates.location = updates.location ?? null;
    if (updates.platform !== undefined) dbUpdates.platform = updates.platform;
    if (updates.source_url !== undefined) dbUpdates.source_url = updates.source_url ?? null;
    if (updates.is_favorite !== undefined) dbUpdates.is_favorite = updates.is_favorite;

    const { error } = await supabase.from("applications").update(dbUpdates).eq("id", id);

    if (error) {
      console.error("[applications adapter] update failed:", error);
      return;
    }

    await loadFromSupabase();
  },

  async updateStage(id: string, newStage: StageKey): Promise<void> {
    const stageId = findStageIdByKey(newStage);
    if (!stageId) {
      console.error("[applications adapter] updateStage: unknown stage", newStage);
      return;
    }

    const { error: updateErr } = await supabase
      .from("applications")
      .update({ current_stage_id: stageId })
      .eq("id", id);

    if (updateErr) {
      console.error("[applications adapter] updateStage failed:", updateErr);
      return;
    }

    await supabase.from("stage_history").insert({
      application_id: id,
      stage_id: stageId,
    });

    await loadFromSupabase();
  },

  async addNote(id: string, content: string): Promise<void> {
    const { error } = await supabase.from("notes").insert({
      application_id: id,
      content,
    });

    if (error) {
      console.error("[applications adapter] addNote failed:", error);
      return;
    }

    await loadFromSupabase();
  },

  async toggleFavorite(id: string): Promise<void> {
    const current = _cache.find((a) => a.id === id);
    if (!current) return;

    const { error } = await supabase
      .from("applications")
      .update({ is_favorite: !current.is_favorite })
      .eq("id", id);

    if (error) {
      console.error("[applications adapter] toggleFavorite failed:", error);
      return;
    }

    await loadFromSupabase();
  },

  async saveFit(
    id: string,
    result: { skor: number; guven: string; eslesme: string[]; eksikler: string[]; ats: string[]; vurgu: string[] },
    basis: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("applications")
      .update({ fit_score: result.skor, fit_json: result, fit_basis: basis, fit_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      console.error("[applications adapter] saveFit failed:", error);
      return;
    }
    await loadFromSupabase();
  },

  async softDelete(id: string): Promise<void> {
    const { error } = await supabase
      .from("applications")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[applications adapter] softDelete failed:", error);
      return;
    }

    await loadFromSupabase();
  },

  subscribe(listener: () => void): () => void {
    _listeners.add(listener);
    return () => {
      _listeners.delete(listener);
    };
  },
};

// ============================================================================
// REACT HOOKS — mock ile aynı imza
// ============================================================================

export function useApplications(): Application[] {
  const [, force] = useState(0);

  useEffect(() => {
    if (!_loaded && !_loading) {
      loadFromSupabase();
    }
    const unsub = applicationsStore.subscribe(() => force((n) => n + 1));
    return unsub;
  }, []);

  return applicationsStore.getAll();
}

export function useApplication(id: string | undefined): Application | undefined {
  const [, force] = useState(0);

  useEffect(() => {
    if (!_loaded && !_loading) {
      loadFromSupabase();
    }
    const unsub = applicationsStore.subscribe(() => force((n) => n + 1));
    return unsub;
  }, []);

  return id ? applicationsStore.getById(id) : undefined;
}

// ============================================================================
// HELPERS — mock'tan birebir kopyalandı
// ============================================================================

export function getCounts() {
  const all = applicationsStore.getAll();
  return {
    all: all.length,
    active: all.filter((a) => a.current_stage !== "rejected" && a.current_stage !== "offer").length,
    interview: all.filter((a) => a.current_stage === "interview" || a.current_stage === "manager").length,
    archive: all.filter((a) => a.current_stage === "rejected" || a.current_stage === "offer").length,
    waiting: all.filter((a) => {
      if (a.current_stage !== "applied") return false;
      const days = Math.floor((Date.now() - new Date(a.applied_at).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 3;
    }).length,
    offer: all.filter((a) => a.current_stage === "offer").length,
  };
}

export function formatDateTr(iso: string): string {
  const date = new Date(iso);
  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

export function formatDateLongTr(iso: string): string {
  const date = new Date(iso);
  const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function getRelativeTimeTr(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "bugün";
  if (days === 1) return "dün";
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  return formatDateTr(iso);
}

export function getStageName(key: StageKey): string {
  return stageDisplayNames[key];
}

export function getStageOrder(key: StageKey): number {
  const stage = _stagesCache.find((s) => s.key === key);
  if (stage) return stage.order;
  // Fallback (cache henüz dolmadıysa)
  const fallback: Record<StageKey, number> = {
    applied: 1,
    screening: 2,
    interview: 3,
    manager: 4,
    offer: 5,
    rejected: 6,
  };
  return fallback[key] ?? 0;
}

export function getMetrics() {
  const all = applicationsStore.getAll();
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const lastWeek = all.filter((a) => now - new Date(a.applied_at).getTime() < week);

  const platformCounts = all.reduce<Record<Platform, number>>(
    (acc, a) => {
      acc[a.platform] = (acc[a.platform] || 0) + 1;
      return acc;
    },
    { linkedin: 0, kariyer: 0, youthall: 0, anbean: 0, other: 0 }
  );

  const topPlatform = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0];

  const positionCounts = all.reduce<Record<string, number>>((acc, a) => {
    const key = a.position.toLowerCase().includes("ürün")
      ? "Ürün Yönetimi"
      : a.position.toLowerCase().includes("süreç")
      ? "Süreç Tasarımı"
      : a.position.toLowerCase().includes("analist")
      ? "İş Analistliği"
      : a.position.toLowerCase().includes("operasyon")
      ? "Operasyon"
      : a.position.toLowerCase().includes("müşteri")
      ? "Müşteri Deneyimi"
      : a.position.toLowerCase().includes("dijital")
      ? "Dijital Bankacılık"
      : "Diğer";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topPosition = Object.entries(positionCounts).sort((a, b) => b[1] - a[1])[0];

  const totalApplied = all.length;
  const reachedScreening = all.filter((a) =>
    a.stage_history.some((h) => h.stage_key === "screening")
  ).length;
  const reachedInterview = all.filter((a) =>
    a.stage_history.some((h) => h.stage_key === "interview" || h.stage_key === "manager")
  ).length;
  const reachedOffer = all.filter((a) => a.current_stage === "offer").length;

  return {
    weeklyCount: lastWeek.length,
    interviewCount: all.filter((a) => a.current_stage === "interview" || a.current_stage === "manager")
      .length,
    topPlatform: topPlatform
      ? { name: platformLabels[topPlatform[0] as Platform], count: topPlatform[1] }
      : null,
    topPosition: topPosition ? { name: topPosition[0], count: topPosition[1] } : null,
    funnel: {
      applied: totalApplied,
      screening: reachedScreening,
      interview: reachedInterview,
      offer: reachedOffer,
    },
  };
}

// Geriye dönük uyumluluk: mock'taki `mockStages` static listesi.
// Stage cache yüklendiğinde dinamik olur; yüklenmediyse default değerler.
export const mockStages: Stage[] = (() => {
  if (_stagesCache.length > 0) return _stagesCache;
  // Cache henüz boşken kullanılabilecek default stage'ler
  return [
    { id: "s1", name: "Başvuruldu",         key: "applied",   order: 1, is_terminal: false, is_default: true, color: "#8FA8B8" },
    { id: "s2", name: "İK Görüşmesi",       key: "screening", order: 2, is_terminal: false, is_default: true, color: "#9FB892" },
    { id: "s3", name: "Teknik Mülakat",     key: "interview", order: 3, is_terminal: false, is_default: true, color: "#C4A875" },
    { id: "s4", name: "Yönetici Görüşmesi", key: "manager",   order: 4, is_terminal: false, is_default: true, color: "#C4A875" },
    { id: "s5", name: "Teklif",             key: "offer",     order: 5, is_terminal: true,  is_default: true, color: "#7A9270" },
    { id: "s6", name: "Elenildi",           key: "rejected",  order: 6, is_terminal: true,  is_default: true, color: "#A8908F" },
  ];
})();

// Stage'leri dinamik almak için (cache yüklendikten sonra)
export function getStages(): Stage[] {
  return _stagesCache.length > 0 ? _stagesCache : mockStages;
}

// Geriye dönük uyumluluk: mock'taki `mockStore` ismi
export const mockStore = applicationsStore;