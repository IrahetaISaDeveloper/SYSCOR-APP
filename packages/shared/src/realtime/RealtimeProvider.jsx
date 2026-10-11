import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { io } from 'socket.io-client';
import apiClient from '../services/apiClient';
import { API_BASE_URL } from '../config/env';
import { useAuth } from '../context/AuthContext';

// Una sola conexión de tiempo real (Socket.IO) por app, igual que el panel
// web (web-shared/context/socketContext.jsx). El servidor avisa cuando algo
// cambia y los hooks se suscriben con useRealtimeEvent / useLiveRefresh.
//
// Autenticación: en el teléfono la cookie de sesión la guarda el motor nativo
// y no siempre viaja en el handshake del WebSocket. Por eso, antes de cada
// conexión, se pide por la API (que sí lleva la cookie) un ticket corto
// (/auth/socket-ticket) y se manda en `auth.token`.

// El socket escucha en la raíz del backend, no en /api.
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const RealtimeContext = createContext({
  isConnected: false,
  reconnectCount: 0,
  subscribe: () => () => {},
});

const fetchTicket = async () => {
  try {
    const { data } = await apiClient.get('/auth/socket-ticket');
    return data?.token || null;
  } catch {
    return null;
  }
};

export function RealtimeProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  // Sube en cada REconexión: los hooks recargan todo, porque lo que pasó
  // mientras el cable estaba caído no se escuchó.
  const [reconnectCount, setReconnectCount] = useState(0);
  const userId = user?.id || user?._id || null;

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
      // Se llama en cada intento de conexión: siempre con un ticket fresco.
      auth: (cb) => {
        fetchTicket().then((token) => cb(token ? { token } : {}));
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });
    socketRef.current = socket;

    let wasConnected = false;
    socket.on('connect', () => {
      setIsConnected(true);
      if (wasConnected) setReconnectCount((n) => n + 1);
      wasConnected = true;
    });
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', (error) => {
      setIsConnected(false);
      if (__DEV__) console.warn('Tiempo real no disponible:', error?.message);
    });

    // El sistema suspende la conexión en segundo plano; al volver se
    // reconecta de inmediato en vez de esperar al siguiente reintento.
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !socket.connected) socket.connect();
    });

    return () => {
      appStateSub.remove();
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, userId]);

  const subscribe = useCallback((event, handler) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, []);

  return (
    <RealtimeContext.Provider value={{ isConnected, reconnectCount, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);

/**
 * Escucha uno o varios eventos mientras el componente esté montado. El
 * handler puede cambiar en cada render sin rehacer la suscripción.
 */
export function useRealtimeEvent(events, handler) {
  const { subscribe, isConnected } = useRealtime();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const key = [].concat(events || []).join('|');

  useEffect(() => {
    if (!key) return undefined;
    // isConnected en las dependencias: se vuelve a suscribir sobre el socket
    // nuevo cuando la conexión se rehace.
    const offs = key.split('|').map((event) => subscribe(event, (...args) => handlerRef.current?.(event, ...args)));
    return () => offs.forEach((off) => off());
  }, [key, subscribe, isConnected]);
}

/**
 * Recarga datos en cuanto el servidor avisa de un cambio.
 *
 * Reemplaza los setInterval de "preguntar cada 15 s":
 *   - Llega uno de `events` -> `refresh()` (agrupado: una ráfaga de eventos
 *     dispara una sola recarga).
 *   - El socket se reconecta o la app vuelve a primer plano -> `refresh()`.
 *   - Sin conexión de tiempo real -> respaldo cada `offlineMs`, como antes.
 *   - Con conexión -> solo una revisión de seguridad cada `safetyMs`.
 *
 * `filter(event, payload)` permite ignorar eventos que no tocan esta pantalla.
 * `enabled: false` (ej. pantalla sin foco) pausa todo.
 */
export function useLiveRefresh(
  events,
  refresh,
  { enabled = true, filter, offlineMs = 15000, safetyMs = 60000, debounceMs = 250 } = {},
) {
  const { isConnected, reconnectCount } = useRealtime();
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  const filterRef = useRef(filter);
  filterRef.current = filter;
  const timerRef = useRef(null);

  const schedule = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => refreshRef.current?.(), debounceMs);
  }, [debounceMs]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useRealtimeEvent(enabled ? events : null, (event, payload) => {
    if (filterRef.current && !filterRef.current(event, payload)) return;
    schedule();
  });

  // Reconexión: recargar lo que se pudo perder.
  const firstReconnect = useRef(reconnectCount);
  useEffect(() => {
    if (!enabled || reconnectCount === firstReconnect.current) return;
    schedule();
  }, [reconnectCount, enabled, schedule]);

  // Respaldo periódico (más espaciado con tiempo real) y al volver a primer plano.
  useEffect(() => {
    if (!enabled) return undefined;
    const every = isConnected ? safetyMs : offlineMs;
    let timer = every ? setInterval(() => refreshRef.current?.(), every) : null;
    const sub = AppState.addEventListener('change', (state) => {
      clearInterval(timer);
      timer = null;
      if (state === 'active') {
        schedule();
        if (every) timer = setInterval(() => refreshRef.current?.(), every);
      }
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [enabled, isConnected, offlineMs, safetyMs, schedule]);
}

export default RealtimeProvider;
