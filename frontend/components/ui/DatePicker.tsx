// components/ui/DatePicker.tsx
// Saf React Native ile takvim seçici (web + iOS + Android). Ek bağımlılık yok.
import React, { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

interface Props {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
  maxDate?: Date;
  minDate?: Date;
}

function dayOnly(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function DatePicker({ visible, value, onClose, onSelect, maxDate, minDate }: Props) {
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());
  const [yearMode, setYearMode] = useState(false);

  useEffect(() => {
    if (visible) {
      setViewYear(value.getFullYear());
      setViewMonth(value.getMonth());
      setYearMode(false);
    }
  }, [visible]);

  const firstWeekdayRaw = new Date(viewYear, viewMonth, 1).getDay(); // 0=Paz
  const firstWeekday = firstWeekdayRaw === 0 ? 6 : firstWeekdayRaw - 1; // Pzt=0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const thisYear = (maxDate ?? new Date()).getFullYear();
  const years: number[] = [];
  for (let y = thisYear; y >= thisYear - 15; y--) years.push(y);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(31,27,22,0.35)", alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <Pressable
          onPress={(e: any) => e?.stopPropagation?.()}
          style={{ width: "100%", maxWidth: 360, backgroundColor: "#FAF8F4", borderRadius: 16, padding: 16, borderWidth: 0.5, borderColor: "#D9D3C8" }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <Pressable onPress={prevMonth} hitSlop={10} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 24, color: "#3D5A47", fontFamily: "Inter_400Regular" }}>‹</Text>
            </Pressable>
            <Pressable onPress={() => setYearMode((v) => !v)} hitSlop={8}>
              <Text style={{ fontSize: 15, color: "#1F1B16", fontFamily: "Inter_600SemiBold" }}>
                {MONTHS[viewMonth]} {viewYear} ▾
              </Text>
            </Pressable>
            <Pressable onPress={nextMonth} hitSlop={10} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 24, color: "#3D5A47", fontFamily: "Inter_400Regular" }}>›</Text>
            </Pressable>
          </View>

          {yearMode ? (
            <ScrollView style={{ maxHeight: 240 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {years.map((y) => {
                  const active = y === viewYear;
                  return (
                    <Pressable
                      key={y}
                      onPress={() => { setViewYear(y); setYearMode(false); }}
                      style={{ width: "33.33%", paddingVertical: 12, alignItems: "center" }}
                    >
                      <Text style={{ fontSize: 15, color: active ? "#3D5A47" : "#1F1B16", fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular" }}>
                        {y}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <>
              <View style={{ flexDirection: "row", marginBottom: 6 }}>
                {WEEKDAYS.map((w) => (
                  <View key={w} style={{ flex: 1, alignItems: "center" }}>
                    <Text style={{ fontSize: 11, color: "#8A8278", fontFamily: "Inter_500Medium" }}>{w}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {cells.map((day, i) => {
                  if (day === null) return <View key={i} style={{ width: "14.285%", height: 40 }} />;
                  const cellDate = new Date(viewYear, viewMonth, day, 12, 0, 0, 0);
                  const disabled =
                    (maxDate ? dayOnly(cellDate) > dayOnly(maxDate) : false) ||
                    (minDate ? dayOnly(cellDate) < dayOnly(minDate) : false);
                  const isSel =
                    value.getFullYear() === viewYear &&
                    value.getMonth() === viewMonth &&
                    value.getDate() === day;
                  return (
                    <View key={i} style={{ width: "14.285%", height: 40, alignItems: "center", justifyContent: "center" }}>
                      <Pressable
                        disabled={disabled}
                        onPress={() => onSelect(cellDate)}
                        style={{
                          width: 34, height: 34, borderRadius: 17,
                          alignItems: "center", justifyContent: "center",
                          backgroundColor: isSel ? "#3D5A47" : "transparent",
                          opacity: disabled ? 0.3 : 1,
                        }}
                      >
                        <Text style={{ fontSize: 14, color: isSel ? "#FAF8F4" : "#1F1B16", fontFamily: isSel ? "Inter_600SemiBold" : "Inter_400Regular" }}>
                          {day}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          <Pressable onPress={onClose} style={{ marginTop: 12, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 14, color: "#5C5650", fontFamily: "Inter_500Medium" }}>Kapat</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
