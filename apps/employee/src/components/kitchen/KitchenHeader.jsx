import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import useKitchenHeaderStyles from "../../styles/kitchenHeaderStyles";
import { useTheme } from "../../theme/ThemeContext";

export default function KitchenHeader({ title, eyebrow, pillText, icon, iconBadge = 0, onIconPress, iconLabel }) {
  const { p } = useTheme();
  const styles = useKitchenHeaderStyles();
  return (
    <View style={styles.container}>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      </View>

      <View style={styles.accessories}>
        {pillText ? (
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>{pillText}</Text>
          </View>
        ) : null}

        {icon ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onIconPress}
            disabled={!onIconPress}
            activeOpacity={0.8}
            accessibilityLabel={iconLabel}
          >
            <SymbolIcon name={icon} size={18} color={p.ink} />
            {iconBadge > 0 ? (
              <View style={styles.iconBadge}>
                <Text style={styles.iconBadgeText}>{iconBadge > 9 ? "9+" : iconBadge}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
