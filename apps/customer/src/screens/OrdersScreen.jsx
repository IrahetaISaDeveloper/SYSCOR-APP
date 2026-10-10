import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics, getAuthTokens } from '@syscor/shared/src/styles/authTheme';
import PanchitaBubble from '@syscor/shared/src/components/panchita/PanchitaBubble';
import { getMenuColors } from '../styles/CustomerMenu';
import ordersStyles, { orderStatusColors as sc, getOrderBandColor } from '../styles/Orders';
import useMyOrders from '../hooks/useMyOrders';
import { useCart } from '../context/CartContext';
import { useTabBarVisibility } from '../context/TabBarVisibilityContext';
import { usePanchita } from '../context/PanchitaContext';
import { cancelMyOrder, holdMyOrder } from '../services/api';
import { formatReservation, formatClock } from '../utils/reservationSlots';
import RateOrderSheet from '../components/RateOrderSheet';

// Etiqueta y color de la insignia de cada estado del backend.
const STATUS_BADGES = {
  pending: { label: 'RECIBIDA', color: '#4C8DF6' },
  preparing: { label: 'EN PREPARACIÓN', color: sc.warning },
  atrasado: { label: 'DEMORADA', color: '#E0712B' },
  ready: { label: 'LISTA', color: sc.success },
  delivered: { label: 'ENTREGADA', color: sc.success },
  cancelled: { label: 'CANCELADA', color: sc.danger },
};

// Paso actual de la barra de progreso según el estado.
const STEP_BY_STATUS = { pending: 0, preparing: 1, atrasado: 1, ready: 2, delivered: 3 };

// Pasos del pedido, cada uno con el estado del backend del que sale su hora.
// El de "salió de cocina" cambia según cómo llega el pedido al cliente.
const getSteps = (order) => {
  const ready = order.isDelivery && order.orderType !== 'local' && order.fulfillment !== 'dine_in'
    ? { label: 'En camino', icon: 'bicycle-outline' }
    : { label: 'Lista', icon: 'bag-check-outline' };
  return [
    { status: 'pending', label: 'Recibida', icon: 'receipt-outline' },
    { status: 'preparing', label: 'En cocina', icon: 'flame-outline' },
    { status: 'ready', ...ready },
    { status: 'delivered', label: 'Entregada', icon: 'checkmark-done-outline' },
  ];
};

// Filtro por origen del pedido.
const TYPE_FILTERS = [
  { id: 'all', label: 'Todos', icon: null },
  { id: 'local', label: 'En el local', icon: 'storefront-outline' },
  { id: 'online', label: 'En línea', icon: 'phone-portrait-outline' },
];

// En "En curso" solo se muestran los últimos pedidos terminados; el resto
// está en "Historial".
const RECENT_PAST_LIMIT = 3;

// ── PANTALLA ────────────────────────────────────────────────────────────
const OrdersScreen = ({ navigation, route }) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const bandColor = getOrderBandColor(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState('current');
  const [typeFilter, setTypeFilter] = useState('all');

  const { orders, isLoading, isRefreshing, error, refetch } = useMyOrders();
  const { addItem, startAddMode } = useCart();
  const { handleScroll, reset: resetTabBar } = useTabBarVisibility();
  const panchita = usePanchita();
  const [cancellingId, setCancellingId] = useState(null);
  // Pedido que se está calificando (null = hoja cerrada).
  const [ratingOrder, setRatingOrder] = useState(null);

  // Al tocar el aviso de "Pedido entregado" se llega aquí con el pedido a
  // calificar: se abre la hoja en cuanto carguen los pedidos.
  const rateOrderId = route?.params?.rateOrderId;
  useEffect(() => {
    if (!rateOrderId || isLoading) return;
    const target = orders.find((o) => o.id === rateOrderId);
    if (target && target.status === 'delivered' && !target.rating) setRatingOrder(target);
    navigation.setParams({ rateOrderId: undefined });
  }, [rateOrderId, isLoading, orders, navigation]);

  // Cancelar un pedido en línea (antes de que entre a cocina). Qué pasa con el dinero lo
  // decide y lo explica el backend.
  const confirmCancel = (order) =>
    Alert.alert(
      `¿Cancelar el pedido ${order.code}?`,
      'Lo que pagaste con saldo regresa a tu saldo al instante. Lo pagado con tarjeta te lo reembolsamos a la tarjeta (puede tardar unos días según tu banco).',
      [
        { text: 'No, mantenerlo', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(order.id);
            const res = await cancelMyOrder(order.id);
            setCancellingId(null);
            refetch();
            panchita.refresh();
            Alert.alert(res.title || (res.success ? 'Pedido cancelado' : 'No se pudo cancelar'), res.success ? res.message : res.error);
          },
        },
      ],
    );

  // "Agregar más productos": el pedido se pausa 10 minutos (cocina no lo
  // empieza) y la app pasa al modo de agregar: el carrito queda solo para lo
  // nuevo hasta que se pague. Una sola vez por pedido.
  const [holdingId, setHoldingId] = useState(null);
  const enterAddMode = (order, until) => {
    startAddMode({ orderId: order.id, code: order.code, until });
    navigation.navigate('Menu');
  };
  const confirmAddMore = (order) =>
    Alert.alert(
      `¿Agregar productos a ${order.code}?`,
      'Tienes 10 minutos para elegir y pagar lo que quieras sumar. Mientras, cocina espera tu pedido. Si no pagas a tiempo, se quita lo agregado y tu pedido sigue como estaba. Solo se puede una vez por pedido.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Agregar productos',
          onPress: async () => {
            setHoldingId(order.id);
            const res = await holdMyOrder(order.id);
            setHoldingId(null);
            refetch();
            if (!res.success) {
              Alert.alert(res.title, res.error);
              return;
            }
            enterAddMode(order, res.hold?.until);
          },
        },
      ],
    );

  // Al salir de la pestaña la barra vuelve a verse.
  useFocusEffect(useCallback(() => () => resetTabBar?.(), [resetTabBar]));

  const filtered = useMemo(
    () => (typeFilter === 'all' ? orders : orders.filter((o) => o.orderType === typeFilter)),
    [orders, typeFilter],
  );
  const active = useMemo(() => filtered.filter((o) => o.isActive), [filtered]);
  const past = useMemo(() => filtered.filter((o) => !o.isActive), [filtered]);
  const deliveredCount = useMemo(
    () => past.filter((o) => o.status === 'delivered').length,
    [past],
  );

  // Vuelve a meter al carrito los productos de un pedido anterior. Se usa el
  // precio guardado en el pedido; el backend recalcula con el precio actual
  // al confirmar la compra.
  const repeatOrder = (order) => {
    for (const item of order.items) {
      if (!item.itemId) continue;
      addItem({
        productType: item.itemType,
        productId: item.itemId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        selectedDrinkId: null,
        selectedSauces: [],
        selectedSelectiveItems: [],
        selectedExtras: [],
      });
    }
    navigation.navigate('Cart');
  };

  const goToMenu = () => navigation.navigate('Menu');

  return (
    <View style={[ordersStyles.container, { backgroundColor: c.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ height: insets.top }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: m.gutter, paddingBottom: ms(130) }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor={c.primary}
            colors={[c.primary]}
          />
        }
      >
        {/* ── ENCABEZADO ── */}
        <View style={[ordersStyles.header, { marginTop: ms(18) }]}>
          <View style={{ flex: 1, gap: ms(4) }}>
            <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(26) }]}>
              Mis pedidos
            </Text>
            {!isLoading ? (
              <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]}>
                {active.length} EN CURSO · {deliveredCount}{' '}
                {deliveredCount === 1 ? 'ENTREGADO' : 'ENTREGADOS'}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ── EN CURSO / HISTORIAL ── */}
        <View style={[ordersStyles.row, { gap: ms(8), marginTop: ms(18) }]}>
          {[
            { id: 'current', label: 'En curso' },
            { id: 'history', label: 'Historial' },
          ].map((t) => {
            const selected = tab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTab(t.id)}
                activeOpacity={0.85}
                style={[
                  ordersStyles.pill,
                  {
                    backgroundColor: selected ? c.primary : c.surface,
                    borderColor: selected ? c.primary : c.border,
                    borderRadius: ms(20),
                    paddingHorizontal: ms(16),
                    height: ms(36),
                  },
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    selected ? textStyles.title : textStyles.body,
                    { color: selected ? c.white : c.textGray, fontSize: ms(13.5) },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── FILTRO: LOCAL / EN LÍNEA ── */}
        <View style={[ordersStyles.row, { gap: ms(8), marginTop: ms(12) }]}>
          {TYPE_FILTERS.map((f) => {
            const selected = typeFilter === f.id;
            const color = selected ? c.primary : c.textGray;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setTypeFilter(f.id)}
                activeOpacity={0.85}
                style={[
                  ordersStyles.chip,
                  {
                    borderColor: selected ? c.primary : c.border,
                    backgroundColor: 'transparent',
                    borderRadius: ms(10),
                    paddingHorizontal: ms(10),
                    paddingVertical: ms(6),
                    gap: ms(5),
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                {f.icon ? <Icon name={f.icon} size={ms(13)} color={color} /> : null}
                <Text
                  style={[
                    selected ? textStyles.link : textStyles.body,
                    { color, fontSize: ms(12) },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── CONTENIDO ── */}
        {isLoading ? (
          <View style={[ordersStyles.centerBox, { paddingVertical: ms(60), gap: ms(12) }]}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]}>
              Cargando tus pedidos…
            </Text>
          </View>
        ) : error ? (
          <Notice
            icon="cloud-offline-outline"
            title="No pudimos cargar tus pedidos"
            text={error}
            actionLabel="Reintentar"
            onAction={refetch}
            colors={c}
            ms={ms}
          />
        ) : filtered.length === 0 ? (
          <Notice
            icon={typeFilter === 'local' ? 'storefront-outline' : 'receipt-outline'}
            title={
              typeFilter === 'local'
                ? 'Sin pedidos del local'
                : typeFilter === 'online'
                  ? 'Sin pedidos en línea'
                  : 'Aún no tienes pedidos'
            }
            text={
              typeFilter === 'local'
                ? 'Cuando comas en el restaurante, pide al mesero que ligue tu cuenta para ver aquí tu pedido.'
                : 'Cuando hagas un pedido lo verás aquí, con su estado en tiempo real.'
            }
            actionLabel={typeFilter === 'local' ? null : 'Ver el menú'}
            onAction={goToMenu}
            colors={c}
            ms={ms}
          />
        ) : tab === 'current' ? (
          <>
            {active.length === 0 ? (
              <Notice
                icon="checkmark-done-outline"
                title="No tienes pedidos en curso"
                text="Tus pedidos terminados están abajo y en el historial."
                actionLabel="Pedir algo"
                onAction={goToMenu}
                colors={c}
                ms={ms}
                compact
              />
            ) : (
              <View style={{ gap: ms(14), marginTop: ms(16) }}>
                {active.map((order) => (
                  <View key={order.id} style={{ gap: ms(8) }}>
                    <ActiveOrderCard order={order} colors={c} bandColor={bandColor} ms={ms} />
                    {order.reservation ? (
                      <ReservationCard
                        reservation={order.reservation}
                        onChooseTable={() => navigation.navigate('TableReservation', { orderId: order.id })}
                        onCheckIn={() => navigation.navigate('TableCheckIn')}
                        colors={c}
                        ms={ms}
                      />
                    ) : null}
                    {order.hold.active || order.canHold ? (
                      <HoldButton
                        hold={order.hold}
                        busy={holdingId === order.id}
                        onHold={() => confirmAddMore(order)}
                        onResume={() => enterAddMode(order, order.hold.until)}
                        onExpire={refetch}
                        colors={c}
                        ms={ms}
                      />
                    ) : null}
                    {order.canCancel ? (
                      <CancelOrderButton
                        busy={cancellingId === order.id}
                        onPress={() => confirmCancel(order)}
                        colors={c}
                        ms={ms}
                      />
                    ) : null}
                    {/* Estimación con tráfico y clima, mensajes al repartidor y ayuda */}
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Panchita', { orderId: order.id })}
                      activeOpacity={0.85}
                      style={[
                        ordersStyles.outlineButton,
                        { backgroundColor: c.surface, borderColor: c.border, borderRadius: ms(14), height: ms(44), gap: ms(8) },
                      ]}
                      accessibilityRole="button"
                    >
                      <Icon name="chatbubbles-outline" size={ms(16)} color={c.primary} />
                      <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13.5) }]}>
                        Seguimiento y ayuda con Panchita
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {past.length > 0 ? (
              <>
                <SectionLabel label="ANTERIORES" colors={c} ms={ms} />
                <View style={{ gap: ms(10) }}>
                  {past.slice(0, RECENT_PAST_LIMIT).map((order) => (
                    <PastOrderRow
                      key={order.id}
                      order={order}
                      colors={c}
                      bandColor={bandColor}
                      ms={ms}
                      onRepeat={() => repeatOrder(order)}
                      onRate={() => setRatingOrder(order)}
                    />
                  ))}
                </View>
                {past.length > RECENT_PAST_LIMIT ? (
                  <TouchableOpacity
                    onPress={() => setTab('history')}
                    style={{ alignSelf: 'center', marginTop: ms(14) }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13) }]}>
                      Ver todo el historial
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : null}
          </>
        ) : past.length === 0 ? (
          <Notice
            icon="time-outline"
            title="Tu historial está vacío"
            text="Aquí aparecerán tus pedidos cuando se entreguen o cancelen."
            colors={c}
            ms={ms}
          />
        ) : (
          groupByMonth(past).map((group) => (
            <View key={group.key}>
              <SectionLabel label={group.label} colors={c} ms={ms} />
              <View style={{ gap: ms(10) }}>
                {group.orders.map((order) => (
                  <PastOrderRow
                    key={order.id}
                    order={order}
                    colors={c}
                    bandColor={bandColor}
                    ms={ms}
                    onRepeat={() => repeatOrder(order)}
                    onRate={() => setRatingOrder(order)}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <RateOrderSheet
        order={ratingOrder}
        onClose={() => setRatingOrder(null)}
        onRated={refetch}
        colors={c}
        ms={ms}
        bottomInset={insets.bottom}
      />

      {/* Chef Panchita, siempre a mano en Pedidos */}
      <PanchitaBubble tokens={getAuthTokens(isDark)} isDark={isDark} onPress={() => navigation.navigate('Panchita')} />
    </View>
  );
};

// ── COMPONENTES ─────────────────────────────────────────────────────────

const StatusBadge = ({ status, ms }) => {
  const badge = STATUS_BADGES[status] || STATUS_BADGES.pending;
  return (
    <View
      style={[
        ordersStyles.badge,
        {
          backgroundColor: badge.color,
          borderRadius: ms(6),
          paddingHorizontal: ms(7),
          paddingVertical: ms(3),
        },
      ]}
    >
      <Text style={[textStyles.kicker, { color: '#FFFFFF', fontSize: ms(9.5) }]}>
        {badge.label}
      </Text>
    </View>
  );
};

// Mesa reservada de un pedido para comer en el local: a qué hora, qué mesa,
// y los botones para elegirla (si falta) o marcar la llegada con el QR.
const RESERVATION_TEXT = {
  pending_table: 'Aún no eliges tu mesa.',
  checked_in: 'Ya estás en tu mesa. ¡Buen provecho!',
  expired: 'La reserva venció: pasaron 30 minutos de la hora. Si ya estás aquí, avísale a un mesero.',
  cancelled: 'La reserva se canceló.',
};

const ReservationCard = ({ reservation: r, onChooseTable, onCheckIn, colors: c, ms }) => {
  const text =
    RESERVATION_TEXT[r.status] ??
    `Te guardamos la mesa hasta las ${r.expiresAt ? formatClock(r.expiresAt) : ''}. Al llegar, escanea el QR de la mesa.`;
  const actionButton = (label, icon, onPress, primary) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: ms(6),
        height: ms(40),
        borderRadius: ms(12),
        borderWidth: 1,
        borderColor: c.primary,
        backgroundColor: primary ? c.primary : 'transparent',
      }}
      accessibilityRole="button"
    >
      <Icon name={icon} size={ms(15)} color={primary ? '#FFFFFF' : c.primary} />
      <Text style={[textStyles.bodyMedium, { fontSize: ms(13), color: primary ? '#FFFFFF' : c.primary }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ padding: ms(14), gap: ms(10), borderRadius: ms(16), borderWidth: 1, borderColor: c.border, backgroundColor: c.surface }}>
      <View style={[ordersStyles.row, { gap: ms(10) }]}>
        <Icon name="restaurant-outline" size={ms(18)} color={c.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(14.5) }]}>
            {r.table ? `Mesa ${r.table.number} · ${r.table.zoneLabel}` : 'Mesa por elegir'}
          </Text>
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}>
            {r.reservedFor ? formatReservation(r.reservedFor) : ''} · {r.partySize} {r.partySize === 1 ? 'persona' : 'personas'}
          </Text>
        </View>
      </View>
      <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}>{text}</Text>
      {r.status === 'pending_table' || r.status === 'reserved' ? (
        <View style={[ordersStyles.row, { gap: ms(8) }]}>
          {r.status === 'reserved' ? actionButton('Llegué: escanear QR', 'qr-code-outline', onCheckIn, true) : null}
          {actionButton(r.status === 'reserved' ? 'Ver mesa' : 'Elegir mi mesa', 'grid-outline', onChooseTable, r.status === 'pending_table')}
        </View>
      ) : null}
    </View>
  );
};

const SectionLabel = ({ label, colors: c, ms }) => (
  <Text
    style={[
      textStyles.kicker,
      { color: c.textGray, fontSize: ms(11), marginTop: ms(24), marginBottom: ms(12) },
    ]}
  >
    {label}
  </Text>
);

// "Agregar más productos" o, si ya está agregando, el tiempo que queda y
// "Continuar" (vuelve al menú en el modo de agregar).
const HoldButton = ({ hold, busy, onHold, onResume, onExpire, colors: c, ms }) => {
  const [now, setNow] = useState(Date.now());
  const remaining = hold.active && hold.until ? Math.max(0, hold.until.getTime() - now) : 0;
  const onHoldNow = remaining > 0;

  useEffect(() => {
    if (!onHoldNow) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [onHoldNow]);

  // Se acabó el tiempo: el backend lo regresó a la cola.
  useEffect(() => {
    if (hold.active && !onHoldNow) onExpire?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onHoldNow]);

  const left = `${Math.floor(remaining / 60000)}:${String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}`;
  const color = onHoldNow ? sc.warning : c.textDark;

  return (
    <TouchableOpacity
      onPress={onHoldNow ? onResume : onHold}
      disabled={busy || (hold.active && !onHoldNow)}
      activeOpacity={0.85}
      style={[
        ordersStyles.outlineButton,
        {
          borderColor: onHoldNow ? sc.warning : c.border,
          backgroundColor: c.surface,
          borderRadius: ms(14),
          height: ms(44),
          gap: ms(8),
          opacity: busy ? 0.6 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={onHoldNow ? `Agregando productos, quedan ${left}. Continuar` : 'Agregar más productos a este pedido'}
    >
      {busy ? (
        <ActivityIndicator size="small" color={color} />
      ) : onHoldNow ? (
        <>
          <Icon name="add-circle" size={ms(16)} color={sc.warning} />
          <Text style={[textStyles.link, { color: sc.warning, fontSize: ms(13.5) }]}>Agregando productos</Text>
          <Text style={[textStyles.num, { color: c.textGray, fontSize: ms(12.5) }]}>· {left}</Text>
          <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13.5) }]}>· Continuar</Text>
        </>
      ) : (
        <>
          <Icon name="add-circle-outline" size={ms(16)} color={c.textDark} />
          <Text style={[textStyles.link, { color: c.textDark, fontSize: ms(13.5) }]}>Agregar más productos</Text>
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>· 10 min</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// Cancelar solo se puede mientras el pedido siga "Recibido". Cuando cocina
// lo empieza, el backend deja de mandar canCancel y el botón desaparece.
const CancelOrderButton = ({ busy, onPress, colors: c, ms }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={busy}
    activeOpacity={0.85}
    style={[
      ordersStyles.outlineButton,
      { borderColor: c.error, borderRadius: ms(14), height: ms(44), gap: ms(8), opacity: busy ? 0.6 : 1 },
    ]}
    accessibilityRole="button"
    accessibilityLabel="Cancelar pedido. Solo se puede antes de que entre a cocina."
  >
    {busy ? (
      <ActivityIndicator size="small" color={c.error} />
    ) : (
      <>
        <Icon name="close-circle-outline" size={ms(16)} color={c.error} />
        <Text style={[textStyles.link, { color: c.error, fontSize: ms(13.5) }]}>Cancelar pedido</Text>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>· antes de que entre a cocina</Text>
      </>
    )}
  </TouchableOpacity>
);

// Progreso del pedido: cuatro pasos unidos por una línea, cada uno con la
// hora a la que el pedido llegó a ese estado. Cada paso es una columna del
// mismo ancho, así la etiqueta y la hora quedan centradas bajo su punto.
const OrderProgress = ({ order, colors: c, ms }) => {
  const steps = getSteps(order);
  const finished = order.status === 'delivered';
  const current = STEP_BY_STATUS[order.status] ?? 0;
  const reached = (index) => finished || index <= current;
  const halfLine = (color) => ({ flex: 1, height: ms(3), backgroundColor: color });

  return (
    <View style={ordersStyles.progressTrack}>
      {steps.map((step, index) => {
        const done = finished || index < current;
        const isCurrent = !finished && index === current;
        const dotColor = done ? sc.success : isCurrent ? sc.warning : c.surfaceMuted;
        const time = reached(index) ? order.statusTimes?.[step.status] : null;
        return (
          <View key={step.status} style={[ordersStyles.progressStep, { gap: ms(6) }]}>
            <View style={ordersStyles.progressTrack}>
              <View
                style={halfLine(index === 0 ? 'transparent' : reached(index) ? sc.success : c.border)}
              />
              <View
                style={[
                  ordersStyles.progressDot,
                  { backgroundColor: dotColor, width: ms(24), height: ms(24), borderRadius: ms(12) },
                ]}
              >
                <Icon
                  name={done ? 'checkmark' : step.icon}
                  size={ms(13)}
                  color={done || isCurrent ? '#FFFFFF' : c.textGray}
                />
              </View>
              <View
                style={halfLine(
                  index === steps.length - 1 ? 'transparent' : reached(index + 1) ? sc.success : c.border,
                )}
              />
            </View>
            <Text
              style={[
                textStyles.kicker,
                { color: isCurrent ? sc.warning : c.textGray, fontSize: ms(9.5), textAlign: 'center' },
              ]}
              numberOfLines={1}
            >
              {step.label.toUpperCase()}
            </Text>
            <Text
              style={[
                textStyles.num,
                { color: time ? c.textDark : c.textLight, fontSize: ms(11.5), textAlign: 'center' },
              ]}
            >
              {time ? timeOf(time) : '--:--'}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// Tarjeta grande del pedido en curso: estado, progreso, tiempo y detalle.
const ActiveOrderCard = ({ order, colors: c, bandColor, ms }) => {
  const [open, setOpen] = useState(false);

  return (
    <View
      style={[
        ordersStyles.activeCard,
        { backgroundColor: c.surface, borderColor: c.primary, borderRadius: ms(18) },
      ]}
    >
      <View style={{ padding: ms(15), gap: ms(16) }}>
        {/* Código, estado, total y hora */}
        <View style={[ordersStyles.spaceBetween, { gap: ms(10) }]}>
          <View style={{ flex: 1, gap: ms(5) }}>
            <View style={[ordersStyles.row, { gap: ms(8), flexWrap: 'wrap' }]}>
              <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(17) }]}>
                {order.code}
              </Text>
              <StatusBadge status={order.status} ms={ms} />
            </View>
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}>
              {getOrderPlace(order)} · {countLabel(order.itemCount)}
            </Text>
            {order.payOnDelivery ? (
              <View style={[ordersStyles.row, { gap: ms(5) }]}>
                <Icon name={order.paymentMethod === 'cash' ? 'cash-outline' : 'card-outline'} size={ms(13)} color={sc.warning} />
                <Text style={[textStyles.bodyMedium, { color: c.textDark, fontSize: ms(12) }]}>
                  Pagas ${order.amountDue.toFixed(2)} {order.paymentMethod === 'cash' ? 'en efectivo' : 'con tarjeta'} al recibir
                </Text>
              </View>
            ) : null}
          </View>
          <View style={[ordersStyles.alignEnd, { gap: ms(3) }]}>
            <Text style={[textStyles.num, { color: c.primary, fontSize: ms(17) }]}>
              ${order.total.toFixed(2)}
            </Text>
            <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(9.5) }]}>
              {formatWhen(order.createdAt)}
            </Text>
          </View>
        </View>

        <OrderProgress order={order} colors={c} ms={ms} />
      </View>

      {/* Franja de tiempo. No hay estimado de entrega en el backend, así que
          se muestra lo que sí se sabe: cuánto lleva el pedido. */}
      <View
        style={[
          ordersStyles.band,
          { backgroundColor: bandColor, paddingHorizontal: ms(15), paddingVertical: ms(12), gap: ms(8) },
        ]}
      >
        <Icon name="time-outline" size={ms(16)} color={c.textGray} />
        <Text style={[textStyles.body, { flex: 1, color: c.textGray, fontSize: ms(12.5) }]}>
          {getBandText(order)}
        </Text>
        <Text style={[textStyles.num, { color: c.primary, fontSize: ms(15) }]}>
          {formatElapsed(order.createdAt)}
        </Text>
      </View>

      <View style={{ padding: ms(15), gap: ms(12) }}>
        {open ? (
          <View style={{ gap: ms(8) }}>
            {order.items.map((item, index) => (
              <View key={`${item.itemId}-${index}`} style={[ordersStyles.detailRow, { gap: ms(10) }]}>
                <Text style={[textStyles.num, { color: c.textGray, fontSize: ms(12.5) }]}>
                  {item.quantity}×
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[textStyles.body, { color: c.textDark, fontSize: ms(13) }]}>
                    {item.name}
                  </Text>
                  {item.notes ? (
                    <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(11.5) }]}>
                      {item.notes}
                    </Text>
                  ) : null}
                </View>
                <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(12.5) }]}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <TouchableOpacity
          onPress={() => setOpen((v) => !v)}
          activeOpacity={0.85}
          style={[
            ordersStyles.outlineButton,
            { borderColor: c.border, borderRadius: ms(14), height: ms(46), gap: ms(6) },
          ]}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
        >
          <Text style={[textStyles.title, { color: c.textGray, fontSize: ms(14) }]}>
            {open ? 'Ocultar detalle' : 'Ver detalle'}
          </Text>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={ms(15)} color={c.textGray} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Fila de un pedido terminado (entregado o cancelado).
// Los entregados se abren al tocarlos para ver a qué hora pasó cada paso.
const PastOrderRow = ({ order, colors: c, bandColor, ms, onRepeat, onRate }) => {
  const [open, setOpen] = useState(false);
  const cancelled = order.status === 'cancelled';
  const delivered = order.status === 'delivered';
  const canRepeat = order.items.some((item) => item.itemId);

  return (
    <TouchableOpacity
      onPress={() => setOpen((v) => !v)}
      disabled={!delivered}
      activeOpacity={0.85}
      style={{
        backgroundColor: c.surface,
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: ms(16),
        padding: ms(13),
        gap: ms(14),
      }}
      accessibilityRole={delivered ? 'button' : undefined}
      accessibilityState={delivered ? { expanded: open } : undefined}
      accessibilityHint={delivered ? 'Muestra la hora de cada paso del pedido' : undefined}
    >
      <View style={[ordersStyles.pastCard, { borderWidth: 0, gap: ms(12) }]}>
        <View
          style={[
            ordersStyles.pastIcon,
            { backgroundColor: bandColor, width: ms(40), height: ms(40), borderRadius: ms(10) },
          ]}
        >
          <Icon
            name={order.orderType === 'local' ? 'storefront-outline' : 'receipt-outline'}
            size={ms(18)}
            color={c.textGray}
          />
        </View>

        <View style={{ flex: 1, gap: ms(4) }}>
          <View style={[ordersStyles.row, { gap: ms(8), flexWrap: 'wrap' }]}>
            <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(14.5) }]}>
              {order.code}
            </Text>
            <StatusBadge status={order.status} ms={ms} />
          </View>
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]} numberOfLines={1}>
            {formatDay(order.createdAt)} · {getOrderPlace(order)} · {countLabel(order.itemCount)}
          </Text>
        </View>

        <View style={[ordersStyles.alignEnd, { gap: ms(4) }]}>
          <Text
            style={[
              textStyles.num,
              { color: cancelled ? c.textLight : c.textDark, fontSize: ms(14.5) },
            ]}
          >
            ${order.total.toFixed(2)}
          </Text>
          {canRepeat ? (
            <TouchableOpacity
              onPress={onRepeat}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={`Repetir pedido ${order.code}`}
            >
              <Text style={[textStyles.link, { color: c.primary, fontSize: ms(12.5) }]}>Repetir</Text>
            </TouchableOpacity>
          ) : null}
          {/* Entregado: calificarlo, o las estrellas que ya se le dieron */}
          {delivered && order.rating ? (
            <View style={[ordersStyles.row, { gap: ms(2) }]} accessibilityLabel={`Calificado con ${order.rating.stars} estrellas`}>
              {[1, 2, 3, 4, 5].map((v) => (
                <Icon key={v} name={v <= order.rating.stars ? 'star' : 'star-outline'} size={ms(11)} color="#F2A33A" />
              ))}
            </View>
          ) : delivered && onRate ? (
            <TouchableOpacity
              onPress={onRate}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={`Calificar pedido ${order.code}`}
            >
              <View style={[ordersStyles.row, { gap: ms(3) }]}>
                <Icon name="star-outline" size={ms(12.5)} color={c.primary} />
                <Text style={[textStyles.link, { color: c.primary, fontSize: ms(12.5) }]}>Calificar</Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {delivered && open ? <OrderProgress order={order} colors={c} ms={ms} /> : null}
    </TouchableOpacity>
  );
};

// Aviso centrado para estados vacíos o de error.
const Notice = ({ icon, title, text, actionLabel, onAction, colors: c, ms, compact }) => (
  <View
    style={[
      ordersStyles.centerBox,
      {
        paddingVertical: compact ? ms(26) : ms(56),
        paddingHorizontal: ms(20),
        gap: ms(8),
        marginTop: ms(16),
        borderRadius: ms(18),
        backgroundColor: compact ? c.surface : 'transparent',
        borderWidth: compact ? 1 : 0,
        borderColor: c.border,
      },
    ]}
  >
    <Icon name={icon} size={ms(compact ? 26 : 36)} color={c.textLight} />
    <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(15.5), textAlign: 'center' }]}>
      {title}
    </Text>
    <Text
      style={[
        textStyles.body,
        { color: c.textGray, fontSize: ms(12.5), lineHeight: ms(18), textAlign: 'center' },
      ]}
    >
      {text}
    </Text>
    {actionLabel && onAction ? (
      <TouchableOpacity
        onPress={onAction}
        style={{ marginTop: ms(6) }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
      >
        <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13.5) }]}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

// ── HELPERS ─────────────────────────────────────────────────────────────

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_LONG = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];

const pad = (n) => String(n).padStart(2, '0');
const timeOf = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// "HOY 18:24", "AYER 18:24" o "14 SEP 18:24".
const formatWhen = (date) => {
  if (!date) return '';
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, now)) return `HOY ${timeOf(date)}`;
  if (isSameDay(date, yesterday)) return `AYER ${timeOf(date)}`;
  return `${date.getDate()} ${MONTHS[date.getMonth()].toUpperCase()} ${timeOf(date)}`;
};

// "14 sep" para la lista de anteriores.
const formatDay = (date) => (date ? `${date.getDate()} ${MONTHS[date.getMonth()]}` : '');

// Tiempo transcurrido desde que se hizo el pedido: "9 min" o "1 h 5 min".
const formatElapsed = (date) => {
  if (!date) return '';
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
};

const countLabel = (n) => `${n} ${n === 1 ? 'producto' : 'productos'}`;

const getOrderPlace = (order) => {
  if (order.orderType === 'local') {
    return order.tableNumber != null ? `Mesa ${order.tableNumber}` : 'En el local';
  }
  if (order.fulfillment === 'dine_in') {
    const table = order.tableNumber ?? order.reservation?.table?.number;
    return table != null ? `Comer en el local · Mesa ${table}` : 'Comer en el local';
  }
  return order.isDelivery ? 'A domicilio' : 'Para recoger';
};

const getBandText = (order) => {
  if (order.status === 'atrasado') return 'Está tardando un poco más. Lleva';
  if (order.status === 'ready') {
    if (order.orderType === 'local' || order.fulfillment === 'dine_in') return 'Listo, va en camino a tu mesa. Lleva';
    return order.isDelivery ? 'Listo, saliendo a tu domicilio. Lleva' : 'Listo para que pases por él. Lleva';
  }
  if (order.status === 'preparing') return 'En cocina. Tu pedido lleva';
  return 'Pedido recibido hace';
};

// Agrupa el historial por mes ("SEPTIEMBRE 2026"), del más reciente al más
// antiguo. Los pedidos ya vienen ordenados así del backend.
const groupByMonth = (orders) => {
  const groups = [];
  for (const order of orders) {
    const d = order.createdAt;
    const key = d ? `${d.getFullYear()}-${d.getMonth()}` : 'sin-fecha';
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = {
        key,
        label: d ? `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}` : 'SIN FECHA',
        orders: [],
      };
      groups.push(group);
    }
    group.orders.push(order);
  }
  return groups;
};

export default OrdersScreen;
