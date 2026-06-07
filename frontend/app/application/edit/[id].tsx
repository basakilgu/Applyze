// app/application/edit/[id].tsx — Edit Application
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { Header } from "../../../components/ui/Header";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { mockStore, useApplication, mockStages, platformLabels, platformColors, stageDisplayNames } from "../../../lib/applications";
import { confirmAction, notify } from "../../../lib/dialogs";
import type { Platform, StageKey } from "../../../types/database";
import { DatePicker } from "../../../components/ui/DatePicker";

const platforms: Platform[] = ["linkedin", "kariyer", "youthall", "anbean", "other"];

const MONTHS_LONG_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
function startOfDayNoon(d: Date): Date { const x = new Date(d); x.setHours(12, 0, 0, 0); return x; }
function dateNDaysAgoObj(n: number): Date { const d = new Date(); d.setDate(d.getDate() - n); return startOfDayNoon(d); }
function sameYMD(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function formatDateLong(d: Date): string { return `${d.getDate()} ${MONTHS_LONG_TR[d.getMonth()]} ${d.getFullYear()}`; }

export default function EditApplicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const app = useApplication(id);

  const [position, setPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [sourceUrl, setSourceUrl] = useState("");
  const [appliedDate, setAppliedDate] = useState<Date>(() => startOfDayNoon(new Date()));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<StageKey>("applied");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (app) {
      setPosition(app.position);
      setCompanyName(app.company_name);
      setLocation(app.location ?? "");
      setPlatform(app.platform);
      setSourceUrl(app.source_url ?? "");
      setAppliedDate(startOfDayNoon(new Date(app.applied_at)));
      setCurrentStage(app.current_stage);
    }
  }, [app]);

  if (!app) return null;

  const handleSave = async () => {
    if (!position.trim() || !companyName.trim()) {
      notify("Eksik bilgi", "Pozisyon ve şirket alanları zorunlu.");
      return;
    }
    setSaving(true);
    await mockStore.update(app.id, {
      position: position.trim(),
      company_name: companyName.trim(),
      location: location.trim() || undefined,
      platform,
      source_url: sourceUrl.trim() || undefined,
      applied_at: appliedDate.toISOString(),
    });
    if (currentStage !== app.current_stage) {
      await mockStore.updateStage(app.id, currentStage);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.replace(`/application/${app.id}`);
    }, 900);
  };

  const handleDelete = async () => {
    const ok = await confirmAction({
      title: "Başvuruyu sil",
      message: "Bu işlem geri alınamaz. Başvuru ve tüm geçmişi silinecek.",
      confirmText: "Sil",
      destructive: true,
    });
    if (ok) {
      await mockStore.softDelete(app.id);
      router.dismissAll?.();
      router.replace("/(tabs)");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F4" }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <Header title="Düzenle" showBack={false} showClose />
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input label="POZİSYON" value={position} onChangeText={setPosition} required maxLength={120} />
        <Input label="ŞİRKET" value={companyName} onChangeText={setCompanyName} required maxLength={80} />
        <Input label="ŞEHİR" value={location} onChangeText={setLocation} maxLength={60} />

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 10, letterSpacing: 0.2 }}>
            BAŞVURU TARİHİ
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {([["Bugün", 0], ["Dün", 1]] as const).map(([lbl, daysAgo]) => {
              const d = dateNDaysAgoObj(daysAgo);
              const isActive = sameYMD(appliedDate, d);
              return (
                <Pressable key={lbl} onPress={() => setAppliedDate(d)} style={({ pressed }) => ({
                  paddingHorizontal: 14, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
                  backgroundColor: isActive ? "#3D5A47" : "#FFFFFF", borderWidth: 1, borderColor: isActive ? "#3D5A47" : "#EBE7DF", opacity: pressed ? 0.85 : 1,
                })}>
                  <Text style={{ fontSize: 13, color: isActive ? "#FAF8F4" : "#1F1B16", fontFamily: isActive ? "Inter_500Medium" : "Inter_400Regular" }}>{lbl}</Text>
                </Pressable>
              );
            })}
            <Pressable onPress={() => setCalendarOpen(true)} style={({ pressed }) => ({
              paddingHorizontal: 14, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
              backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EBE7DF", opacity: pressed ? 0.85 : 1,
            })}>
              <Text style={{ fontSize: 13, color: "#1F1B16", fontFamily: "Inter_400Regular" }}>Takvim</Text>
            </Pressable>
          </View>
          <Pressable onPress={() => setCalendarOpen(true)} style={({ pressed }) => ({
            minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: "#D9D3C8", backgroundColor: "#FFFFFF",
            paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", opacity: pressed ? 0.85 : 1,
          })}>
            <Text style={{ fontSize: 14, color: "#1F1B16", fontFamily: "Inter_400Regular" }}>{formatDateLong(appliedDate)}</Text>
            <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_500Medium" }}>Değiştir</Text>
          </Pressable>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 10, letterSpacing: 0.2 }}>
            PLATFORM
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {platforms.map((p) => {
              const isActive = platform === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPlatform(p)}
                  style={({ pressed }) => ({
                    flexDirection: "row", alignItems: "center",
                    paddingHorizontal: 12, height: 36, borderRadius: 18,
                    backgroundColor: isActive ? "#3D5A47" : "#FFFFFF",
                    borderWidth: 1, borderColor: isActive ? "#3D5A47" : "#EBE7DF",
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 6, height: 6, borderRadius: 3,
                      backgroundColor: isActive ? "#FAF8F4" : platformColors[p],
                      marginRight: 7,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: isActive ? "#FAF8F4" : "#1F1B16",
                      fontFamily: isActive ? "Inter_500Medium" : "Inter_400Regular",
                    }}
                  >
                    {platformLabels[p]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Input
          label="İLAN BAĞLANTISI"
          value={sourceUrl}
          onChangeText={setSourceUrl}
          placeholder="https://..."
          autoCapitalize="none"
          keyboardType="url"
        />

        <View style={{ marginBottom: 16, marginTop: 4 }}>
          <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 10, letterSpacing: 0.2 }}>
            AŞAMA
          </Text>
          <Card padding={4}>
            {mockStages.map((st, i) => {
              const isSelected = currentStage === st.key;
              const isLast = i === mockStages.length - 1;
              return (
                <Pressable key={st.id} onPress={() => setCurrentStage(st.key)} style={({ pressed }) => ({
                  flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 12,
                  borderBottomWidth: isLast ? 0 : 0.5, borderColor: "rgba(235, 231, 223, 0.7)",
                  backgroundColor: isSelected ? "rgba(61, 90, 71, 0.06)" : "transparent",
                  borderRadius: isSelected ? 6 : 0, opacity: pressed ? 0.7 : 1,
                })}>
                  <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: isSelected ? "#3D5A47" : "#D9D3C8", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    {isSelected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#3D5A47" }} />}
                  </View>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: st.color ?? "#8A8278", marginRight: 10 }} />
                  <Text style={{ flex: 1, fontSize: 14, color: "#1F1B16", fontFamily: isSelected ? "Inter_500Medium" : "Inter_400Regular" }}>
                    {stageDisplayNames[st.key]}
                  </Text>
                </Pressable>
              );
            })}
          </Card>
        </View>

        <DatePicker
          visible={calendarOpen}
          value={appliedDate}
          maxDate={new Date()}
          onClose={() => setCalendarOpen(false)}
          onSelect={(d) => { setAppliedDate(d); setCalendarOpen(false); }}
        />

        {/* Danger zone */}
        <View style={{ marginTop: 32 }}>
          <SectionHeader title="TEHLİKELİ BÖLGE" caps />
          <Card padding={16} style={{ borderColor: "rgba(168, 144, 143, 0.3)" }}>
            <Text style={{ fontSize: 13, color: "#5C5650", fontFamily: "Inter_400Regular", lineHeight: 19, marginBottom: 12 }}>
              Bu başvuruyu silmek istersen aşağıdaki butona dokunabilirsin. İşlem geri alınamaz.
            </Text>
            <Button label="Başvuruyu sil" onPress={handleDelete} variant="danger" size="md" fullWidth />
          </Card>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(250, 248, 244, 0.95)",
          borderTopWidth: 0.5, borderColor: "rgba(217, 211, 200, 0.8)",
        }}
      >
        <SafeAreaView edges={["bottom"]}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            {saved && (
              <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_500Medium", textAlign: "center", marginBottom: 10 }}>
                Değişiklikler kaydedildi ✓
              </Text>
            )}
            <Button label={saving ? "Kaydediliyor…" : "Kaydet"} onPress={handleSave} variant="primary" size="lg" fullWidth loading={saving} />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
