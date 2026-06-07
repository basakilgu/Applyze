// app/settings/import.tsx — Excel/CSV ile toplu başvuru içe aktarma.
import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import * as DocumentPicker from "expo-document-picker";
import * as XLSX from "xlsx";
import { supabase } from "../../lib/supabase";
import { applicationsStore } from "../../lib/applications";

type Row = {
  company_name: string;
  position: string;
  location?: string;
  platform: string;
  stageKey: string;
  applied_at?: string;
  source_url?: string;
  note?: string;
};

const TEMPLATE_HEADERS = ["sirket", "pozisyon", "sehir", "platform", "asama", "basvuru_tarihi", "ilan_linki", "notlar"];

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path d="M 13 4 L 7 10 L 13 16" fill="none" stroke="#1F1B16" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function norm(s: any): string {
  return String(s ?? "").toLowerCase().trim();
}

function matchCol(h: string): keyof Row | "ignore" {
  const n = norm(h);
  if (n.includes("şirket") || n.includes("sirket") || n.includes("firma") || n.includes("company")) return "company_name";
  if (n.includes("pozisyon") || n.includes("unvan") || n.includes("görev") || n.includes("position") || n.includes("title")) return "position";
  if (n.includes("şehir") || n.includes("sehir") || n.includes("lokasyon") || n.includes("city") || n.includes("location")) return "location";
  if (n.includes("platform") || n.includes("kaynak") || n.includes("site")) return "platform";
  if (n.includes("aşama") || n.includes("asama") || n.includes("durum") || n.includes("stage") || n.includes("status")) return "stageKey";
  if (n.includes("tarih") || n.includes("date")) return "applied_at";
  if (n.includes("link") || n.includes("url") || n.includes("ilan") || n.includes("bağlant") || n.includes("baglant")) return "source_url";
  if (n.includes("not") || n.includes("açıklama") || n.includes("aciklama") || n.includes("note")) return "note";
  return "ignore";
}

function platformKey(v: any): string {
  const n = norm(v);
  if (n.includes("linkedin")) return "linkedin";
  if (n.includes("kariyer")) return "kariyer";
  if (n.includes("youthall")) return "youthall";
  if (n.includes("anbean")) return "anbean";
  return "other";
}

function stageKeyFrom(v: any): string {
  const n = norm(v);
  if (!n) return "applied";
  if (n.includes("ik") || n.includes("ön değer") || n.includes("on deger") || n.includes("screen")) return "screening";
  if (n.includes("teknik") || n.includes("mülakat") || n.includes("mulakat") || n.includes("interview")) return "interview";
  if (n.includes("yönetici") || n.includes("yonetici") || n.includes("manager")) return "manager";
  if (n.includes("teklif") || n.includes("offer")) return "offer";
  if (n.includes("elen") || n.includes("red") || n.includes("reject")) return "rejected";
  return "applied";
}

function parseDate(v: any): string | undefined {
  if (v == null || v === "") return undefined;
  if (v instanceof Date && !isNaN(v.getTime())) return new Date(v.getFullYear(), v.getMonth(), v.getDate(), 12).toISOString();
  const s = String(v).trim();
  let m = s.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/); // GG.AA.YYYY
  if (m) return new Date(+m[3], +m[2] - 1, +m[1], 12).toISOString();
  m = s.match(/^(\d{4})[.\/-](\d{1,2})[.\/-](\d{1,2})$/); // YYYY-AA-GG
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], 12).toISOString();
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

export default function ImportScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState<number | null>(null);
  const [skipped, setSkipped] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const goBack = () => { if (router.canGoBack()) router.back(); else router.replace("/(tabs)/profile"); };

  const downloadTemplate = () => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const csv = TEMPLATE_HEADERS.join(",") + "\n" +
      "Trendyol,Süreç Tasarım Uzmanı,İstanbul,LinkedIn,Başvuruldu,14.05.2026,https://...,Örnek not\n";
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "applyze_sablon.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handlePick = async () => {
    setErr(null); setDone(null); setRows([]);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets || !res.assets[0]) return;
      const asset = res.assets[0];
      setFileName(asset.name ?? "dosya");
      setParsing(true);

      const resp = await fetch(asset.uri);
      const buf = await resp.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const aoa = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, blankrows: false });
      if (!aoa || aoa.length < 2) { setErr("Dosyada veri bulunamadı (başlık satırı + en az 1 satır gerekli)."); setParsing(false); return; }

      const headers = (aoa[0] as any[]).map((h) => matchCol(h));
      const parsed: Row[] = [];
      for (let i = 1; i < aoa.length; i++) {
        const r = aoa[i] as any[];
        if (!r || r.length === 0) continue;
        const obj: any = { platform: "other", stageKey: "applied" };
        headers.forEach((col, idx) => {
          if (col === "ignore") return;
          const val = r[idx];
          if (col === "platform") obj.platform = platformKey(val);
          else if (col === "stageKey") obj.stageKey = stageKeyFrom(val);
          else if (col === "applied_at") obj.applied_at = parseDate(val);
          else obj[col] = val == null ? "" : String(val).trim();
        });
        if (norm(obj.company_name) || norm(obj.position)) {
          obj.company_name = obj.company_name || "(Şirket yok)";
          obj.position = obj.position || "(Pozisyon yok)";
          parsed.push(obj as Row);
        }
      }
      if (parsed.length === 0) { setErr("Geçerli satır bulunamadı. Başlıkların 'sirket', 'pozisyon' gibi olduğundan emin ol."); setParsing(false); return; }
      setRows(parsed);
      setParsing(false);
    } catch (e) {
      console.error("[import] parse failed:", e);
      setErr("Dosya okunamadı. CSV ya da Excel (.xlsx) olduğundan emin ol.");
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true); setProgress(0); setErr(null); setSkipped(0);
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) { setErr("Oturum bulunamadı."); setImporting(false); return; }

    const { data: stages } = await supabase.from("stages").select("id,key").eq("user_id", uid);
    const stageMap = new Map<string, string>();
    (stages ?? []).forEach((s: any) => { if (s.key) stageMap.set(s.key, s.id); });

    // Tekrar kontrolu: "sirket|pozisyon" anahtari. Hem listede zaten olanlari
    // hem de dosyanin kendi icindeki tekrarlari atlar.
    const dedupKey = (c: any, p: any) => `${norm(c)}|${norm(p)}`;
    const { data: existing } = await supabase
      .from("applications")
      .select("company_name,position")
      .is("deleted_at", null);
    const seen = new Set<string>((existing ?? []).map((e: any) => dedupKey(e.company_name, e.position)));

    let ok = 0;
    let skip = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const key = dedupKey(row.company_name, row.position);
      if (seen.has(key)) { skip++; setProgress(i + 1); continue; }
      seen.add(key);
      const stageId = stageMap.get(row.stageKey) ?? stageMap.get("applied") ?? null;
      try {
        const { data: app, error } = await supabase.from("applications").insert({
          user_id: uid,
          company_name: row.company_name,
          position: row.position,
          location: row.location || null,
          platform: row.platform,
          source_url: row.source_url || null,
          current_stage_id: stageId,
          ...(row.applied_at ? { applied_at: row.applied_at } : {}),
        }).select("id").single();
        if (!error && app) {
          if (stageId) {
            await supabase.from("stage_history").insert({
              application_id: app.id, stage_id: stageId,
              ...(row.applied_at ? { changed_at: row.applied_at } : {}),
            });
          }
          if (row.note) await supabase.from("notes").insert({ application_id: app.id, content: row.note });
          ok++;
        }
      } catch (e) { console.error("[import] row failed:", e); }
      setProgress(i + 1);
    }
    await applicationsStore.refresh();
    setImporting(false);
    setSkipped(skip);
    setDone(ok);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF8F4" }}>
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 52 }}>
          <Pressable onPress={goBack} hitSlop={10} style={{ padding: 6, marginRight: 4 }}>
            <BackIcon />
          </Pressable>
          <Text style={{ fontSize: 17, color: "#1F1B16", fontFamily: "Inter_600SemiBold" }}>Toplu içe aktar</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <Text style={{ fontSize: 14, color: "#5C5650", fontFamily: "Inter_400Regular", lineHeight: 21, marginTop: 4, marginBottom: 14 }}>
          Excel veya CSV dosyasından başvurularını topluca ekle. Başlık satırı şu sütunları içerebilir (sıra önemsiz): şirket, pozisyon, şehir, platform, aşama, başvuru tarihi, ilan linki, notlar.
        </Text>

        {Platform.OS === "web" && (
          <Pressable onPress={downloadTemplate} style={{ paddingVertical: 8, marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: "#3D5A47", fontFamily: "Inter_500Medium", textDecorationLine: "underline" }}>Örnek şablon indir (CSV)</Text>
          </Pressable>
        )}

        <Pressable
          onPress={handlePick}
          disabled={parsing || importing}
          style={({ pressed }) => ({
            height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: "#3D5A47", borderStyle: "dashed",
            backgroundColor: "#F1F4EF", alignItems: "center", justifyContent: "center", flexDirection: "row",
            opacity: (parsing || importing) ? 0.6 : pressed ? 0.9 : 1, marginBottom: 12,
          })}
        >
          {parsing ? (
            <><ActivityIndicator color="#3D5A47" /><Text style={{ marginLeft: 8, color: "#3D5A47", fontFamily: "Inter_500Medium" }}>Okunuyor…</Text></>
          ) : (
            <Text style={{ color: "#3D5A47", fontFamily: "Inter_500Medium", fontSize: 15 }}>Excel / CSV dosyası seç</Text>
          )}
        </Pressable>

        {fileName && !err && rows.length > 0 && (
          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: "#EBE7DF", backgroundColor: "#FFFFFF", padding: 14, marginBottom: 14 }}>
            <Text style={{ fontSize: 13, color: "#1F1B16", fontFamily: "Inter_600SemiBold", marginBottom: 8 }}>
              {rows.length} başvuru bulundu — önizleme:
            </Text>
            {rows.slice(0, 5).map((r, i) => (
              <Text key={i} style={{ fontSize: 13, color: "#5C5650", fontFamily: "Inter_400Regular", marginBottom: 3 }} numberOfLines={1}>
                • {r.company_name} — {r.position}
              </Text>
            ))}
            {rows.length > 5 && <Text style={{ fontSize: 12, color: "#8A8278", marginTop: 2 }}>…ve {rows.length - 5} tane daha</Text>}
          </View>
        )}

        {err && <Text style={{ fontSize: 13, color: "#A96458", fontFamily: "Inter_400Regular", marginBottom: 12, lineHeight: 19 }}>{err}</Text>}

        {rows.length > 0 && done === null && (
          <Pressable
            onPress={handleImport}
            disabled={importing}
            style={({ pressed }) => ({ height: 50, backgroundColor: "#1F1B16", borderRadius: 12, alignItems: "center", justifyContent: "center", opacity: importing ? 0.7 : pressed ? 0.92 : 1 })}
          >
            {importing ? (
              <><ActivityIndicator color="#FAF8F4" /><Text style={{ marginLeft: 8, color: "#FAF8F4", fontFamily: "Inter_500Medium" }}>{progress}/{rows.length} aktarılıyor…</Text></>
            ) : (
              <Text style={{ color: "#FAF8F4", fontFamily: "Inter_500Medium", fontSize: 15 }}>{rows.length} başvuruyu içe aktar</Text>
            )}
          </Pressable>
        )}

        {done !== null && (
          <View style={{ marginTop: 8, alignItems: "center" }}>
            <Text style={{ fontSize: 15, color: "#3D5A47", fontFamily: "Inter_600SemiBold", marginBottom: skipped > 0 ? 6 : 12 }}>{done} başvuru içe aktarıldı ✓</Text>
            {skipped > 0 && (
              <Text style={{ fontSize: 13, color: "#8A8278", fontFamily: "Inter_400Regular", marginBottom: 12, textAlign: "center" }}>
                {skipped} tanesi zaten listende olduğu için atlandı.
              </Text>
            )}
            <Pressable onPress={() => router.replace("/(tabs)")} style={({ pressed }) => ({ height: 48, paddingHorizontal: 24, backgroundColor: "#3D5A47", borderRadius: 12, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.9 : 1 })}>
              <Text style={{ color: "#FAF8F4", fontFamily: "Inter_500Medium", fontSize: 14 }}>Listeye git</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
