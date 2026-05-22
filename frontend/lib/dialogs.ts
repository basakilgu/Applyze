// lib/dialogs.ts
// Platform-bağımsız onay dialogu.
// Web: window.confirm (React Native Alert web'de çalışmaz).
// Native (iOS/Android): Alert.alert.
// Promise<boolean> döner: kullanıcı onayladıysa true, iptal ettiyse false.

import { Alert, Platform } from "react-native";

export function confirmAction(opts: {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}): Promise<boolean> {
  const {
    title,
    message = "",
    confirmText = "Tamam",
    cancelText = "İptal",
    destructive = false,
  } = opts;

  if (Platform.OS === "web") {
    const text = message ? `${title}\n\n${message}` : title;
    const ok = typeof window !== "undefined" ? window.confirm(text) : false;
    return Promise.resolve(ok);
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: "cancel", onPress: () => resolve(false) },
      {
        text: confirmText,
        style: destructive ? "destructive" : "default",
        onPress: () => resolve(true),
      },
    ]);
  });
}

// Tek butonlu bilgi mesajı (web: window.alert, native: Alert.alert).
export function notify(title: string, message = ""): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
    return;
  }
  Alert.alert(title, message);
}
