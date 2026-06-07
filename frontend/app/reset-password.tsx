// app/reset-password.tsx — Yeni şifre belirleme (e-postadaki sıfırlama linki buraya gelir)
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../lib/supabase";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false); // geçerli bir sıfırlama oturumu var mı
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) {
        setReady(true);
        setChecking(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        setReady(true);
        setChecking(false);
      }
    });

    // Belirli bir süre sonra hâlâ oturum yoksa "geçersiz bağlantı"
    const t = setTimeout(() => { if (mounted) setChecking(false); }, 2500);

    return () => { mounted = false; subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  const handleUpdate = async () => {
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalı."); return; }
    if (password !== confirm) { setError("Şifreler eşleşmiyor."); return; }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError("Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir; giriş ekranından tekrar 'Şifremi unuttum' dene.");
      setLoading(false);
      return;
    }
    setInfo("Şifren güncellendi. Yönlendiriliyorsun…");
    setTimeout(() => router.replace("/(tabs)"), 900);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#FAF8F4" }}
    >
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, paddingHorizontal: 28 }}>
        <View style={{ flex: 0.2 }} />

        <Text style={{ fontSize: 26, color: "#1F1B16", fontFamily: "Inter_600SemiBold", letterSpacing: -0.5, marginBottom: 8 }}>
          Yeni şifre belirle
        </Text>

        {checking ? (
          <View style={{ marginTop: 24, flexDirection: "row", alignItems: "center" }}>
            <ActivityIndicator color="#3D5A47" />
            <Text style={{ fontSize: 14, color: "#8A8278", fontFamily: "Inter_400Regular", marginLeft: 10 }}>
              Bağlantı doğrulanıyor…
            </Text>
          </View>
        ) : !ready ? (
          <>
            <Text style={{ fontSize: 14, color: "#8A8278", fontFamily: "Inter_400Regular", lineHeight: 21, marginBottom: 28 }}>
              Bu bağlantı geçersiz ya da süresi dolmuş görünüyor. Giriş ekranından "Şifremi unuttum" ile yeni bir bağlantı iste.
            </Text>
            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              style={({ pressed }) => ({
                height: 52, backgroundColor: "#1F1B16", borderRadius: 12,
                alignItems: "center", justifyContent: "center",
                opacity: pressed ? 0.92 : 1,
              })}
            >
              <Text style={{ fontSize: 15, color: "#FAF8F4", fontFamily: "Inter_500Medium" }}>Giriş ekranına dön</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 14, color: "#8A8278", fontFamily: "Inter_400Regular", lineHeight: 21, marginBottom: 28 }}>
              Hesabın için yeni bir şifre gir.
            </Text>

            <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 6 }}>Yeni şifre</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="En az 6 karakter"
              placeholderTextColor="#B8B0A4"
              secureTextEntry={!show}
              autoComplete="new-password"
              style={{ height: 52, borderRadius: 12, paddingHorizontal: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EBE7DF", fontSize: 15, color: "#1F1B16", fontFamily: "Inter_400Regular", marginBottom: 16 }}
            />

            <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 6 }}>Yeni şifre (tekrar)</Text>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Şifreni tekrar yaz"
              placeholderTextColor="#B8B0A4"
              secureTextEntry={!show}
              autoComplete="new-password"
              style={{ height: 52, borderRadius: 12, paddingHorizontal: 16, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EBE7DF", fontSize: 15, color: "#1F1B16", fontFamily: "Inter_400Regular", marginBottom: 8 }}
            />

            <Pressable onPress={() => setShow((v) => !v)} style={{ alignSelf: "flex-start", paddingVertical: 6, marginBottom: 4 }} hitSlop={8}>
              <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_500Medium" }}>{show ? "Şifreyi gizle" : "Şifreyi göster"}</Text>
            </Pressable>

            {error && <Text style={{ fontSize: 13, color: "#A8908F", fontFamily: "Inter_400Regular", marginTop: 4, marginBottom: 4, lineHeight: 19 }}>{error}</Text>}
            {info && <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_400Regular", marginTop: 4, marginBottom: 4 }}>{info}</Text>}

            <View style={{ flex: 1 }} />

            <Pressable
              onPress={handleUpdate}
              disabled={loading}
              style={({ pressed }) => ({
                height: 52, backgroundColor: "#1F1B16", borderRadius: 12,
                alignItems: "center", justifyContent: "center",
                opacity: loading ? 0.6 : pressed ? 0.92 : 1, marginBottom: 12,
              })}
            >
              {loading ? <ActivityIndicator color="#FAF8F4" /> : (
                <Text style={{ fontSize: 15, color: "#FAF8F4", fontFamily: "Inter_500Medium" }}>Şifreyi güncelle</Text>
              )}
            </Pressable>
          </>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
