import React, { useEffect, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { TABLE_STATUS_META } from '@syscor/shared/src/components/commons/StatusBadge';
import tableNodeStyles from "../../styles/tableNodeStyles";

const STATUS_ICON = {
  libre: "checkmark",
  ocupada: "restaurant-outline",
  limpieza: "sparkles-outline",
  reservada: "bookmark-outline",
};

// Color de borde exacto por estado (igual al mockup, no un shade calculado)
const STATUS_BORDER_COLOR = {
  libre: "#25A25A",
  ocupada: "#8E1C1C",
  limpieza: "#B9740A",
  reservada: "#74408A",
};

// Color del ícono de "estado" dentro del aro (mismo tono que el ícono de estado del mockup)
const STATUS_ICON_COLOR = "#FFFFFF";

export default function TableNode({ table, onPress }) {
  const meta = TABLE_STATUS_META[table.status] ?? TABLE_STATUS_META.libre;
  const borderColor = STATUS_BORDER_COLOR[table.status] ?? STATUS_BORDER_COLOR.libre;

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
        {/* Sillas alrededor: rectangulares horizontales arriba/abajo, verticales izq/der */}
        <View style={[tableNodeStyles.chairH, tableNodeStyles.chairTop]} />
        <View style={[tableNodeStyles.chairH, tableNodeStyles.chairBottom]} />
        <View style={[tableNodeStyles.chairV, tableNodeStyles.chairLeft]} />
        <View style={[tableNodeStyles.chairV, tableNodeStyles.chairRight]} />

        {/* Mesa circular */}
        <Animated.View
          style={[
            tableNodeStyles.tableCircle,
            {
              backgroundColor: meta.color,
              borderColor,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon name={STATUS_ICON[table.status]} size={14} color={STATUS_ICON_COLOR} style={tableNodeStyles.statusIcon} />
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
