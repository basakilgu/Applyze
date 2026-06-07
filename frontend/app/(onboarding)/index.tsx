// app/(onboarding)/index.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { CompassMark } from "../../components/ui/CompassMark";
import { setHasSeenOnboarding } from "../../lib/onboarding";
import { supabase } from "../../lib/supabase";

function ProgressDots({ active }: { active: 0 | 1 | 2 }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: i === active ? 28 : 8,
            height: 4, borderRadius: 2,
            backgroundColor: "#FAF8F4",
            opacity: i === active ? 1 : 0.3,
            marginRight: i === 2 ? 0 : 6,
          }}
        />
      ))}
    </View>
  );
}

export default function Onboarding1() {
  const router = useRouter();
  const finishOnboarding = async () => {
    await setHasSeenOnboarding();
    const { data } = await supabase.auth.getSession();
    router.replace(data.session ? "/(tabs)" : "/(auth)/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#243530" }}>
      <StatusBar style="light" />
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, paddingHorizontal: 28 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
          <ProgressDots active={0} />
          <Pressable onPress={finishOnboarding} hitSlop={12}>
            <Text style={{ fontSize: 14, color: "#B8B0A4", fontFamily: "Inter_500Medium" }}>
              Atla
            </Text>
          </Pressable>
        </View>

        {/* Compass */}
        <View style={{ alignItems: "center", marginTop: 80 }}>
          <CompassMark size={130} variant="glow-light" color="#FAF8F4" haloColor="#3D5A47" />
        </View>

        {/* Editorial */}
        <View style={{ marginTop: 64 }}>
          <Text
            style={{
              fontSize: 32, color: "#FAF8F4",
              fontFamily: "Inter_300Light",
              lineHeight: 40, letterSpacing: -0.6,
            }}
          >
            Sadece bir takipçi
          </Text>
          <Text
            style={{
              fontSize: 32, color: "#FAF8F4",
              fontFamily: "Inter_300Light",
              lineHeight: 40, letterSpacing: -0.6,
            }}
          >
            değil. Bir <Text style={{ color: "#B8C9BD" }}>pusula.</Text>
          </Text>
        </View>

        <View style={{ marginTop: 22 }}>
          <Text
            style={{
              fontSize: 15, color: "#B8B0A4",
              fontFamily: "Inter_400Regular",
              lineHeight: 23,
            }}
          >
            Başvurularını topla, örüntüleri gör,{"\n"}kendi yönünü bul.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* CTA */}
        <View style={{ paddingBottom: 16 }}>
          <Pressable
            onPress={() => router.push("/(onboarding)/two")}
            style={({ pressed }) => ({
              height: 54, backgroundColor: "#FAF8F4", borderRadius: 12,
              alignItems: "center", justifyContent: "center",
              opacity: pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
          >
            <Text style={{ fontSize: 16, color: "#1F1B16", fontFamily: "Inter_500Medium", letterSpacing: 0.1 }}>
              Devam et
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
