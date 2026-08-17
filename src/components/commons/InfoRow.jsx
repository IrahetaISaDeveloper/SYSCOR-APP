import React from "react";
import { View, Text } from "react-native";
import infoRowStyles from "../../styles/infoRowStyles";

export default function InfoRow({ label, value }) {
  return (
    <View style={infoRowStyles.row}>
      <Text style={infoRowStyles.label}>{label}</Text>
      <Text style={infoRowStyles.value}>{value ?? "—"}</Text>
    </View>
  );
}