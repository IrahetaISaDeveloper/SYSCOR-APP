import { useCallback, useEffect, useState } from 'react';
import { getConversation, sendMessage, resetConversation } from '../services/panchitaApi';

let nextId = 0;
const makeId = () => `pm${(nextId += 1)}`;

const WELCOME = {
  role: 'model',
  text: '¡Hola! Soy Chef Panchita 🌮. Te digo cuándo llega tu pedido, le escribo al repartidor, te armo "lo de siempre" y, si algo salió mal, lo resolvemos aquí mismo.',
  cards: [],
};

// Conversación con Panchita. La guarda el servidor: al abrir la pantalla se
// retoma, y cada mensaje nuevo solo manda el texto.
export default function usePanchitaChat({ onActionDone } = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getConversation().then((res) => {
      const saved = res.success ? res.data.messages || [] : [];
      setMessages([WELCOME, ...saved].map((m) => ({ ...m, id: makeId() })));
      setLoading(false);
    });
  }, []);

  const send = useCallback(
    async (text) => {
      const message = String(text || '').trim();
      if (!message || sending) return;
      setMessages((list) => [...list, { id: makeId(), role: 'user', text: message, cards: [] }]);
      setSending(true);
      const res = await sendMessage(message);
      setSending(false);
      const reply = res.success
        ? { role: 'model', text: res.data.reply, cards: res.data.cards || [] }
        : { role: 'model', text: res.error, cards: [], failed: true };
      setMessages((list) => [...list, { ...reply, id: makeId() }]);
      // Un reclamo o un mensaje al repartidor cambian el seguimiento.
      if (reply.cards.some((card) => ['claim', 'driver_message'].includes(card.type))) onActionDone?.();
    },
    [sending, onActionDone],
  );

  const reset = useCallback(async () => {
    await resetConversation();
    setMessages([{ ...WELCOME, id: makeId() }]);
  }, []);

  return { messages, loading, sending, send, reset, isFresh: messages.length <= 1 };
}
