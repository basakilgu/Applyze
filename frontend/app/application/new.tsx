// app/application/new.tsx — New Application Form
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { Header } from "../../components/ui/Header";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { mockStore, mockStages, platformLabels, platformColors, stageDisplayNames } from "../../lib/applications";
import type { Application, Platform, StageKey } from "../../types/database";
import { confirmAction } from "../../lib/dialogs";
import { DatePicker } from "../../components/ui/DatePicker";
import { supabase } from "../../lib/supabase";

const platforms: Platform[] = ["linkedin", "kariyer", "youthall", "anbean", "other"];

function detectPlatformFromUrl(url: string): Platform | null {
  const u = (url || "").toLowerCase();
  if (u.includes("linkedin")) return "linkedin";
  if (u.includes("kariyer")) return "kariyer";
  if (u.includes("youthall")) return "youthall";
  if (u.includes("anbean")) return "anbean";
  return null;
}

function FitSection({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (!items || items.length === 0) return null;
  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_600SemiBold", marginBottom: 5 }}>{title}</Text>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: "row", marginBottom: 4 }}>
          <Text style={{ color, marginRight: 7, fontSize: 13, lineHeight: 19 }}>•</Text>
          <Text style={{ flex: 1, fontSize: 13, color: "#1F1B16", fontFamily: "Inter_400Regular", lineHeight: 19 }}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

const MONTHS_LONG_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function startOfDayNoon(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

function dateNDaysAgoObj(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return startOfDayNoon(d);
}

function sameYMD(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateLong(d: Date): string {
  return `${d.getDate()} ${MONTHS_LONG_TR[d.getMonth()]} ${d.getFullYear()}`;
}

export default function NewApplicationScreen() {
  const router = useRouter();

  const [position, setPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [sourceUrl, setSourceUrl] = useState("");
  const [initialStage, setInitialStage] = useState<StageKey>("applied");
  const [initialNote, setInitialNote] = useState("");

  const [errors, setErrors] = useState<{ position?: string; companyName?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [appliedDate, setAppliedDate] = useState<Date>(() => startOfDayNoon(new Date()));
  const [calendarOpen, setCalendarOpen] = useState(false);

  // İlan metni -> AI ile otomatik doldurma
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState<string | null>(null);

  // CV <-> ilan uyum analizi
  const [fitLoading, setFitLoading] = useState(false);
  const [fitErr, setFitErr] = useState<string | null>(null);
  const [fitNeedCv, setFitNeedCv] = useState(false);
  const [fitResult, setFitResult] = useState<
    { skor: number; guven: string; eslesme: string[]; eksikler: string[]; ats: string[]; vurgu: string[] } | null
  >(null);

  // Tekrar uyarısı: URL alanı değiştikçe (debounce ile) aynı ilana
  // daha önce başvurulmuş mu kontrol et. Engellemez, sadece uyarır (FR-10).
  const [duplicateApp, setDuplicateApp] = useState<Application | null>(null);

  useEffect(() => {
    const url = sourceUrl.trim();
    if (!url) {
      setDuplicateApp(null);
      return;
    }
    const timer = setTimeout(() => {
      setDuplicateApp(mockStore.findByUrl(url));
    }, 400);
    return () => clearTimeout(timer);
  }, [sourceUrl]);

  const handleAiFill = async () => {
    const text = aiText.trim();
    if (text.length < 20) {
      setAiErr("Lütfen ilan metnini yapıştır (biraz daha uzun olmalı).");
      return;
    }
    setAiLoading(true);
    setAiErr(null);
    try {
      const { data, error } = await supabase.functions.invoke("parse-job", {
        body: { text },
      });
      if (error || !data || (data as any).error) {
        setAiErr("Şu an okunamadı. Tekrar dene ya da alanları elle doldur.");
        setAiLoading(false);
        return;
      }
      const d = data as { sirket?: string; pozisyon?: string; sehir?: string; platform?: string; notlar?: string };
      if (d.pozisyon) setPosition(d.pozisyon);
      if (d.sirket) setCompanyName(d.sirket);
      if (d.sehir) setLocation(d.sehir);
      if (d.notlar) setInitialNote(d.notlar);
      if (d.platform) {
        const pf = String(d.platform).toLowerCase();
        const valid: Platform[] = ["linkedin", "kariyer", "youthall", "anbean", "other"];
        if ((valid as string[]).includes(pf)) setPlatform(pf as Platform);
      }
      setErrors({});
      setAiLoading(false);
    } catch (e) {
      console.error("[new application] parse-job failed:", e);
      setAiErr("Bir şeyler ters gitti. Tekrar dene.");
      setAiLoading(false);
    }
  };

  const handleAnalyzeFit = async () => {
    const text = aiText.trim();
    if (text.length < 20) {
      setFitErr("Önce ilan metnini yapıştır.");
      return;
    }
    setFitLoading(true);
    setFitErr(null);
    setFitNeedCv(false);
    setFitResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-fit", {
        body: { job_text: text },
      });
      if (error || !data) {
        setFitErr("Analiz alınamadı. Tekrar dene.");
        setFitLoading(false);
        return;
      }
      const d = data as any;
      if (d.error === "no_cv") { setFitNeedCv(true); setFitLoading(false); return; }
      if (d.error) { setFitErr("Analiz üretilemedi. Tekrar dene."); setFitLoading(false); return; }
      setFitResult(d);
      setFitLoading(false);
    } catch (e) {
      console.error("[new application] analyze-fit failed:", e);
      setFitErr("Bir şeyler ters gitti. Tekrar dene.");
      setFitLoading(false);
    }
  };

  const handleSave = async () => {
    const newErrors: typeof errors = {};
    if (!position.trim()) newErrors.position = "Pozisyon zorunlu";
    if (!companyName.trim()) newErrors.companyName = "Şirket zorunlu";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const created = await mockStore.add({
        position: position.trim(),
        company_name: companyName.trim(),
        location: location.trim() || undefined,
        platform,
        source_url: sourceUrl.trim() || undefined,
        initial_stage: initialStage,
        initial_note: initialNote.trim() || undefined,
        applied_at: appliedDate.toISOString(),
      });

      if (!created) {
        setSaveError("Başvuru kaydedilemedi. İnternet bağlantını kontrol edip tekrar dene.");
        setSaving(false);
        return;
      }

      // Başarılı — listeye dön (web'de router.back() güvenilmez olabiliyor)
      router.replace("/(tabs)");
    } catch (e) {
      console.error("[new application] save failed:", e);
      setSaveError("Bir şeyler ters gitti. Lütfen tekrar dene.");
      setSaving(false);
    }
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  const handleClose = async () => {
    if (position || companyName || initialNote) {
      const ok = await confirmAction({
        title: "Çıkmak istediğine emin misin?",
        message: "Yazdıkların kaydedilmeyecek.",
        confirmText: "Çık",
        cancelText: "Devam et",
        destructive: true,
      });
      if (ok) goBack();
    } else {
      goBack();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F4" }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <Header title="Yeni başvuru" showBack={false} showClose onBack={handleClose} />
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: 14, color: "#8A8278",
            marginBottom: 22, marginTop: 4,
            fontFamily: "Inter_300Light", lineHeight: 21,
          }}
        >
          Bu başvuruyu pusulan üzerinde işaretleyelim.
        </Text>

        {/* İlan metni -> AI ile otomatik doldur */}
        <View
          style={{
            marginBottom: 22, padding: 14, borderRadius: 12,
            backgroundColor: "#F1F4EF", borderWidth: 1, borderColor: "#DDE6D9",
          }}
        >
          <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_600SemiBold", marginBottom: 4 }}>
            İlan metnini yapıştır, AI doldursun
          </Text>
          <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_400Regular", lineHeight: 17, marginBottom: 10 }}>
            İlandaki metni kopyalayıp aşağıya yapıştır; şirket, pozisyon ve şehir otomatik dolsun. Sonra istersen düzelt.
          </Text>
          <Input
            value={aiText}
            onChangeText={(t) => { setAiText(t); if (aiErr) setAiErr(null); }}
            placeholder="İlan metnini buraya yapıştır…"
            multiline
            height={96}
            error={aiErr ?? undefined}
          />
          <Button
            label={aiLoading ? "Okunuyor…" : "AI ile doldur"}
            onPress={handleAiFill}
            variant="secondary"
            size="md"
            loading={aiLoading}
          />

          <View style={{ height: 10 }} />

          <Button
            label={fitLoading ? "Analiz ediliyor…" : "CV uyumunu analiz et"}
            onPress={handleAnalyzeFit}
            variant="ghost"
            size="md"
            loading={fitLoading}
          />
          {fitErr && (
            <Text style={{ fontSize: 12, color: "#A96458", fontFamily: "Inter_400Regular", marginTop: 8 }}>{fitErr}</Text>
          )}
          {fitNeedCv && (
            <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_400Regular", marginTop: 8, lineHeight: 18 }}>
              Uyum analizi için önce profiline CV metnini eklemelisin.{" "}
              <Text onPress={() => router.push("/settings/cv")} style={{ color: "#3D5A47", fontFamily: "Inter_500Medium", textDecorationLine: "underline" }}>CV ekle</Text>
            </Text>
          )}
        </View>

        {fitResult && (
          <View style={{ marginBottom: 22, padding: 14, borderRadius: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#EBE7DF" }}>
            <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 2 }}>
              <Text style={{ fontSize: 30, fontFamily: "Inter_600SemiBold", color: "#3D5A47", letterSpacing: -0.5 }}>%{fitResult.skor}</Text>
              <Text style={{ fontSize: 13, color: "#5C5650", marginLeft: 8, fontFamily: "Inter_400Regular" }}>uyum · güven: {fitResult.guven}</Text>
            </View>
            <FitSection title="Eşleşen güçlü yönlerin" items={fitResult.eslesme} color="#3D5A47" />
            <FitSection title="Geliştirilebilecekler" items={fitResult.eksikler} color="#8A5A00" />
            <FitSection title="Eksik anahtar kelimeler (ATS)" items={fitResult.ats} color="#5C5650" />
            <FitSection title="Başvuruda vurgula" items={fitResult.vurgu} color="#1F1B16" />
            <Text style={{ fontSize: 11, color: "#8A8278", marginTop: 10, fontStyle: "italic", fontFamily: "Inter_400Regular" }}>
              Bu analiz bir rehberdir, garanti değildir.
            </Text>
          </View>
        )}

        <Input
          label="POZİSYON"
          value={position}
          onChangeText={(t) => { setPosition(t); if (errors.position) setErrors({ ...errors, position: undefined }); }}
          placeholder="ör. Süreç Tasarım Uzmanı"
          required
          error={errors.position}
          maxLength={120}
        />

        <Input
          label="ŞİRKET"
          value={companyName}
          onChangeText={(t) => { setCompanyName(t); if (errors.companyName) setErrors({ ...errors, companyName: undefined }); }}
          placeholder="ör. Trendyol"
          required
          error={errors.companyName}
          maxLength={80}
        />

        <Input
          label="ŞEHİR"
          value={location}
          onChangeText={setLocation}
          placeholder="İstanbul"
          maxLength={60}
        />

        {/* Başvuru tarihi */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 10, letterSpacing: 0.2 }}>
            BAŞVURU TARİHİ
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {([["Bugün", 0], ["Dün", 1]] as const).map(([lbl, daysAgo]) => {
              const d = dateNDaysAgoObj(daysAgo);
              const isActive = sameYMD(appliedDate, d);
              return (
                <Pressable
                  key={lbl}
                  onPress={() => setAppliedDate(d)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 14, height: 36, borderRadius: 18,
                    alignItems: "center", justifyContent: "center",
                    backgroundColor: isActive ? "#3D5A47" : "#FFFFFF",
                    borderWidth: 1, borderColor: isActive ? "#3D5A47" : "#EBE7DF",
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ fontSize: 13, color: isActive ? "#FAF8F4" : "#1F1B16", fontFamily: isActive ? "Inter_500Medium" : "Inter_400Regular" }}>
                    {lbl}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setCalendarOpen(true)}
              style={({ pressed }) => ({
                paddingHorizontal: 14, height: 36, borderRadius: 18,
                alignItems: "center", justifyContent: "center",
                backgroundColor: "#FFFFFF",
                borderWidth: 1, borderColor: "#EBE7DF",
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontSize: 13, color: "#1F1B16", fontFamily: "Inter_400Regular" }}>
                Takvim
              </Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => setCalendarOpen(true)}
            style={({ pressed }) => ({
              minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: "#D9D3C8",
              backgroundColor: "#FFFFFF", paddingHorizontal: 14,
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontSize: 14, color: "#1F1B16", fontFamily: "Inter_400Regular" }}>
              {formatDateLong(appliedDate)}
            </Text>
            <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_500Medium" }}>
              Değiştir
            </Text>
          </Pressable>
          <Text style={{ fontSize: 11, color: "#8A8278", marginTop: 6, fontFamily: "Inter_400Regular", lineHeight: 16 }}>
            Geçmiş bir başvuruysa tarihini değiştir — kısayol ya da takvimden seç.
          </Text>
        </View>

        {/* Platform selector */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 10, letterSpacing: 0.2 }}>
            PLATFORM
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {platforms.map((p) => {
              const isActive = platform === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => setPlatform(p)}
                  style={({ pressed }) => ({
                    flexDirection: "row", alignItems: "center",
                    paddingHorizontal: 12, height: 36,
                    borderRadius: 18,
                    backgroundColor: isActive ? "#3D5A47" : "#FFFFFF",
                    borderWidth: 1,
                    borderColor: isActive ? "#3D5A47" : "#EBE7DF",
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 6, height: 6, borderRadius: 3,
                      backgroundColor: isActive ? "#FAF8F4" : platformColors[p],
                      marginRight: 7,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: isActive ? "#FAF8F4" : "#1F1B16",
                      fontFamily: isActive ? "Inter_500Medium" : "Inter_400Regular",
                    }}
                  >
                    {platformLabels[p]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Input
          label="İLAN BAĞLANTISI"
          value={sourceUrl}
          onChangeText={(t) => {
            setSourceUrl(t);
            const pf = detectPlatformFromUrl(t);
            if (pf) setPlatform(pf);
          }}
          placeholder="https://..."
          autoCapitalize="none"
          keyboardType="url"
          helper="İsteğe bağlı — daha sonra ilana hızlı erişim için"
        />

        {duplicateApp && (
          <Pressable
            onPress={() => router.push(`/application/${duplicateApp.id}`)}
            style={{
              marginBottom: 16,
              padding: 14,
              borderRadius: 12,
              backgroundColor: "#FBF3E3",
              borderWidth: 1,
              borderColor: "#E8D9B5",
            }}
          >
            <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8A5A00", marginBottom: 4 }}>
              Bu ilana zaten başvurmuşsun
            </Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: "#5C5650" }}>
              {duplicateApp.company_name} — {duplicateApp.position}
            </Text>
            <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: "#3D5A47", marginTop: 8 }}>
              Mevcut başvuruya git →
            </Text>
          </Pressable>
        )}

        {/* Aşama selector */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_500Medium", marginBottom: 10, letterSpacing: 0.2 }}>
            AŞAMA
          </Text>
          <Card padding={4}>
            {mockStages.map((s, i) => {
              const isSelected = initialStage === s.key;
              const isLast = i === mockStages.length - 1;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setInitialStage(s.key)}
                  style={({ pressed }) => ({
                    flexDirection: "row", alignItems: "center",
                    paddingHorizontal: 12, paddingVertical: 12,
                    borderBottomWidth: isLast ? 0 : 0.5,
                    borderColor: "rgba(235, 231, 223, 0.7)",
                    backgroundColor: isSelected ? "rgba(61, 90, 71, 0.06)" : "transparent",
                    borderRadius: isSelected ? 6 : 0,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 16, height: 16, borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: isSelected ? "#3D5A47" : "#D9D3C8",
                      alignItems: "center", justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {isSelected && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#3D5A47" }} />}
                  </View>
                  <View
                    style={{
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: s.color ?? "#8A8278",
                      marginRight: 10,
                    }}
                  />
                  <Text
                    style={{
                      flex: 1, fontSize: 14,
                      color: "#1F1B16",
                      fontFamily: isSelected ? "Inter_500Medium" : "Inter_400Regular",
                    }}
                  >
                    {stageDisplayNames[s.key]}
                  </Text>
                </Pressable>
              );
            })}
          </Card>
          <Text style={{ fontSize: 11, color: "#8A8278", marginTop: 6, fontFamily: "Inter_400Regular", lineHeight: 16 }}>
            Çoğu başvuruda "Başvuruldu" varsayılandır. Süreç ilerlediyse uygun aşamayı seç.
          </Text>
        </View>

        <Input
          label="NOTLAR"
          value={initialNote}
          onChangeText={setInitialNote}
          placeholder="Bu başvuruyla ilgili düşüncelerini yaz..."
          multiline
          height={120}
          maxLength={2000}
          helper={initialNote ? `${initialNote.length}/2000` : "İsteğe bağlı"}
        />
      </ScrollView>

      <DatePicker
        visible={calendarOpen}
        value={appliedDate}
        maxDate={new Date()}
        onClose={() => setCalendarOpen(false)}
        onSelect={(d) => {
          setAppliedDate(d);
          setCalendarOpen(false);
        }}
      />

      {/* Sticky bottom */}
      <View
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(250, 248, 244, 0.95)",
          borderTopWidth: 0.5, borderColor: "rgba(217, 211, 200, 0.8)",
        }}
      >
        <SafeAreaView edges={["bottom"]}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            {saveError && (
              <Text
                style={{
                  fontSize: 13, color: "#A96458",
                  fontFamily: "Inter_400Regular",
                  marginBottom: 10, textAlign: "center",
                }}
              >
                {saveError}
              </Text>
            )}
            <Button
              label={saving ? "Kaydediliyor…" : "Kaydet"}
              onPress={handleSave}
              variant="primary"
              size="lg"
              fullWidth
              loading={saving}
            />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
