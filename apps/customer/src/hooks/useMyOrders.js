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
    // El backend no tiene número de pedido; los últimos caracteres del ID
    // bastan para que cliente y mesero hablen del mismo pedido.
    code: `#${id.slice(-5).toUpperCase()}`,
    orderType: raw.orderType === 'local' ? 'local' : 'online',
    tableNumber: raw.table?.number ?? null,
    isDelivery: !!raw.isDelivery,
    status: raw.status || 'pending',
    isActive: ACTIVE_STATUSES.includes(raw.status),
    total: Number(raw.total) || 0,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: raw.createdAt ? new Date(raw.createdAt) : null,
    // Hasta cuándo se puede cancelar desde la app (null = ya no se puede).
    cancelDeadline: raw.cancelDeadline ? new Date(raw.cancelDeadline) : null,
    cancelledByCustomer: raw.cancellation?.by === 'customer',
  };
};

export default useMyOrders;
