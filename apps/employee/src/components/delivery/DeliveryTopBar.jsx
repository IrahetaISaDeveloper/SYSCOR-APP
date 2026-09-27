import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import styles from "../../styles/deliveryCommonStyles";

export default function DeliveryTopBar({
  title,
  monoTitle = false,
  subtitle,
  subtitleColor,
  onBack,
  rightIcon,
  onRightPress,
  rightLabel,
}) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.roundButton} onPress={onBack} activeOpacity={0.8} accessibilityLabel="Regresar">
        <SymbolIcon name="arrow_back" size={19} color={employeePalette.ink} />
      </TouchableOpacity>

      <View style={styles.topBarTexts}>
        <Text style={monoTitle ? styles.topBarTitleMono : styles.topBarTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.topBarSubtitle, subtitleColor && { color: subtitleColor }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightIcon ? (
        <TouchableOpacity
          style={styles.roundButton}
          onPress={onRightPress}
          activeOpacity={0.8}
          accessibilityLabel={rightLabel}
        >
          <SymbolIcon name={rightIcon} size={18} color={employeePalette.accent} />
        </TouchableOpacity>
      ) : (
        <View style={styles.roundSpacer} />
      )}
    </View>
  );
}
