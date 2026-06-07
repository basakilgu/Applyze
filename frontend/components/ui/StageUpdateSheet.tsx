// components/ui/StageUpdateSheet.tsx
import React from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import Svg, { Path } from "react-native-svg";

import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";
import { getStages } from "../../lib/applications";

interface Props {
  visible: boolean;
  onClose: () => void;
  currentStageId?: string;
  onSelectId: (stageId: string) => void;
  onAddStage: (name: string) => void;
  onDeleteStage: (stageId: string) => void;
}

function CheckIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path d="M 3 7.5 L 5.5 10 L 11 4" fill="none" stroke="#FAF8F4" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function StageUpdateSheet({ visible, onClose, currentStageId, onSelectId, onAddStage, onDeleteStage }: Props) {
  const [selectedId, setSelectedId] = React.useState<string | undefined>(currentStageId);
  const [showAdd, setShowAdd] = React.useState(false);
  const [newName, setNewName] = React.useState("");

  React.useEffect(() => {
    if (visible) { setSelectedId(currentStageId); setShowAdd(false); setNewName(""); }
  }, [visible, currentStageId]);

  const stages = getStages();

  const handleConfirm = () => {
    if (selectedId && selectedId !== currentStageId) onSelectId(selectedId);
    onClose();
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (name.length < 2) return;
    onAddStage(name);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Aşamayı güncelle" subtitle="Bu başvuru hangi aşamada?">
      <View style={{ marginTop: 4 }}>
        {stages.map((stage) => {
          const isSelected = selectedId === stage.id;
          return (
            <Pressable
              key={stage.id}
              onPress={() => setSelectedId(stage.id)}
              style={({ pressed }) => ({
                flexDirection: "row", alignItems: "center",
                paddingHorizontal: 14, paddingVertical: 14, marginBottom: 6, borderRadius: 10,
                backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                borderWidth: 1, borderColor: isSelected ? "#3D5A47" : "rgba(217, 211, 200, 0.5)",
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: stage.color ?? "#8A8278", marginRight: 12 }} />
              <Text style={{ flex: 1, fontSize: 14, color: "#1F1B16", fontFamily: isSelected ? "Inter_500Medium" : "Inter_400Regular" }}>
                {stage.name}{!stage.is_default ? "  ·  özel" : ""}
              </Text>
              {!stage.is_default && (
                <Pressable onPress={() => onDeleteStage(stage.id)} hitSlop={8} style={{ marginRight: isSelected ? 10 : 0 }}>
                  <Text style={{ fontSize: 12, color: "#A96458", fontFamily: "Inter_500Medium" }}>Sil</Text>
                </Pressable>
              )}
              {isSelected && (
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#3D5A47", alignItems: "center", justifyContent: "center" }}>
                  <CheckIcon />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {showAdd ? (
        <View style={{ marginTop: 8, flexDirection: "row", gap: 8, alignItems: "center" }}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Yeni aşama adı (ör. Vaka Çalışması)"
            placeholderTextColor="#B8B0A4"
            autoFocus
            style={{ flex: 1, height: 46, borderRadius: 10, borderWidth: 1, borderColor: "#D9D3C8", backgroundColor: "#FFFFFF", paddingHorizontal: 12, fontSize: 14, color: "#1F1B16", fontFamily: "Inter_400Regular" }}
          />
          <Pressable onPress={handleAdd} style={({ pressed }) => ({ height: 46, paddingHorizontal: 16, borderRadius: 10, backgroundColor: "#3D5A47", alignItems: "center", justifyContent: "center", opacity: pressed ? 0.9 : 1 })}>
            <Text style={{ color: "#FAF8F4", fontFamily: "Inter_500Medium", fontSize: 14 }}>Ekle</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setShowAdd(true)} style={{ paddingVertical: 12, marginTop: 2 }}>
          <Text style={{ fontSize: 14, color: "#3D5A47", fontFamily: "Inter_500Medium" }}>+ Yeni aşama ekle</Text>
        </Pressable>
      )}

      <View style={{ marginTop: 14, flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Button label="İptal" onPress={onClose} variant="secondary" size="lg" fullWidth />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Onayla" onPress={handleConfirm} variant="primary" size="lg" fullWidth />
        </View>
      </View>
    </BottomSheet>
  );
}
