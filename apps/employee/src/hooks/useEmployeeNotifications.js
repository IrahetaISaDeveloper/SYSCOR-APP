import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLiveRefresh, useRealtimeEvent } from "@syscor/shared/src/realtime/RealtimeProvider";
import { EVENTS } from "@syscor/shared/src/realtime/events";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/notificationsApi";

const EmployeeNotificationsContext = createContext(null);

const sameId = (a, b) => a != null && b != null && String(a) === String(b);

// Bandeja personal del empleado: la lista y el contador de no leídas. Un solo
// estado para la campana del encabezado y la pantalla de Notificaciones.
// Los avisos nuevos llegan por tiempo real; al reconectar o volver a primer
// plano se recarga la primera página por si se perdió alguno.
export function EmployeeNotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const loadingMoreRef = useRef(false);

  const refresh = useCallback(async ({ pull = false } = {}) => {
    if (pull) setRefreshing(true);
    try {
      const page = await getMyNotifications();
      setNotifications(page.notifications);
      setHasMore(page.hasMore);
      setUnreadCount(page.unreadCount);
      setError(null);
    } catch {
      setError("No se pudieron cargar tus notificaciones.");
    } finally {
      setLoading(false);
      if (pull) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Reconexión, primer plano y un respaldo espaciado. Cuando otro mesero toma
  // una solicitud de mesa, su aviso se borra de esta bandeja: se recarga.
  useLiveRefresh(
    [EVENTS.TABLE_REQUEST_CHANGED, EVENTS.CASHIER_WAITER_CALL_CHANGED],
    refresh,
    { offlineMs: 30000, safetyMs: 120000 },
  );

  useRealtimeEvent(EVENTS.EMPLOYEE_NOTIFICATION, (_event, payload) => {
    const incoming = payload?.notification;
    if (!incoming?._id) return;
    setNotifications((list) => (list.some((n) => sameId(n._id, incoming._id)) ? list : [incoming, ...list]));
    if (!incoming.readAt) setUnreadCount((n) => n + 1);
  });

  const loadMore = useCallback(async () => {
    const last = notifications[notifications.length - 1];
    if (!hasMore || !last || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const page = await getMyNotifications({ before: last.createdAt });
      setNotifications((list) => [
        ...list,
        ...page.notifications.filter((n) => !list.some((m) => sameId(m._id, n._id))),
      ]);
      setHasMore(page.hasMore);
      setUnreadCount(page.unreadCount);
    } catch {
      // Se reintenta al volver a llegar al final de la lista.
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [notifications, hasMore]);

  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  // `id` puede ser de un aviso que todavía no está en la lista (push tocado
  // antes de cargarla): igual se marca en el servidor.
  const markRead = useCallback(async (id) => {
    if (!id) return;
    const target = notificationsRef.current.find((n) => sameId(n._id, id));
    if (target && !target.readAt) {
      const now = new Date().toISOString();
      setNotifications((list) => list.map((n) => (sameId(n._id, id) ? { ...n, readAt: now } : n)));
      setUnreadCount((n) => Math.max(0, n - 1));
    }
    try {
      const count = await markNotificationRead(id);
      if (count != null) setUnreadCount(count);
    } catch {
      // Queda como leída en pantalla; la próxima recarga trae lo real.
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString();
    setNotifications((list) => list.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      refresh();
    }
  }, [refresh]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      hasMore,
      loading,
      refreshing,
      loadingMore,
      error,
      refresh,
      loadMore,
      markRead,
      markAllRead,
    }),
    [notifications, unreadCount, hasMore, loading, refreshing, loadingMore, error, refresh, loadMore, markRead, markAllRead]
  );

  return <EmployeeNotificationsContext.Provider value={value}>{children}</EmployeeNotificationsContext.Provider>;
}

export function useEmployeeNotifications() {
  const context = useContext(EmployeeNotificationsContext);
  if (!context) throw new Error("useEmployeeNotifications debe usarse dentro de EmployeeNotificationsProvider");
  return context;
}

export default useEmployeeNotifications;
