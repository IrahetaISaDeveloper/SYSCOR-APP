import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { TABLE_STATUS_META } from "../commons/StatusBadge";
import tableNodeStyles from "../../styles/tableNodeStyles";

const STATUS_ICON = {
  libre: "checkmark",
  ocupada: "restaurant-outline",
  limpieza: "sparkles-outline",
  reservada: "bookmark-outline",
};

// Posiciones de las 4 sillas alrededor de la mesa (arriba, derecha, abajo, izquierda)
const CHAIR_POSITIONS = [
  { top: -10, left: "50%", marginLeft: -9 },
  { top: "50%", right: -10, marginTop: -9 },
  { bottom: -10, left: "50%", marginLeft: -9 },
  { top: "50%", left: -10, marginTop: -9 },
];

export default function TableNode({ table, onPress }) {
  const meta = TABLE_STATUS_META[table.status] ?? TABLE_STATUS_META.libre;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  const itemCount = useMemo(
    () => (table.activeOrders || []).reduce((sum, o) => sum + (o.itemCount || 0), 0),
    [table.activeOrders]
  );

  // Pulso suave en el aro de la mesa cuando está ocupada
  useEffect(() => {
    let loop;
    if (table.status === "ocupada") {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 850,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 850,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => loop && loop.stop();
  }, [table.status, pulseAnim]);

  // "Escobita" moviéndose en limpieza
  useEffect(() => {
    let loop;
    if (table.status === "limpieza") {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(spinAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.timing(spinAnim, { toValue: -1, duration: 260, useNativeDriver: true }),
          Animated.timing(spinAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
          Animated.delay(700),
        ])
      );
      loop.start();
    } else {
      spinAnim.setValue(0);
    }
    return () => loop && loop.stop();
  }, [table.status, spinAnim]);

  const handlePressIn = () =>
    Animated.spring(pressAnim, { toValue: 0.92, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start();

  const rotate = spinAnim.interpolate({ inputRange: [-1, 1], outputRange: ["-16deg", "16deg"] });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(table)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[tableNodeStyles.wrapper, { transform: [{ scale: pressAnim }] }]}>
        {/* Sillas alrededor */}
        {CHAIR_POSITIONS.map((pos, i) => (
          <View key={i} style={[tableNodeStyles.chair, pos]} />
        ))}

        {/* Mesa circular */}
        <Animated.View
          style={[
            tableNodeStyles.tableCircle,
            {
              backgroundColor: meta.color,
              borderColor: shade(meta.color, -18),
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Animated.View style={[tableNodeStyles.statusIcon, { transform: [{ rotate }] }]}>
            <Icon name={STATUS_ICON[table.status]} size={14} color={shade(meta.color, -55)} />
          </Animated.View>
          <Text style={tableNodeStyles.tableNumber}>{table.number}</Text>
          <Text style={tableNodeStyles.statusLabel}>{meta.label}</Text>
        </Animated.View>

        {table.status === "ocupada" && itemCount > 0 && (
          <View style={tableNodeStyles.itemsPill}>
            <Text style={tableNodeStyles.itemsPillText}>{itemCount}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function shade(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}
