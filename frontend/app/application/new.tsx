// app/application/new.tsx — New Application Form
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { Header } from "../../components/ui/Header";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockStore, mockStages, platformLabels, platformColors, stageDisplayNames } from "../../lib/applications";
import type { Application, Platform, StageKey } from "../../types/database";
import { confirmAction } from "../../lib/dialogs";

const platforms: Platform[] = ["linkedin", "kariyer", "youthall", "anbean", "other"];

export default function NewApplicationScreen() {
  const router = useRouter();

  const [position, setPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [sourceUrl, setSourceUrl] = useState("");
  const [initialStage, setInitialStage] = useState<StageKey>("applied");
  const [initialNote, setInitialNote] = useState("");

  const [errors, setErrors] = useState<{ position?: string; companyName?: string }>({});

  // Tekrar uyarısı: URL alanı değiştikçe (debounce ile) aynı ilana
  // daha önce başvurulmuş mu kontrol et. Engellemez, sadece uyarır (FR-10).
  const [duplicateApp, setDuplicateApp] = useState<Application | null>(null);

  useEffect(() => {
    const url = sourceUrl.trim();
    if (!url) {
      setDuplicateApp(null);
      return;
    }
    const timer = setTimeout(() => {
      setDuplicateApp(mockStore.findByUrl(url));
    }, 400);
    return () => clearTimeout(timer);
  }, [sourceUrl]);

  const handleSave = () => {
    const newErrors: typeof errors = {};
    if (!position.trim()) newErrors.position = "Pozisyon zorunlu";
    if (!companyName.trim()) newErrors.companyName = "Şirket zorunlu";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mockStore.add({
      position: position.trim(),
      company_name: companyName.trim(),
      location: location.trim() || undefined,
      platform,
      source_url: sourceUrl.trim() || undefined,
      initial_stage: initialStage,
      initial_note: initialNote.trim() || undefined,
    });

    router.back();
  };

  const handleClose = async () => {
    if (position || companyName || initialNote) {
      const ok = await confirmAction({
        title: "Çıkmak istediğine emin misin?",
        message: "Yazdıkların kaydedilmeyecek.",
        confirmText: "Çık",
        cancelText: "Devam et",
        destructive: true,
      });
      if (ok) router.back();
    } else {
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F4" }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <Header title="Yeni başvuru" showBack={false} showClose onBack={handleClose} />
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 14, color: "#8A8278",
            marginBottom: 22, marginTop: 4,
            fontFamily: "Inter_300Light", lineHeight: 21,
          }}
        >
          Bu başvuruyu pusulan üzerinde işaretleyelim.
        </Text>

        <Input
          label="POZİSYON"
          value={position}
          onChangeText={(t) => { setPosition(t); if (errors.position) setErrors({ ...errors, position: undefined }); }}
          placeholder="ör. Süreç Tasarım Uzmanı"
          required
          error={errors.position}
          maxLength={120}
        />

        <Input
          label="ŞİRKET"
          value={companyName}
          onChangeText={(t) => { setCompanyName(t); if (errors.companyName) setErrors({ ...errors, companyName: undefined }); }}
          placeholder="ör. Trendyol"
          required
          error={errors.companyName}
          maxLength={80}
        />

        <Input
          label="ŞEHİR"
          value={location}
          onChangeText={setLocation}
          placeholder="İstanbul"
          maxLength={60}
        />

        {/* Platform selector */}
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
                    paddingHorizontal: 12, height: 36,
                    borderRadius: 18,
                    backgroundColor: isActive ? "#3D5A47" : "#FFFFFF",
                    borderWidth: 1,
                    borderColor: isActive ? "#3D5A47" : "#EBE7DF",
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
          helper="İsteğe bağlı — daha sonra ilana hızlı erişim için"
        />

        {duplicateApp && (
          <Pressable
            onPress={() => router.push(`/application/${duplicateApp.id}`)}
            style={{
              marginBottom: 16,
              padding: 14,
              borderRadius: 12,
              backgroundColor: "#FBF3E3",
              borderWidth: 1,
              borderColor: "#E8D9B5",
            }}
          >
            <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8A5A00", marginBottom: 4 }}>
              Bu ilana zaten başvurmuşsun
            </Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: "#5C5650" }}>
              {duplicateApp.company_name} — {duplicateApp.position}
            </Text>
            <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: "#3D5A47", marginTop: 8 }}>
              Mevcut başvuruya git →
            </Text>
          </Pressable>
        )}

        {/* Aşama selector */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 10, letterSpacing: 0.2 }}>
            AŞAMA
          </Text>
          <Card padding={4}>
            {mockStages.map((s, i) => {
              const isSelected = initialStage === s.key;
              const isLast = i === mockStages.length - 1;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setInitialStage(s.key)}
                  style={({ pressed }) => ({
                    flexDirection: "row", alignItems: "center",
                    paddingHorizontal: 12, paddingVertical: 12,
                    borderBottomWidth: isLast ? 0 : 0.5,
                    borderColor: "rgba(235, 231, 223, 0.7)",
                    backgroundColor: isSelected ? "rgba(61, 90, 71, 0.06)" : "transparent",
                    borderRadius: isSelected ? 6 : 0,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 16, height: 16, borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: isSelected ? "#3D5A47" : "#D9D3C8",
                      alignItems: "center", justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {isSelected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#3D5A47" }} />}
                  </View>
                  <View
                    style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: s.color ?? "#8A8278",
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      flex: 1, fontSize: 14,
                      color: "#1F1B16",
                      fontFamily: isSelected ? "Inter_500Medium" : "Inter_400Regular",
                    }}
                  >
                    {stageDisplayNames[s.key]}
                  </Text>
                </Pressable>
              );
            })}
          </Card>
          <Text style={{ fontSize: 11, color: "#8A8278", marginTop: 6, fontFamily: "Inter_400Regular", lineHeight: 16 }}>
            Çoğu başvuruda "Başvuruldu" varsayılandır. Süreç ilerlediyse uygun aşamayı seç.
          </Text>
        </View>

        <Input
          label="NOTLAR"
          value={initialNote}
          onChangeText={setInitialNote}
          placeholder="Bu başvuruyla ilgili düşüncelerini yaz..."
          multiline
          height={120}
          maxLength={2000}
          helper={initialNote ? `${initialNote.length}/2000` : "İsteğe bağlı"}
        />
      </ScrollView>

      {/* Sticky bottom */}
      <View
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(250, 248, 244, 0.95)",
          borderTopWidth: 0.5, borderColor: "rgba(217, 211, 200, 0.8)",
        }}
      >
        <SafeAreaView edges={["bottom"]}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <Button
              label="Kaydet"
              onPress={handleSave}
              variant="primary"
              size="lg"
              fullWidth
            />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
