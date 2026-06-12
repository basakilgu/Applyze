// lib/onboarding.ts
// Onboarding'in bir kez gosterilmesi icin "gorulduyse atla" bayragi.
// HESAP bazli: bayrak kullanicinin user_metadata.onboarded alaninda saklanir.
// Boylece her yeni kullanici, hangi cihaz/tarayici olursa olsun, onboarding'i
// bir kez gorur (eskiden cihaz bazli localStorage'daydi; ayni tarayicida ikinci
// kullanici hic gormuyordu). Oturum yoksa "gorulmedi" varsayilir.

import { supabase } from "./supabase";

export async function getHasSeenOnboarding(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.user_metadata?.onboarded === true;
  } catch {
    return false;
  }
}

export async function setHasSeenOnboarding(): Promise<void> {
  try {
    // user_metadata'ya yazar; mevcut alanlar (ör. full_name) korunur (merge).
    await supabase.auth.updateUser({ data: { onboarded: true } });
  } catch {
    // sessizce gec — yazilamazsa onboarding tekrar gosterilir, kritik degil
  }
}
