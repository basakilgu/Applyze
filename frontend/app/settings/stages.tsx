// app/settings/stages.tsx
import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Svg, { Line } from "react-native-svg";

import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { mockStages, stageDisplayNames } from "../../lib/applications";
import { notify } from "../../lib/dialogs";

function DragHandle() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Line x1={3} y1={4}  x2={11} y2={4}  stroke="#B8B0A4" strokeWidth={1.4} strokeLinecap="round" />
      <Line x1={3} y1={7}  x2={11} y2={7}  stroke="#B8B0A4" strokeWidth={1.4} strokeLinecap="round" />
      <Line x1={3} y1={10} x2={11} y2={10} stroke="#B8B0A4" strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

export default function StagesSettingsScreen() {
  const handleEdit = (name: string) => {
    notify(name, "Aşama düzenleme yakında eklenecek. Şimdilik standart aşamalar kullanılıyor.");
  };

  const handleAdd = () => {
    notify("Yakında", "Özel aşama ekleme ve sıralama yakında eklenecek. Şu an standart 6 aşama kullanılıyor.");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F4" }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <Header title="Aşamalar" />
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 14, color: "#8A8278",
            marginTop: 4, marginBottom: 18,
            fontFamily: "Inter_300Light",
            lineHeight: 21,
          }}
        >
          Süreç boyunca takip ettiğin aşamalar. Her başvurunun{"\n"}geçtiği yolun haritası.
        </Text>

        <Card padding={0}>
          {mockStages.map((s, i) => {
            const isLast = i === mockStages.length - 1;
            return (
              <Pressable
                key={s.id}
                onPress={() => handleEdit(stageDisplayNames[s.key])}
                style={({ pressed }) => ({
                  flexDirection: "row", alignItems: "center",
                  paddingHorizontal: 14, paddingVertical: 14,
                  borderBottomWidth: isLast ? 0 : 0.5,
                  borderColor: "rgba(235, 231, 223, 0.7)",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <View style={{ marginRight: 10 }}><DragHandle /></View>
                <View
                  style={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: s.color ?? "#8A8278",
                    marginRight: 12,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: "#1F1B16", fontFamily: "Inter_500Medium" }}>
                    {stageDisplayNames[s.key]}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#8A8278", marginTop: 2, fontFamily: "Inter_400Regular" }}>
                    {s.is_terminal ? "Son aşama" : `${s.order}. sıra`} · Varsayılan
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Card>

        <View style={{ marginTop: 16 }}>
          <Button label="+  Aşama ekle" onPress={handleAdd} variant="secondary" size="lg" fullWidth />
        </View>

        <Text
          style={{
            fontSize: 11, color: "#8A8278",
            marginTop: 16, lineHeight: 16,
            fontFamily: "Inter_400Regular",
            paddingHorizontal: 4,
          }}
        >
          Şu an varsayılan aşamalar gösteriliyor. Özel aşamalar ve sıralama yakında eklenecek.
        </Text>
      </ScrollView>
    </View>
  );
}
