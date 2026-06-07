// app/(tabs)/index.tsx — Applications List (Liste)
// Tek değişiklik: Tag bileşeni içeride inline FilterChip olarak tanımlandı.
// Chip'ler arası spacing düzgün, label + count yan yana, aktif durum belirgin.

import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Svg, { Line, Path, Circle } from "react-native-svg";

import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import {
  useApplications, getCounts, formatDateTr, getStageOrder, platformColors, platformLabels,
} from "../../lib/applications";
import type { StageKey, Platform } from "../../types/database";

type FilterKey = "all" | "active" | "interview" | "archive" | "favorites";

// =============================================================
// FilterChip — dosya içi (eski Tag yerine)
// =============================================================
function FilterChip({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: active ? "#3D5A47" : "#F4F1EB",
        borderWidth: active ? 0 : 0.5,
        borderColor: "#EBE7DF",
        marginRight: 8,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 13,
          color: active ? "#FAF8F4" : "#1F1B16",
          fontFamily: "Inter_500Medium",
          letterSpacing: 0.1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: active ? "rgba(250, 248, 244, 0.75)" : "#8A8278",
          fontFamily: "Inter_500Medium",
          marginLeft: 6,
        }}
      >
        {count}
      </Text>
    </Pressable>
  );
}

function PlusIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Line x1={8} y1={2} x2={8} y2={14} stroke="#1F1B16" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={2} y1={8} x2={14} y2={8} stroke="#1F1B16" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function SearchIcon({ color = "#8A8278" }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Circle cx={7} cy={7} r={4.5} fill="none" stroke={color} strokeWidth={1.4} />
      <Path d="M 10.5 10.5 L 14 14" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 12 12">
      <Path
        d="M 6 1 L 7.5 4.5 L 11 4.8 L 8.3 7.2 L 9.2 10.5 L 6 8.7 L 2.8 10.5 L 3.7 7.2 L 1 4.8 L 4.5 4.5 Z"
        fill={filled ? "#C4A875" : "none"}
        stroke={filled ? "#C4A875" : "#B8B0A4"}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ApplicationRow({
  company, position, platform, stage, date, notesCount, isFavorite, fitScore, onPress,
}: {
  company: string; position: string; platform: Platform; stage: StageKey;
  date: string; notesCount: number; isFavorite: boolean; fitScore?: number; onPress: () => void;
}) {
  const order = getStageOrder(stage);
  const isRejected = stage === "rejected";
  const meta =
    `${formatDateTr(date)} · ${order}. aşama` +
    (isRejected ? "" : "") +
    (notesCount > 0 ? ` · ${notesCount} not` : "");

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
      <Card onPress={onPress} padding={14}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
              <View
                style={{
                  width: 6, height: 6, borderRadius: 3,
                  backgroundColor: platformColors[platform], marginRight: 7,
                }}
              />
              <Text
                style={{
                  fontSize: 11, color: "#8A8278",
                  fontFamily: "Inter_500Medium", letterSpacing: 0.2,
                }}
              >
                {platformLabels[platform]}
              </Text>
              {isFavorite && (
                <View style={{ marginLeft: 8 }}>
                  <StarIcon filled />
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: 15, color: "#1F1B16",
                fontFamily: "Inter_600SemiBold", letterSpacing: -0.1,
              }}
              numberOfLines={1}
            >
              {position}
            </Text>
            <Text
              style={{
                fontSize: 13, color: "#5C5650",
                marginTop: 2, fontFamily: "Inter_400Regular",
              }}
              numberOfLines={1}
            >
              {company}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Badge stage={stage} size="md" />
            {fitScore != null && (
              <View style={{ marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: "#E2E8D6" }}>
                <Text style={{ fontSize: 11, color: "#3D5A47", fontFamily: "Inter_600SemiBold" }}>%{fitScore} uyum</Text>
              </View>
            )}
          </View>
        </View>
        <Text
          style={{
            fontSize: 11, color: "#8A8278",
            marginTop: 10, fontFamily: "Menlo",
          }}
        >
          {meta}
        </Text>
      </Card>
    </View>
  );
}

export default function ApplicationsScreen() {
  const router = useRouter();
  const apps = useApplications();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const c = getCounts();
    return {
      ...c,
      favorites: apps.filter((a) => a.is_favorite).length,
    };
  }, [apps]);

  const filtered = useMemo(() => {
    let list = apps;
    if (filter === "active") list = list.filter((a) => a.current_stage !== "rejected" && a.current_stage !== "offer");
    else if (filter === "interview") list = list.filter((a) => a.current_stage === "interview" || a.current_stage === "manager");
    else if (filter === "archive") list = list.filter((a) => a.current_stage === "rejected" || a.current_stage === "offer");
    else if (filter === "favorites") list = list.filter((a) => a.is_favorite);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) => a.company_name.toLowerCase().includes(q) || a.position.toLowerCase().includes(q)
      );
    }
    return list;
  }, [apps, filter, search]);

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F4" }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <View
          style={{
            paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
            flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 26, color: "#1F1B16",
                fontFamily: "Inter_600SemiBold", letterSpacing: -0.5,
              }}
            >
              Başvurularım
            </Text>
            <Text
              style={{
                fontSize: 13, color: "#8A8278",
                marginTop: 4, fontFamily: "Inter_400Regular",
              }}
            >
              {counts.all} toplam · {counts.interview} mülakat · {counts.offer} teklif
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <Pressable
              onPress={() => router.push("/application/new")}
              style={({ pressed }) => ({
                width: 38, height: 38, borderRadius: 10,
                backgroundColor: "#1F1B16",
                alignItems: "center", justifyContent: "center",
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Svg width={16} height={16} viewBox="0 0 16 16">
                <Line x1={8} y1={2} x2={8} y2={14} stroke="#FAF8F4" strokeWidth={1.5} strokeLinecap="round" />
                <Line x1={2} y1={8} x2={14} y2={8} stroke="#FAF8F4" strokeWidth={1.5} strokeLinecap="round" />
              </Svg>
            </Pressable>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
            <View
              style={{
                flexDirection: "row", alignItems: "center",
                paddingHorizontal: 14, height: 42,
                backgroundColor: "#FFFFFF", borderRadius: 10,
                borderWidth: 0.5, borderColor: "#EBE7DF",
              }}
            >
              <SearchIcon />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Şirket veya pozisyon ara"
                placeholderTextColor="#B8B0A4"
                style={{ flex: 1, marginLeft: 10, fontSize: 14, color: "#1F1B16", fontFamily: "Inter_400Regular" }}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")} hitSlop={10}>
                  <Text style={{ fontSize: 12, color: "#8A8278", fontFamily: "Inter_500Medium" }}>
                    Temizle
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 14, paddingTop: 2 }}
        >
          <FilterChip label="Tümü"      count={counts.all}       active={filter === "all"}       onPress={() => setFilter("all")} />
          <FilterChip label="Aktif"     count={counts.active}    active={filter === "active"}    onPress={() => setFilter("active")} />
          <FilterChip label="Mülakat"   count={counts.interview} active={filter === "interview"} onPress={() => setFilter("interview")} />
          <FilterChip label="Favoriler" count={counts.favorites} active={filter === "favorites"} onPress={() => setFilter("favorites")} />
          <FilterChip label="Arşiv"     count={counts.archive}   active={filter === "archive"}   onPress={() => setFilter("archive")} />
        </ScrollView>
      </SafeAreaView>

      {filtered.length === 0 ? (
        search.trim() ? (
          <EmptyState
            headline="Sonuç bulunamadı."
            subline={`"${search}" için bir başvuru yok. Aramanı genişletmeyi dene.`}
          />
        ) : filter === "favorites" ? (
          <EmptyState
            headline="Henüz favorin yok."
            subline="Bir başvuruyu yıldızlayarak favorilere ekleyebilirsin."
          />
        ) : (
          <EmptyState
            headline="Yolculuğun başlasın."
            subline="İlk başvurunu ekle, pusulan yönünü bulsun."
            ctaLabel="Başvuru ekle"
            onCtaPress={() => router.push("/application/new")}
          />
        )
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: app }) => (
            <ApplicationRow
              company={app.company_name}
              position={app.position}
              platform={app.platform}
              stage={app.current_stage}
              date={app.applied_at}
              notesCount={app.notes.length}
              isFavorite={app.is_favorite ?? false}
              fitScore={app.fit_score}
              onPress={() => router.push(`/application/${app.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}
