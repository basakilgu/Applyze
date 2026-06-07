// app/(onboarding)/three.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
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

function NotificationMock() {
  return (
    <View style={{ width: 240, alignItems: "center" }}>
      <View
        style={{
          width: 220, height: 142, borderRadius: 22, backgroundColor: "#1A2622",
          borderWidth: 0.5, borderColor: "#3D5A47", padding: 16,
        }}
      >
        <Text style={{ fontSize: 36, color: "#FAF8F4", fontFamily: "Inter_300Light", textAlign: "center" }}>
          09:41
        </Text>

        <View
          style={{
            backgroundColor: "rgba(250, 248, 244, 0.10)",
            marginTop: 18, paddingHorizontal: 14, paddingVertical: 11,
            borderRadius: 12, flexDirection: "row", alignItems: "center",
          }}
        >
          <Svg width={16} height={16} viewBox="0 0 16 16" style={{ marginRight: 10 }}>
            <Path d="M 8 2 L 9 6 L 8 10 L 7 6 Z" fill="#B8C9BD" />
          </Svg>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, color: "#FAF8F4", fontFamily: "Inter_500Medium" }}>
              Applyze
            </Text>
            <Text style={{ fontSize: 10, color: "#B8B0A4", fontFamily: "Inter_400Regular", marginTop: 2 }}>
              Hatırlatıcın var
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function Onboarding3() {
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
          <ProgressDots active={2} />
          <Pressable onPress={finishOnboarding} hitSlop={12}>
            <Text style={{ fontSize: 14, color: "#B8B0A4", fontFamily: "Inter_500Medium" }}>Atla</Text>
          </Pressable>
        </View>

        <View style={{ alignItems: "center", marginTop: 70 }}>
          <NotificationMock />
        </View>

        <View style={{ marginTop: 50 }}>
          <Text style={{ fontSize: 32, color: "#FAF8F4", fontFamily: "Inter_300Light", lineHeight: 40, letterSpacing: -0.6 }}>
            Bildirimlerin
          </Text>
          <Text style={{ fontSize: 32, color: "#FAF8F4", fontFamily: "Inter_300Light", lineHeight: 40, letterSpacing: -0.6 }}>
            <Text style={{ color: "#B8C9BD" }}>sessiz.</Text>
          </Text>
        </View>

        <View style={{ marginTop: 22 }}>
          <Text style={{ fontSize: 15, color: "#B8B0A4", fontFamily: "Inter_400Regular", lineHeight: 23 }}>
            Kilit ekranında şirket adı görünmez.{"\n"}
            Çalışırken iş arayanlar için sessiz bir yoldaş.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ paddingBottom: 16 }}>
          <Pressable
            onPress={finishOnboarding}
            style={({ pressed }) => ({
              height: 54, backgroundColor: "#FAF8F4", borderRadius: 12,
              alignItems: "center", justifyContent: "center",
              opacity: pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
          >
            <Text style={{ fontSize: 16, color: "#1F1B16", fontFamily: "Inter_500Medium", letterSpacing: 0.1 }}>
              Pusulanı çıkar
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
