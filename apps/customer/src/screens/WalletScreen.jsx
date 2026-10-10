import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { getMenuColors } from '../styles/CustomerMenu';
import ordersStyles, { getOrderBandColor } from '../styles/Orders';
import { getMyWallet } from '../services/walletApi';
import { usePanchita } from '../context/PanchitaContext';

const GREEN = '#1FC47A';
const money = (n) => `$${Math.abs(Number(n) || 0).toFixed(2)}`;

// Ícono de cada tipo de movimiento (ver walletMovementModel en el backend).
const MOVEMENT_ICONS = {
  claim_credit: 'chatbubble-ellipses-outline',
  order_payment: 'bag-handle-outline',
  payment_release: 'arrow-undo-outline',
  order_cancel: 'close-circle-outline',
  adjustment: 'create-outline',
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleDateString('es-SV', { day: 'numeric', month: 'short' }) +
    ' · ' +
    date.toLocaleTimeString('es-SV', { hour: 'numeric', minute: '2-digit' });
};

// "Mi saldo" en Más: el saldo a favor, de dónde salió y en qué se usó, más
// los reembolsos a tarjeta (pendientes o hechos).
const WalletScreen = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const bandColor = getOrderBandColor(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();
  const panchita = usePanchita();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (pull = false) => {
    if (pull) setRefreshing(true);
    const res = await getMyWallet();
    if (res.success) {
      setData(res);
      setError(null);
    } else {
      setError(res.error);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Mientras llega la respuesta se muestra el saldo que ya conoce la app.
  const balance = data ? data.balance : Number(panchita.wallet?.balance) || 0;
  const pendingRefunds = (data?.cardRefunds || []).filter((r) => r.status === 'pending_refund');
  const doneRefunds = (data?.cardRefunds || []).filter((r) => r.status === 'refunded');

  const sectionTitle = (text) => (
    <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(17), marginTop: ms(26), marginBottom: ms(10) }]}>
      {text}
    </Text>
  );

  return (
    <View style={[ordersStyles.container, { backgroundColor: c.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ height: insets.top }} />

      {/* ── ENCABEZADO ── */}
      <View style={[ordersStyles.row, { paddingHorizontal: m.gutter, paddingVertical: ms(12), gap: ms(12) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            ordersStyles.roundButton,
            { backgroundColor: c.surface, borderColor: c.border, width: ms(40), height: ms(40), borderRadius: ms(20) },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Icon name="chevron-back" size={ms(20)} color={c.textDark} />
        </TouchableOpacity>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(20) }]}>Mi saldo</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: m.gutter, paddingBottom: ms(40) }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={c.primary} colors={[c.primary]} />
        }
      >
        {/* ── SALDO ── */}
        <View
          style={{
            marginTop: ms(12),
            padding: ms(20),
            borderRadius: ms(22),
            backgroundColor: isDark ? 'rgba(31,196,122,0.14)' : 'rgba(31,196,122,0.10)',
            borderWidth: 1,
            borderColor: 'rgba(31,196,122,0.35)',
            gap: ms(6),
          }}
        >
          <Text style={[textStyles.kicker, { color: GREEN, fontSize: ms(10.5) }]}>SALDO A FAVOR</Text>
          <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(38) }]} accessibilityLabel={`Saldo a favor: ${money(balance)}`}>
            {money(balance)}
          </Text>
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13), lineHeight: ms(18) }]}>
            Se usa solo al pagar tu próximo pedido. Lo recibes cuando Chef Panchita resuelve un reclamo o cuando
            cancelas un pedido que pagaste con saldo.
          </Text>
        </View>

        {loading && !data ? <ActivityIndicator color={c.primary} style={{ marginTop: ms(24) }} /> : null}

        {error && !data ? (
          <TouchableOpacity onPress={() => load()} style={{ alignItems: 'center', paddingVertical: ms(24), gap: ms(6) }}>
            <Icon name="cloud-offline-outline" size={ms(26)} color={c.textGray} />
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13), textAlign: 'center' }]}>{error}</Text>
            <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13) }]}>Reintentar</Text>
          </TouchableOpacity>
        ) : null}

        {/* ── REEMBOLSOS A TARJETA ── */}
        {pendingRefunds.length || doneRefunds.length ? sectionTitle('Reembolsos a tu tarjeta') : null}
        {[...pendingRefunds, ...doneRefunds].map((refund) => {
          const pending = refund.status === 'pending_refund';
          return (
            <View
              key={refund.id}
              style={[
                ordersStyles.row,
                {
                  gap: ms(12),
                  padding: ms(14),
                  marginBottom: ms(10),
                  borderRadius: ms(16),
                  borderWidth: 1,
                  borderColor: pending ? '#F2A33A' : c.border,
                  backgroundColor: c.surface,
                },
              ]}
            >
              <View style={[ordersStyles.pastIcon, { width: ms(40), height: ms(40), borderRadius: ms(12), backgroundColor: bandColor }]}>
                <Icon name={pending ? 'hourglass-outline' : 'checkmark-done'} size={ms(19)} color={pending ? '#F2A33A' : GREEN} />
              </View>
              <View style={{ flex: 1, gap: ms(2) }}>
                <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(14.5) }]}>
                  {money(refund.amount)} · {pending ? 'En proceso' : 'Reembolsado'}
                </Text>
                <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]} numberOfLines={3}>
                  {refund.reason}
                </Text>
              </View>
            </View>
          );
        })}

        {/* ── MOVIMIENTOS ── */}
        {data ? sectionTitle('Movimientos') : null}
        {data && data.movements.length === 0 ? (
          <View style={{ alignItems: 'center', gap: ms(6), paddingVertical: ms(20) }}>
            <Icon name="receipt-outline" size={ms(28)} color={c.textLight} />
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13), textAlign: 'center' }]}>
              Aún no hay movimientos en tu saldo.
            </Text>
          </View>
        ) : null}
        {data
          ? data.movements.map((movement, index) => {
              const incoming = movement.amount > 0;
              return (
                <View
                  key={movement.id}
                  style={[
                    ordersStyles.row,
                    {
                      gap: ms(12),
                      paddingVertical: ms(12),
                      borderTopWidth: index > 0 ? 1 : 0,
                      borderTopColor: c.border,
                    },
                  ]}
                >
                  <View style={[ordersStyles.pastIcon, { width: ms(40), height: ms(40), borderRadius: ms(12), backgroundColor: bandColor }]}>
                    <Icon name={MOVEMENT_ICONS[movement.type] || 'swap-vertical'} size={ms(18)} color={incoming ? GREEN : c.textDark} />
                  </View>
                  <View style={{ flex: 1, gap: ms(2) }}>
                    <Text style={[textStyles.bodyMedium, { color: c.textDark, fontSize: ms(14) }]} numberOfLines={2}>
                      {movement.description || (incoming ? 'Abono' : 'Uso de saldo')}
                    </Text>
                    <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(12) }]}>{formatDate(movement.createdAt)}</Text>
                  </View>
                  <Text style={[textStyles.num, { color: incoming ? GREEN : c.textDark, fontSize: ms(15) }]}>
                    {incoming ? '+' : '−'}
                    {money(movement.amount)}
                  </Text>
                </View>
              );
            })
          : null}
      </ScrollView>
    </View>
  );
};

export default WalletScreen;
