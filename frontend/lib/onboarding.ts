// lib/onboarding.ts
// Onboarding'in bir kez gosterilmesi icin "gorulduyse atla" bayragi.
// Native: SecureStore. Web: localStorage. Hata olursa "gorulmedi" varsayar.

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "hasSeenOnboarding";

export async function getHasSeenOnboarding(): Promise<boolean> {
  try {
    if (Platform.OS === "web") {
      if (typeof window === "undefined") return false;
      return window.localStorage.getItem(KEY) === "true";
    }
    const value = await SecureStore.getItemAsync(KEY);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setHasSeenOnboarding(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.localStorage.setItem(KEY, "true");
      return;
    }
    await SecureStore.setItemAsync(KEY, "true");
  } catch {
    // sessizce gec — bayrak yazilamazsa onboarding tekrar gosterilir, kritik degil
  }
}
