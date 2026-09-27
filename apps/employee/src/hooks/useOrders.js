import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchCartOrders,
  fetchKitchenOrders,
  updateCartOrderStatus,
  updateApiOrderStatusRequest,
} from '../services/kitchenOrdersApi';
import { mapApiOrder, mapCart, CART_BACKEND_STATUS } from '../utils/kitchenOrderMapper';
import { ACTIVE_KITCHEN_STATUSES, KITCHEN_FILTERS } from '../constants/kitchenStatus';

const POLL_INTERVAL_MS = 15000;

const NEXT_STATUS = {
  pending: 'preparing',
  preparing: 'ready',
  late: 'ready',
};

const isActive = (order) => ACTIVE_KITCHEN_STATUSES.includes(order.status);

const byKitchenPriority = (a, b) => {
  if (isActive(a) !== isActive(b)) return isActive(a) ? -1 : 1;
  const diff = new Date(a.createdAt) - new Date(b.createdAt);
  return isActive(a) ? diff : -diff;
};

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [seenPendingIds, setSeenPendingIds] = useState(null);

  const firstLoadRef = useRef(true);

  const loadOrders = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true);
    const [apiResult, cartResult] = await Promise.allSettled([fetchKitchenOrders(), fetchCartOrders()]);

    if (apiResult.status === 'rejected' && cartResult.status === 'rejected') {
      console.error('[useOrders] Error cargando comandas:', apiResult.reason);
      setError('No se pudieron cargar las comandas. Verifica tu conexión.');
      if (!silent) setIsLoading(false);
      return;
    }

    const apiOrders = apiResult.status === 'fulfilled' ? apiResult.value.map(mapApiOrder) : [];
    const cartOrders = cartResult.status === 'fulfilled' ? cartResult.value.map(mapCart) : [];

    const all = [...apiOrders, ...cartOrders]
      .filter((o) => o && o.items.length > 0)
      .sort(byKitchenPriority);

    setOrders(all);
    setSeenPendingIds((prev) => prev ?? new Set(all.filter((o) => o.status === 'pending').map((o) => o.id)));
    setError(null);
    if (!silent) setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders({ silent: !firstLoadRef.current });
      firstLoadRef.current = false;
      const interval = setInterval(() => loadOrders({ silent: true }), POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }, [loadOrders])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders({ silent: true });
    setRefreshing(false);
  }, [loadOrders]);

  const changeStatus = useCallback(
    async (order, nextStatus) => {
      setUpdatingId(order.id);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)).sort(byKitchenPriority));

      try {
        if (order.source === 'cart') {
          await updateCartOrderStatus(order.id, CART_BACKEND_STATUS[nextStatus] || nextStatus);
        } else {
          await updateApiOrderStatusRequest(order.id, nextStatus);
        }
      } catch (err) {
        console.error('[useOrders] Error actualizando comanda:', err);
        Alert.alert('Error', 'No se pudo actualizar la comanda. Intenta de nuevo.');
      } finally {
        setUpdatingId(null);
        loadOrders({ silent: true });
      }
    },
    [loadOrders]
  );

  const advanceOrder = useCallback(
    (order) => {
      const next = NEXT_STATUS[order.status];
      if (next) changeStatus(order, next);
    },
    [changeStatus]
  );

  const resumeOrder = useCallback((order) => changeStatus(order, 'preparing'), [changeStatus]);

  const counts = useMemo(() => {
    const result = { active: orders.filter(isActive).length };
    for (const filter of KITCHEN_FILTERS) {
      result[filter.key] = filter.key === 'all' ? orders.length : orders.filter((o) => o.status === filter.key).length;
    }
    return result;
  }, [orders]);

  const filteredOrders = useMemo(
    () => (activeFilter === 'all' ? orders : orders.filter((o) => o.status === activeFilter)),
    [orders, activeFilter]
  );

  const newPendingCount = useMemo(() => {
    if (!seenPendingIds) return 0;
    return orders.filter((o) => o.status === 'pending' && !seenPendingIds.has(o.id)).length;
  }, [orders, seenPendingIds]);

  const acknowledgeNewOrders = useCallback(() => {
    setSeenPendingIds(new Set(orders.filter((o) => o.status === 'pending').map((o) => o.id)));
    setActiveFilter('pending');
  }, [orders]);

  return {
    orders: filteredOrders,
    counts,
    activeFilter,
    setActiveFilter,
    isLoading,
    refreshing,
    error,
    onRefresh,
    reload: loadOrders,
    updatingId,
    advanceOrder,
    resumeOrder,
    newPendingCount,
    acknowledgeNewOrders,
  };
};

export default useOrders;
