import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { getMenuColors } from '../styles/CustomerMenu';
import { useCart } from '../context/CartContext';
import { navigate, navigationRef } from '../navigation/navigationRef';

const AUTO_HIDE_MS = 3500;
const HIDDEN = -160;

// Confirmación de que algo se agregó a la bolsa. Se dibuja encima de todas
// las pantallas porque el detalle del producto se cierra al agregar. Baja
// desde arriba, se va solo y ofrece "Ver bolsa" (salvo si ya se está ahí).
export default function CartAddedToast() {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const insets = useSafeAreaInsets();
  const { addedNotice, dismissAddedNotice } = useCart();
  const offset = useRef(new Animated.Value(HIDDEN)).current;

  // Pantalla actual: repetir un pedido agrega y de inmediato abre la bolsa.
  const currentRoute = () => (navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : null);
  const [routeName, setRouteName] = useState(currentRoute);
  useEffect(() => navigationRef.addListener('state', () => setRouteName(currentRoute())), []);

  useEffect(() => {
    if (!addedNotice) return undefined;
    Animated.spring(offset, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
    const timer = setTimeout(() => close(), AUTO_HIDE_MS);
    return () => clearTimeout(timer);
    // Se reinicia el tiempo cuando se suman productos al mismo aviso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addedNotice?.key, addedNotice?.count]);

  if (!addedNotice) return null;

  function close(then) {
    const key = addedNotice.key;
    Animated.timing(offset, { toValue: HIDDEN, duration: 200, useNativeDriver: true }).start(() => {
      dismissAddedNotice(key);
      then?.();
    });
  }

  const onCart = routeName === 'Cart';
  const title =
    addedNotice.lines > 1
      ? `${addedNotice.count} productos agregados`
      : addedNotice.count > 1
        ? `${addedNotice.count} × ${addedNotice.name}`
        : addedNotice.name;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: insets.top + 8,
        left: 12,
        right: 12,
        transform: [{ translateY: offset }],
        zIndex: 100,
        elevation: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 10,
          borderRadius: 18,
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.border,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        }}
        accessible
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${title}, se agregó a tu bolsa`}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: c.imagePlaceholder,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {addedNotice.imageUrl && addedNotice.lines === 1 ? (
            <Image source={{ uri: addedNotice.imageUrl }} style={{ width: 44, height: 44 }} />
          ) : (
            <Icon name="bag-handle" size={22} color={c.primary} />
          )}
          <View
            style={{
              position: 'absolute',
              right: 2,
              bottom: 2,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: '#1FC47A',
              borderWidth: 2,
              borderColor: c.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="checkmark" size={10} color="#FFFFFF" />
          </View>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[textStyles.kicker, { color: '#1FC47A', fontSize: 9.5 }]}>AGREGADO A TU BOLSA</Text>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: 14 }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {onCart ? (
          <TouchableOpacity onPress={() => close()} hitSlop={10} accessibilityLabel="Cerrar aviso">
            <Icon name="close" size={18} color={c.textGray} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => close(() => navigate('CustomerTabs', { screen: 'Cart' }))}
            style={{ paddingHorizontal: 12, height: 36, borderRadius: 12, backgroundColor: c.primary, justifyContent: 'center' }}
            accessibilityRole="button"
            accessibilityLabel="Ver bolsa"
          >
            <Text style={[textStyles.button, { color: '#FFFFFF', fontSize: 13 }]}>Ver bolsa</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}
