// app/index.tsx — Splash + Session Check
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CompassMark } from "../components/ui/CompassMark";
import { supabase } from "../lib/supabase";
import { getHasSeenOnboarding } from "../lib/onboarding";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const startedAt = Date.now();
    const MIN_SPLASH_MS = 1200;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const seenOnboarding = await getHasSeenOnboarding();
      if (!mounted) return;

      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, MIN_SPLASH_MS - elapsed);

      setTimeout(() => {
        if (!mounted) return;
        // Tanitim ekranlari ilk ziyarette herkese ONCE gosterilir.
        // Onboarding bitince (oturum yoksa) giris ekranina gidilir.
        if (!seenOnboarding) {
          router.replace("/(onboarding)");
        } else if (data.session) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)/login");
        }
      }, wait);
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: "#1A2622", alignItems: "center", justifyContent: "center" }}>
      <StatusBar style="light" />
      <View
        style={{
          width: 88, height: 88, borderRadius: 22,
          backgroundColor: "#243530",
          alignItems: "center", justifyContent: "center",
          marginBottom: 28,
          shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3, shadowRadius: 16,
        }}
      >
        <CompassMark size={64} variant="filled" color="#FAF8F4" />
      </View>
      <Text style={{ fontSize: 26, color: "#FAF8F4", fontFamily: "Inter_300Light", letterSpacing: -0.5 }}>
        Applyze
      </Text>
      <Text
        style={{
          fontSize: 10, color: "#8A8278",
          marginTop: 8, letterSpacing: 1.6,
          fontFamily: "Inter_500Medium",
        }}
      >
        KARİYER PUSULASI
      </Text>
    </View>
  );
}