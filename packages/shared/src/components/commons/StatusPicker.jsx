import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TABLE_STATUS_META } from "./StatusBadge";
import statusPickerStyles from "../../styles/statusPickerStyles";

export default function StatusPicker({ value, onChange }) {
  return (
    <View style={statusPickerStyles.row}>
      {Object.entries(TABLE_STATUS_META).map(([key, meta]) => {
        const active = value === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            style={[
              statusPickerStyles.chip,
              { borderColor: meta.color },
              active && { backgroundColor: meta.color },
            ]}
          >
            <View style={[statusPickerStyles.dot, { backgroundColor: active ? "#FFFFFF" : meta.color }]} />
            <Text style={[statusPickerStyles.chipLabel, active && statusPickerStyles.chipLabelActive]}>
              {meta.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
