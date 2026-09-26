import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { sendDriverMessage } from '../services/panchitaApi';

const FACTOR_ICONS = {
  kitchen: 'restaurant-outline',
  traffic: 'car-outline',
  weather: 'rainy-outline',
};

const RISK = {
  low: { label: 'A TIEMPO', color: '#1FC47A' },
  medium: { label: 'PODRÍA TARDAR', color: '#F2A33A' },
  high: { label: 'CON RETRASO', color: '#D93636' },
};

// "7:45 p. m." en hora del teléfono.
const formatTime = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'a. m.' : 'p. m.'}`;
};

// Seguimiento de un pedido en curso: cuándo llega, por qué (cocina, tráfico,
// clima) y, si es a domicilio, mensajes de un toque para el repartidor.
const OrderTrackingCard = ({ order, colors: c, ms, onSent }) => {
  const eta = order.eta;
  const risk = RISK[eta?.risk] || RISK.low;
  const [sending, setSending] = useState(null);
  const [custom, setCustom] = useState('');
  const [writing, setWriting] = useState(false);
  const [sent, setSent] = useState(order.driverMessages || []);
  const [error, setError] = useState(null);

  const send = async (text, preset) => {
    const clean = String(text || '').trim();
    if (!clean || sending) return;
    setSending(clean);
    setError(null);
    const res = await sendDriverMessage(order.id, clean, preset);
    setSending(null);
    if (!res.success) {
      setError(res.error);
      return;
    }
    setSent((list) => [...list, { text: res.data.text, createdAt: new Date().toISOString() }]);
    setCustom('');
    setWriting(false);
    onSent?.();
  };

  return (
    <View
      style={{
        borderRadius: ms(20),
        borderWidth: 1,
        borderColor: c.border,
        backgroundColor: c.surface,
        padding: ms(16),
        gap: ms(14),
      }}
    >
      {/* Encabezado */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]}>
          PEDIDO #{order.shortId} · {String(order.statusLabel || '').toUpperCase()}
        </Text>
        <View style={{ paddingHorizontal: ms(8), paddingVertical: ms(3), borderRadius: ms(8), backgroundColor: risk.color }}>
          <Text style={[textStyles.kicker, { color: '#FFFFFF', fontSize: ms(9) }]}>{risk.label}</Text>
        </View>
      </View>

      {/* Estimación */}
      {eta ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: ms(12) }}>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(40), lineHeight: ms(44) }]}>
            {eta.minutes}
            <Text style={{ fontSize: ms(16) }}> min</Text>
          </Text>
          <View style={{ flex: 1, paddingBottom: ms(6) }}>
            <Text style={[textStyles.bodyMedium, { color: c.textDark, fontSize: ms(13.5) }]}>
              {eta.isDelivery ? 'Llega' : 'Listo'} ≈ {formatTime(eta.arrivalAt)}
            </Text>
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>
              Entre {eta.window?.[0]} y {eta.window?.[1]} min
            </Text>
          </View>
        </View>
      ) : null}

      {/* Por qué */}
      {eta?.factors?.length ? (
        <View style={{ gap: ms(8) }}>
          {eta.factors.map((factor) => (
            <View key={`${factor.type}-${factor.label}`} style={{ flexDirection: 'row', gap: ms(10), alignItems: 'flex-start' }}>
              <Icon name={FACTOR_ICONS[factor.type] || 'information-circle-outline'} size={ms(16)} color={c.primary} />
              <Text style={[textStyles.body, { flex: 1, color: c.textGray, fontSize: ms(12.5) }]}>{factor.label}</Text>
            </View>
          ))}
          {eta.isDelivery && eta.trafficSource && eta.trafficSource !== 'google' ? (
            <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(11) }]}>
              El tráfico es un estimado según la hora; no es en vivo.
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Repartidor */}
      {order.isDelivery ? (
        <View style={{ gap: ms(8), borderTopWidth: 1, borderTopColor: c.border, paddingTop: ms(12) }}>
          <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>MENSAJE AL REPARTIDOR</Text>

          {sent.length > 0 ? (
            <View style={{ gap: ms(4) }}>
              {sent.slice(-3).map((m, i) => (
                <View key={`${m.createdAt}-${i}`} style={{ flexDirection: 'row', gap: ms(6), alignItems: 'center' }}>
                  <Icon name="checkmark-done" size={ms(14)} color="#1FC47A" />
                  <Text style={[textStyles.body, { flex: 1, color: c.textDark, fontSize: ms(12.5) }]}>{m.text}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: ms(8) }}>
            {(order.quickMessages || []).map((text) => (
              <TouchableOpacity
                key={text}
                onPress={() => send(text, true)}
                disabled={!!sending}
                style={{
                  paddingHorizontal: ms(12),
                  height: ms(34),
                  borderRadius: ms(17),
                  borderWidth: 1,
                  borderColor: c.border,
                  backgroundColor: c.background,
                  justifyContent: 'center',
                  opacity: sending && sending !== text ? 0.5 : 1,
                }}
                accessibilityRole="button"
                accessibilityLabel={`Enviar al repartidor: ${text}`}
              >
                {sending === text ? (
                  <ActivityIndicator size="small" color={c.primary} />
                ) : (
                  <Text style={[textStyles.body, { color: c.textDark, fontSize: ms(12.5) }]}>{text}</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setWriting(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: ms(4),
                paddingHorizontal: ms(12),
                height: ms(34),
                borderRadius: ms(17),
                backgroundColor: 'rgba(226,61,40,0.12)',
              }}
              accessibilityRole="button"
            >
              <Icon name="create-outline" size={ms(14)} color={c.primary} />
              <Text style={[textStyles.link, { color: c.primary, fontSize: ms(12.5) }]}>Escribir</Text>
            </TouchableOpacity>
          </ScrollView>

          {writing ? (
            <View style={{ flexDirection: 'row', gap: ms(8), alignItems: 'center' }}>
              <TextInput
                value={custom}
                onChangeText={setCustom}
                placeholder="Ej. Es la casa del portón verde"
                placeholderTextColor={c.textLight}
                maxLength={200}
                autoFocus
                style={[
                  textStyles.body,
                  {
                    flex: 1,
                    borderWidth: 1,
                    borderColor: c.border,
                    borderRadius: ms(12),
                    paddingHorizontal: ms(12),
                    paddingVertical: ms(9),
                    color: c.textDark,
                    fontSize: ms(13.5),
                  },
                ]}
                onSubmitEditing={() => send(custom, false)}
                returnKeyType="send"
              />
              <TouchableOpacity
                onPress={() => send(custom, false)}
                disabled={!custom.trim() || !!sending}
                style={{
                  width: ms(40),
                  height: ms(40),
                  borderRadius: ms(20),
                  backgroundColor: c.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: custom.trim() ? 1 : 0.5,
                }}
                accessibilityLabel="Enviar mensaje"
              >
                <Icon name="send" size={ms(16)} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : null}

          {error ? <Text style={[textStyles.body, { color: c.error, fontSize: ms(12) }]}>{error}</Text> : null}
        </View>
      ) : null}
    </View>
  );
};

export default OrderTrackingCard;
