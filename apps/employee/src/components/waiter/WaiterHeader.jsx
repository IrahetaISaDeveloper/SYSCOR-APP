import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import waiterHeaderStyles from "../../styles/waiterHeaderStyles";

export default function WaiterHeader({ eyebrow, title, subtitle, accessoryIcon, onAccessoryPress }) {
  return (
    <View style={waiterHeaderStyles.container}>
      <View style={waiterHeaderStyles.texts}>
        {eyebrow ? <Text style={waiterHeaderStyles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={waiterHeaderStyles.title}>{title}</Text>
        {subtitle ? <Text style={waiterHeaderStyles.subtitle}>{subtitle}</Text> : null}
      </View>

      {accessoryIcon ? (
        <TouchableOpacity
          style={waiterHeaderStyles.accessory}
          onPress={onAccessoryPress}
          disabled={!onAccessoryPress}
          activeOpacity={0.8}
        >
          <SymbolIcon name={accessoryIcon} size={19} color={employeePalette.accent} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
