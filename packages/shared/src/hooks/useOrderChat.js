import { useCallback, useEffect, useRef, useState } from 'react';
import { getOrderChat, sendOrderChatMessage } from '../services/orderChatApi';
import { useLiveRefresh } from '../realtime/RealtimeProvider';
import { EVENTS } from '../realtime/events';

// Respaldo sin tiempo real: cada cuánto se vuelve a pedir la conversación.
// Cada consulta también la marca como leída.
const OFFLINE_POLL_MS = 4000;

// Conversación de un pedido (ver services/orderChatApi). Los mensajes que se
// mandan aparecen al instante como "enviando" y se reemplazan por los del
// servidor al confirmarse.
export default function useOrderChat(orderId) {
  const [chat, setChat] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendError, setSendError] = useState(null);
  const alive = useRef(true);

  const load = useCallback(async () => {
    if (!orderId) return;
    const res = await getOrderChat(orderId);
    if (!alive.current) return;
    if (res.success) {
      setChat(res.data);
      setError(null);
    } else if (!chat || res.status === 403 || res.status === 404) {
      // Un fallo de red con la conversación ya cargada no tapa la pantalla:
      // se reintenta en la siguiente vuelta.
      setError(res.error);
    }
    setLoading(false);
  }, [orderId, chat]);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    load();
    // Solo al cambiar de pedido; las recargas siguientes vienen de abajo.
  }, [orderId]);

  // Tiempo real: mensaje nuevo, "visto" o cambio del pedido (entregado =
  // chat cerrado) de ESTE pedido. Sin conexión, se pregunta cada OFFLINE_POLL_MS.
  useLiveRefresh(
    [EVENTS.ORDER_CHAT_MESSAGE, EVENTS.ORDER_CHAT_READ, EVENTS.ORDER_CHANGED, EVENTS.ORDER_UPDATED],
    load,
    {
      enabled: !!orderId,
      debounceMs: 100,
      offlineMs: OFFLINE_POLL_MS,
      safetyMs: 30000,
      filter: (event, payload) => String(payload?.orderId || payload?.order?._id || '') === String(orderId),
    },
  );

  const send = useCallback(
    async (rawText, preset = false) => {
      const text = String(rawText || '').trim();
      if (!text || !orderId) return false;
      const temp = { id: `tmp-${Date.now()}`, from: chat?.side, text, preset, createdAt: new Date().toISOString(), pending: true };
      setPending((list) => [...list, temp]);
      setSendError(null);

      const res = await sendOrderChatMessage(orderId, text, preset);
      if (!alive.current) return res.success;
      setPending((list) => list.filter((m) => m.id !== temp.id));
      if (!res.success) {
        setSendError(res.error);
        return false;
      }
      setChat((current) =>
        current ? { ...current, messages: [...current.messages.filter((m) => m.id !== res.data.id), res.data] } : current,
      );
      return true;
    },
    [orderId, chat?.side],
  );

  // Si una consulta trajo el mensaje antes de que el envío respondiera, el
  // "enviando" ya sobra.
  const serverMessages = chat?.messages || [];
  const stillPending = pending.filter(
    (p) =>
      !serverMessages.some(
        (m) => m.from === p.from && m.text === p.text && new Date(m.createdAt) >= new Date(p.createdAt) - 5000,
      ),
  );

  return {
    chat,
    messages: [...serverMessages, ...stillPending],
    loading,
    error,
    sendError,
    clearSendError: () => setSendError(null),
    send,
    reload: load,
  };
}
