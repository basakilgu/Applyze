// app/milestone.tsx — "Yolculuğum / Eşikler": başvuru yolculuğunun anlamlı özeti.
import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { Header } from "../components/ui/Header";
import {
  useApplications,
  getMetrics,
  getCounts,
  formatDateLongTr,
} from "../lib/applications";

const C = {
  bg: "#FAF8F4",
  card: "#FFFFFF",
  border: "#EBE7DF",
  ink: "#1F1B16",
  muted: "#5C5650",
  faint: "#8A8278",
  sage: "#3D5A47",
  sageTint: "#F1F4EF",
  sageText: "#2F4639",
};
const F = {
  light: "Inter_300Light",
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
};
const DAY = 24 * 60 * 60 * 1000;

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={{ fontSize: 11, color: C.faint, fontFamily: F.medium, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 12, marginTop: 28 }}>
      {children}
    </Text>
  );
}

export default function MilestoneScreen() {
  const apps = useApplications();

  const d = useMemo(() => {
    if (!apps || apps.length === 0) return null;

    const firstApplied = Math.min(...apps.map((a) => new Date(a.applied_at).getTime()));
    const earliest = (pred: (k: string) => boolean): number | null => {
      let min = Infinity;
      for (const a of apps) {
        for (const h of a.stage_history) {
          if (pred(h.stage_key)) {
            const t = new Date(h.changed_at).getTime();
            if (t < min) min = t;
          }
        }
      }
      return min === Infinity ? null : min;
    };

    const reached = (pred: (k: string) => boolean) =>
      apps.filter((a) => a.stage_history.some((h) => pred(h.stage_key))).length;

    const total = apps.length;
    const screening = reached((k) => k === "screening" || k === "interview" || k === "manager" || k === "offer");
    const interview = reached((k) => k === "interview" || k === "manager" || k === "offer");
    const offer = reached((k) => k === "offer");

    const milestones = [
      { key: "applied", label: "İlk başvuru", at: firstApplied, hint: "Yolculuk başladı" },
      { key: "screening", label: "İlk geri dönüş", at: earliest((k) => k === "screening"), hint: "Biri seni fark etti" },
      { key: "interview", label: "İlk mülakat", at: earliest((k) => k === "interview" || k === "manager"), hint: "İlk açılan kapı" },
      { key: "offer", label: "İlk teklif", at: earliest((k) => k === "offer"), hint: "Emeğin karşılığı" },
    ];

    const counts = getCounts();
    const metrics = getMetrics();
    const daysActive = Math.max(1, Math.floor((Date.now() - firstApplied) / DAY));

    return {
      total, screening, interview, offer, milestones, counts, metrics, daysActive,
      pct: (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0),
    };
  }, [apps]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <Header title="Yolculuğum" showBack={false} showClose />

        {!d ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
            <Text style={{ fontSize: 15, color: C.muted, fontFamily: F.regular, textAlign: "center", lineHeight: 22 }}>
              Henüz başvuru yok. İlk başvurunu ekleyince yolculuğun burada görünmeye başlayacak.
            </Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}>
            {/* Özet kahraman */}
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 34, color: C.ink, fontFamily: F.light, letterSpacing: -0.6 }}>
                {d.total} başvuru
              </Text>
              <Text style={{ fontSize: 14, color: C.faint, fontFamily: F.regular, marginTop: 4 }}>
                {d.daysActive} gündür yoldasın · {d.counts.active} tanesi hâlâ açık
              </Text>
            </View>

            {/* Eşikler */}
            <SectionTitle>Eşikler</SectionTitle>
            <View style={{ backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: "hidden" }}>
              {d.milestones.map((m, i) => {
                const done = m.at != null;
                return (
                  <View
                    key={m.key}
                    style={{
                      flexDirection: "row", alignItems: "center",
                      paddingHorizontal: 16, paddingVertical: 14,
                      borderBottomWidth: i < d.milestones.length - 1 ? 1 : 0, borderBottomColor: C.border,
                      opacity: done ? 1 : 0.55,
                    }}
                  >
                    <View style={{
                      width: 30, height: 30, borderRadius: 15, marginRight: 14,
                      alignItems: "center", justifyContent: "center",
                      backgroundColor: done ? C.sage : "#ECE8E0",
                    }}>
                      <Text style={{ color: done ? "#FFFFFF" : C.faint, fontSize: 14, fontFamily: F.semibold }}>
                        {done ? "✓" : (i + 1).toString()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, color: C.ink, fontFamily: F.medium }}>{m.label}</Text>
                      <Text style={{ fontSize: 12, color: C.faint, fontFamily: F.regular, marginTop: 2 }}>
                        {done ? m.hint : "henüz değil"}
                      </Text>
                    </View>
                    {done && (
                      <Text style={{ fontSize: 12, color: C.sageText, fontFamily: F.medium }}>
                        {formatDateLongTr(new Date(m.at as number).toISOString())}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Huni & dönüşüm */}
            <SectionTitle>Huni & dönüşüm</SectionTitle>
            <View style={{ backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16 }}>
              {[
                { label: "Başvuru", n: d.total, pct: 100 },
                { label: "Geri dönüş", n: d.screening, pct: d.pct(d.screening) },
                { label: "Mülakat", n: d.interview, pct: d.pct(d.interview) },
                { label: "Teklif", n: d.offer, pct: d.pct(d.offer) },
              ].map((row, i) => (
                <View key={row.label} style={{ marginBottom: i < 3 ? 14 : 0 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                    <Text style={{ fontSize: 13, color: C.ink, fontFamily: F.medium }}>{row.label}</Text>
                    <Text style={{ fontSize: 13, color: C.muted, fontFamily: F.regular }}>
                      {row.n}{i > 0 ? `  ·  %${row.pct}` : ""}
                    </Text>
                  </View>
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: C.sageTint, overflow: "hidden" }}>
                    <View style={{ height: 8, borderRadius: 4, width: `${Math.max(row.pct, 2)}%`, backgroundColor: C.sage }} />
                  </View>
                </View>
              ))}
              <Text style={{ fontSize: 11, color: C.faint, fontFamily: F.regular, marginTop: 14, lineHeight: 16 }}>
                Yüzdeler toplam başvuruya göredir. Süreç ilerledikçe bu oranlar daha anlamlı hale gelir.
              </Text>
            </View>

            {/* Öne çıkanlar */}
            <SectionTitle>Öne çıkanlar</SectionTitle>
            <View style={{ backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: "hidden" }}>
              {[
                d.metrics.topPosition ? { label: "En çok başvurduğun alan", value: `${d.metrics.topPosition.name} · ${d.metrics.topPosition.count}` } : null,
                d.metrics.topPlatform ? { label: "En çok kullandığın platform", value: `${d.metrics.topPlatform.name} · ${d.metrics.topPlatform.count}` } : null,
                { label: "Yanıt bekleyen", value: `${d.counts.waiting}` },
                { label: "Bu hafta eklenen", value: `${d.metrics.weeklyCount}` },
              ].filter(Boolean).map((row: any, i, arr) => (
                <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: C.border }}>
                  <Text style={{ fontSize: 14, color: C.muted, fontFamily: F.regular, flex: 1 }}>{row.label}</Text>
                  <Text style={{ fontSize: 14, color: C.ink, fontFamily: F.medium, textAlign: "right" }}>{row.value}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
