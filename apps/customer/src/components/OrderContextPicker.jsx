import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import Sheet from './Sheet';

const STATUS_LABELS = {
  pending: 'Recibido',
  preparing: 'En cocina',
  atrasado: 'Demorado',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const PLACE_LABELS = { delivery: 'A domicilio', pickup: 'Para llevar', dine_in: 'Comer en el local' };

// Hasta cuántos pedidos se ofrecen (los más recientes).
const MAX_ORDERS = 15;

const formatDate = (date) =>
  date ? date.toLocaleDateString('es-SV', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';

const placeOf = (order) => (order.orderType === 'local' ? 'En el local' : PLACE_LABELS[order.fulfillment] || '');

// "Añadir contexto" del chat de Panchita, como el del panel web: el cliente
// elige de qué pedido quiere hablar y Panchita lo toma como tema (el backend
// lo recibe como `orderId`). Sin pedido elegido, Panchita usa el más reciente.
export default function OrderContextPicker({ orders, selectedId, onChange, colors: c, ms, bottomInset }) {
  const [open, setOpen] = useState(false);
  const selected = orders.find((o) => o.id === selectedId) || null;
  const list = orders.slice(0, MAX_ORDERS);

  const choose = (id) => {
    onChange(id);
    setOpen(false);
  };

  const row = (key, { title, caption, active, onPress, icon }) => (
    <TouchableOpacity
      key={key}
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: ms(10),
        padding: ms(12),
        borderRadius: ms(12),
        borderWidth: 1,
        borderColor: active ? c.primary : c.border,
        backgroundColor: active ? c.primaryTint : c.surface,
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
    >
      <Icon name={icon} size={ms(18)} color={active ? c.primary : c.textGray} />
      <View style={{ flex: 1 }}>
        <Text style={[textStyles.bodyMedium, { color: c.textDark, fontSize: ms(14) }]}>{title}</Text>
        {caption ? <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>{caption}</Text> : null}
      </View>
      {active ? <Icon name="checkmark" size={ms(18)} color={c.primary} /> : null}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: ms(8),
          paddingHorizontal: ms(12),
          height: ms(38),
          borderRadius: ms(10),
          borderWidth: 1,
          borderColor: selected ? c.primary : c.border,
          backgroundColor: selected ? c.primaryTint : c.surface,
        }}
        accessibilityRole="button"
        accessibilityLabel={selected ? `Hablando del pedido ${selected.code}. Cambiar` : 'Elegir de qué pedido hablar'}
      >
        <Icon name={selected ? 'receipt' : 'add-circle-outline'} size={ms(16)} color={selected ? c.primary : c.textGray} />
        <Text
          style={[textStyles.bodyMedium, { flex: 1, fontSize: ms(13), color: selected ? c.primary : c.textGray }]}
          numberOfLines={1}
        >
          {selected
            ? `Sobre: ${selected.code} · ${STATUS_LABELS[selected.status] || selected.status}`
            : 'Añadir contexto: ¿de qué pedido hablamos?'}
        </Text>
        <Icon name="chevron-down" size={ms(16)} color={selected ? c.primary : c.textGray} />
      </TouchableOpacity>

      <Sheet visible={open} onClose={() => setOpen(false)} colors={c} ms={ms} bottomInset={bottomInset}>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(17), marginBottom: ms(4) }]}>
          ¿De qué pedido hablamos?
        </Text>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5), marginBottom: ms(12) }]}>
          Panchita lo tomará en cuenta en lo que le escribas.
        </Text>
        <ScrollView style={{ maxHeight: ms(420) }} contentContainerStyle={{ gap: ms(8) }}>
          {row('none', {
            title: 'Sin pedido específico',
            caption: 'Panchita usa tu pedido más reciente',
            active: !selected,
            onPress: () => choose(null),
            icon: 'chatbubbles-outline',
          })}
          {list.map((order) =>
            row(order.id, {
              title: `${order.code} · ${STATUS_LABELS[order.status] || order.status}`,
              caption: [placeOf(order), `$${order.total.toFixed(2)}`, formatDate(order.createdAt)].filter(Boolean).join(' · '),
              active: order.id === selectedId,
              onPress: () => choose(order.id),
              icon: 'receipt-outline',
            }),
          )}
          {list.length === 0 ? (
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]}>Aún no tienes pedidos.</Text>
          ) : null}
        </ScrollView>
      </Sheet>
    </>
  );
}
