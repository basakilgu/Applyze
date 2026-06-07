// app/application/[id].tsx — Application Detail
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Linking, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Svg, { Path, Circle, Line } from "react-native-svg";

import { Header } from "../../components/ui/Header";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { StageUpdateSheet } from "../../components/ui/StageUpdateSheet";
import { NoteAddSheet } from "../../components/ui/NoteAddSheet";
import { DatePicker } from "../../components/ui/DatePicker";
import {
  useApplication, mockStore, mockStages, formatDateLongTr, formatDateTr, getRelativeTimeTr,
  platformColors, platformLabels, stageDisplayNames, getStageOrder, getStages,
} from "../../lib/applications";
import type { StageKey } from "../../types/database";
import { confirmAction } from "../../lib/dialogs";
import { supabase } from "../../lib/supabase";

function MoreIcon({ color = "#1F1B16" }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Circle cx={4}  cy={10} r={1.4} fill={color} />
      <Circle cx={10} cy={10} r={1.4} fill={color} />
      <Circle cx={16} cy={10} r={1.4} fill={color} />
    </Svg>
  );
}

function StarIcon({ filled, color = "#C4A875" }: { filled: boolean; color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path
        d="M 9 2 L 11.2 6.7 L 16.5 7.2 L 12.5 10.8 L 13.7 16 L 9 13.3 L 4.3 16 L 5.5 10.8 L 1.5 7.2 L 6.8 6.7 Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </Svg>
  );
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

function StageTimeline({ history, currentStageId, currentKey }: { history: { stage_id: string; stage_key: StageKey; stage_name: string; stage_color?: string; changed_at: string }[]; currentStageId?: string; currentKey: StageKey }) {
  const allStages = getStages().filter((s) => s.key !== "rejected");
  const currentOrder = (allStages.find((s) => s.id === currentStageId)?.order) ?? 0;
  const isRejected = currentKey === "rejected";

  if (isRejected) {
    return (
      <View>
        {history.map((h, i) => {
          const isLast = i === history.length - 1;
          return (
            <View key={i} style={{ flexDirection: "row", marginBottom: isLast ? 0 : 18 }}>
              <View style={{ width: 24, alignItems: "center", marginRight: 12 }}>
                <View
                  style={{
                    width: 12, height: 12, borderRadius: 6,
                    backgroundColor: h.stage_color ?? (h.stage_key === "rejected" ? "#A8908F" : "#3D5A47"),
                  }}
                />
                {!isLast && <View style={{ width: 1.5, flex: 1, backgroundColor: "#D9D3C8", marginTop: 4, minHeight: 24 }} />}
              </View>
              <View style={{ flex: 1, paddingTop: -2 }}>
                <Text style={{ fontSize: 13, color: "#1F1B16", fontFamily: "Inter_500Medium" }}>
                  {h.stage_name}
                </Text>
                <Text style={{ fontSize: 11, color: "#8A8278", marginTop: 2, fontFamily: "Menlo" }}>
                  {formatDateLongTr(h.changed_at)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View>
      {allStages.map((s, i) => {
        const isCompleted = s.order < currentOrder;
        const isCurrent = s.id === currentStageId;
        const isUpcoming = s.order > currentOrder;
        const isLast = i === allStages.length - 1;

        const dotColor = isCompleted ? "#3D5A47" : isCurrent ? "#3D5A47" : "#EBE7DF";
        const lineColor = isCompleted ? "#3D5A47" : "#EBE7DF";
        const labelColor = isUpcoming ? "#B8B0A4" : "#1F1B16";

        const histEntry = history.find((h) => h.stage_id === s.id);

        return (
          <View key={s.id} style={{ flexDirection: "row", marginBottom: isLast ? 0 : 14 }}>
            <View style={{ width: 24, alignItems: "center", marginRight: 12 }}>
              {isCurrent ? (
                <View
                  style={{
                    width: 14, height: 14, borderRadius: 7,
                    backgroundColor: dotColor,
                    borderWidth: 3, borderColor: "rgba(61, 90, 71, 0.18)",
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 12, height: 12, borderRadius: 6,
                    backgroundColor: dotColor,
                  }}
                />
              )}
              {!isLast && <View style={{ width: 1.5, flex: 1, backgroundColor: lineColor, marginTop: 4, minHeight: 22 }} />}
            </View>
            <View style={{ flex: 1, paddingTop: -2 }}>
              <Text
                style={{
                  fontSize: 13, color: labelColor,
                  fontFamily: isCurrent ? "Inter_600SemiBold" : "Inter_500Medium",
                }}
              >
                {s.name}
              </Text>
              {histEntry ? (
                <Text style={{ fontSize: 11, color: "#8A8278", marginTop: 2, fontFamily: "Menlo" }}>
                  {formatDateLongTr(histEntry.changed_at)}
                </Text>
              ) : isCurrent ? (
                <Text style={{ fontSize: 11, color: "#3D5A47", marginTop: 2, fontFamily: "Inter_400Regular" }}>
                  Şu an buradasın
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function reminderInfo(iso?: string): { label: string; color: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const now = new Date();
  const td = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((dd - td) / 86400000);
  if (days < 0) return { label: "gecikti", color: "#A96458" };
  if (days === 0) return { label: "bugün", color: "#A96458" };
  if (days === 1) return { label: "yarın", color: "#8A5A00" };
  return { label: `${days} gün sonra`, color: "#3D5A47" };
}

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const app = useApplication(id);

  const [stageSheetVisible, setStageSheetVisible] = useState(false);
  const [noteSheetVisible, setNoteSheetVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // CV uyum analizi
  const [fitJobText, setFitJobText] = useState("");
  const [fitLoading, setFitLoading] = useState(false);
  const [fitErr, setFitErr] = useState<string | null>(null);
  const [fitNeedCv, setFitNeedCv] = useState(false);
  const [fitResult, setFitResult] = useState<
    { skor: number; guven: string; eslesme: string[]; eksikler: string[]; ats: string[]; vurgu: string[] } | null
  >(null);
  const [editingFit, setEditingFit] = useState(false);
  const [fitBasis, setFitBasis] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const showSaved = () => {
    setSavedMsg("Değişiklikler kaydedildi ✓");
    setTimeout(() => setSavedMsg(null), 2500);
  };

  if (!app) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FAF8F4" }}>
        <StatusBar style="dark" />
        <SafeAreaView edges={["top"]}>
          <Header title="" />
        </SafeAreaView>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 14, color: "#8A8278", fontFamily: "Inter_400Regular" }}>
            Başvuru bulunamadı.
          </Text>
        </View>
      </View>
    );
  }

  const handleStageUpdateById = (stageId: string) => {
    const target = getStages().find((s) => s.id === stageId);
    const wasInterview = app.current_stage === "interview" || app.current_stage === "manager";
    const becomesInterview = target?.key === "interview" || target?.key === "manager";
    mockStore.updateStageById(app.id, stageId);
    showSaved();
    if (!wasInterview && becomesInterview) {
      setTimeout(() => router.push("/milestone"), 300);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    const ok = await confirmAction({
      title: "Aşamayı sil",
      message: "Bu özel aşama silinecek. Bu aşamadaki başvurular 'Başvuruldu'ya döner.",
      confirmText: "Sil",
      destructive: true,
    });
    if (!ok) return;
    await mockStore.deleteStage(stageId);
    showSaved();
  };

  const handleAddStage = async (name: string) => {
    const cur = getStages().find((s) => s.id === app.current_stage_id);
    const afterOrder = cur?.order ?? getStageOrder(app.current_stage);
    const newId = await mockStore.addCustomStage(name, afterOrder);
    if (newId) {
      await mockStore.updateStageById(app.id, newId);
      showSaved();
    }
  };

  const handleAddNote = (content: string) => {
    mockStore.addNote(app.id, content);
    showSaved();
  };

  const handleDeleteNote = async (noteId: string) => {
    const ok = await confirmAction({
      title: "Notu sil",
      message: "Bu not silinecek. Geri alınamaz.",
      confirmText: "Sil",
      destructive: true,
    });
    if (!ok) return;
    await mockStore.deleteNote(noteId);
    showSaved();
  };

  const handleToggleFavorite = () => {
    mockStore.toggleFavorite(app.id);
    showSaved();
  };

  const handleMore = () => setMenuOpen(true);

  const handleEdit = () => {
    setMenuOpen(false);
    router.push(`/application/edit/${app.id}`);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    const ok = await confirmAction({
      title: "Bu başvuruyu sil",
      message: "Geri alınamaz. Başvuru ve tüm geçmişi silinecek.",
      confirmText: "Sil",
      destructive: true,
    });
    if (ok) {
      await mockStore.softDelete(app.id);
      router.back();
    }
  };

  const handleFit = async () => {
    setFitErr(null);
    setFitNeedCv(false);
    setFitResult(null);
    const basis = fitJobText.trim().length >= 15 ? "ilan" : "kisitli";
    let jobText = fitJobText.trim();
    if (jobText.length < 15) {
      const notes = (app.notes || []).map((n) => n.content).join("\n");
      jobText = `Pozisyon: ${app.position}\nŞirket: ${app.company_name}${app.location ? "\nŞehir: " + app.location : ""}${notes ? "\nNotlar / aranan nitelikler:\n" + notes : ""}`.trim();
    }
    if (jobText.length < 15) {
      setFitErr("Analiz için yeterli bilgi yok. İlan metnini yapıştır.");
      return;
    }
    setFitLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-fit", { body: { job_text: jobText } });
      if (error || !data) { setFitErr("Analiz alınamadı. Tekrar dene."); setFitLoading(false); return; }
      const d = data as any;
      if (d.error === "no_cv") { setFitNeedCv(true); setFitLoading(false); return; }
      if (d.error) { setFitErr("Analiz üretilemedi. Tekrar dene."); setFitLoading(false); return; }
      setFitResult(d);
      setFitBasis(basis);
      setEditingFit(false);
      setFitLoading(false);
      mockStore.saveFit(app.id, d, basis);
      showSaved();
    } catch (e) {
      console.error("[detail] analyze-fit failed:", e);
      setFitErr("Bir şeyler ters gitti. Tekrar dene.");
      setFitLoading(false);
    }
  };

  const handleSetReminder = (d: Date) => {
    const x = new Date(d); x.setHours(9, 0, 0, 0);
    mockStore.setReminder(app.id, x.toISOString());
    showSaved();
  };
  const handleClearReminder = async () => {
    await mockStore.setReminder(app.id, null);
    showSaved();
  };

  const openSource = () => {
    if (!app.source_url) return;
    let url = app.source_url.trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.open(url, "_blank");
    } else {
      Linking.openURL(url);
    }
  };

  const shownFit = fitResult ?? app.fit ?? null;
  const shownBasis = fitBasis ?? app.fit_basis ?? null;
  const basisLabel =
    shownBasis === "ilan" ? "İlan metnine göre"
    : shownBasis === "kisitli" ? "Kısıtlı veriyle (pozisyon ve notlar)"
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F4" }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <Header
          title=""
          rightActions={
            <View style={{ flexDirection: "row", gap: 6 }}>
              <Pressable
                onPress={handleToggleFavorite}
                style={({ pressed }) => ({
                  width: 38, height: 38, borderRadius: 19,
                  alignItems: "center", justifyContent: "center",
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <StarIcon filled={app.is_favorite ?? false} />
              </Pressable>
              <Pressable
                onPress={handleMore}
                style={({ pressed }) => ({
                  width: 38, height: 38, borderRadius: 19,
                  alignItems: "center", justifyContent: "center",
                  opacity: pressed ? 0.5 : 1,
                })}
              >
                <MoreIcon />
              </Pressable>
            </View>
          }
        />
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header info */}
        <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <View
              style={{
                width: 6, height: 6, borderRadius: 3,
                backgroundColor: platformColors[app.platform], marginRight: 8,
              }}
            />
            <Text style={{ fontSize: 11, color: "#8A8278", fontFamily: "Inter_500Medium", letterSpacing: 0.4 }}>
              {platformLabels[app.platform].toUpperCase()}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 24, color: "#1F1B16",
              fontFamily: "Inter_600SemiBold",
              lineHeight: 32, letterSpacing: -0.4,
            }}
          >
            {app.position}
          </Text>
          <Text
            style={{
              fontSize: 14, color: "#5C5650",
              marginTop: 4, fontFamily: "Inter_400Regular",
            }}
          >
            {app.company_name}{app.location ? ` · ${app.location}` : ""}
          </Text>

          <View style={{ flexDirection: "row", marginTop: 12 }}>
            <Badge
              stage={app.current_stage}
              size="md"
              customLabel={app.current_stage_is_custom ? app.current_stage_name : undefined}
              customColor={app.current_stage_is_custom ? app.current_stage_color : undefined}
            />
            <View style={{ marginLeft: 10, justifyContent: "center" }}>
              <Text style={{ fontSize: 11, color: "#8A8278", fontFamily: "Menlo" }}>
                {formatDateTr(app.applied_at)} · {getStageOrder(app.current_stage)}. aşama
              </Text>
            </View>
          </View>
        </View>

        {/* Düzenle / Sil — sayfada görünür (ayrıca üst sağdaki ... menüsünde de var) */}
        <View style={{ flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Button label="Düzenle" onPress={handleEdit} variant="secondary" size="md" fullWidth />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Sil" onPress={handleDelete} variant="danger" size="md" fullWidth />
          </View>
        </View>

        {/* Süreç (Stage timeline) */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="Süreç" />
          <Card padding={18}>
            <StageTimeline history={app.stage_history} currentStageId={app.current_stage_id} currentKey={app.current_stage} />
          </Card>
        </View>

        {/* CV Uyumu */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="CV Uyumu" />
          <Card padding={16}>
            {shownFit && !editingFit ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 2 }}>
                  <Text style={{ fontSize: 30, fontFamily: "Inter_600SemiBold", color: "#3D5A47", letterSpacing: -0.5 }}>%{shownFit.skor}</Text>
                  <Text style={{ fontSize: 13, color: "#5C5650", marginLeft: 8, fontFamily: "Inter_400Regular" }}>uyum · güven: {shownFit.guven}</Text>
                </View>
                {basisLabel && (
                  <Text style={{ fontSize: 11, color: "#8A8278", fontFamily: "Inter_400Regular", marginBottom: 2 }}>
                    {basisLabel}{!fitResult && app.fit_at ? ` · ${getRelativeTimeTr(app.fit_at)}` : ""}
                  </Text>
                )}
                <FitSection title="Eşleşen güçlü yönlerin" items={shownFit.eslesme} color="#3D5A47" />
                <FitSection title="Geliştirilebilecekler" items={shownFit.eksikler} color="#8A5A00" />
                <FitSection title="Eksik anahtar kelimeler (ATS)" items={shownFit.ats} color="#5C5650" />
                <FitSection title="Başvuruda vurgula" items={shownFit.vurgu} color="#1F1B16" />
                <Pressable onPress={() => { setEditingFit(true); setFitResult(null); }} style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_500Medium" }}>Yeniden analiz et</Text>
                </Pressable>
                <Text style={{ fontSize: 11, color: "#8A8278", marginTop: 8, fontStyle: "italic", fontFamily: "Inter_400Regular" }}>
                  Bu analiz bir rehberdir, garanti değildir.
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 13, color: "#5C5650", fontFamily: "Inter_400Regular", lineHeight: 19, marginBottom: 10 }}>
                  Profilindeki CV ile bu başvuruyu karşılaştır. İlan metnini yapıştırırsan analiz daha isabetli olur; yapıştırmazsan pozisyon ve notlarından analiz edilir.
                </Text>
                <TextInput
                  value={fitJobText}
                  onChangeText={(t) => { setFitJobText(t); if (fitErr) setFitErr(null); }}
                  placeholder="(Opsiyonel) İlan metnini buraya yapıştır…"
                  placeholderTextColor="#B8B0A4"
                  multiline
                  style={{ minHeight: 70, borderRadius: 10, borderWidth: 1, borderColor: "#D9D3C8", backgroundColor: "#FFFFFF", padding: 12, fontSize: 13, color: "#1F1B16", fontFamily: "Inter_400Regular", textAlignVertical: "top", marginBottom: 10 }}
                />
                {fitErr && <Text style={{ fontSize: 12, color: "#A96458", fontFamily: "Inter_400Regular", marginBottom: 8 }}>{fitErr}</Text>}
                {fitNeedCv && (
                  <Text style={{ fontSize: 12, color: "#5C5650", fontFamily: "Inter_400Regular", marginBottom: 8, lineHeight: 18 }}>
                    Önce profiline CV yüklemelisin.{" "}
                    <Text onPress={() => router.push("/settings/cv")} style={{ color: "#3D5A47", fontFamily: "Inter_500Medium", textDecorationLine: "underline" }}>CV ekle</Text>
                  </Text>
                )}
                <Button label={fitLoading ? "Analiz ediliyor…" : "CV uyumunu analiz et"} onPress={handleFit} variant="primary" size="md" loading={fitLoading} fullWidth />
              </>
            )}
          </Card>
        </View>

        {/* Takip Hatırlatması */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="Takip Hatırlatması" />
          <Card padding={16}>
            {app.reminder_at ? (
              <>
                <Text style={{ fontSize: 14, color: "#1F1B16", fontFamily: "Inter_500Medium" }}>
                  {formatDateLongTr(app.reminder_at)}
                  {reminderInfo(app.reminder_at) ? `  ·  ${reminderInfo(app.reminder_at)!.label}` : ""}
                </Text>
                <View style={{ flexDirection: "row", gap: 18, marginTop: 12 }}>
                  <Pressable onPress={() => setReminderOpen(true)}><Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_500Medium" }}>Değiştir</Text></Pressable>
                  <Pressable onPress={handleClearReminder}><Text style={{ fontSize: 13, color: "#A96458", fontFamily: "Inter_500Medium" }}>Kaldır</Text></Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 13, color: "#5C5650", fontFamily: "Inter_400Regular", lineHeight: 19, marginBottom: 12 }}>
                  Bu başvuru için kendine bir takip tarihi koy; zamanı geldiğinde hatırlatalım.
                </Text>
                <Button label="Takip tarihi ekle" onPress={() => setReminderOpen(true)} variant="secondary" size="md" fullWidth />
              </>
            )}
          </Card>
        </View>

        {/* Notlar */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="Notlar" rightLabel="+ Yeni" onRightPress={() => setNoteSheetVisible(true)} />
          {app.notes.length === 0 ? (
            <Card padding={18}>
              <Text style={{ fontSize: 13, color: "#8A8278", fontFamily: "Inter_300Light", textAlign: "center", lineHeight: 19 }}>
                Henüz not yok.{"\n"}İlk notunu ekle.
              </Text>
            </Card>
          ) : (
            <Card padding={0}>
              {app.notes.map((note, idx) => (
                <View
                  key={note.id}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 14,
                    borderBottomWidth: idx === app.notes.length - 1 ? 0 : 0.5,
                    borderColor: "rgba(235, 231, 223, 0.7)",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <Text style={{ fontSize: 11, color: "#8A8278", fontFamily: "Menlo" }}>
                      {formatDateTr(note.created_at)} · {getRelativeTimeTr(note.created_at)}
                    </Text>
                    <Pressable onPress={() => handleDeleteNote(note.id)} hitSlop={8}>
                      <Text style={{ fontSize: 12, color: "#A96458", fontFamily: "Inter_500Medium" }}>Sil</Text>
                    </Pressable>
                  </View>
                  <Text
                    style={{
                      fontSize: 14, color: "#1F1B16",
                      fontFamily: "Inter_400Regular", lineHeight: 21,
                    }}
                  >
                    {note.content}
                  </Text>
                </View>
              ))}
            </Card>
          )}
        </View>

        {/* Detaylar */}
        {app.source_url ? (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <SectionHeader title="Detaylar" />
            <Card padding={0}>
              <Pressable
                onPress={openSource}
                style={({ pressed }) => ({
                  paddingHorizontal: 16, paddingVertical: 14,
                  flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ fontSize: 13, color: "#5C5650", fontFamily: "Inter_400Regular" }}>
                  İlan kaynağı
                </Text>
                <Text
                  style={{ fontSize: 12, color: "#3D5A47", fontFamily: "Inter_500Medium", maxWidth: 220, textDecorationLine: "underline" }}
                  numberOfLines={1}
                >
                  {app.source_url.replace(/^https?:\/\//, "")} ↗
                </Text>
              </Pressable>
            </Card>
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky bottom action bar */}
      <View
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(250, 248, 244, 0.95)",
          borderTopWidth: 0.5, borderColor: "rgba(217, 211, 200, 0.8)",
        }}
      >
        <SafeAreaView edges={["bottom"]}>
          <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Aşama güncelle"
                onPress={() => setStageSheetVisible(true)}
                variant="primary"
                size="lg"
                fullWidth
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Not ekle"
                onPress={() => setNoteSheetVisible(true)}
                variant="secondary"
                size="lg"
                fullWidth
              />
            </View>
          </View>
        </SafeAreaView>
      </View>

      <DatePicker
        visible={reminderOpen}
        value={app.reminder_at ? new Date(app.reminder_at) : new Date()}
        minDate={new Date()}
        onClose={() => setReminderOpen(false)}
        onSelect={(d) => { handleSetReminder(d); setReminderOpen(false); }}
      />

      <StageUpdateSheet
        visible={stageSheetVisible}
        onClose={() => setStageSheetVisible(false)}
        currentStageId={app.current_stage_id}
        onSelectId={handleStageUpdateById}
        onAddStage={handleAddStage}
        onDeleteStage={handleDeleteStage}
      />

      <NoteAddSheet
        visible={noteSheetVisible}
        onClose={() => setNoteSheetVisible(false)}
        onSave={handleAddNote}
      />

      {menuOpen && (
        <Pressable
          onPress={() => setMenuOpen(false)}
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(26,38,34,0.18)",
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 60, right: 16,
              minWidth: 180,
              backgroundColor: "#FFFFFF",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#EBE7DF",
              paddingVertical: 6,
            }}
          >
            <Pressable
              onPress={handleEdit}
              style={({ pressed }) => ({
                paddingVertical: 12, paddingHorizontal: 18,
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <Text style={{ fontSize: 15, color: "#1F1B16", fontFamily: "Inter_500Medium" }}>
                Düzenle
              </Text>
            </Pressable>
            <View style={{ height: 1, backgroundColor: "#EBE7DF", marginHorizontal: 12 }} />
            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => ({
                paddingVertical: 12, paddingHorizontal: 18,
                opacity: pressed ? 0.5 : 1,
              })}
            >
              <Text style={{ fontSize: 15, color: "#DC2626", fontFamily: "Inter_500Medium" }}>
                Sil
              </Text>
            </Pressable>
          </View>
        </Pressable>
      )}

      {savedMsg && (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 96, alignItems: "center", zIndex: 50 }} pointerEvents="none">
          <View style={{ backgroundColor: "#3D5A47", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}>
            <Text style={{ color: "#FAF8F4", fontFamily: "Inter_500Medium", fontSize: 13 }}>{savedMsg}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
