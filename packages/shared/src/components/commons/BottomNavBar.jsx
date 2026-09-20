import React, { useRef } from "react";
import { View, Text, TouchableOpacity, Animated, SafeAreaView } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import bottomNavBarStyles from "../../styles/bottomNavBarStyles";

function NavBarItem({ icon, label, active, accentColor, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, speed: 30 }).start();
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
      <Animated.View
        style={[
          bottomNavBarStyles.iconPill,
          active && { backgroundColor: `${accentColor}1A` },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Icon name={icon} size={20} color={active ? accentColor : "#9AA1A8"} />
      </Animated.View>
      <Text
        style={[
          bottomNavBarStyles.label,
          { color: active ? accentColor : "#9AA1A8" },
          active && bottomNavBarStyles.labelActive,
        ]}
      >
        {label}
      </Text>
      {active && <View style={[bottomNavBarStyles.activeDot, { backgroundColor: accentColor }]} />}
    </TouchableOpacity>
  );
}

export default function BottomNavBar({ items, accentColor = "#C62828" }) {
  return (
    <SafeAreaView style={bottomNavBarStyles.safeArea}>
      <View style={bottomNavBarStyles.container}>
        {items.map(({ key, ...itemProps }) => (
          <NavBarItem key={key} {...itemProps} accentColor={accentColor} />
        ))}
      </View>
    </SafeAreaView>
  );
}