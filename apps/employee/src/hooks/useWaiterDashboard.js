import { useState, useEffect, useCallback, useRef } from "react";
import { Alert } from "react-native";
import {
  fetchWaiterDashboard,
  fetchMenu,
  updateTableStatus,
  createOrder,
} from "../services/waiterDashboardApi";

const POLL_INTERVAL_MS = 15000;

export default function useWaiterDashboard() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [menu, setMenu] = useState({ combos: [], drinks: [], extras: [] });
  const [menuLoading, setMenuLoading] = useState(false);

  const [selectedTable, setSelectedTable] = useState(null);
  const [isActionsModalVisible, setActionsModalVisible] = useState(false);
  const [isAssignModalVisible, setAssignModalVisible] = useState(false);
  const [isOrderModalVisible, setOrderModalVisible] = useState(false);

  const pollRef = useRef(null);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard({ silent: true });
    setRefreshing(false);
  }, [loadDashboard]);

  useEffect(() => {
    loadDashboard();
    pollRef.current = setInterval(() => loadDashboard({ silent: true }), POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [loadDashboard]);

  // ---- Selección de mesa / navegación entre modales ----

  const openTable = useCallback((table) => {
  console.log('🪑 Mesa seleccionada:', table.number, '| status:', JSON.stringify(table.status));
  setSelectedTable(table);
  if (table.status === "libre" || table.status === "reservada") {
    setAssignModalVisible(true);
  } else {
    setActionsModalVisible(true);
  }
}, []);

  const closeAllModals = useCallback(() => {
    setActionsModalVisible(false);
    setAssignModalVisible(false);
    setOrderModalVisible(false);
  }, []);

  const openOrderModal = useCallback(async () => {
    setActionsModalVisible(false);
    if (menu.combos.length === 0 && menu.drinks.length === 0 && menu.extras.length === 0) {
      try {
        setMenuLoading(true);
        const data = await fetchMenu();
        setMenu(data);
      } catch (err) {
        console.error("useWaiterDashboard.openOrderModal:", err);
        Alert.alert("Error", "No se pudo cargar el menú");
      } finally {
        setMenuLoading(false);
      }
    }
    setOrderModalVisible(true);
  }, []);

  // ---- Acciones sobre mesas ----

  const assignCustomer = useCallback(
  async ({ customerName, peopleCount, items }) => {
    if (!selectedTable) return;
    try {
      await updateTableStatus(selectedTable._id, "ocupada");
      await createOrder({
        table: selectedTable._id,
        items,
        customerName,
        peopleCount,
      });
      setAssignModalVisible(false);
      await loadDashboard({ silent: true });
    } catch (err) {
      console.log('🔴 assignCustomer falló en:', err.config?.method?.toUpperCase(), err.config?.url);
      console.log('🔴 status:', err.response?.status, 'data:', JSON.stringify(err.response?.data));
      Alert.alert("Error", "No se pudo asignar la mesa. Intenta de nuevo.");
    }
  },
  [selectedTable, loadDashboard]
);

  const addItemsToOrder = useCallback(
    async (items) => {
      if (!selectedTable) return;
      try {
        await createOrder({ table: selectedTable._id, items });
        await loadDashboard({ silent: true });
      } catch (err) {
        console.error("useWaiterDashboard.addItemsToOrder:", err);
        Alert.alert("Error", "No se pudo agregar la comanda. Intenta de nuevo.");
      }
    },
    [selectedTable, loadDashboard]
  );

  const sendTableToCleaning = useCallback(async () => {
    if (!selectedTable) return;
    try {
      await updateTableStatus(selectedTable._id, "limpieza");
      setActionsModalVisible(false);
      await loadDashboard({ silent: true });
    } catch (err) {
      console.error("useWaiterDashboard.sendTableToCleaning:", err);
      Alert.alert("Error", "No se pudo liberar la mesa. Intenta de nuevo.");
    }
  }, [selectedTable, loadDashboard]);

  const freeTable = useCallback(
    async (table) => {
      const target = table || selectedTable;
      if (!target) return;
      try {
        await updateTableStatus(target._id, "libre");
        setActionsModalVisible(false);
        await loadDashboard({ silent: true });
      } catch (err) {
        console.error("useWaiterDashboard.freeTable:", err);
        Alert.alert("Error", "No se pudo marcar la mesa como libre.");
      }
    },
    [selectedTable, loadDashboard]
  );

  return {
    tables,
    loading,
    refreshing,
    error,
    onRefresh,

    menu,
    menuLoading,

    selectedTable,
    isActionsModalVisible,
    isAssignModalVisible,
    isOrderModalVisible,

    openTable,
    closeAllModals,
    openOrderModal,
    setActionsModalVisible,
    setAssignModalVisible,
    setOrderModalVisible,

    assignCustomer,
    addItemsToOrder,
    sendTableToCleaning,
    freeTable,
  };
}