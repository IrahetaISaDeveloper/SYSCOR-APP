import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { getMenuColors } from '../styles/CustomerMenu';
import { useTabBarVisibility } from '../context/TabBarVisibilityContext';

// Barra inferior de la app de clientes: cinco pestañas con el botón del menú
// elevado en el centro.
//
// No se usa el `AppTabBar` compartido porque ese lo usa también la app de
// empleados; este diseño es solo del cliente.
//
// Una pestaña sin pantalla (`route: null`) se muestra apagada y no navega:
// es preferible a mandar al cliente a una pantalla vacía.
const ITEMS = [
  { key: 'orders', icon: 'time-outline', label: 'Pedidos', route: 'Orders' },
  { key: 'favorites', icon: 'heart-outline', label: 'Favoritos', route: 'Favorites' },
  { key: 'menu', icon: 'restaurant', label: 'Menú', route: 'Menu', center: true },
  { key: 'address', icon: 'location-outline', label: 'Dirección', route: 'Addresses' },
  { key: 'more', icon: 'menu-outline', label: 'Más', route: 'More' },
];

export default function CustomerTabBar({ state, navigation }) {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const { ms } = useAuthMetrics();
  const insets = useSafeAreaInsets();
  const { hidden } = useTabBarVisibility();

  // Se mide la barra para saber cuánto hay que bajarla al esconderla.
  const [barHeight, setBarHeight] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;

  // El botón central sobresale por encima de la barra (y su sombra un poco
  // más): hay que bajarlo también o se queda asomando al esconderla.
  const protrusion = ms(26) + ms(14);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: hidden ? 1 : 0,
      duration: 220,
      // Se anima el alto (ver `height`), que no admite el driver nativo.
      useNativeDriver: false,
    }).start();
  }, [hidden, slide]);

  // El contenedor encoge hasta 0 para que la pantalla ocupe el hueco que
  // deja la barra; si solo se desplazara, quedaría una franja vacía abajo.
  const height = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [barHeight, 0],
  });

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, protrusion],
  });

  const currentRoute = state.routes[state.index]?.name;

  const go = (item) => {
    if (!item.route || item.route === currentRoute) return;
    navigation.navigate(item.route);
  };

  return (
    <Animated.View style={barHeight ? { height } : null}>
      <Animated.View
        onLayout={(event) => {
          // Solo se mide con la barra a la vista; al esconderse no cambia su alto.
          if (!barHeight) setBarHeight(event.nativeEvent.layout.height);
        }}
        style={[
          styles.bar,
          {
            backgroundColor: c.navBackground,
            borderTopColor: c.navBorder,
            paddingTop: ms(10),
            paddingBottom: Math.max(insets.bottom, ms(10)),
            paddingHorizontal: ms(6),
            transform: [{ translateY }],
          },
        ]}
        pointerEvents={hidden ? 'none' : 'auto'}
      >
        {ITEMS.map((item) => {
          const active = item.route === currentRoute;

          if (item.center) {
            return (
              <View key={item.key} style={styles.item}>
                <TouchableOpacity
                  style={[
                    styles.centerButton,
                    {
                      backgroundColor: c.primary,
                      width: ms(56),
                      height: ms(56),
                      borderRadius: ms(28),
                      // Sobresale por encima del borde superior de la barra.
                      marginTop: -ms(26),
                    },
                  ]}
                  activeOpacity={0.9}
                  onPress={() => go(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={item.label}
                >
                  <Icon name={item.icon} size={ms(25)} color="#FFFFFF" />
                </TouchableOpacity>
                <Text
                  style={[
                    textStyles.link,
                    { color: c.primary, fontSize: ms(10.5), marginTop: ms(6) },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            );
          }

          // Una pestaña sin pantalla todavía se ve atenuada y no responde.
          const pending = !item.route;
          const color = active ? c.primary : c.textGray;

          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.item, { gap: ms(5) }, pending && styles.pending]}
              activeOpacity={pending ? 1 : 0.7}
              onPress={() => go(item)}
              disabled={pending}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: pending }}
              accessibilityLabel={item.label}
            >
              <Icon name={item.icon} size={ms(21)} color={color} />
              <Text
                style={[
                  active ? textStyles.link : textStyles.body,
                  { color, fontSize: ms(10.5) },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopWidth: 1,
  },
  // La barra se esconde deslizándose hacia abajo (ver translateY).
  item: {
    flex: 1,
    alignItems: 'center',
  },
  pending: {
    opacity: 0.45,
  },
  centerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
