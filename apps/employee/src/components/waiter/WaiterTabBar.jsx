import React from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SymbolIcon from "../commons/SymbolIcon";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import waiterTabBarStyles from "../../styles/waiterTabBarStyles";

export default function WaiterTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        waiterTabBarStyles.container,
        { paddingBottom: Math.max(16, insets.bottom + 6), paddingLeft: 8 + insets.left, paddingRight: 8 + insets.right },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [waiterTabBarStyles.item, pressed && { opacity: 0.7 }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
          >
            <SymbolIcon
              name={options.tabBarIcon}
              size={21}
              color={focused ? employeePalette.accent : employeePalette.muted}
            />
            <Text style={[waiterTabBarStyles.label, focused && waiterTabBarStyles.labelActive]}>
              {options.tabBarLabel ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
