// app/settings/cv.tsx — CV dosyası yükleme (PDF). Dosya Supabase Storage'da saklanır,
// görüntülenip indirilebilir. Metin (AI uyum analizi için) arka planda çıkarılıp
// profiles.cv_text'e kaydedilir; "Gelişmiş" alanında görüntülenip düzenlenebilir.
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "../../lib/supabase";
import { confirmAction } from "../../lib/dialogs";

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path d="M 13 4 L 7 10 L 13 16" fill="none" stroke="#1F1B16" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function DocIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26">
      <Path d="M 6 3 L 15 3 L 20 8 L 20 23 L 6 23 Z" fill="none" stroke="#3D5A47" strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M 15 3 L 15 8 L 20 8" fill="none" stroke="#3D5A47" strokeWidth={1.5} strokeLinejoin="round" />
    </Svg>
  );
}

async function blobToBase64(blob: Blob): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const s = String(reader.result);
      resolve(s.includes(",") ? s.split(",")[1] : s);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function CvScreen() {
  const router = useRouter();
  const [cvText, setCvText] = useState("");
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);
  const [savingText, setSavingText] = useState(false);

  useEffect(() => {
    let m = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) { if (m) setLoading(false); return; }
      const { data: p } = await supabase
        .from("profiles").select("cv_text, cv_file_path, cv_file_name").eq("user_id", uid).maybeSingle();
      if (m) {
        setCvText((p?.cv_text as string) ?? "");
        setFilePath((p?.cv_file_path as string) ?? null);
        setFileName((p?.cv_file_name as string) ?? null);
        setLoading(false);
      }
    })();
    return () => { m = false; };
  }, []);

  const handlePick = async () => {
    setErr(null);
    setStatus(null);
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ["application/pdf"], copyToCacheDirectory: true, multiple: false });
      if (res.canceled || !res.assets || !res.assets[0]) return;
      const asset = res.assets[0];

      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) { setErr("Oturum bulunamadı."); return; }

      setBusy(true);
      setStatus("Dosya yükleniyor…");

      const resp = await fetch(asset.uri);
      const blob = await resp.blob();
      const path = `${uid}/cv.pdf`;

      const { error: upErr } = await supabase.storage.from("cvs").upload(path, blob, {
        upsert: true,
        contentType: asset.mimeType ?? "application/pdf",
      });
      if (upErr) {
        setErr("Dosya yüklenemedi: " + upErr.message);
        setBusy(false);
        return;
      }

      // Metni çıkar (AI için). Başarısız olsa bile dosya yüklendi sayılır.
      setStatus("Metin çıkarılıyor…");
      let text = "";
      try {
        const b64 = await blobToBase64(blob);
        const { data } = await supabase.functions.invoke("extract-cv", {
          body: { fileBase64: b64, mimeType: asset.mimeType ?? "application/pdf" },
        });
        if ((data as any)?.text) text = (data as any).text;
      } catch { /* metin çıkmazsa sorun değil, dosya yüklendi */ }

      await supabase.from("profiles").upsert(
        { user_id: uid, cv_file_path: path, cv_file_name: asset.name ?? "CV.pdf", cv_text: text || null },
        { onConflict: "user_id" },
      );

      setFilePath(path);
      setFileName(asset.name ?? "CV.pdf");
      setCvText(text);
      setBusy(false);
      setStatus(text ? "CV yüklendi ✓" : "Dosya yüklendi ✓ (metin çıkarılamadı — uyum analizi için 'Gelişmiş'ten ekleyebilirsin)");
      setTimeout(() => setStatus(null), 4000);
    } catch (e) {
      console.error("[cv] pick failed:", e);
      setErr("Dosya işlenemedi. Tekrar dene.");
      setBusy(false);
    }
  };

  const handleView = async () => {
    if (!filePath) return;
    const { data, error } = await supabase.storage.from("cvs").createSignedUrl(filePath, 3600);
    if (error || !data?.signedUrl) { setErr("Dosya açılamadı."); return; }
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.open(data.signedUrl, "_blank");
    } else {
      Linking.openURL(data.signedUrl);
    }
  };

  const handleRemove = async () => {
    const ok = await confirmAction({
      title: "CV'yi kaldır",
      message: "Yüklediğin CV silinecek. Emin misin?",
      confirmText: "Kaldır",
      cancelText: "Vazgeç",
      destructive: true,
    });
    if (!ok) return;
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return;
    if (filePath) await supabase.storage.from("cvs").remove([filePath]);
    await supabase.from("profiles").upsert(
      { user_id: uid, cv_file_path: null, cv_file_name: null, cv_text: null },
      { onConflict: "user_id" },
    );
    setFilePath(null);
    setFileName(null);
    setCvText("");
    setStatus("CV kaldırıldı.");
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSaveText = async () => {
    setSavingText(true);
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) { setSavingText(false); return; }
    await supabase.from("profiles").upsert({ user_id: uid, cv_text: cvText.trim() || null }, { onConflict: "user_id" });
    setSavingText(false);
    setStatus("Metin kaydedildi ✓");
    setTimeout(() => setStatus(null), 2500);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#FAF8F4" }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 52 }}>
          <Pressable onPress={() => { if (router.canGoBack()) router.back(); else router.replace("/(tabs)/profile"); }} hitSlop={10} style={{ padding: 6, marginRight: 4 }}>
            <BackIcon />
          </Pressable>
          <Text style={{ fontSize: 17, color: "#1F1B16", fontFamily: "Inter_600SemiBold" }}>CV / Özgeçmiş</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 14, color: "#5C5650", fontFamily: "Inter_400Regular", lineHeight: 21, marginTop: 4, marginBottom: 16 }}>
          CV'ni PDF olarak yükle. Dosyan saklanır, buradan görüntüleyip indirebilirsin. Her ilan için "CV uyumunu analiz et" özelliğinde kullanılır.
        </Text>

        {loading ? (
          <View style={{ marginTop: 24, flexDirection: "row", alignItems: "center" }}>
            <ActivityIndicator color="#3D5A47" />
            <Text style={{ marginLeft: 10, color: "#8A8278", fontFamily: "Inter_400Regular" }}>Yükleniyor…</Text>
          </View>
        ) : (
          <>
            {filePath && fileName ? (
              <View style={{ borderRadius: 12, borderWidth: 1, borderColor: "#EBE7DF", backgroundColor: "#FFFFFF", padding: 14, marginBottom: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <DocIcon />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 14, color: "#1F1B16", fontFamily: "Inter_500Medium" }} numberOfLines={1}>{fileName}</Text>
                    <Text style={{ fontSize: 12, color: "#8A8278", fontFamily: "Inter_400Regular", marginTop: 2 }}>Yüklendi</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", marginTop: 14, gap: 10 }}>
                  <Pressable onPress={handleView} style={({ pressed }) => ({ flex: 1, height: 42, borderRadius: 10, backgroundColor: "#3D5A47", alignItems: "center", justifyContent: "center", opacity: pressed ? 0.9 : 1 })}>
                    <Text style={{ color: "#FAF8F4", fontFamily: "Inter_500Medium", fontSize: 14 }}>Görüntüle / İndir</Text>
                  </Pressable>
                  <Pressable onPress={handleRemove} style={({ pressed }) => ({ flex: 1, height: 42, borderRadius: 10, borderWidth: 1, borderColor: "#E8D8D8", alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
                    <Text style={{ color: "#A96458", fontFamily: "Inter_500Medium", fontSize: 14 }}>Kaldır</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            <Pressable
              onPress={handlePick}
              disabled={busy}
              style={({ pressed }) => ({
                height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: "#3D5A47", borderStyle: "dashed",
                backgroundColor: "#F1F4EF", alignItems: "center", justifyContent: "center", flexDirection: "row",
                opacity: busy ? 0.6 : pressed ? 0.9 : 1, marginBottom: 12,
              })}
            >
              {busy ? (
                <>
                  <ActivityIndicator color="#3D5A47" />
                  <Text style={{ marginLeft: 8, color: "#3D5A47", fontFamily: "Inter_500Medium" }}>{status ?? "İşleniyor…"}</Text>
                </>
              ) : (
                <Text style={{ color: "#3D5A47", fontFamily: "Inter_500Medium", fontSize: 15 }}>{filePath ? "Başka PDF yükle" : "PDF yükle"}</Text>
              )}
            </Pressable>

            {err && <Text style={{ fontSize: 13, color: "#A96458", fontFamily: "Inter_400Regular", marginBottom: 8, lineHeight: 19 }}>{err}</Text>}
            {status && !busy && <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_500Medium", marginBottom: 8 }}>{status}</Text>}

            {/* Gelişmiş: AI için çıkarılan metin */}
            <Pressable onPress={() => setShowText((v) => !v)} style={{ paddingVertical: 12, marginTop: 6 }}>
              <Text style={{ fontSize: 13, color: "#5C5650", fontFamily: "Inter_500Medium" }}>
                {showText ? "▾ " : "▸ "}Gelişmiş: AI için çıkarılan metin
              </Text>
            </Pressable>
            {showText && (
              <>
                <Text style={{ fontSize: 12, color: "#8A8278", fontFamily: "Inter_400Regular", lineHeight: 17, marginBottom: 8 }}>
                  Uyum analizi bu metni kullanır. Dosyadan otomatik çıkarılır; gerekirse düzeltebilirsin.
                </Text>
                <TextInput
                  value={cvText}
                  onChangeText={setCvText}
                  placeholder="CV metni…"
                  placeholderTextColor="#B8B0A4"
                  multiline
                  style={{ minHeight: 160, borderRadius: 12, borderWidth: 1, borderColor: "#D9D3C8", backgroundColor: "#FFFFFF", padding: 14, fontSize: 13, color: "#1F1B16", fontFamily: "Inter_400Regular", textAlignVertical: "top", marginBottom: 10 }}
                />
                <Pressable onPress={handleSaveText} disabled={savingText} style={({ pressed }) => ({ height: 44, borderRadius: 10, backgroundColor: "#1F1B16", alignItems: "center", justifyContent: "center", opacity: savingText ? 0.6 : pressed ? 0.9 : 1 })}>
                  {savingText ? <ActivityIndicator color="#FAF8F4" /> : <Text style={{ color: "#FAF8F4", fontFamily: "Inter_500Medium", fontSize: 14 }}>Metni kaydet</Text>}
                </Pressable>
              </>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
