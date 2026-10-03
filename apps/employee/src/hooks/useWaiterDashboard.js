import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  fetchWaiterDashboard,
  updateTableStatus,
  checkoutTable,
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

  const firstLoadRef = useRef(true);

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchWaiterDashboard();
      setTables(data);
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
      const interval = setInterval(() => loadDashboard({ silent: true }), POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }, [loadDashboard])
  );

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
        Alert.alert("Error", errorMessage(err, fallbackMessage));
      } finally {
        setBusy(false);
      }
    },
    [selectedTable, loadDashboard]
  );

  const sendTableToCleaning = useCallback(() => {
    if (!selectedTable) return;
    const pendingInKitchen = (selectedTable.activeOrders || []).some((o) => o.status !== "delivered");
    const message = pendingInKitchen
      ? `La Mesa ${selectedTable.number} tiene comandas sin cobrar. Si pasa a limpieza se cancelarán las que sigan en cocina.`
      : `La Mesa ${selectedTable.number} pasará a limpieza.`;

    Alert.alert("Cliente se retiró", message, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Pasar a limpieza",
        style: "destructive",
        onPress: () => changeTableStatus("limpieza", "No se pudo pasar la mesa a limpieza."),
      },
    ]);
  }, [selectedTable, changeTableStatus]);

  const freeTable = useCallback(
    () => changeTableStatus("libre", "No se pudo marcar la mesa como libre."),
    [changeTableStatus]
  );

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

        Alert.alert(
          "Cuenta cobrada",
          `Mesa ${tableNumber} · $${total.toFixed(2)} ${paymentMethod === "card" ? "con tarjeta" : "en efectivo"}.`,
          [
            { text: "Mantener ocupada", style: "cancel" },
            {
              text: "Pasar a limpieza",
              onPress: () => changeTableStatus("limpieza", "No se pudo pasar la mesa a limpieza."),
            },
          ]
        );
      } catch (err) {
        console.error("useWaiterDashboard.chargeTable:", err);
        Alert.alert("Error", errorMessage(err, "No se pudo cobrar la cuenta. Intenta de nuevo."));
      } finally {
        setBusy(false);
      }
    },
    [selectedTable, loadDashboard, changeTableStatus]
  );

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

    sendTableToCleaning,
    freeTable,
    chargeTable,
  };
}
