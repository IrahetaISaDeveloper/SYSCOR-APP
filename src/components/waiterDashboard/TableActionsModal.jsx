import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import BottomSheetModal from "../commons/BottomSheetModal";
import tableActionsModalStyles from "../../styles/tableActionsModalStyles";

export default function TableActionsModal({
  visible,
  table,
  onClose,
  onOpenOrder,
  onSendToCleaning,
  onFreeTable,
}) {
  if (!table) return null;

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title={`Mesa ${table.number}`}>
      <View style={tableActionsModalStyles.body}>
        {table.status === "ocupada" && (
          <>
            <ActionRow
              icon="🧾"
              label="Ver / agregar comanda"
              onPress={onOpenOrder}
            />
            <ActionRow
              icon="🧹"
              label="Cliente se retiró · pasar a limpieza"
              onPress={onSendToCleaning}
              danger
            />
          </>
        )}

        {table.status === "limpieza" && (
          <ActionRow
            icon="✅"
            label="Marcar mesa como libre"
            onPress={() => onFreeTable(table)}
          />
        )}
        {table.status !== "ocupada" && table.status !== "limpieza" && (
  <View style={{ paddingVertical: 20 }}>
    <Text style={{ color: "#B0B4B8", fontSize: 13, textAlign: "center" }}>
      Estado no reconocido: "{String(table.status)}"
    </Text>
  </View>
)}
      </View>
    </BottomSheetModal>
  );
}

function ActionRow({ icon, label, onPress, danger = false }) {
  return (
    <TouchableOpacity style={tableActionsModalStyles.row} onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          tableActionsModalStyles.iconCircle,
          danger && tableActionsModalStyles.iconCircleDanger,
        ]}
      >
        <Text style={tableActionsModalStyles.iconEmoji}>{icon}</Text>
      </View>
      <Text style={[tableActionsModalStyles.rowLabel, danger && tableActionsModalStyles.rowLabelDanger]}>
        {label}
      </Text>
      <Text style={tableActionsModalStyles.chevron}>›</Text>
    </TouchableOpacity>
  );
}
