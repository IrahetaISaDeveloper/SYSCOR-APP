import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOverview } from '../services/panchitaApi';
import { usePreferences } from './PreferencesContext';

// Seguimiento de Chef Panchita para toda la app de clientes.
//
// Mientras la app está abierta, pregunta cada 45 s por los pedidos en curso
// (con su estimación), el saldo a favor y los avisos. Los avisos nuevos se
// encolan y se muestran de a uno (ver PanchitaAlertBanner); cada aviso tiene
// una `key` estable y las que ya se vieron se guardan en el teléfono para no
// repetirlas.
//
// Todavía no hay notificaciones push: con la app cerrada no llegan avisos.
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
  const appStateRef = useRef(AppState.currentState);

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
    const timer = setInterval(() => {
      if (appStateRef.current === 'active') refresh();
    }, POLL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      // Al volver a la app se actualiza de inmediato.
      if (appStateRef.current !== 'active' && state === 'active') refresh();
      appStateRef.current = state;
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [refresh]);

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
