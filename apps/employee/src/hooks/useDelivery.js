import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import {
  fetchAvailableDeliveries,
  fetchMyActiveDelivery,
  fetchDeliveryHistory,
  acceptDelivery,
  rejectDelivery,
  confirmDelivery,
} from "../services/deliveryApi";
import { findMockDelivery, MOCK_STATS } from "../mocks/deliveryMock";

const DeliveryContext = createContext(null);

export function DeliveryProvider({ children }) {
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [available, setAvailable] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [active, avail] = await Promise.all([
        fetchMyActiveDelivery().catch(() => null),
        fetchAvailableDeliveries().catch(() => []),
      ]);
      setActiveDelivery(active);
      setAvailable(avail || []);
    } catch (err) {
      console.error("useDelivery.load error:", err);
      setError("No se pudieron cargar las entregas.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const hist = await fetchDeliveryHistory().catch(() => []);
      setHistory(hist || []);
    } catch (err) {
      console.error("useDelivery.loadHistory error:", err);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([load(true), loadHistory()]);
    setRefreshing(false);
  }, [load, loadHistory]);

  const accept = useCallback(
    async (deliveryId) => {
      try {
        const updated = await acceptDelivery(deliveryId);
        setActiveDelivery(updated);
        setAvailable((prev) => prev.filter((d) => String(d.id) !== String(deliveryId)));
        return updated;
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          "No se pudo aceptar la entrega. Puede que ya la haya tomado otro repartidor.";
        Alert.alert("Error", msg);
        await load(true);
        throw err;
      }
    },
    [load]
  );

  const reject = useCallback(
    async (deliveryId) => {
      try {
        await rejectDelivery(deliveryId);
        setActiveDelivery(null);
        await load(true);
      } catch (err) {
        const msg = err?.response?.data?.message || "No se pudo rechazar la entrega.";
        Alert.alert("Error", msg);
        throw err;
      }
    },
    [load]
  );

  const confirm = useCallback(
    async (deliveryId, options = {}) => {
      try {
        const result = await confirmDelivery(deliveryId, options);
        setActiveDelivery(null);
        await Promise.all([load(true), loadHistory()]);
        return result;
      } catch (err) {
        const msg = err?.response?.data?.message || "No se pudo confirmar la entrega.";
        Alert.alert("Error", msg);
        throw err;
      }
    },
    [load, loadHistory]
  );

  const getDeliveryById = useCallback(
    (id) => {
      if (!id) return activeDelivery || null;
      if (activeDelivery && (activeDelivery.id === id || String(activeDelivery.id) === String(id))) {
        return activeDelivery;
      }
      const foundAvail = available.find((d) => d.id === id || String(d.id) === String(id));
      if (foundAvail) return foundAvail;
      const foundHist = history.find((d) => d.id === id || String(d.id) === String(id));
      if (foundHist) return foundHist;
      return findMockDelivery(id);
    },
    [activeDelivery, available, history]
  );

  const stats = useMemo(() => {
    const deliveredCount = history.length;
    const toCollect = history
      .filter((h) => h.paymentMethod === "cash")
      .reduce((sum, h) => sum + (h.total || 0), 0);
    const distanceKm = history.reduce((sum, h) => sum + (h.distanceKm || 2.5), 0);

    return {
      delivered: deliveredCount > 0 ? deliveredCount : MOCK_STATS.delivered,
      toCollect: toCollect > 0 ? toCollect : MOCK_STATS.toCollect,
      distanceKm: distanceKm > 0 ? Math.round(distanceKm * 10) / 10 : MOCK_STATS.distanceKm,
    };
  }, [history]);

  useEffect(() => {
    load();
    loadHistory();
  }, [load, loadHistory]);

  const value = {
    activeDelivery,
    available,
    history,
    stats,
    loading,
    refreshing,
    error,
    onRefresh,
    load,
    loadHistory,
    accept,
    reject,
    confirm,
    getDeliveryById,
  };

  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) {
    throw new Error("useDelivery debe usarse dentro de un DeliveryProvider");
  }
  return ctx;
}

export default useDelivery;
