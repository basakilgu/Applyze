// app/(tabs)/profile.tsx — Profil ekranı
// Supabase auth ile gerçek kullanıcı bilgisi.

import React, { useMemo, useState, useId, useEffect } from "react";
import { View, Text, ScrollView, Alert, Pressable, Switch, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from "react-native-svg";

import { useApplications } from "../../lib/applications";
import { supabase } from "../../lib/supabase";
import { notify } from "../../lib/dialogs";

// =============================================================
// THEME
// =============================================================

const colors = {
  cream50: "#FAF8F4",
  cream100: "#F4F1EB",
  cream200: "#EBE7DF",
  cream300: "#D9D3C8",
  ink900: "#1F1B16",
  ink700: "#5C5650",
  ink500: "#8A8278",
  ink300: "#B8B0A4",
  forestDeep: "#1A2622",
  forestSurface: "#243530",
  sage: "#3D5A47",
  sageMist: "#B8C9BD",
  sagePale: "#E2E8D6",
  white: "#FFFFFF",
  divider: "rgba(235, 231, 223, 0.7)",
  danger: "#A96458",
};

const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  light: "Inter_300Light",
};

const shadows = {
  card: {
    shadowColor: "#1F1B16",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  elevated: {
    shadowColor: "#1F1B16",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
};

// =============================================================
// HELPERS
// =============================================================

const MONTHS_LONG = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function formatDateLongTr(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

function computeCounts(apps: any[]) {
  return {
    all: apps.length,
    interview: apps.filter((a) => a.current_stage === "interview" || a.current_stage === "manager").length,
    offer: apps.filter((a) => a.current_stage === "offer").length,
  };
}

function computeDaysSinceStart(apps: any[]): number {
  if (apps.length === 0) return 0;
  const sorted = [...apps].sort(
    (a, b) =>
      new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime()
  );
  return Math.floor(
    (Date.now() - new Date(sorted[0].applied_at).getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

// =============================================================
// CompassMark
// =============================================================

function CompassMark({
  size,
  variant,
  color,
  haloColor,
}: {
  size: number;
  variant: "filled" | "outline" | "glow-dark";
  color?: string;
  haloColor?: string;
}) {
  const id = useId().replace(/:/g, "_");

  if (variant === "filled") {
    const c = color ?? colors.sage;
    return (
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Path d="M 16 4 L 21 16 L 16 28 L 11 16 Z" fill={c} />
      </Svg>
    );
  }

  if (variant === "outline") {
    const halo = haloColor ?? colors.sage;
    return (
      <Svg width={size} height={size} viewBox="0 0 60 60">
        <Circle cx="30" cy="30" r="27" stroke={halo} strokeWidth="0.8" fill="none" />
        <Path d="M 30 12 L 36 30 L 30 48 L 24 30 Z" fill={halo} />
      </Svg>
    );
  }

  const c = color ?? colors.sageMist;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={c} stopOpacity="0.55" />
          <Stop offset="55%" stopColor={c} stopOpacity="0.18" />
          <Stop offset="100%" stopColor={c} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy="50" r="48" fill={`url(#${id})`} />
      <Path d="M 50 30 L 56 50 L 50 70 L 44 50 Z" fill={c} />
    </Svg>
  );
}

// =============================================================
// Card / SectionLabel / ChevronRight
// =============================================================

function Card({
  children,
  padding = 16,
}: {
  children: React.ReactNode;
  padding?: number;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.cream300,
        padding,
        ...shadows.card,
      }}
    >
      {children}
    </View>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <View style={{ paddingHorizontal: 4, paddingBottom: 10 }}>
      <Text
        style={{
          fontSize: 11,
          color: colors.ink500,
          fontFamily: fonts.medium,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function ChevronRight({
  color = colors.ink300,
  size = 14,
}: {
  color?: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path
        d="M 5 3 L 9 7 L 5 11"
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// =============================================================
// SettingRow / SwitchRow / StatColumn
// =============================================================

function SettingRow({
  label,
  onPress,
  value,
  isLast,
  destructive,
}: {
  label: string;
  onPress?: () => void;
  value?: string;
  isLast?: boolean;
  destructive?: boolean;
}) {
  const inner = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 0.5,
        borderColor: colors.divider,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: destructive ? colors.danger : colors.ink900,
          fontFamily: fonts.regular,
        }}
      >
        {label}
      </Text>
      {value ? (
        <Text
          style={{ fontSize: 13, color: colors.ink500, fontFamily: fonts.regular }}
        >
          {value}
        </Text>
      ) : onPress ? (
        <ChevronRight />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        {inner}
      </Pressable>
    );
  }
  return inner;
}

function SwitchRow({
  label,
  description,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderColor: colors.divider,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text
          style={{ fontSize: 14, color: colors.ink900, fontFamily: fonts.regular }}
        >
          {label}
        </Text>
        {description ? (
          <Text
            style={{
              fontSize: 11,
              color: colors.ink500,
              marginTop: 2,
              fontFamily: fonts.regular,
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.cream300, true: colors.sage }}
        thumbColor={colors.white}
      />
    </View>
  );
}

function StatColumn({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text
        style={{
          fontSize: 24,
          color: colors.ink900,
          fontFamily: fonts.semibold,
          letterSpacing: -0.5,
          lineHeight: 28,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: colors.ink500,
          marginTop: 6,
          fontFamily: fonts.medium,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// =============================================================
// Ana ekran
// =============================================================

export default function ProfileScreen() {
  const router = useRouter();
  const apps = (useApplications() ?? []) as any[];
  const counts = useMemo(() => computeCounts(apps), [apps]);
  const daysSinceStart = useMemo(() => computeDaysSinceStart(apps), [apps]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [silentMode, setSilentMode] = useState(true);

  // Supabase'den gerçek kullanıcı bilgisi
  const [user, setUser] = useState<{
    full_name: string;
    email: string;
    member_since: string;
  }>({
    full_name: "Yükleniyor...",
    email: "",
    member_since: new Date().toISOString(),
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const email = data.user.email ?? "";
        const fullName =
          (data.user.user_metadata?.full_name as string | undefined) ??
          email.split("@")[0]; // metadata yoksa email'in kullanıcı kısmını göster
        setUser({
          full_name: fullName,
          email,
          member_since: data.user.created_at ?? new Date().toISOString(),
        });
      }
    })();
  }, []);

const handleSignOut = async () => {
    const confirmed =
      Platform.OS === "web"
        ? typeof window !== "undefined" &&
          window.confirm("Hesabından çıkış yapmak istediğine emin misin?")
        : await new Promise<boolean>((resolve) => {
            Alert.alert(
              "Çıkış yap",
              "Hesabından çıkış yapmak istediğine emin misin?",
              [
                { text: "İptal", style: "cancel", onPress: () => resolve(false) },
                {
                  text: "Çıkış yap",
                  style: "destructive",
                  onPress: () => resolve(true),
                },
              ]
            );
          });

    if (!confirmed) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Çıkış hatası:", error);
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.alert("Çıkış yapılamadı: " + error.message);
      }
      return;
    }
    router.replace("/(auth)/login");
  };

  const handleDeleteAccount = async () => {
    const confirmed =
      Platform.OS === "web"
        ? typeof window !== "undefined" &&
          window.confirm(
            "Tüm başvuruların ve verilerin kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?"
          )
        : await new Promise<boolean>((resolve) => {
            Alert.alert(
              "Hesabı sil",
              "Tüm başvuruların ve verilerin kalıcı olarak silinecek. Bu işlem geri alınamaz.",
              [
                { text: "İptal", style: "cancel", onPress: () => resolve(false) },
                {
                  text: "Hesabı sil",
                  style: "destructive",
                  onPress: () => resolve(true),
                },
              ]
            );
          });

    if (!confirmed) return;

    // TODO: gerçek hesap silme akışı (Edge Function ile)
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream50 }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}
          >
            <Text
              style={{
                fontSize: 11,
                color: colors.ink500,
                fontFamily: fonts.medium,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              Profil
            </Text>
            <Text
              style={{
                fontSize: 26,
                color: colors.ink900,
                fontFamily: fonts.light,
                fontStyle: "italic",
                letterSpacing: -0.4,
                marginTop: 6,
              }}
            >
              Sen ve pusulan.
            </Text>
          </View>

          <View style={{ paddingHorizontal: 20 }}>
            <View
              style={{
                backgroundColor: colors.forestDeep,
                borderRadius: 22,
                paddingTop: 36,
                paddingBottom: 60,
                paddingHorizontal: 24,
                alignItems: "center",
                overflow: "hidden",
                position: "relative",
                ...shadows.elevated,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: -22,
                  left: -22,
                  opacity: 0.18,
                }}
              >
                <CompassMark
                  size={120}
                  variant="outline"
                  haloColor={colors.sageMist}
                />
              </View>
              <View
                style={{
                  position: "absolute",
                  bottom: -28,
                  right: -28,
                  opacity: 0.22,
                }}
              >
                <CompassMark
                  size={140}
                  variant="outline"
                  haloColor={colors.sageMist}
                />
              </View>

              <View style={{ marginBottom: 18, zIndex: 1 }}>
                <CompassMark
                  size={64}
                  variant="glow-dark"
                  color={colors.sageMist}
                />
              </View>

              <Text
                style={{
                  fontSize: 22,
                  color: colors.cream50,
                  fontFamily: fonts.light,
                  fontStyle: "italic",
                  letterSpacing: -0.3,
                  textAlign: "center",
                  zIndex: 1,
                }}
              >
                {user.full_name}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.ink300,
                  marginTop: 6,
                  fontFamily: fonts.regular,
                  textAlign: "center",
                  zIndex: 1,
                }}
              >
                {user.email}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: colors.sageMist,
                  marginTop: 14,
                  fontFamily: fonts.medium,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  zIndex: 1,
                }}
              >
                Üye · {formatDateLongTr(user.member_since)}
              </Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: -36, zIndex: 2 }}>
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 14,
                paddingVertical: 22,
                paddingHorizontal: 16,
                flexDirection: "row",
                borderWidth: 0.5,
                borderColor: colors.cream300,
                ...shadows.elevated,
              }}
            >
              <StatColumn value={counts.all} label="Başvuru" />
              <View style={{ width: 0.5, backgroundColor: colors.cream300 }} />
              <StatColumn
                value={counts.interview}
                label="Mülakat"
              />
              <View style={{ width: 0.5, backgroundColor: colors.cream300 }} />
              <StatColumn value={daysSinceStart} label="Gün" />
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
            <SectionLabel title="TERCİHLER" />
            <Card padding={0}>
              <SwitchRow
                label="Bildirimler"
                description="Aşama değişiklikleri ve hatırlatıcılar"
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
              <SwitchRow
                label="Sessiz mod"
                description="Kilit ekranında şirket adı görünmez"
                value={silentMode}
                onValueChange={setSilentMode}
                disabled={!notificationsEnabled}
              />
              <SettingRow
                label="Aşama yönetimi"
                onPress={() => router.push("/settings/stages")}
                isLast
              />
            </Card>
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
            <SectionLabel title="HESAP" />
            <Card padding={0}>
              <SettingRow
                label="Profil bilgilerim"
                onPress={() =>
                  notify("Yakında", "Bu özellik üzerinde çalışıyoruz.")
                }
              />
              <SettingRow
                label="Verilerimi indir"
                onPress={() =>
                  notify("Verilerini indir", "Tüm başvurularını CSV olarak e-posta adresine göndereceğiz.")
                }
                isLast
              />
            </Card>
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
            <SectionLabel title="UYGULAMA" />
            <Card padding={0}>
              <SettingRow
                label="Gizlilik Politikası"
                onPress={() =>
                  notify("Gizlilik", "Verilerin bu cihazdan ayrılmadan, şifreli olarak saklanır.")
                }
              />
              <SettingRow
                label="Kullanım Koşulları"
                onPress={() =>
                  notify("Koşullar", "Bu özellik geliştirme aşamasında.")
                }
              />
              <SettingRow
                label="Geri bildirim gönder"
                onPress={() =>
                  notify("Geri bildirim", "feedback@applyze.com adresine yazabilirsin.")
                }
              />
              <SettingRow label="Sürüm" value="1.0.0" isLast />
            </Card>
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
            <Card padding={0}>
              <SettingRow
                label="Çıkış yap"
                onPress={handleSignOut}
                destructive
              />
              <SettingRow
                label="Hesabımı sil"
                onPress={handleDeleteAccount}
                destructive
                isLast
              />
            </Card>
          </View>

          <View
            style={{ alignItems: "center", marginTop: 38, paddingHorizontal: 20 }}
          >
            <CompassMark size={24} variant="outline" haloColor={colors.ink300} />
            <Text
              style={{
                fontSize: 14,
                color: colors.ink500,
                marginTop: 12,
                fontFamily: fonts.light,
                fontStyle: "italic",
                textAlign: "center",
                letterSpacing: -0.1,
              }}
            >
              Pusulan yerinde duruyor.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}