// app/(onboarding)/two.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { setHasSeenOnboarding } from "../../lib/onboarding";

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

function FunnelIllustration() {
  return (
    <Svg width={150} height={150} viewBox="0 0 150 150">
      <Circle cx={75} cy={28}  r={11} fill="none" stroke="#FAF8F4" strokeWidth={1.2} opacity={0.85} />
      <Line  x1={75} y1={42}  x2={75} y2={56} stroke="#FAF8F4" strokeWidth={0.8} opacity={0.4} />
      <Circle cx={75} cy={68}  r={9}  fill="none" stroke="#B8C9BD" strokeWidth={1.4} opacity={0.95} />
      <Line  x1={75} y1={80}  x2={75} y2={92} stroke="#B8C9BD" strokeWidth={0.8} opacity={0.5} />
      <Circle cx={75} cy={102} r={7}  fill="#B8C9BD" opacity={0.85} />
      <Path  d="M 72 102 L 74 104 L 78 100" fill="none" stroke="#243530" strokeWidth={1.4} strokeLinecap="round" />

      <Line x1={20} y1={28} x2={61} y2={28}  stroke="#FAF8F4" strokeWidth={0.5} opacity={0.25} strokeDasharray="2 3" />
      <Line x1={89} y1={28} x2={130} y2={28} stroke="#FAF8F4" strokeWidth={0.5} opacity={0.25} strokeDasharray="2 3" />
      <Line x1={28} y1={68} x2={61} y2={68}  stroke="#B8C9BD" strokeWidth={0.5} opacity={0.3} strokeDasharray="2 3" />
      <Line x1={89} y1={68} x2={122} y2={68} stroke="#B8C9BD" strokeWidth={0.5} opacity={0.3} strokeDasharray="2 3" />
    </Svg>
  );
}

export default function Onboarding2() {
  const router = useRouter();
  const finishOnboarding = async () => {
    await setHasSeenOnboarding();
    router.replace("/(tabs)");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#243530" }}>
      <StatusBar style="light" />
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, paddingHorizontal: 28 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
          <ProgressDots active={1} />
          <Pressable onPress={finishOnboarding} hitSlop={12}>
            <Text style={{ fontSize: 14, color: "#B8B0A4", fontFamily: "Inter_500Medium" }}>Atla</Text>
          </Pressable>
        </View>

        <View style={{ alignItems: "center", marginTop: 80 }}>
          <FunnelIllustration />
        </View>

        <View style={{ marginTop: 60 }}>
          <Text style={{ fontSize: 32, color: "#FAF8F4", fontFamily: "Inter_300Light", lineHeight: 40, letterSpacing: -0.6 }}>
            Hangi aşamada
          </Text>
          <Text style={{ fontSize: 32, color: "#FAF8F4", fontFamily: "Inter_300Light", lineHeight: 40, letterSpacing: -0.6 }}>
            <Text style={{ color: "#B8C9BD" }}>elendiğini</Text> gör.
          </Text>
        </View>

        <View style={{ marginTop: 22 }}>
          <Text style={{ fontSize: 15, color: "#B8B0A4", fontFamily: "Inter_400Regular", lineHeight: 23 }}>
            Süreçte takıldığın yeri öğren.{"\n"}
            Başvuruların biriktikçe örüntüler ortaya çıkar.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ paddingBottom: 16 }}>
          <Pressable
            onPress={() => router.push("/(onboarding)/three")}
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
