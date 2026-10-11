import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { useLiveRefresh } from "@syscor/shared/src/realtime/RealtimeProvider";
import { EVENTS } from "@syscor/shared/src/realtime/events";
import { AppAlert } from "@syscor/shared/src/components/commons/AppAlert";
import {
  fetchDeliveryQueue,
  fetchMyPackage,
  fetchDeliveryHistory,
  fetchAvailability,
  updateAvailability,
  startDelivery,
  startPackage,
  confirmDelivery,
} from "../services/deliveryApi";
import { isToday } from "../constants/deliveryStatus";

const DeliveryContext = createContext(null);

// Respaldo sin tiempo real: cada cuánto se pregunta si llegó un paquete nuevo.
const POLL_MS = 15000;

const sameId = (a, b) => a != null && b != null && String(a) === String(b);
const apiMessage = (err, fallback) => err?.response?.data?.message || fallback;

// Identifica un paquete y cuántas paradas tiene, para notar si es nuevo o
// si Panchita le sumó un pedido.
const packageKey = (pkg) => (pkg ? `${pkg.id || pkg.code}:${pkg.stops.length}` : null);

// La parada que toca entregar ahora dentro del paquete.
const currentStopOf = (pkg) =>
  pkg?.stops?.find((stop) => sameId(stop.id, pkg.currentStopId)) || null;

// Último mensaje del cliente en cada parada, para avisar de los nuevos.
const customerMessageKeys = (pkg) =>
  Object.fromEntries(
    (pkg?.stops || []).map((stop) => {
      const last = stop.chat?.lastMessage;
      return [String(stop.id), last?.from === "customer" ? last.id : null];
    })
  );

export function DeliveryProvider({ children }) {
  const navigation = useNavigation();
  // Paquete asignado por Panchita: { id, code, status, reason, stops, currentStopId }
  const [pkg, setPkg] = useState(null);
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [onShift, setOnShift] = useState(false);
  const [shiftSaving, setShiftSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  // Para avisar una sola vez cuando llega un paquete nuevo
  const knownPackageRef = useRef(undefined);
  // Mensajes del cliente ya vistos en el aviso (por parada)
  const knownMessagesRef = useRef(undefined);

  const applyPackage = useCallback((next) => {
    const known = knownPackageRef.current;
    const nextKey = packageKey(next);
    // undefined = primera carga: no se avisa de lo que ya estaba asignado
    if (known !== undefined && next && next.status === "assigned" && nextKey !== known) {
      const added = known && known.split(":")[0] === String(next.id || next.code);
      AppAlert.alert(
        added ? "Panchita sumó un pedido a tu paquete" : "Chef Panchita te asignó un paquete",
        `${next.code}: ${next.stops.length} ${next.stops.length === 1 ? "entrega" : "entregas"}. Pasa por el mostrador a recogerlo.`
      );
    }
    knownPackageRef.current = nextKey;

    // Mensaje nuevo del cliente en el chat. Con la app abierta se avisa aquí;
    // con la app cerrada le llega la notificación push (ver PushManager).
    const messages = customerMessageKeys(next);
    const knownMessages = knownMessagesRef.current;
    if (knownMessages !== undefined) {
      const stop = (next?.stops || []).find(
        (s) => messages[String(s.id)] && messages[String(s.id)] !== knownMessages[String(s.id)] && s.chat?.unread > 0
      );
      // Si ya está leyendo ese chat, no hace falta avisarle.
      const current = navigation.getCurrentRoute?.();
      const viewing = current?.name === "OrderChat" && sameId(current.params?.orderId, stop?.id);
      if (stop && !viewing) {
        AppAlert.alert(`Mensaje de ${stop.customer?.name || "el cliente"}`, stop.chat.lastMessage.text, [
          { text: "Después", style: "cancel" },
          {
            text: "Responder",
            onPress: () => navigation.navigate("Deliveries", { screen: "OrderChat", params: { orderId: stop.id } }),
          },
        ]);
      }
    }
    knownMessagesRef.current = messages;

    setPkg(next);
  }, [navigation]);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const [myPackage, pending, shift] = await Promise.all([
          fetchMyPackage(),
          fetchDeliveryQueue(),
          fetchAvailability(),
        ]);
        applyPackage(myPackage);
        setQueue(pending);
        setOnShift(shift);
      } catch (err) {
        console.error("useDelivery.load error:", err);
        setError(apiMessage(err, "No se pudieron cargar las entregas."));
      } finally {
        setLoading(false);
      }
    },
    [applyPackage]
  );

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

  // Salir del local con el paquete asignado
  const startRoute = useCallback(async () => {
    try {
      const updated = await startPackage();
      applyPackage(updated);
      return updated;
    } catch (err) {
      AppAlert.alert("No se pudo salir a ruta", apiMessage(err, "No se pudo iniciar el paquete."));
      await load(true);
      throw err;
    }
  }, [applyPackage, load]);

  // Respaldo manual: tomar un pedido de la cola sin paquete asignado
  const start = useCallback(
    async (deliveryId) => {
      try {
        const updated = await startDelivery(deliveryId);
        applyPackage(updated);
        setQueue((prev) => prev.filter((d) => !sameId(d.id, deliveryId)));
        return updated;
      } catch (err) {
        AppAlert.alert("No se pudo iniciar", apiMessage(err, "No se pudo iniciar la entrega."));
        await load(true);
        throw err;
      }
    },
    [applyPackage, load]
  );

  // Confirma una parada. Devuelve la respuesta con el paquete actualizado
  // (si quedan paradas, `package.currentStopId` es la siguiente).
  const confirm = useCallback(
    async (deliveryId, options = {}) => {
      try {
        const result = await confirmDelivery(deliveryId, options);
        // Lo que queda del paquete ya es conocido (no se avisa); si se
        // terminó y Panchita asigna otro, ese sí se avisa.
        knownPackageRef.current = packageKey(result?.package ?? null);
        await Promise.all([load(true), loadHistory()]);
        return result;
      } catch (err) {
        AppAlert.alert("No se pudo confirmar", apiMessage(err, "No se pudo confirmar la entrega."));
        throw err;
      }
    },
    [load, loadHistory]
  );

  const toggleShift = useCallback(async () => {
    const next = !onShift;
    if (!next && pkg?.status === "assigned") {
      const proceed = await new Promise((resolve) => {
        AppAlert.alert(
          "Salir de turno",
          "Todavía no sales con tu paquete. Si sales de turno, Panchita se lo asignará a otro repartidor.",
          [
            { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
            { text: "Salir de turno", style: "destructive", onPress: () => resolve(true) },
          ]
        );
      });
      if (!proceed) return;
    }
    setShiftSaving(true);
    setOnShift(next);
    try {
      const result = await updateAvailability(next);
      applyPackage(result?.package ?? null);
      await load(true);
    } catch (err) {
      setOnShift(!next);
      AppAlert.alert("No se pudo cambiar tu turno", apiMessage(err, "Intenta de nuevo."));
    } finally {
      setShiftSaving(false);
    }
  }, [onShift, pkg, applyPackage, load]);

  const activeDelivery = useMemo(() => currentStopOf(pkg), [pkg]);

  const getDeliveryById = useCallback(
    (id) => {
      if (!id) return activeDelivery;
      return (
        pkg?.stops?.find((d) => sameId(d.id, id)) ||
        queue.find((d) => sameId(d.id, id)) ||
        history.find((d) => sameId(d.id, id)) ||
        null
      );
    },
    [activeDelivery, pkg, queue, history]
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

  // Tiempo real: paquete asignado, cola de reparto, mensajes del cliente y
  // cambios de pedidos a domicilio llegan al instante. Sin conexión se vuelve
  // a preguntar cada POLL_MS como antes.
  useLiveRefresh(
    [
      EVENTS.DELIVERY_PACKAGE_ASSIGNED,
      EVENTS.DELIVERY_QUEUE_CHANGED,
      EVENTS.DELIVERY_QUEUED,
      EVENTS.DELIVERY_STARTED,
      EVENTS.ORDER_CHAT_MESSAGE,
      EVENTS.ORDER_DRIVER_MESSAGE,
      EVENTS.ORDER_UPDATED,
      EVENTS.ORDER_DELETED,
    ],
    () => load(true),
    {
      offlineMs: POLL_MS,
      // De los cambios de pedidos solo importan los de domicilio.
      filter: (event, payload) => event !== EVENTS.ORDER_UPDATED || !!payload?.order?.isDelivery,
    }
  );

  const value = {
    pkg,
    activeDelivery,
    queue,
    history,
    stats,
    onShift,
    shiftSaving,
    loading,
    refreshing,
    error,
    onRefresh,
    load,
    loadHistory,
    start,
    startRoute,
    confirm,
    toggleShift,
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
