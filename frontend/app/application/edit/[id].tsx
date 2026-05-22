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
import { mockStore, useApplication, platformLabels, platformColors } from "../../../lib/applications";
import { confirmAction, notify } from "../../../lib/dialogs";
import type { Platform } from "../../../types/database";

const platforms: Platform[] = ["linkedin", "kariyer", "youthall", "anbean", "other"];

export default function EditApplicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const app = useApplication(id);

  const [position, setPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [sourceUrl, setSourceUrl] = useState("");

  useEffect(() => {
    if (app) {
      setPosition(app.position);
      setCompanyName(app.company_name);
      setLocation(app.location ?? "");
      setPlatform(app.platform);
      setSourceUrl(app.source_url ?? "");
    }
  }, [app]);

  if (!app) return null;

  const handleSave = () => {
    if (!position.trim() || !companyName.trim()) {
      notify("Eksik bilgi", "Pozisyon ve şirket alanları zorunlu.");
      return;
    }
    mockStore.update(app.id, {
      position: position.trim(),
      company_name: companyName.trim(),
      location: location.trim() || undefined,
      platform,
      source_url: sourceUrl.trim() || undefined,
    });
    router.back();
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
            <Button label="Kaydet" onPress={handleSave} variant="primary" size="lg" fullWidth />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
