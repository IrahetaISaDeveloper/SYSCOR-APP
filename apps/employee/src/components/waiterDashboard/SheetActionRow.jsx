import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import styles from "../../styles/waiterSheetContentStyles";

export default function SheetActionRow({ icon, label, hint, onPress, warn = false, disabled = false }) {
  return (
    <TouchableOpacity
      style={[styles.actionRow, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIconBox, warn && styles.actionIconBoxWarn]}>
        <SymbolIcon name={icon} size={19} color={warn ? employeePalette.warnInk : employeePalette.accent} />
      </View>
      <View style={styles.actionTexts}>
        <Text style={[styles.actionLabel, warn && styles.actionLabelWarn]}>{label}</Text>
        {hint ? <Text style={styles.actionHint}>{hint}</Text> : null}
      </View>
      <SymbolIcon name="chevron_right" size={17} color={employeePalette.muted} />
    </TouchableOpacity>
  );
}
