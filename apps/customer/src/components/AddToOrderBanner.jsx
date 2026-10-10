import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { getMenuColors } from '../styles/CustomerMenu';
import { orderStatusColors as sc } from '../styles/Orders';
import { useCart } from '../context/CartContext';
import { resumeMyOrder } from '../services/api';
import { navigate } from '../navigation/navigationRef';

// Barra fija arriba de todas las pantallas mientras el cliente agrega
// productos a un pedido: a qué pedido, cuánto tiempo le queda, ir a pagar o
// dejarlo. El vencimiento (borrar lo agregado) lo maneja CartContext.
export default function AddToOrderBanner() {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const insets = useSafeAreaInsets();
  const { addMode, endAddMode, itemCount } = useCart();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!addMode) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [addMode]);

  if (!addMode) return null;

  const remaining = Math.max(0, new Date(addMode.until).getTime() - now);
  const left = `${Math.floor(remaining / 60000)}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}`;
  const urgent = remaining < 2 * 60 * 1000;

  const goPay = () => navigate('CustomerTabs', { screen: 'Cart' });

  // Ya no quiere agregar nada: el pedido vuelve a la cola sin esperar.
  const stop = () =>
    Alert.alert('¿Dejar de agregar productos?', `Tu pedido ${addMode.code} vuelve a la cola tal como estaba.`, [
      { text: 'Seguir agregando', style: 'cancel' },
      {
        text: 'Dejar de agregar',
        style: 'destructive',
        onPress: async () => {
          await resumeMyOrder(addMode.orderId);
          endAddMode();
        },
      },
    ]);

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: insets.top + 4, paddingHorizontal: 12 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: urgent ? c.error : sc.warning,
          backgroundColor: c.surface,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 6,
        }}
      >
        <Icon name="add-circle" size={20} color={urgent ? c.error : sc.warning} />
        <View style={{ flex: 1 }}>
          <Text style={[textStyles.bodyMedium, { color: c.textDark, fontSize: 13 }]} numberOfLines={1}>
            Agregando a {addMode.code}
          </Text>
          <Text style={[textStyles.body, { color: urgent ? c.error : c.textGray, fontSize: 11.5 }]}>
            Quedan <Text style={textStyles.num}>{left}</Text> para pagar
            {itemCount > 0 ? ` · ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={goPay}
          disabled={itemCount === 0}
          style={{
            paddingHorizontal: 12,
            height: 32,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c.primary,
            opacity: itemCount === 0 ? 0.45 : 1,
          }}
          accessibilityRole="button"
          accessibilityLabel="Ir a pagar lo agregado"
        >
          <Text style={[textStyles.bodyMedium, { color: '#FFFFFF', fontSize: 12.5 }]}>Pagar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={stop} hitSlop={10} accessibilityRole="button" accessibilityLabel="Dejar de agregar productos">
          <Icon name="close" size={20} color={c.textGray} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
