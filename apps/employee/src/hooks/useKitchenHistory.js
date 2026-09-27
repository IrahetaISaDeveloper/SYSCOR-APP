import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchCartOrders, fetchKitchenFinishedOrders } from '../services/kitchenOrdersApi';
import { mapApiOrder, mapCart } from '../utils/kitchenOrderMapper';

const POLL_INTERVAL_MS = 30000;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function useKitchenHistory() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const firstLoadRef = useRef(true);

  const loadHistory = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true);
    const since = startOfToday();
    const [apiResult, cartResult] = await Promise.allSettled([fetchKitchenFinishedOrders(since), fetchCartOrders()]);

    if (apiResult.status === 'rejected' && cartResult.status === 'rejected') {
      console.error('[useKitchenHistory] Error cargando historial:', apiResult.reason);
      setError('No se pudo cargar el historial. Verifica tu conexión.');
      if (!silent) setIsLoading(false);
      return;
    }

    const apiOrders = apiResult.status === 'fulfilled' ? apiResult.value.map(mapApiOrder) : [];
    const cartOrders =
      cartResult.status === 'fulfilled'
        ? cartResult.value.filter((c) => new Date(c.createdAt) >= since).map(mapCart)
        : [];

    const finished = [...apiOrders, ...cartOrders]
      .filter((o) => o && (o.status === 'ready' || o.status === 'delivered') && o.items.length > 0)
      .sort((a, b) => new Date(b.readyAt || b.createdAt) - new Date(a.readyAt || a.createdAt));

    setOrders(finished);
    setError(null);
    if (!silent) setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory({ silent: !firstLoadRef.current });
      firstLoadRef.current = false;
      const interval = setInterval(() => loadHistory({ silent: true }), POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }, [loadHistory])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory({ silent: true });
    setRefreshing(false);
  }, [loadHistory]);

  const stats = useMemo(() => {
    const timed = orders.filter((o) => typeof o.prepMinutes === 'number');
    const average = timed.length
      ? Math.round(timed.reduce((sum, o) => sum + o.prepMinutes, 0) / timed.length)
      : null;
    return {
      total: orders.length,
      waiting: orders.filter((o) => o.status === 'ready').length,
      averagePrep: average,
    };
  }, [orders]);

  return { orders, stats, isLoading, refreshing, error, onRefresh, reload: loadHistory };
}
