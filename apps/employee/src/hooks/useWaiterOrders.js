import { useState, useCallback, useMemo, useRef } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { fetchWaiterDashboard, updateOrderStatus } from "../services/waiterDashboardApi";

const POLL_INTERVAL_MS = 15000;

export const ORDER_FILTERS = [
  { key: "all", label: "TODAS" },
  { key: "kitchen", label: "EN COCINA", statuses: ["pending", "preparing", "atrasado"] },
  { key: "ready", label: "LISTAS", statuses: ["ready"] },
  { key: "delivered", label: "SERVIDAS", statuses: ["delivered"] },
];

export default function useWaiterOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const firstLoadRef = useRef(true);

  const loadOrders = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const tables = await fetchWaiterDashboard();
      const flattened = tables
        .flatMap((table) =>
          (table.activeOrders || []).map((order) => ({
            ...order,
            tableId: table._id,
            tableNumber: table.number,
            customerName: order.customerName || table.customerName || null,
          }))
        )
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setOrders(flattened);
      setError(null);
    } catch (err) {
      console.error("useWaiterOrders.loadOrders:", err);
      setError("No se pudieron cargar las comandas");
    } finally {
      if (!silent) setLoading(false);
    }
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

  const counts = useMemo(() => {
    const result = {};
    for (const filter of ORDER_FILTERS) {
      result[filter.key] = filter.statuses
        ? orders.filter((o) => filter.statuses.includes(o.status)).length
        : orders.length;
    }
    return result;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const filter = ORDER_FILTERS.find((f) => f.key === activeFilter);
    if (!filter?.statuses) return orders;
    return orders.filter((o) => filter.statuses.includes(o.status));
  }, [orders, activeFilter]);

  const markDelivered = useCallback(
    async (orderId) => {
      setUpdatingId(orderId);
      try {
        await updateOrderStatus(orderId, "delivered");
        await loadOrders({ silent: true });
      } catch (err) {
        console.error("useWaiterOrders.markDelivered:", err);
        Alert.alert("Error", err?.response?.data?.message || "No se pudo marcar la comanda como servida.");
      } finally {
        setUpdatingId(null);
      }
    },
    [loadOrders]
  );

  return {
    orders: filteredOrders,
    counts,
    loading,
    refreshing,
    error,
    onRefresh,
    activeFilter,
    setActiveFilter,
    updatingId,
    markDelivered,
  };
}
