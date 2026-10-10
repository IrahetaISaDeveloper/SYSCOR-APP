import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import {
  fetchDeliveryQueue,
  fetchMyActiveDelivery,
  fetchDeliveryHistory,
  startDelivery,
  confirmDelivery,
} from "../services/deliveryApi";
import { isToday } from "../constants/deliveryStatus";

const DeliveryContext = createContext(null);

const sameId = (a, b) => a != null && b != null && String(a) === String(b);
const apiMessage = (err, fallback) => err?.response?.data?.message || fallback;

export function DeliveryProvider({ children }) {
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [active, pending] = await Promise.all([fetchMyActiveDelivery(), fetchDeliveryQueue()]);
      setActiveDelivery(active);
      setQueue(pending);
    } catch (err) {
      console.error("useDelivery.load error:", err);
      setError(apiMessage(err, "No se pudieron cargar las entregas."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await fetchDeliveryHistory());
    } catch (err) {
      console.error("useDelivery.loadHistory error:", err);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([load(true), loadHistory()]);
    setRefreshing(false);
  }, [load, loadHistory]);

  const start = useCallback(
    async (deliveryId) => {
      try {
        const updated = await startDelivery(deliveryId);
        setActiveDelivery(updated);
        setQueue((prev) => prev.filter((d) => !sameId(d.id, deliveryId)));
        return updated;
      } catch (err) {
        Alert.alert("No se pudo iniciar", apiMessage(err, "No se pudo iniciar la entrega."));
        await load(true);
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
        Alert.alert("No se pudo confirmar", apiMessage(err, "No se pudo confirmar la entrega."));
        throw err;
      }
    },
    [load, loadHistory]
  );

  const getDeliveryById = useCallback(
    (id) => {
      if (!id) return activeDelivery;
      if (sameId(activeDelivery?.id, id)) return activeDelivery;
      return queue.find((d) => sameId(d.id, id)) || history.find((d) => sameId(d.id, id)) || null;
    },
    [activeDelivery, queue, history]
  );

  const stats = useMemo(() => {
    const today = history.filter((h) => isToday(h.deliveredAt));
    const distanceKm = today.reduce((sum, h) => sum + (Number(h.distanceKm) || 0), 0);
    const collected = today
      .filter((h) => h.paymentMethod === "cash")
      .reduce((sum, h) => sum + (Number(h.collectedAmount) || 0), 0);
    return {
      delivered: today.length,
      cashCollected: Math.round(collected * 100) / 100,
      distanceKm: Math.round(distanceKm * 10) / 10,
    };
  }, [history]);

  useEffect(() => {
    load();
    loadHistory();
  }, [load, loadHistory]);

  const value = {
    activeDelivery,
    queue,
    history,
    stats,
    loading,
    refreshing,
    error,
    onRefresh,
    load,
    loadHistory,
    start,
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
