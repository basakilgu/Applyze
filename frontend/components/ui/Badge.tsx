// components/ui/Badge.tsx
import React from "react";
import { View, Text } from "react-native";
import type { StageKey } from "../../types/database";

interface Props {
  stage: StageKey;
  size?: "sm" | "md";
  customLabel?: string;
  customColor?: string;
}

const config: Record<StageKey, { bg: string; text: string; label: string }> = {
  applied:   { bg: "#DEE6EE", text: "#2F4358", label: "Başvuru" },
  screening: { bg: "#E2E8D6", text: "#4A5638", label: "İK" },
  interview: { bg: "#EDE0CE", text: "#5E4828", label: "Mülakat" },
  manager:   { bg: "#EDE0CE", text: "#5E4828", label: "Yönetici" },
  offer:     { bg: "#C9D8C0", text: "#2F4A2A", label: "Teklif" },
  rejected:  { bg: "#E8D8D8", text: "#6B4444", label: "Elendi" },
};

export function Badge({ stage, size = "md", customLabel, customColor }: Props) {
  const py = size === "sm" ? 3 : 5;
  const px = size === "sm" ? 8 : 11;
  const fontSize = size === "sm" ? 10 : 11;

  let bg: string;
  let text: string;
  let label: string;
  if (customLabel) {
    bg = customColor ? customColor + "26" : "#EBE7DF";
    text = customColor ?? "#5C5650";
    label = customLabel;
  } else {
    const c = config[stage] ?? config.applied;
    bg = c.bg; text = c.text; label = c.label;
  }

  return (
    <View style={{ paddingVertical: py, paddingHorizontal: px, borderRadius: 5, backgroundColor: bg, alignSelf: "flex-start" }}>
      <Text style={{ fontSize, color: text, fontFamily: "Inter_500Medium", letterSpacing: 0.1 }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
