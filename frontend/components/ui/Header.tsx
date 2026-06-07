// components/ui/Header.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";

interface Props {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  rightActions?: React.ReactNode;
  variant?: "light" | "dark";
}

function BackIcon({ color = "#1F1B16" }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path d="M 12 4 L 6 10 L 12 16" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CloseIcon({ color = "#1F1B16" }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path d="M 5 5 L 15 15 M 15 5 L 5 15" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function Header({
  title, showBack = true, showClose = false, onBack, rightActions, variant = "light",
}: Props) {
  const router = useRouter();
  const handlePress =
    onBack ??
    (() => {
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)");
    });

  const iconColor = variant === "dark" ? "#FAF8F4" : "#1F1B16";
  const titleColor = variant === "dark" ? "#FAF8F4" : "#1F1B16";

  return (
    <View
      style={{
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
      }}
    >
      <View style={{ width: 44 }}>
        {(showBack || showClose) && (
          <Pressable
            onPress={handlePress}
            style={({ pressed }) => ({
              width: 40, height: 40, borderRadius: 20,
              alignItems: "center", justifyContent: "center",
              opacity: pressed ? 0.5 : 1,
            })}
          >
            {showClose ? <CloseIcon color={iconColor} /> : <BackIcon color={iconColor} />}
          </Pressable>
        )}
      </View>

      {title ? (
        <Text
          style={{
            fontSize: 15, color: titleColor,
            fontFamily: "Inter_600SemiBold",
            letterSpacing: -0.1,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
      ) : (
        <View />
      )}

      <View style={{ width: 44, alignItems: "flex-end" }}>
        {rightActions}
      </View>
    </View>
  );
}

export { BackIcon, CloseIcon };
