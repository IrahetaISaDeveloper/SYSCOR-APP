import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getMyOrders } from '../services/api';

// Estados en los que el pedido todavía no termina.
const ACTIVE_STATUSES = ['pending', 'preparing', 'ready', 'atrasado'];

// Pedidos del cliente para la pantalla "Mis pedidos".
//
// Se vuelve a consultar cada vez que la pestaña gana el foco: el estado de un
// pedido cambia en cocina y el cliente espera verlo al entrar.
const useMyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const hasLoaded = useRef(false);

  // `indicator`: 'full' tapa la pantalla con el cargando (primera vez),
  // 'pull' muestra el de "jalar para refrescar" y 'none' actualiza en silencio.
  const fetchOrders = useCallback(async (indicator = 'full') => {
    if (indicator === 'full') setIsLoading(true);
    if (indicator === 'pull') setIsRefreshing(true);
    setError(null);

    const res = await getMyOrders();

    if (res.success) {
      setOrders((res.data || []).map(normalizeOrder));
      hasLoaded.current = true;
    } else {
      setError(res.error || 'No se pudieron cargar tus pedidos.');
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Al volver a la pestaña no se tapa la lista con el indicador de carga.
      fetchOrders(hasLoaded.current ? 'none' : 'full');
    }, [fetchOrders]),
  );

  const activeOrders = useMemo(() => orders.filter((o) => o.isActive), [orders]);
  const pastOrders = useMemo(() => orders.filter((o) => !o.isActive), [orders]);

  return {
    orders,
    activeOrders,
    pastOrders,
    isLoading,
    isRefreshing,
    error,
    refetch: () => fetchOrders('pull'),
  };
};

// ── Helpers ───────────────────────────────────────────────────────

// A qué hora entró el pedido a cada estado, sacado de `statusHistory`. Se
// toma la primera vez que pasó por cada uno. "Recibido" cae en createdAt si
// el historial no lo trae (pedidos viejos).
const getStatusTimes = (raw) => {
  const times = { pending: null, preparing: null, ready: null, delivered: null };
  for (const entry of raw.statusHistory || []) {
    if (!(entry?.status in times) || times[entry.status] || !entry.changedAt) continue;
    const date = new Date(entry.changedAt);
    if (!Number.isNaN(date.getTime())) times[entry.status] = date;
  }
  if (!times.pending && raw.createdAt) times.pending = new Date(raw.createdAt);
  return times;
};

const normalizeOrder = (raw) => {
  const id = String(raw._id?.$oid || raw._id || raw.id || '');
  const items = (raw.items || []).map((item) => ({
    itemType: item.itemType,
    itemId: String(item.itemId?.$oid || item.itemId || ''),
    name: item.name || 'Producto',
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    notes: item.notes || '',
  }));

  return {
    id,
    // Código de orden del backend ("AD27-01"): el mismo que ven el panel y
    // Panchita. El recorte del id es solo por si el pedido aún no lo trae.
    code: raw.code || id.slice(-6).toUpperCase(),
    orderType: raw.orderType === 'local' ? 'local' : 'online',
    tableNumber: raw.table?.number ?? null,
    isDelivery: !!raw.isDelivery,
    // 'delivery', 'pickup' o 'dine_in' (los pedidos viejos no lo traen).
    fulfillment: raw.fulfillment || (raw.isDelivery ? 'delivery' : 'pickup'),
    // Mesa reservada de un pedido para comer en el local.
    reservation: raw.reservation
      ? {
          id: String(raw.reservation.id || raw.reservation._id || ''),
          status: raw.reservation.status,
          reservedFor: raw.reservation.reservedFor ? new Date(raw.reservation.reservedFor) : null,
          expiresAt: raw.reservation.expiresAt ? new Date(raw.reservation.expiresAt) : null,
          partySize: raw.reservation.partySize,
          table: raw.reservation.table || null,
        }
      : null,
    status: raw.status || 'pending',
    isActive: ACTIVE_STATUSES.includes(raw.status),
    total: Number(raw.total) || 0,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: raw.createdAt ? new Date(raw.createdAt) : null,
    statusTimes: getStatusTimes(raw),
    // Hasta cuándo se puede cancelar desde la app (null = ya no se puede).
    // Se puede cancelar mientras siga "Recibido": en cuanto pasa a cocina, ya no.
    canCancel: !!raw.canCancel,
    // "Agregar más productos": { active, until } y si todavía se puede.
    hold: {
      active: !!raw.hold?.active,
      until: raw.hold?.until ? new Date(raw.hold.until) : null,
    },
    canHold: !!raw.canHold,
    cancelledByCustomer: raw.cancellation?.by === 'customer',
    // Pago al recibir: 'cash' o 'card_on_delivery' con paymentStatus 'pending'.
    paymentMethod: raw.paymentMethod || null,
    payOnDelivery: ['cash', 'card_on_delivery'].includes(raw.paymentMethod) && raw.paymentStatus !== 'paid',
    // Lo que falta pagar al recibir (el total menos lo cubierto con saldo).
    amountDue: Math.max(0, (Number(raw.total) || 0) - (Number(raw.payment?.creditApplied) || 0)),
    // Calificación del cliente (null = todavía no la deja).
    rating: raw.rating?.stars
      ? { stars: raw.rating.stars, tags: raw.rating.tags || [], comment: raw.rating.comment || '' }
      : null,
  };
};

export default useMyOrders;
