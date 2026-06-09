// app/(auth)/login.tsx
import React, { useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Path, Circle } from "react-native-svg";

import { CompassMark } from "../../components/ui/CompassMark";
import { supabase } from "../../lib/supabase";

function MailIcon({ color = "#1F1B16" }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path d="M 2.5 4.5 L 9 9.5 L 15.5 4.5 L 15.5 13.5 L 2.5 13.5 Z" fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
      <Path d="M 2.5 4.5 L 15.5 4.5" stroke={color} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <Path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
      <Path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <Path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </Svg>
  );
}

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path d="M 13 4 L 7 10 L 13 16" fill="none" stroke="#1F1B16" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function EyeIcon({ off = false }: { off?: boolean }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path
        d="M 2 10 C 4 5.5 7 3.5 10 3.5 C 13 3.5 16 5.5 18 10 C 16 14.5 13 16.5 10 16.5 C 7 16.5 4 14.5 2 10 Z"
        fill="none" stroke="#8A8278" strokeWidth={1.4} strokeLinejoin="round"
      />
      <Circle cx={10} cy={10} r={2.6} fill="none" stroke="#8A8278" strokeWidth={1.4} />
      {off && <Path d="M 3 3 L 17 17" stroke="#8A8278" strokeWidth={1.4} strokeLinecap="round" />}
    </Svg>
  );
}

// Supabase ham hatalarini Turkce ve anlasilir mesajlara cevir
function mapAuthError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) return "E-posta veya şifre hatalı.";
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("user already"))
    return "Bu e-posta zaten kayıtlı. Giriş yapmayı dene.";
  if (m.includes("password should be at least")) return "Şifre en az 6 karakter olmalı.";
  if (m.includes("invalid format") || (m.includes("email") && m.includes("invalid")))
    return "Geçerli bir e-posta adresi gir.";
  if (m.includes("email not confirmed")) return "E-postan henüz doğrulanmamış. Gelen kutunu kontrol et.";
  if (m.includes("for security purposes") || m.includes("rate limit") || m.includes("too many"))
    return "Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.";
  if (m.includes("network") || m.includes("fetch")) return "Bağlantı sorunu. İnternetini kontrol edip tekrar dene.";
  return raw;
}

// Basit e-posta format kontrolu (anlik, sunucuya gitmeden geri bildirim)
function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

type Mode = "select" | "email-login" | "email-signup" | "forgot";

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("select");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  function resetMessages() {
    setError(null);
    setInfo(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirm(false);
    setAcceptedTerms(false);
    resetMessages();
  }

  const handleGoogle = async () => {
    resetMessages();
    const redirectTo =
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.location.origin
        : "applyze://";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) setError(mapAuthError(error.message));
    // Web'de bu çağrı sayfayı Google'a yönlendirir; dönüşte oturum otomatik kurulur.
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      setError("E-posta ve şifre gerekli.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Geçerli bir e-posta adresi gir.");
      return;
    }
    setLoading(true);
    resetMessages();

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(mapAuthError(error.message));
      setLoading(false);
      return;
    }
    // Basarili: (auth)/_layout SIGNED_IN'i yakalayip yonlendirecek
    setLoading(false);
  };

  const handleEmailSignup = async () => {
    if (!email.trim() || !password) {
      setError("E-posta ve şifre gerekli.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Geçerli bir e-posta adresi gir.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor. İki alana da aynı şifreyi yaz.");
      return;
    }
    if (!acceptedTerms) {
      setError("Devam etmek için Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmelisin.");
      return;
    }
    setLoading(true);
    resetMessages();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(mapAuthError(error.message));
      setLoading(false);
      return;
    }

    if (data.session) {
      // Otomatik giris yapildi (Confirm email kapali) -> auth layout yonlendirir
      setLoading(false);
    } else if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      // E-posta ZATEN kayitli (onaylanmis). Supabase guvenlik nedeniyle hata dondurmez;
      // bos "identities" dizisi bunu ele verir. Kullaniciyi dogru yone yonlendir.
      setError("Bu e-posta ile zaten bir hesabın var. Giriş yap ya da 'Şifremi unuttum' ile sıfırla.");
      setLoading(false);
    } else {
      // Confirm email acik kalmissa: dogrulama bekleniyor
      setInfo("Hesabın oluşturuldu. E-postandaki doğrulama bağlantısına tıkla, sonra giriş yap.");
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      setError("Önce e-posta adresini gir.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Geçerli bir e-posta adresi gir.");
      return;
    }
    setLoading(true);
    resetMessages();

    const redirectTo =
      Platform.OS === "web" && typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : "https://applyze.vercel.app/reset-password"; // canlı web adresinle güncelle
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      setError(mapAuthError(error.message));
      setLoading(false);
      return;
    }
    setInfo("Şifre sıfırlama bağlantısı e-postana gönderildi. Gelen kutunu kontrol et.");
    setLoading(false);
  };

  // ============ FORGOT PASSWORD ============
  if (mode === "forgot") {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: "#FAF8F4" }}
      >
        <StatusBar style="dark" />
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, paddingHorizontal: 28 }}>
          <Pressable
            onPress={() => switchMode("email-login")}
            style={{ paddingVertical: 12, marginTop: 4, alignSelf: "flex-start" }}
            hitSlop={10}
          >
            <BackIcon />
          </Pressable>

          <View style={{ flex: 0.2 }} />

          <Text style={{ fontSize: 26, color: "#1F1B16", fontFamily: "Inter_600SemiBold", letterSpacing: -0.5, marginBottom: 8 }}>
            Şifreni mi unuttun?
          </Text>
          <Text style={{ fontSize: 14, color: "#8A8278", fontFamily: "Inter_400Regular", lineHeight: 21, marginBottom: 32 }}>
            E-posta adresini gir, sıfırlama bağlantısını gönderelim.
          </Text>

          <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 6 }}>
            E-posta
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@email.com"
            placeholderTextColor="#B8B0A4"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            style={{
              height: 52, borderRadius: 12, paddingHorizontal: 16,
              backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EBE7DF",
              fontSize: 15, color: "#1F1B16", fontFamily: "Inter_400Regular",
              marginBottom: 8,
            }}
          />

          {error && (
            <Text style={{ fontSize: 13, color: "#A8908F", fontFamily: "Inter_400Regular", marginBottom: 8, marginTop: 4 }}>
              {error}
            </Text>
          )}
          {info && (
            <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_400Regular", marginBottom: 8, marginTop: 4 }}>
              {info}
            </Text>
          )}

          <View style={{ flex: 1 }} />

          <Pressable
            onPress={handleForgot}
            disabled={loading}
            style={({ pressed }) => ({
              height: 52, backgroundColor: "#1F1B16", borderRadius: 12,
              alignItems: "center", justifyContent: "center",
              opacity: loading ? 0.6 : pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
              marginBottom: 12,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#FAF8F4" />
            ) : (
              <Text style={{ fontSize: 15, color: "#FAF8F4", fontFamily: "Inter_500Medium" }}>
                Sıfırlama bağlantısı gönder
              </Text>
            )}
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ============ EMAIL LOGIN / SIGNUP FORM ============
  if (mode === "email-login" || mode === "email-signup") {
    const isLogin = mode === "email-login";
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: "#FAF8F4" }}
      >
        <StatusBar style="dark" />
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, paddingHorizontal: 28 }}>
          {/* Back button */}
          <Pressable
            onPress={() => switchMode("select")}
            style={{ paddingVertical: 12, marginTop: 4, alignSelf: "flex-start" }}
            hitSlop={10}
          >
            <BackIcon />
          </Pressable>

          <View style={{ flex: 0.15 }} />

          <Text style={{ fontSize: 26, color: "#1F1B16", fontFamily: "Inter_600SemiBold", letterSpacing: -0.5, marginBottom: 8 }}>
            {isLogin ? "Tekrar hoşgeldin." : "Hesabını oluştur."}
          </Text>
          <Text style={{ fontSize: 14, color: "#8A8278", fontFamily: "Inter_400Regular", lineHeight: 21, marginBottom: 28 }}>
            {isLogin ? "Yolculuğuna kaldığın yerden devam et." : "Pusulan seni bekliyor."}
          </Text>

          {/* Email */}
          <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 6 }}>
            E-posta
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@email.com"
            placeholderTextColor="#B8B0A4"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            style={{
              height: 52, borderRadius: 12, paddingHorizontal: 16,
              backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EBE7DF",
              fontSize: 15, color: "#1F1B16", fontFamily: "Inter_400Regular",
              marginBottom: 16,
            }}
          />

          {/* Password */}
          <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 6 }}>
            Şifre
          </Text>
          <View style={{ justifyContent: "center", marginBottom: isLogin ? 6 : 16 }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={isLogin ? "Şifren" : "En az 6 karakter"}
              placeholderTextColor="#B8B0A4"
              secureTextEntry={!showPassword}
              autoComplete={isLogin ? "current-password" : "new-password"}
              style={{
                height: 52, borderRadius: 12, paddingLeft: 16, paddingRight: 48,
                backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EBE7DF",
                fontSize: 15, color: "#1F1B16", fontFamily: "Inter_400Regular",
              }}
            />
            <Pressable
              onPress={() => setShowPassword((s) => !s)}
              style={{ position: "absolute", right: 14, height: 52, justifyContent: "center" }}
              hitSlop={8}
            >
              <EyeIcon off={showPassword} />
            </Pressable>
          </View>

          {/* Sifremi unuttum (sadece giris modunda) */}
          {isLogin && (
            <Pressable onPress={() => switchMode("forgot")} style={{ alignSelf: "flex-end", paddingVertical: 6, marginBottom: 6 }} hitSlop={8}>
              <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_500Medium" }}>
                Şifremi unuttum
              </Text>
            </Pressable>
          )}

          {/* Sifre onayi (sadece kayit modunda) */}
          {!isLogin && (
            <>
              <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 6 }}>
                Şifre (tekrar)
              </Text>
              <View style={{ justifyContent: "center", marginBottom: 8 }}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Şifreni tekrar yaz"
                  placeholderTextColor="#B8B0A4"
                  secureTextEntry={!showConfirm}
                  autoComplete="new-password"
                  style={{
                    height: 52, borderRadius: 12, paddingLeft: 16, paddingRight: 48,
                    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EBE7DF",
                    fontSize: 15, color: "#1F1B16", fontFamily: "Inter_400Regular",
                  }}
                />
                <Pressable
                  onPress={() => setShowConfirm((s) => !s)}
                  style={{ position: "absolute", right: 14, height: 52, justifyContent: "center" }}
                  hitSlop={8}
                >
                  <EyeIcon off={showConfirm} />
                </Pressable>
              </View>
            </>
          )}

          {/* Error / Info */}
          {error && (
            <Text style={{ fontSize: 13, color: "#A8908F", fontFamily: "Inter_400Regular", marginBottom: 8, marginTop: 4 }}>
              {error}
            </Text>
          )}
          {info && (
            <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_400Regular", marginBottom: 8, marginTop: 4, lineHeight: 19 }}>
              {info}
            </Text>
          )}

          <View style={{ flex: 1 }} />

          {!isLogin && (
            <Pressable
              onPress={() => { setAcceptedTerms((v) => !v); if (error) setError(null); }}
              style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 14, paddingRight: 4 }}
            >
              <View
                style={{
                  width: 20, height: 20, borderRadius: 6, marginRight: 10, marginTop: 1,
                  borderWidth: 1.5,
                  borderColor: acceptedTerms ? "#3D5A47" : "#D9D3C8",
                  backgroundColor: acceptedTerms ? "#3D5A47" : "transparent",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                {acceptedTerms && (
                  <Svg width={12} height={12} viewBox="0 0 12 12">
                    <Path d="M 2.5 6.2 L 5 8.5 L 9.5 3.5" fill="none" stroke="#FAF8F4" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </View>
              <Text style={{ flex: 1, fontSize: 12, color: "#5C5650", fontFamily: "Inter_400Regular", lineHeight: 18 }}>
                <Text onPress={() => router.push("/legal/terms")} style={{ color: "#3D5A47", fontFamily: "Inter_500Medium", textDecorationLine: "underline" }}>Kullanım Koşulları</Text>
                {" ve "}
                <Text onPress={() => router.push("/legal/privacy")} style={{ color: "#3D5A47", fontFamily: "Inter_500Medium", textDecorationLine: "underline" }}>Gizlilik Politikası</Text>
                {"'nı okudum ve kabul ediyorum."}
              </Text>
            </Pressable>
          )}

          {/* Primary action */}
          <Pressable
            onPress={isLogin ? handleEmailLogin : handleEmailSignup}
            disabled={loading}
            style={({ pressed }) => ({
              height: 52, backgroundColor: "#1F1B16", borderRadius: 12,
              alignItems: "center", justifyContent: "center",
              opacity: loading ? 0.6 : pressed ? 0.92 : 1,
              transform: [{ scale: pressed ? 0.99 : 1 }],
              marginBottom: 12,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#FAF8F4" />
            ) : (
              <Text style={{ fontSize: 15, color: "#FAF8F4", fontFamily: "Inter_500Medium" }}>
                {isLogin ? "Giriş yap" : "Hesap oluştur"}
              </Text>
            )}
          </Pressable>

          {/* Toggle */}
          <Pressable
            onPress={() => switchMode(isLogin ? "email-signup" : "email-login")}
            style={{ alignItems: "center", paddingVertical: 12 }}
          >
            <Text style={{ fontSize: 13, color: "#5C5650", fontFamily: "Inter_400Regular" }}>
              {isLogin ? "Hesabın yok mu? Oluştur" : "Zaten hesabın var mı? Giriş yap"}
            </Text>
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ============ SELECT MODE (anaekran) ============
  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F4" }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, paddingHorizontal: 28 }}>
        <View style={{ flex: 0.4 }} />

        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 64, height: 64, borderRadius: 16,
              backgroundColor: "#243530",
              alignItems: "center", justifyContent: "center",
              marginBottom: 20,
              shadowColor: "#1F1B16", shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12, shadowRadius: 8,
            }}
          >
            <CompassMark size={48} variant="filled" color="#FAF8F4" />
          </View>

          <Text style={{ fontSize: 22, color: "#1F1B16", fontFamily: "Inter_600SemiBold", letterSpacing: -0.4 }}>
            Applyze
          </Text>
          <Text style={{ fontSize: 11, color: "#8A8278", marginTop: 6, letterSpacing: 1.4, fontFamily: "Inter_500Medium" }}>
            KARİYER PUSULASI
          </Text>
        </View>

        <View style={{ flex: 0.5 }} />

        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 22, color: "#1F1B16", fontFamily: "Inter_300Light", textAlign: "center", lineHeight: 30, letterSpacing: -0.3 }}>
            Yolculuğun başlasın.
          </Text>
          <Text style={{ fontSize: 14, color: "#8A8278", textAlign: "center", marginTop: 10, fontFamily: "Inter_400Regular", lineHeight: 21, maxWidth: 280 }}>
            Hesabınla giriş yap, başvurularını organize et.
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        {/* Google ile devam et */}
        <Pressable
          onPress={handleGoogle}
          style={({ pressed }) => ({
            height: 52, backgroundColor: "#FFFFFF", borderRadius: 12,
            borderWidth: 1, borderColor: "#D9D3C8",
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
            marginBottom: 14,
          })}
        >
          <GoogleIcon />
          <Text style={{ fontSize: 15, color: "#1F1B16", fontFamily: "Inter_500Medium", marginLeft: 10, letterSpacing: 0.1 }}>
            Google ile devam et
          </Text>
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#EBE7DF" }} />
          <Text style={{ marginHorizontal: 10, fontSize: 12, color: "#8A8278", fontFamily: "Inter_400Regular" }}>veya</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#EBE7DF" }} />
        </View>

        {/* E-posta ile giris */}
        <Pressable
          onPress={() => switchMode("email-login")}
          style={({ pressed }) => ({
            height: 52, backgroundColor: "#1F1B16", borderRadius: 12,
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
            marginBottom: 12,
          })}
        >
          <MailIcon color="#FAF8F4" />
          <Text style={{ fontSize: 15, color: "#FAF8F4", fontFamily: "Inter_500Medium", marginLeft: 10, letterSpacing: 0.1 }}>
            E-posta ile giriş yap
          </Text>
        </Pressable>

        {/* Hesap olustur */}
        <Pressable
          onPress={() => switchMode("email-signup")}
          style={({ pressed }) => ({
            height: 52, backgroundColor: "transparent", borderRadius: 12,
            borderWidth: 1, borderColor: "#D9D3C8",
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          })}
        >
          <Text style={{ fontSize: 15, color: "#1F1B16", fontFamily: "Inter_500Medium", letterSpacing: 0.1 }}>
            Yeni hesap oluştur
          </Text>
        </Pressable>

        <Text style={{ fontSize: 11, color: "#B8B0A4", textAlign: "center", marginTop: 20, marginBottom: 8, fontFamily: "Inter_400Regular", lineHeight: 16 }}>
          Devam ederek <Text onPress={() => router.push("/legal/terms")} style={{ color: "#3D5A47", fontFamily: "Inter_500Medium", textDecorationLine: "underline" }}>Kullanım Koşulları</Text> ve{"\n"}
          <Text onPress={() => router.push("/legal/privacy")} style={{ color: "#3D5A47", fontFamily: "Inter_500Medium", textDecorationLine: "underline" }}>Gizlilik Politikası</Text>'nı kabul etmiş olursun.
        </Text>
      </SafeAreaView>
    </View>
  );
}
