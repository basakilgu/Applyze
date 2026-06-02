// app/(tabs)/dashboard.tsx — Özet ekranı
// Sadece useApplications'ı dışarıdan alıyor. Tüm helper'lar ve UI bileşenleri içeride.

import React, { useMemo, useId, useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from "react-native-svg";

import { useApplications } from "../../lib/applications";
import { fetchAiSuggestions, type AiResult } from "../../lib/aiSuggestions";

// =============================================================
// THEME
// =============================================================

const colors = {
  cream50: "#FAF8F4",
  cream100: "#F4F1EB",
  cream200: "#EBE7DF",
  cream300: "#D9D3C8",
  ink900: "#1F1B16",
  ink700: "#5C5650",
  ink500: "#8A8278",
  ink300: "#B8B0A4",
  forestDeep: "#1A2622",
  forestSurface: "#243530",
  sage: "#3D5A47",
  sageMist: "#B8C9BD",
  sagePale: "#E2E8D6",
  white: "#FFFFFF",
  divider: "rgba(235, 231, 223, 0.7)",
  danger: "#A96458",
};

const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  light: "Inter_300Light",
};

const shadows = {
  card: {
    shadowColor: "#1F1B16",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  elevated: {
    shadowColor: "#1F1B16",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
};

// =============================================================
// USER (hardcoded — no external dep)
// =============================================================

const USER_NAME = "Başak";

// =============================================================
// HELPER FUNCTIONS (mockData'dan bağımsız, apps'i parametre alır)
// =============================================================

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  kariyer: "Kariyer.net",
  youthall: "Youthall",
  anbean: "Anbean",
  other: "Diğer",
};

const MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
const MONTHS_LONG = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const WEEK_DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

function formatTodayLong(): string {
  const date = new Date();
  return `${WEEK_DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS_LONG[date.getMonth()]}`;
}

function getRelativeTimeTr(iso: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "bugün";
  if (days === 1) return "dün";
  if (days < 7) return `${days} gün önce`;
  if (days < 30) return `${Math.floor(days / 7)} hafta önce`;
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const firstName = name.split(" ")[0];
  if (hour < 6) return `İyi geceler, ${firstName}`;
  if (hour < 12) return `Günaydın, ${firstName}`;
  if (hour < 18) return `İyi günler, ${firstName}`;
  return `İyi akşamlar, ${firstName}`;
}

// Apps'ten counts hesapla (mockData'ya bağımsız)
function computeCounts(apps: any[]) {
  return {
    all: apps.length,
    active: apps.filter((a) => a.current_stage !== "rejected" && a.current_stage !== "offer").length,
    interview: apps.filter((a) => a.current_stage === "interview" || a.current_stage === "manager").length,
    offer: apps.filter((a) => a.current_stage === "offer").length,
    rejected: apps.filter((a) => a.current_stage === "rejected").length,
  };
}

// Apps'ten dashboard verilerini hesapla
function computeDashboardData(apps: any[]) {
  const now = Date.now();

  const reachedApplied = apps.length;
  const reachedScreening = apps.filter(
    (a) =>
      Array.isArray(a.stage_history) &&
      a.stage_history.some((h: any) => h.stage_key === "screening")
  ).length;
  const reachedInterview = apps.filter(
    (a) =>
      Array.isArray(a.stage_history) &&
      a.stage_history.some((h: any) => h.stage_key === "interview")
  ).length;
  const reachedOffer = apps.filter((a) => a.current_stage === "offer").length;

  const recentMoves = [...apps]
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.applied_at).getTime() -
        new Date(a.updated_at || a.applied_at).getTime()
    )
    .slice(0, 3);

  const sortedByApplied = [...apps].sort(
    (a, b) =>
      new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime()
  );
  const firstApp = sortedByApplied[0];
  const daysSinceStart = firstApp
    ? Math.floor(
        (now - new Date(firstApp.applied_at).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return {
    funnel: {
      applied: reachedApplied,
      screening: reachedScreening,
      interview: reachedInterview,
      offer: reachedOffer,
    },
    recentMoves,
    daysSinceStart,
  };
}

// =============================================================
// CompassMark
// =============================================================

function CompassMark({
  size,
  variant,
  color,
  haloColor,
}: {
  size: number;
  variant: "filled" | "outline" | "glow-dark";
  color?: string;
  haloColor?: string;
}) {
  const id = useId().replace(/:/g, "_");

  if (variant === "filled") {
    const c = color ?? colors.sage;
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d="M 16 4 L 21 16 L 16 28 L 11 16 Z" fill={c} />
      </Svg>
    );
  }

  if (variant === "outline") {
    const halo = haloColor ?? colors.sage;
    return (
      <Svg width={size} height={size} viewBox="0 0 60 60">
        <Circle cx="30" cy="30" r="27" stroke={halo} strokeWidth="0.8" fill="none" />
        <Path d="M 30 12 L 36 30 L 30 48 L 24 30 Z" fill={halo} />
      </Svg>
    );
  }

  const c = color ?? colors.sageMist;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={c} stopOpacity="0.55" />
          <Stop offset="55%" stopColor={c} stopOpacity="0.18" />
          <Stop offset="100%" stopColor={c} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy="50" r="48" fill={`url(#${id})`} />
      <Path d="M 50 30 L 56 50 L 50 70 L 44 50 Z" fill={c} />
    </Svg>
  );
}

// =============================================================
// UI helpers
// =============================================================

function Card({
  children,
  padding = 16,
}: {
  children: React.ReactNode;
  padding?: number;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.cream300,
        padding,
        ...shadows.card,
      }}
    >
      {children}
    </View>
  );
}

function SectionLabel({
  title,
  rightLabel,
  onRightPress,
}: {
  title: string;
  rightLabel?: string;
  onRightPress?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 4,
        paddingBottom: 10,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          color: colors.ink500,
          fontFamily: fonts.medium,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
      {rightLabel && onRightPress ? (
        <Pressable
          onPress={onRightPress}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={{ fontSize: 12, color: colors.sage, fontFamily: fonts.medium }}>
            {rightLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const STAGE_LABELS: Record<string, string> = {
  applied: "Başvuru",
  screening: "İK",
  interview: "Mülakat",
  manager: "Yönetici",
  offer: "Teklif",
  rejected: "Elendi",
};

const STAGE_PALETTE: Record<string, { bg: string; text: string }> = {
  applied: { bg: "#DEE6EE", text: "#2F4358" },
  screening: { bg: "#E2E8D6", text: "#4A5638" },
  interview: { bg: "#EDE0CE", text: "#5E4828" },
  manager: { bg: "#EDE0CE", text: "#5E4828" },
  offer: { bg: "#D5E3CC", text: "#2F4A2A" },
  rejected: { bg: "#E8D8D8", text: "#6B4444" },
};

function Badge({ stage }: { stage: string }) {
  const c = STAGE_PALETTE[stage] ?? STAGE_PALETTE.applied;
  const label = STAGE_LABELS[stage] ?? stage;
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        backgroundColor: c.bg,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          color: c.text,
          fontFamily: fonts.medium,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function FunnelChart({
  data,
}: {
  data: { applied: number; screening: number; interview: number; offer: number };
}) {
  const stages = [
    { label: "Başvuru", count: data.applied, color: colors.sageMist },
    { label: "İK Görüşmesi", count: data.screening, color: colors.sage },
    { label: "Mülakat", count: data.interview, color: colors.forestSurface },
    { label: "Teklif", count: data.offer, color: colors.forestDeep },
  ];
  const max = data.applied || 1;

  return (
    <View>
      {stages.map((s, i) => (
        <View key={i} style={{ marginBottom: i < stages.length - 1 ? 14 : 0 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.ink700, fontFamily: fonts.medium }}>
              {s.label}
            </Text>
            <Text style={{ fontSize: 12, color: colors.ink900, fontFamily: fonts.semibold }}>
              {s.count}
            </Text>
          </View>
          <View
            style={{
              height: 6,
              backgroundColor: colors.cream200,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${(s.count / max) * 100}%`,
                backgroundColor: s.color,
                borderRadius: 3,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function ChevronRight({
  color = colors.sage,
  size = 14,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path
        d="M 5 3 L 9 7 L 5 11"
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArrowUp({ color }: { color: string }) {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10">
      <Path
        d="M 5 8 L 5 2 M 2 5 L 5 2 L 8 5"
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArrowDown({ color }: { color: string }) {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10">
      <Path
        d="M 5 2 L 5 8 M 2 5 L 5 8 L 8 5"
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MetricColumn({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <View style={{ flex: 1, alignItems: "flex-start" }}>
      <Text
        style={{
          fontSize: 36,
          color: accent ? colors.sage : colors.ink900,
          fontFamily: fonts.semibold,
          letterSpacing: -1,
          lineHeight: 40,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: colors.ink500,
          marginTop: 4,
          fontFamily: fonts.medium,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function WeeklyBars({ counts }: { counts: number[] }) {
  const labels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const today = new Date().getDay();
  const orderedToday = today === 0 ? 6 : today - 1;
  const max = Math.max(...counts, 1);

  return (
    <View style={{ marginTop: 18 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          height: 56,
          borderBottomWidth: 0.5,
          borderColor: colors.cream300,
          paddingBottom: 2,
        }}
      >
        {counts.map((c, i) => {
          const heightRatio = c === 0 ? 0.05 : c / max;
          const isToday = i === orderedToday;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                alignItems: "center",
                height: 56,
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  width: 14,
                  height: Math.max(3, heightRatio * 54),
                  backgroundColor:
                    c === 0 ? colors.cream200 : isToday ? colors.sage : colors.sageMist,
                  borderRadius: 2,
                }}
              />
            </View>
          );
        })}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        {labels.map((l, i) => (
          <View key={l} style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 10,
                color: i === orderedToday ? colors.ink900 : colors.ink500,
                fontFamily: i === orderedToday ? fonts.medium : fonts.regular,
                letterSpacing: 0.3,
              }}
            >
              {l}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// =============================================================
// Ana ekran
// =============================================================

export default function DashboardScreen() {
  const router = useRouter();
  const apps = (useApplications() ?? []) as any[];

  const counts = useMemo(() => computeCounts(apps), [apps]);
  const data = useMemo(() => computeDashboardData(apps), [apps]);
  // ===========================================================
  // AI ÖNERİLERİ (Gemini — ai-suggestions Edge Function)
  // ===========================================================
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    // En az 3 başvuru yoksa AI çağırma (veri çok az, anlamlı yorum çıkmaz)
    if (counts.all < 3) {
      setAiResult(null);
      return;
    }

    let cancelled = false;
    setAiLoading(true);

    fetchAiSuggestions(apps)
      .then((result) => {
        if (!cancelled) setAiResult(result);
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });

    // Component kapanırsa eski isteği iptal et (yarış durumu önlenir)
    return () => {
      cancelled = true;
    };
    // apps değişince (yeni başvuru, aşama güncellemesi) öneriler yenilenir
  }, [apps.length]);

  const weekStats = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const thisWeek = apps.filter(
      (a) => now - new Date(a.applied_at).getTime() < 7 * dayMs
    ).length;
    const lastWeek = apps.filter((a) => {
      const t = now - new Date(a.applied_at).getTime();
      return t >= 7 * dayMs && t < 14 * dayMs;
    }).length;
    const diff = thisWeek - lastWeek;

    const bars = [0, 0, 0, 0, 0, 0, 0];
    apps.forEach((a) => {
      const d = new Date(a.applied_at);
      const ageDays = Math.floor((now - d.getTime()) / dayMs);
      if (ageDays < 7) {
        const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
        bars[dayOfWeek]++;
      }
    });

    return { thisWeek, lastWeek, diff, bars };
  }, [apps]);

  const patterns = useMemo(() => {
    if (apps.length === 0) return null;
    const platformCount: Record<string, number> = {};
    apps.forEach((a) => {
      platformCount[a.platform] = (platformCount[a.platform] || 0) + 1;
    });
    const topPlatform = Object.entries(platformCount).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const activeApps = apps.filter(
      (a) => a.current_stage !== "rejected" && a.current_stage !== "offer"
    );
    const stageCount: Record<string, number> = {};
    activeApps.forEach((a) => {
      stageCount[a.current_stage] = (stageCount[a.current_stage] || 0) + 1;
    });
    const topStage = Object.entries(stageCount).sort((a, b) => b[1] - a[1])[0];
    const stageNameMap: Record<string, string> = {
      applied: "başvuru",
      screening: "İK görüşmesi",
      interview: "mülakat",
    };

    return {
      topPlatform: {
        name: PLATFORM_LABELS[topPlatform[0]] ?? topPlatform[0],
        count: topPlatform[1],
        total: apps.length,
      },
      topStage: topStage
        ? { name: stageNameMap[topStage[0]] ?? topStage[0], count: topStage[1] }
        : null,
    };
  }, [apps]);

  const waitingApps = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    return apps
      .filter((a) => {
        if (a.current_stage === "rejected" || a.current_stage === "offer") return false;
        const days = (now - new Date(a.updated_at || a.applied_at).getTime()) / dayMs;
        return days >= 7;
      })
      .sort(
        (a, b) =>
          new Date(a.updated_at || a.applied_at).getTime() -
          new Date(b.updated_at || b.applied_at).getTime()
      )
      .slice(0, 3);
  }, [apps]);

  const reflection = useMemo(() => {
    if (counts.all === 0) {
      return "Henüz yola çıkmadın. İlk başvurunu eklemek için Liste sekmesine dokun.";
    }
    if (counts.offer > 0) {
      return `Bir teklif aldın — ${data.daysSinceStart} gündür süren bir yolculuğun karşılığı.`;
    }
    if (weekStats.thisWeek === 0 && weekStats.lastWeek > 0) {
      return `Bu hafta yeni başvuru eklemedin. Geçen hafta ${weekStats.lastWeek} eklemiştin — durmak da yolculuğun parçası.`;
    }
    if (weekStats.thisWeek === 0) {
      return "Bu hafta yeni başvuru eklemedin. Bir sonraki adımı düşünmek için iyi bir an.";
    }
    if (counts.interview > 0) {
      return `Bu hafta ${weekStats.thisWeek} yeni başvuru ekledin, ${counts.interview} tanesi mülakat aşamasında.`;
    }
    return `Bu hafta ${weekStats.thisWeek} yeni başvuru ekledin. Yolun başında olmak güzel.`;
  }, [counts, data, weekStats]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream50 }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 22 }}>
            <Text
              style={{
                fontSize: 11,
                color: colors.ink500,
                fontFamily: fonts.medium,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              {formatTodayLong()}
            </Text>
            <Text
              style={{
                fontSize: 28,
                color: colors.ink900,
                marginTop: 8,
                fontFamily: fonts.light,
                fontStyle: "italic",
                letterSpacing: -0.4,
                lineHeight: 36,
              }}
            >
              {getGreeting(USER_NAME)}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.ink700,
                marginTop: 12,
                fontFamily: fonts.regular,
                lineHeight: 22,
              }}
            >
              {reflection}
            </Text>
          </View>

          {counts.all > 0 && (
            <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
              <View
                style={{
                  backgroundColor: colors.forestDeep,
                  borderRadius: 18,
                  paddingVertical: 24,
                  paddingHorizontal: 22,
                  flexDirection: "row",
                  alignItems: "center",
                  overflow: "hidden",
                  position: "relative",
                  ...shadows.elevated,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    right: -18,
                    bottom: -18,
                    opacity: 0.45,
                  }}
                >
                  <CompassMark size={130} variant="glow-dark" color={colors.sageMist} />
                </View>

                <View style={{ flex: 1, zIndex: 1 }}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: colors.sageMist,
                      fontFamily: fonts.medium,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    Pusulan
                  </Text>
                  <Text
                    style={{
                      fontSize: 22,
                      color: colors.cream50,
                      marginTop: 8,
                      fontFamily: fonts.light,
                      fontStyle: "italic",
                      lineHeight: 28,
                      letterSpacing: -0.3,
                    }}
                  >
                    Yolun {data.daysSinceStart}. gününde.
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.ink300,
                      marginTop: 8,
                      fontFamily: fonts.regular,
                      letterSpacing: 0.2,
                    }}
                  >
                    {counts.all} başvuru · {counts.interview} mülakat ·{" "}
                    {counts.offer} teklif
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 22,
              flexDirection: "row",
              borderTopWidth: 0.5,
              borderBottomWidth: 0.5,
              borderColor: colors.divider,
              backgroundColor: colors.cream100,
            }}
          >
            <MetricColumn label="Aktif" value={counts.active} />
            <View style={{ width: 0.5, backgroundColor: colors.cream300 }} />
            <View style={{ flex: 1, paddingLeft: 20 }}>
              <MetricColumn label="Mülakat" value={counts.interview} accent />
            </View>
            <View style={{ width: 0.5, backgroundColor: colors.cream300 }} />
            <View style={{ flex: 1, paddingLeft: 20 }}>
              <MetricColumn label="Teklif" value={counts.offer} />
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
            <SectionLabel title="YOLUN HARİTASI" />
            <Card padding={20}>
              {counts.all < 3 ? (
                <View style={{ alignItems: "center", paddingVertical: 18 }}>
                  <CompassMark size={42} variant="outline" haloColor={colors.sage} />
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.ink900,
                      fontFamily: fonts.light,
                      fontStyle: "italic",
                      textAlign: "center",
                      marginTop: 14,
                      lineHeight: 22,
                    }}
                  >
                    Yolun haritası birikmeye başlıyor.
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.ink500,
                      textAlign: "center",
                      marginTop: 8,
                      fontFamily: fonts.regular,
                      lineHeight: 18,
                    }}
                  >
                    {3 - counts.all} başvuru daha eklediğinde örüntüler{"\n"}
                    görünür hale gelecek.
                  </Text>
                </View>
              ) : (
                <FunnelChart data={data.funnel} />
              )}
            </Card>
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
            <SectionLabel title="BU HAFTA" />
            <Card padding={18}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text
                    style={{
                      fontSize: 32,
                      color: colors.ink900,
                      fontFamily: fonts.semibold,
                      letterSpacing: -0.8,
                      lineHeight: 36,
                    }}
                  >
                    {weekStats.thisWeek}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.ink700,
                      marginLeft: 8,
                      fontFamily: fonts.regular,
                    }}
                  >
                    yeni başvuru
                  </Text>
                </View>

                {(weekStats.thisWeek > 0 || weekStats.lastWeek > 0) && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 999,
                      backgroundColor:
                        weekStats.diff >= 0 ? colors.sagePale : colors.cream200,
                    }}
                  >
                    {weekStats.diff > 0 ? (
                      <ArrowUp color={colors.sage} />
                    ) : weekStats.diff < 0 ? (
                      <ArrowDown color={colors.ink700} />
                    ) : null}
                    <Text
                      style={{
                        fontSize: 11,
                        color: weekStats.diff >= 0 ? colors.sage : colors.ink700,
                        marginLeft: weekStats.diff !== 0 ? 5 : 0,
                        fontFamily: fonts.medium,
                        letterSpacing: 0.2,
                      }}
                    >
                      Geçen hafta {weekStats.lastWeek}
                    </Text>
                  </View>
                )}
              </View>

              <WeeklyBars counts={weekStats.bars} />
            </Card>
          </View>

          {patterns && counts.all >= 3 && (
            <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
              <SectionLabel title="ÖRÜNTÜLER" />
              <Card padding={0}>
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: patterns.topStage ? 0.5 : 0,
                    borderColor: colors.divider,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      color: colors.ink500,
                      fontFamily: fonts.medium,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    En çok başvurduğun
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.ink900,
                      marginTop: 4,
                      fontFamily: fonts.regular,
                      lineHeight: 20,
                    }}
                  >
                    {patterns.topPlatform.name} —{" "}
                    <Text style={{ fontFamily: fonts.medium }}>
                      {patterns.topPlatform.count}/{patterns.topPlatform.total}
                    </Text>
                  </Text>
                </View>

                {patterns.topStage && (
                  <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.ink500,
                        fontFamily: fonts.medium,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      Aktiflik tonu
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.ink900,
                        marginTop: 4,
                        fontFamily: fonts.regular,
                        lineHeight: 20,
                      }}
                    >
                      Aktif başvuruların çoğu{" "}
                      <Text style={{ fontFamily: fonts.medium }}>
                        {patterns.topStage.name}
                      </Text>{" "}
                      aşamasında.
                    </Text>
                  </View>
                )}
              </Card>
            </View>
          )}

          {waitingApps.length > 0 && (
            <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
              <SectionLabel title="GERİ DÖNÜŞ BEKLEYENLER" />
              <Card padding={0}>
                {waitingApps.map((app, idx) => {
                  const days = Math.floor(
                    (Date.now() -
                      new Date(app.updated_at || app.applied_at).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <Pressable
                      key={app.id}
                      onPress={() => router.push(`/application/${app.id}`)}
                      style={({ pressed }) => ({
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottomWidth: idx === waitingApps.length - 1 ? 0 : 0.5,
                        borderColor: colors.divider,
                        opacity: pressed ? 0.6 : 1,
                      })}
                    >
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: colors.ink900,
                            fontFamily: fonts.medium,
                          }}
                          numberOfLines={1}
                        >
                          {app.position}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.ink500,
                            marginTop: 2,
                            fontFamily: fonts.regular,
                          }}
                          numberOfLines={1}
                        >
                          {app.company_name} · {days} gündür sessiz
                        </Text>
                      </View>
                      <ChevronRight color={colors.ink300} />
                    </Pressable>
                  );
                })}
              </Card>
            </View>
          )}

          {data.recentMoves.length > 0 && (
            <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
              <SectionLabel
                title="SON HAREKETLER"
                rightLabel="Tümünü gör"
                onRightPress={() => router.push("/(tabs)")}
              />
              <Card padding={0}>
                {data.recentMoves.map((app: any, idx: number) => (
                  <Pressable
                    key={app.id}
                    onPress={() => router.push(`/application/${app.id}`)}
                    style={({ pressed }) => ({
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottomWidth:
                        idx === data.recentMoves.length - 1 ? 0 : 0.5,
                      borderColor: colors.divider,
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.ink900,
                          fontFamily: fonts.medium,
                        }}
                        numberOfLines={1}
                      >
                        {app.position}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          color: colors.ink500,
                          marginTop: 2,
                          fontFamily: fonts.regular,
                        }}
                        numberOfLines={1}
                      >
                        {app.company_name} ·{" "}
                        {getRelativeTimeTr(app.updated_at || app.applied_at)}
                      </Text>
                    </View>
                    <Badge stage={app.current_stage} />
                  </Pressable>
                ))}
              </Card>
            </View>
          )}

          {counts.all >= 3 && (
            <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
              <SectionLabel title="PUSULAN ŞUNLARI SÖYLÜYOR" />
              <View
                style={{
                  backgroundColor: colors.forestSurface,
                  borderRadius: 12,
                  overflow: "hidden",
                  position: "relative",
                  minHeight: 80,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    opacity: 0.18,
                    zIndex: 0,
                  }}
                >
                  <CompassMark
                    size={56}
                    variant="outline"
                    haloColor={colors.sageMist}
                  />
                </View>

                {/* DURUM 1: Yükleniyor */}
                {aiLoading && (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 22,
                      zIndex: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.sageMist,
                        fontFamily: fonts.light,
                        fontStyle: "italic",
                        lineHeight: 19,
                      }}
                    >
                      Pusula başvurularını okuyor…
                    </Text>
                  </View>
                )}

                {/* DURUM 2: Başarılı — Gemini önerileri */}
                {!aiLoading &&
                  aiResult?.status === "ok" &&
                  aiResult.suggestions.map((s, idx) => (
                    <View
                      key={idx}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderBottomWidth:
                          idx === aiResult.suggestions.length - 1 ? 0 : 0.5,
                        borderColor: "rgba(184, 201, 189, 0.14)",
                        zIndex: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.sagePale,
                          fontFamily: fonts.semibold,
                          marginBottom: 4,
                          lineHeight: 18,
                        }}
                      >
                        {s.baslik}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.cream100,
                          fontFamily: fonts.regular,
                          lineHeight: 19,
                        }}
                      >
                        {s.metin}
                      </Text>
                    </View>
                  ))}

                {/* DURUM 3: Boş — öneri üretilemedi */}
                {!aiLoading && aiResult?.status === "empty" && (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 22,
                      zIndex: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.cream100,
                        fontFamily: fonts.regular,
                        lineHeight: 19,
                      }}
                    >
                      Henüz net bir örüntü oluşmadı. Başvuruların arttıkça pusula
                      daha çok şey söyleyecek.
                    </Text>
                  </View>
                )}

                {/* DURUM 4: Hata */}
                {!aiLoading && aiResult?.status === "error" && (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 22,
                      zIndex: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.cream100,
                        fontFamily: fonts.regular,
                        lineHeight: 19,
                      }}
                    >
                      Öneriler şu an alınamadı. Biraz sonra tekrar dene.
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={{
                  fontSize: 11,
                  color: colors.ink500,
                  marginTop: 10,
                  fontFamily: fonts.light,
                  fontStyle: "italic",
                  lineHeight: 17,
                  paddingHorizontal: 4,
                }}
              >
                Pusula, başvuru verini yorumlar. Şirket adların paylaşılmaz.
              </Text>
            </View>
          )}

          {counts.all >= 1 && (
            <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
              <Pressable
                onPress={() => router.push("/milestone")}
                style={({ pressed }) => ({
                  paddingHorizontal: 18,
                  paddingVertical: 18,
                  borderRadius: 10,
                  borderWidth: 0.8,
                  borderColor: colors.divider,
                  backgroundColor: colors.white,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: pressed ? 0.7 : 1,
                  ...shadows.card,
                })}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.cream100,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <CompassMark size={20} variant="filled" color={colors.sage} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.ink900,
                        fontFamily: fonts.medium,
                      }}
                    >
                      Eşiklerini gör
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.ink500,
                        marginTop: 2,
                        fontFamily: fonts.regular,
                      }}
                    >
                      {data.daysSinceStart} gün · {counts.all} başvuru
                    </Text>
                  </View>
                </View>
                <ChevronRight />
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
