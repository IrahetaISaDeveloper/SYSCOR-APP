import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons as Icon } from "@expo/vector-icons";
import bottomNavBarStyles from "../../styles/bottomNavBarStyles";

function NavBarItem({ icon, label, active, accentColor, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true, speed: 30 }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <TouchableOpacity
      style={bottomNavBarStyles.item}
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={{ alignItems: "center", gap: 3, transform: [{ scale: scaleAnim }] }}>
        <Icon name={icon} size={21} color={active ? accentColor : "#6E665C"} />
        <Text
          style={[
            bottomNavBarStyles.label,
            { color: active ? accentColor : "#6E665C" },
            active && bottomNavBarStyles.labelActive,
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function BottomNavBar({ items, accentColor = "#C62828" }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[bottomNavBarStyles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {items.map(({ key, ...itemProps }) => (
        <NavBarItem key={key} {...itemProps} accentColor={accentColor} />
      ))}
    </View>
  );
}
