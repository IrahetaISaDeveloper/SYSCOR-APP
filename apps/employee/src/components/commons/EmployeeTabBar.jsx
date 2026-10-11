import React from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SymbolIcon from "./SymbolIcon";
import useEmployeeTabBarStyles from "../../styles/employeeTabBarStyles";
import { useTheme } from "../../theme/ThemeContext";

export default function EmployeeTabBar({ state, descriptors, navigation }) {
  const { p } = useTheme();
  const employeeTabBarStyles = useEmployeeTabBarStyles();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        employeeTabBarStyles.container,
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
            style={({ pressed }) => [employeeTabBarStyles.item, pressed && { opacity: 0.7 }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
          >
            <SymbolIcon
              name={options.tabBarIcon}
              size={21}
              color={focused ? p.accent : p.muted}
            />
            <Text style={[employeeTabBarStyles.label, focused && employeeTabBarStyles.labelActive]}>
              {options.tabBarLabel ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
