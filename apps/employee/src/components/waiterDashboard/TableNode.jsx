import React, { useMemo, useRef } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import { TABLE_STATUS } from "../../constants/waiterStatus";
import tableNodeStyles from "../../styles/tableNodeStyles";

export default function TableNode({ table, onPress }) {
  const meta = TABLE_STATUS[table.status] ?? TABLE_STATUS.libre;
  const pressAnim = useRef(new Animated.Value(1)).current;

  const itemCount = useMemo(
    () => (table.activeOrders || []).reduce((sum, o) => sum + (o.itemCount || 0), 0),
    [table.activeOrders]
  );

  const animateTo = (toValue) => Animated.spring(pressAnim, { toValue, useNativeDriver: true, speed: 30 }).start();

  return (
    <View style={tableNodeStyles.cell}>
      <Pressable
        onPress={() => onPress(table)}
        onPressIn={() => animateTo(0.93)}
        onPressOut={() => animateTo(1)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Mesa ${table.number}, ${meta.label.toLowerCase()}`}
      >
        <Animated.View style={[tableNodeStyles.wrapper, { transform: [{ scale: pressAnim }] }]}>
          <View style={tableNodeStyles.chairTop} />
          <View style={tableNodeStyles.chairBottom} />
          <View style={tableNodeStyles.chairLeft} />
          <View style={tableNodeStyles.chairRight} />

          <View style={[tableNodeStyles.tableCircle, { backgroundColor: meta.color, borderColor: meta.border }]}>
            <SymbolIcon name={meta.icon} size={14} color="#FFFFFF" />
            <Text style={tableNodeStyles.tableNumber}>{table.number}</Text>
            <Text style={tableNodeStyles.statusLabel}>{meta.label}</Text>
          </View>

          {table.status === "ocupada" && itemCount > 0 && (
            <View style={tableNodeStyles.itemsPill}>
              <Text style={tableNodeStyles.itemsPillText}>{itemCount}</Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}
