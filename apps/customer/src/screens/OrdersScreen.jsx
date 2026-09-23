import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { getMenuColors } from '../styles/CustomerMenu';
import ordersStyles, { orderStatusColors as sc, getOrderBandColor } from '../styles/Orders';
import useMyOrders from '../hooks/useMyOrders';
import { useCart } from '../context/CartContext';
import { useTabBarVisibility } from '../context/TabBarVisibilityContext';

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

// El último paso cambia según cómo llega el pedido al cliente.
const getSteps = (order) => {
  const last =
    order.orderType === 'local'
      ? { label: 'En mesa', icon: 'restaurant-outline' }
      : order.isDelivery
        ? { label: 'En camino', icon: 'bicycle-outline' }
        : { label: 'Para recoger', icon: 'bag-handle-outline' };
  return [
    { label: 'Recibida', icon: 'receipt-outline' },
    { label: 'En cocina', icon: 'flame-outline' },
    last,
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
const OrdersScreen = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const bandColor = getOrderBandColor(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState('current');
  const [typeFilter, setTypeFilter] = useState('all');

  const { orders, isLoading, isRefreshing, error, refetch } = useMyOrders();
  const { addItem } = useCart();
  const { handleScroll, reset: resetTabBar } = useTabBarVisibility();

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
          <TouchableOpacity
            onPress={() => setTab('history')}
            style={[
              ordersStyles.roundButton,
              {
                backgroundColor: c.surface,
                borderColor: c.border,
                width: ms(44),
                height: ms(44),
                borderRadius: ms(22),
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Ver historial de pedidos"
          >
            <Icon name="receipt-outline" size={ms(19)} color={c.textDark} />
          </TouchableOpacity>
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
                  <ActiveOrderCard
                    key={order.id}
                    order={order}
                    colors={c}
                    bandColor={bandColor}
                    ms={ms}
                  />
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
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
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

// Tarjeta grande del pedido en curso: estado, progreso, tiempo y detalle.
const ActiveOrderCard = ({ order, colors: c, bandColor, ms }) => {
  const [open, setOpen] = useState(false);
  const steps = getSteps(order);
  const current = STEP_BY_STATUS[order.status] ?? 0;

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

        {/* Progreso */}
        <View style={{ gap: ms(8) }}>
          <View style={ordersStyles.progressTrack}>
            {steps.map((step, index) => {
              const done = index < current;
              const isCurrent = index === current;
              const dotColor = done ? sc.success : isCurrent ? sc.warning : c.surfaceMuted;
              return (
                <React.Fragment key={step.label}>
                  <View
                    style={[
                      ordersStyles.progressDot,
                      {
                        backgroundColor: dotColor,
                        width: ms(24),
                        height: ms(24),
                        borderRadius: ms(12),
                      },
                    ]}
                  >
                    <Icon
                      name={done ? 'checkmark' : step.icon}
                      size={ms(13)}
                      color={done || isCurrent ? '#FFFFFF' : c.textGray}
                    />
                  </View>
                  {index < steps.length - 1 ? (
                    <View
                      style={[
                        ordersStyles.progressLine,
                        {
                          height: ms(3),
                          backgroundColor: index < current ? sc.success : c.border,
                        },
                      ]}
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
          </View>
          <View style={ordersStyles.progressLabels}>
            {steps.map((step, index) => (
              <Text
                key={step.label}
                style={[
                  textStyles.kicker,
                  {
                    color: index === current ? sc.warning : c.textGray,
                    fontSize: ms(9.5),
                    textAlign: index === 0 ? 'left' : index === steps.length - 1 ? 'right' : 'center',
                  },
                ]}
              >
                {step.label.toUpperCase()}
              </Text>
            ))}
          </View>
        </View>
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
const PastOrderRow = ({ order, colors: c, bandColor, ms, onRepeat }) => {
  const cancelled = order.status === 'cancelled';
  const canRepeat = order.items.some((item) => item.itemId);

  return (
    <View
      style={[
        ordersStyles.pastCard,
        {
          backgroundColor: c.surface,
          borderColor: c.border,
          borderRadius: ms(16),
          padding: ms(13),
          gap: ms(12),
        },
      ]}
    >
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
      </View>
    </View>
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
  return order.isDelivery ? 'A domicilio' : 'Para recoger';
};

const getBandText = (order) => {
  if (order.status === 'atrasado') return 'Está tardando un poco más. Lleva';
  if (order.status === 'ready') {
    if (order.orderType === 'local') return 'Listo, va en camino a tu mesa. Lleva';
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
