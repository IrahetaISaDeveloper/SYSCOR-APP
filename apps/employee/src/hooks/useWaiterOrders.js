import { useState, useCallback, useMemo, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@syscor/shared/src/context/AuthContext";
import { fetchWaiterDashboard } from "../services/waiterDashboardApi";
import useOrderActions from "./useOrderActions";

const POLL_INTERVAL_MS = 15000;

// Cocina incluye los 2º tiempos en espera: siguen sin servirse.
export const ORDER_FILTERS = [
  { key: "all", label: "Todas" },
  { key: "kitchen", label: "Cocina", statuses: ["pending", "preparing", "atrasado"] },
  { key: "ready", label: "Listas", statuses: ["ready"] },
  { key: "delivered", label: "Servidas", statuses: ["delivered"] },
];

// "Todas": las de cualquier mesero (cualquiera puede llevar una comanda
// lista). "Mías": las que tomé o las que dije que llevo.
export const ORDER_SCOPES = [
  { key: "all", label: "Todas las comandas" },
  { key: "mine", label: "Mías" },
];

export default function useWaiterOrders() {
  const { user } = useAuth();
  const myId = user?.id || user?._id || null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [scope, setScope] = useState("all");

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
            tableFloor: table.floor || 1,
            customerName: order.customerName || table.customerName || null,
          }))
        )
        .sort((a, b) => new Date(b.firedAt || b.createdAt) - new Date(a.firedAt || a.createdAt));
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

  const reloadSilently = useCallback(() => loadOrders({ silent: true }), [loadOrders]);
  const actions = useOrderActions(reloadSilently);

  const inScope = useMemo(() => {
    if (scope !== "mine" || !myId) return orders;
    return orders.filter(
      (o) => String(o.waiterId) === String(myId) || String(o.servingBy?.id) === String(myId)
    );
  }, [orders, scope, myId]);

  const counts = useMemo(() => {
    const result = {};
    for (const filter of ORDER_FILTERS) {
      result[filter.key] = filter.statuses
        ? inScope.filter((o) => filter.statuses.includes(o.status)).length
        : inScope.length;
    }
    return result;
  }, [inScope]);

  const filteredOrders = useMemo(() => {
    const filter = ORDER_FILTERS.find((f) => f.key === activeFilter);
    if (!filter?.statuses) return inScope;
    return inScope.filter((o) => filter.statuses.includes(o.status));
  }, [inScope, activeFilter]);

  return {
    myId,
    orders: filteredOrders,
    counts,
    loading,
    refreshing,
    error,
    onRefresh,
    activeFilter,
    setActiveFilter,
    scope,
    setScope,
    actions,
  };
}
