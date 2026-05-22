// app/(auth)/_layout.tsx
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { getHasSeenOnboarding } from "../../lib/onboarding";

export default function AuthLayout() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const seen = await getHasSeenOnboarding();
        router.replace(seen ? "/(tabs)" : "/(onboarding)");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
