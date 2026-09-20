import React from "react";
import { View, Text } from "react-native";
import statusBadgeStyles from "../../styles/statusBadgeStyles";

export const TABLE_STATUS_META = {
  libre: { label: "Libre", color: "#2ECC71" },
  ocupada: { label: "Ocupada", color: "#C62828" },
  limpieza: { label: "Limpieza", color: "#F39C12" },
  reservada: { label: "Reservada", color: "#9B59B6" },
};

export const ORDER_STATUS_META = {
  pending: { label: "Pendiente", color: "#F39C12" },
  preparing: { label: "Preparando", color: "#3498DB" },
  ready: { label: "Listo", color: "#2ECC71" },
  delivered: { label: "Entregado", color: "#7F8C8D" },
  cancelled: { label: "Cancelado", color: "#C62828" },
};

export default function StatusBadge({ status, type = "table" }) {
  const meta =
    type === "table"
      ? TABLE_STATUS_META[status]
      : ORDER_STATUS_META[status];

  if (!meta) return null;

  return (
    <View style={[statusBadgeStyles.container, { backgroundColor: `${meta.color}22` }]}>
      <View style={[statusBadgeStyles.dot, { backgroundColor: meta.color }]} />
      <Text style={[statusBadgeStyles.label, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}
