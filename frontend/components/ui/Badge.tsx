// components/ui/Badge.tsx
import React from "react";
import { View, Text } from "react-native";
import type { StageKey } from "../../types/database";

interface Props {
  stage: StageKey;
  size?: "sm" | "md";
}

const config: Record<StageKey, { bg: string; text: string; label: string }> = {
  applied:   { bg: "#DEE6EE", text: "#2F4358", label: "Başvuru" },
  screening: { bg: "#E2E8D6", text: "#4A5638", label: "İK" },
  interview: { bg: "#EDE0CE", text: "#5E4828", label: "Mülakat" },
  manager:   { bg: "#EDE0CE", text: "#5E4828", label: "Yönetici" },
  offer:     { bg: "#C9D8C0", text: "#2F4A2A", label: "Teklif" },
  rejected:  { bg: "#E8D8D8", text: "#6B4444", label: "Elendi" },
};

export function Badge({ stage, size = "md" }: Props) {
  const c = config[stage];
  const py = size === "sm" ? 3 : 5;
  const px = size === "sm" ? 8 : 11;
  const fontSize = size === "sm" ? 10 : 11;

  return (
    <View style={{ paddingVertical: py, paddingHorizontal: px, borderRadius: 5, backgroundColor: c.bg, alignSelf: "flex-start" }}>
      <Text style={{ fontSize, color: c.text, fontFamily: "Inter_500Medium", letterSpacing: 0.1 }}>
        {c.label}
      </Text>
    </View>
  );
}
