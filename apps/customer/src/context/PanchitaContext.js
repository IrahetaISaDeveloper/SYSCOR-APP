import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOverview } from '../services/panchitaApi';
import { usePreferences } from './PreferencesContext';
import { useLiveRefresh } from '@syscor/shared/src/realtime/RealtimeProvider';
import { EVENTS } from '@syscor/shared/src/realtime/events';

// Seguimiento de Chef Panchita para toda la app de clientes.
//
// Mientras la app está abierta, se actualiza en cuanto el servidor avisa que
// cambió un pedido (y cada 45 s, por la estimación de tráfico y clima): pedidos
// en curso, saldo a favor y avisos. Los avisos nuevos se
// encolan y se muestran de a uno (ver PanchitaAlertBanner); cada aviso tiene
// una `key` estable y las que ya se vieron se guardan en el teléfono para no
// repetirlas.
//
// Con la app cerrada los avisos llegan como notificación push.
const PanchitaContext = createContext(null);

const POLL_MS = 45 * 1000;
const SEEN_KEY = 'syscor:customer:panchitaSeenAlerts';
const MAX_SEEN = 150;

export const PanchitaProvider = ({ children }) => {
  const { orderAlerts } = usePreferences();
  const [overview, setOverview] = useState({ activeOrders: [], alerts: [], wallet: { balance: 0 }, claims: [] });
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const seenRef = useRef(null);

  const loadSeen = async () => {
    if (seenRef.current) return seenRef.current;
    try {
      const raw = await AsyncStorage.getItem(SEEN_KEY);
      seenRef.current = new Set(raw ? JSON.parse(raw) : []);
    } catch {
      seenRef.current = new Set();
    }
    return seenRef.current;
  };

  const markSeen = useCallback(async (keys) => {
    const seen = await loadSeen();
    keys.forEach((k) => seen.add(k));
    const list = [...seen].slice(-MAX_SEEN);
    seenRef.current = new Set(list);
    AsyncStorage.setItem(SEEN_KEY, JSON.stringify(list)).catch(() => {});
  }, []);

  const refresh = useCallback(async () => {
    const res = await getOverview();
    setLoading(false);
    if (!res.success) return null;
    setOverview(res.data);

    const seen = await loadSeen();
    const fresh = (res.data.alerts || []).filter((a) => !seen.has(a.key));
    if (fresh.length > 0) {
      if (orderAlerts) {
        setQueue((q) => [...q, ...fresh.filter((a) => !q.some((x) => x.key === a.key))]);
      } else {
        // Con los avisos apagados no se muestran, pero tampoco se acumulan.
        markSeen(fresh.map((a) => a.key));
      }
    }
    return res.data;
  }, [orderAlerts, markSeen]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Tiempo real: en cuanto cambia un pedido del cliente (o le escribe el
  // repartidor) se actualiza el seguimiento. Sin conexión, cada POLL_MS.
  useLiveRefresh(
    [EVENTS.ORDER_CHANGED, EVENTS.DELIVERY_ON_ROUTE, EVENTS.DELIVERY_DELIVERED, EVENTS.ORDER_CHAT_MESSAGE],
    refresh,
    { offlineMs: POLL_MS, safetyMs: POLL_MS },
  );

  const dismissAlert = useCallback(
    (key) => {
      setQueue((q) => q.filter((a) => a.key !== key));
      markSeen([key]);
    },
    [markSeen],
  );

  const value = useMemo(
    () => ({
      ...overview,
      loading,
      refresh,
      currentAlert: queue[0] || null,
      dismissAlert,
    }),
    [overview, loading, refresh, queue, dismissAlert],
  );

  return <PanchitaContext.Provider value={value}>{children}</PanchitaContext.Provider>;
};

export const usePanchita = () => {
  const ctx = useContext(PanchitaContext);
  if (!ctx) throw new Error('usePanchita debe usarse dentro de un PanchitaProvider');
  return ctx;
};

export default PanchitaContext;
