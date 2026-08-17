import React from 'react';
import BottomNavBar from '../components/commons/BottomNavBar';

export default function AppTabBar({ state, descriptors, navigation, accentColor = '#C62828' }) {
  const items = state.routes.map((route, index) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return {
      key: route.key,
      icon: options.tabBarIcon ?? 'ellipse-outline',
      label: options.tabBarLabel ?? route.name,
      active: isFocused,
      onPress,
    };
  });

  return <BottomNavBar items={items} accentColor={accentColor} />;
}
