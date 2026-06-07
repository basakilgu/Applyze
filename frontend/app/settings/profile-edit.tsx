// app/settings/profile-edit.tsx — Profil bilgileri (görünen ad düzenleme)
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { supabase } from "../../lib/supabase";

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path d="M 13 4 L 7 10 L 13 16" fill="none" stroke="#1F1B16" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ProfileEditScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let m = true;
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (m) {
        setEmail(u?.email ?? "");
        setName((u?.user_metadata?.full_name as string) ?? "");
        setLoading(false);
      }
    });
    return () => { m = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setErr(null);
    setSaved(false);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setSaving(false);
    if (error) { setErr("Kaydedilemedi. Lütfen tekrar dene."); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#FAF8F4" }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 52 }}>
          <Pressable onPress={() => { if (router.canGoBack()) router.back(); else router.replace("/(tabs)/profile"); }} hitSlop={10} style={{ padding: 6, marginRight: 4 }}>
            <BackIcon />
          </Pressable>
          <Text style={{ fontSize: 17, color: "#1F1B16", fontFamily: "Inter_600SemiBold" }}>Profil bilgilerim</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {loading ? (
          <View style={{ marginTop: 24, flexDirection: "row", alignItems: "center" }}>
            <ActivityIndicator color="#3D5A47" />
            <Text style={{ marginLeft: 10, color: "#8A8278", fontFamily: "Inter_400Regular" }}>Yükleniyor…</Text>
          </View>
        ) : (
          <>
            <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginTop: 8, marginBottom: 6 }}>GÖRÜNEN AD</Text>
            <TextInput
              value={name}
              onChangeText={(t) => { setName(t); if (err) setErr(null); }}
              placeholder="Adın (ör. Başak İlgü)"
              placeholderTextColor="#B8B0A4"
              style={{ height: 52, borderRadius: 12, paddingHorizontal: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EBE7DF", fontSize: 15, color: "#1F1B16", fontFamily: "Inter_400Regular", marginBottom: 4 }}
            />
            <Text style={{ fontSize: 11, color: "#8A8278", fontFamily: "Inter_400Regular", marginBottom: 18 }}>
              Özet ekranındaki selamlamada ve profilde bu ad görünür.
            </Text>

            <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 6 }}>E-POSTA</Text>
            <View style={{ height: 52, borderRadius: 12, paddingHorizontal: 16, backgroundColor: "#F4F1EB", borderWidth: 1, borderColor: "#EBE7DF", justifyContent: "center", marginBottom: 6 }}>
              <Text style={{ fontSize: 15, color: "#8A8278", fontFamily: "Inter_400Regular" }}>{email}</Text>
            </View>
            <Text style={{ fontSize: 11, color: "#8A8278", fontFamily: "Inter_400Regular", marginBottom: 24 }}>
              E-posta adresi şimdilik değiştirilemez.
            </Text>

            {err && <Text style={{ fontSize: 13, color: "#A96458", fontFamily: "Inter_400Regular", marginBottom: 12 }}>{err}</Text>}

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => ({ height: 50, backgroundColor: "#1F1B16", borderRadius: 12, alignItems: "center", justifyContent: "center", opacity: saving ? 0.6 : pressed ? 0.92 : 1 })}
            >
              {saving ? <ActivityIndicator color="#FAF8F4" /> : <Text style={{ fontSize: 15, color: "#FAF8F4", fontFamily: "Inter_500Medium" }}>Kaydet</Text>}
            </Pressable>
            {saved && (
              <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_500Medium", textAlign: "center", marginTop: 12 }}>Değişiklikler kaydedildi ✓</Text>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
