import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon, MaterialCommunityIcons } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { useTheme, makeStyles } from "../../theme/ThemeContext";

// Barra inferior del mesero, con el mismo diseño que la de la app de
// clientes: la pestaña principal (Mesas) va en un botón elevado al centro.
//
// Los íconos son de Ionicons (`tabBarIcon` en las opciones de cada pestaña);
// con `tabBarIconSet: 'material-community'` se toman de MaterialCommunityIcons
// (Ionicons no tiene una mesa). `tabBarCenter: true` marca la pestaña que va
// en el botón central.
function TabIcon({ options, size, color }) {
  const IconSet = options.tabBarIconSet === 'material-community' ? MaterialCommunityIcons : Icon;
  return <IconSet name={options.tabBarIcon} size={size} color={color} />;
}

export default function WaiterTabBar({ state, descriptors, navigation }) {
  const { c } = useTheme();
  const styles = useStyles();
  const { ms } = useAuthMetrics();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: ms(10),
          paddingBottom: Math.max(insets.bottom, ms(10)),
          paddingHorizontal: ms(6),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const active = state.index === index;
        const label = options.tabBarLabel ?? route.name;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!active && !event.defaultPrevented) navigation.navigate(route.name);
        };

        if (options.tabBarCenter) {
          return (
            <View key={route.key} style={styles.item}>
              <TouchableOpacity
                style={[
                  styles.centerButton,
                  {
                    width: ms(56),
                    height: ms(56),
                    borderRadius: ms(28),
                    // Sobresale por encima del borde superior de la barra.
                    marginTop: -ms(26),
                  },
                ]}
                activeOpacity={0.9}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={label}
              >
                <TabIcon options={options} size={ms(27)} color={c.white} />
              </TouchableOpacity>
              <Text style={[textStyles.link, { color: c.primary, fontSize: ms(10.5), marginTop: ms(6) }]}>
                {label}
              </Text>
            </View>
          );
        }

        const color = active ? c.primary : c.textGray;

        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.item, { gap: ms(5) }]}
            activeOpacity={0.7}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
          >
            <TabIcon options={options} size={ms(21)} color={color} />
            <Text style={[active ? textStyles.link : textStyles.body, { color, fontSize: ms(10.5) }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(({ c }) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    backgroundColor: c.navBackground,
    borderTopColor: c.navBorder,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primary,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
}));
