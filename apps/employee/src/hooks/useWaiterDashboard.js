import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { AppAlert } from "@syscor/shared/src/components/commons/AppAlert";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { useLiveRefresh } from "@syscor/shared/src/realtime/RealtimeProvider";
import { EVENTS, ORDER_EVENTS, TABLE_EVENTS } from "@syscor/shared/src/realtime/events";
import {
  fetchWaiterDashboard,
  updateTableStatus,
  checkoutTable,
  fetchCashierStatus,
  requestTableBill,
} from "../services/waiterDashboardApi";

const POLL_INTERVAL_MS = 15000;

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

export default function useWaiterDashboard() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [selectedTableId, setSelectedTableId] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [busy, setBusy] = useState(false);
  // Con un turno de caja abierto, "Cobrar la cuenta" pasa a "Enviar a caja"
  const [cashierOpen, setCashierOpen] = useState(false);

  const firstLoadRef = useRef(true);
  const isFocused = useIsFocused();

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const [data, cashier] = await Promise.all([
        fetchWaiterDashboard(),
        // Si la consulta de caja falla, se asume cerrada: el servidor igual
        // rechaza el cobro si estuviera abierta.
        fetchCashierStatus().catch(() => false),
      ]);
      setTables(data);
      setCashierOpen(cashier);
      setError(null);
    } catch (err) {
      console.error("useWaiterDashboard.loadDashboard:", err);
      setError("No se pudo cargar el mapa de mesas");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard({ silent: !firstLoadRef.current });
      firstLoadRef.current = false;
    }, [loadDashboard])
  );

  // Tiempo real: el servidor avisa de mesas, comandas y turno de caja y se recarga al instante. Sin
  // conexión, se vuelve a preguntar cada POLL_INTERVAL_MS como antes.
  useLiveRefresh([...TABLE_EVENTS, ...ORDER_EVENTS, EVENTS.CASHIER_STATUS_CHANGED], () => loadDashboard({ silent: true }), {
    enabled: isFocused,
    offlineMs: POLL_INTERVAL_MS,
  });

  // La comanda se mandó desde el menú y el servidor ya ocupó la mesa: se
  // pinta ocupada al instante, sin esperar la recarga.
  const markOccupied = useCallback(
    (tableId) => {
      setTables((prev) => prev.map((t) => (t._id === tableId ? { ...t, status: "ocupada" } : t)));
      loadDashboard({ silent: true });
    },
    [loadDashboard]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard({ silent: true });
    setRefreshing(false);
  }, [loadDashboard]);

  const selectedTable = useMemo(
    () => tables.find((t) => t._id === selectedTableId) || null,
    [tables, selectedTableId]
  );

  useEffect(() => {
    if (activeSheet && selectedTableId && !selectedTable && !loading) setActiveSheet(null);
  }, [activeSheet, selectedTableId, selectedTable, loading]);

  const openTable = useCallback((table) => {
    setSelectedTableId(table._id);
    setActiveSheet("actions");
  }, []);

  const closeSheet = useCallback(() => setActiveSheet(null), []);
  const openCharge = useCallback(() => setActiveSheet("charge"), []);
  const backToActions = useCallback(() => setActiveSheet("actions"), []);

  const changeTableStatus = useCallback(
    async (status, fallbackMessage) => {
      if (!selectedTable) return;
      setBusy(true);
      try {
        await updateTableStatus(selectedTable._id, status);
        setActiveSheet(null);
        await loadDashboard({ silent: true });
      } catch (err) {
        console.error("useWaiterDashboard.changeTableStatus:", err);
        AppAlert.alert("Error", errorMessage(err, fallbackMessage));
      } finally {
        setBusy(false);
      }
    },
    [selectedTable, loadDashboard]
  );

  // El cliente se fue: la mesa queda Disponible de inmediato.
  const clientLeft = useCallback(() => {
    if (!selectedTable) return;
    const pendingInKitchen = (selectedTable.activeOrders || []).some((o) => o.status !== "delivered");
    const message = pendingInKitchen
      ? `La Mesa ${selectedTable.number} tiene comandas sin cobrar. Si la liberas se cancelarán las que sigan en cocina.`
      : `La Mesa ${selectedTable.number} quedará disponible.`;

    AppAlert.alert("Cliente se retiró", message, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Liberar mesa",
        style: "destructive",
        onPress: () => changeTableStatus("libre", "No se pudo liberar la mesa."),
      },
    ]);
  }, [selectedTable, changeTableStatus]);

  const chargeTable = useCallback(
    async (paymentMethod) => {
      if (!selectedTable) return;
      setBusy(true);
      try {
        const response = await checkoutTable(selectedTable._id, paymentMethod);
        const total = Number(response?.data?.total || 0);
        const tableNumber = selectedTable.number;
        setActiveSheet("actions");
        await loadDashboard({ silent: true });

        AppAlert.alert(
          "Cuenta cobrada",
          `Mesa ${tableNumber} · $${total.toFixed(2)} ${paymentMethod === "card" ? "con tarjeta" : "en efectivo"}.`,
          [
            { text: "Mantener ocupada", style: "cancel" },
            {
              text: "Liberar mesa",
              onPress: () => changeTableStatus("libre", "No se pudo liberar la mesa."),
            },
          ]
        );
      } catch (err) {
        console.error("useWaiterDashboard.chargeTable:", err);
        // La caja abrió turno mientras tanto: la cuenta se manda a caja
        if (err?.response?.data?.code === "CASHIER_OPEN") {
          setCashierOpen(true);
          setActiveSheet("actions");
        }
        AppAlert.alert(
          err?.response?.data?.title || "Error",
          errorMessage(err, "No se pudo cobrar la cuenta. Intenta de nuevo.")
        );
      } finally {
        setBusy(false);
      }
    },
    [selectedTable, loadDashboard, changeTableStatus]
  );

  // "Enviar a caja": la caja resalta la cuenta de esta mesa para cobrarla
  const sendToCashier = useCallback(async () => {
    if (!selectedTable) return;
    setBusy(true);
    try {
      const response = await requestTableBill(selectedTable._id);
      const total = Number(response?.data?.total || 0);
      await loadDashboard({ silent: true });
      AppAlert.alert(
        "Cuenta enviada a caja",
        `Mesa ${selectedTable.number} · $${total.toFixed(2)}. El cliente paga en caja; la mesa se libera al cobrar.`
      );
    } catch (err) {
      console.error("useWaiterDashboard.sendToCashier:", err);
      AppAlert.alert("Error", errorMessage(err, "No se pudo enviar la cuenta a caja."));
    } finally {
      setBusy(false);
    }
  }, [selectedTable, loadDashboard]);

  // Recarga sin indicador (después de servir, marchar o "yo la llevo").
  const reload = useCallback(() => loadDashboard({ silent: true }), [loadDashboard]);

  return {
    reload,
    markOccupied,
    tables,
    loading,
    refreshing,
    error,
    onRefresh,

    selectedTable,
    activeSheet,
    busy,

    openTable,
    closeSheet,
    openCharge,
    backToActions,

    clientLeft,
    chargeTable,
    cashierOpen,
    sendToCashier,
  };
}
