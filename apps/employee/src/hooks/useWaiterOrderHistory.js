import { useState, useCallback, useMemo, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@syscor/shared/src/context/AuthContext";
import { fetchApiOrders } from "../services/kitchenOrdersApi";

const POLL_INTERVAL_MS = 30000;

// Cuánto hacia atrás se ve el historial.
export const HISTORY_RANGES = [
  { key: "today", label: "Hoy", days: 0 },
  { key: "week", label: "7 días", days: 6 },
];

const sinceDays = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
};

const idOf = (ref) => (ref && typeof ref === "object" ? ref._id || ref.id : ref) || null;

const fullName = (person) =>
  person && typeof person === "object" ? [person.name, person.lastname].filter(Boolean).join(" ") : person || "";

// Pasa la comanda del listado general de `/orders` a la forma que usa OrderCard
// (la del tablero del mesero).
const toCardOrder = (order) => ({
  ...order,
  tableId: idOf(order.table),
  tableNumber: order.table?.number ?? "–",
  tableFloor: order.table?.floor || 1,
  waiterId: idOf(order.waiter),
  waiter: fullName(order.waiter),
  customerName: order.customerName || order.localCustomerName || null,
});

// Comandas de mesa ya cerradas (servidas o canceladas) de todo el restaurante.
export default function useWaiterOrderHistory() {
  const { user } = useAuth();
  const myId = user?.id || user?._id || null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("today");

  const firstLoadRef = useRef(true);

  const loadHistory = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) setLoading(true);
        const days = HISTORY_RANGES.find((r) => r.key === range)?.days ?? 0;
        const data = await fetchApiOrders({ status: "delivered,cancelled", from: sinceDays(days).toISOString() });
        const closed = data
          .filter((o) => o.orderType !== "online" && o.table)
          .map(toCardOrder)
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
        setOrders(closed);
        setError(null);
      } catch (err) {
        console.error("useWaiterOrderHistory.loadHistory:", err);
        setError("No se pudo cargar el historial");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [range]
  );

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

  const stats = useMemo(
    () => ({
      served: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    }),
    [orders]
  );

  return { myId, orders, stats, loading, refreshing, error, onRefresh, range, setRange };
}
