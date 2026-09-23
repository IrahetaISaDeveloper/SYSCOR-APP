import { useCallback, useRef, useState } from 'react';
import apiClient from '../services/apiClient';
import { LOGIN_FAQ } from '../constants/loginFaq';

// Conversación con Chef Panchita en la pantalla de acceso.
//
// Habla con el mismo endpoint público que el sistema web (`/chat/login-help`):
// no lleva sesión ni herramientas, porque quien pregunta todavía no ha
// entrado. No consulta datos del negocio ni confirma si una cuenta existe.
//
// Al final de cada respuesta la pantalla pregunta si el problema se resolvió
// (ver `awaitingFeedback`); si el cliente dice que no, se ofrecen los canales
// de soporte.

const WELCOME =
  '¡Hola! Soy Chef Panchita. Puedo ayudarte a entrar a tu cuenta, con el código de verificación o a recuperar tu contraseña. ¿En qué te ayudo?';

// El atajo a recuperar contraseña no se ofrece de entrada: solo cuando el
// cliente dice que ese es su problema. Ofrecerlo antes sería empujar a
// restablecer la clave a quien quizá solo escribió mal el correo.
const RECOVERY_HINTS = [
  'olvid', 'no recuerdo', 'no me acuerdo', 'recuperar', 'restablecer',
  'resetear', 'cambiar mi contrase', 'perdi mi contrase', 'nueva contrase',
  'no se mi contrase',
];

// Sin tildes y en minúsculas, para que "olvidé" y "olvide" cuenten igual.
const normalize = (text) =>
  (text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const mentionsPasswordTrouble = (text) => {
  const t = normalize(text);
  return RECOVERY_HINTS.some((hint) => t.includes(normalize(hint)));
};

let nextId = 0;
const makeId = () => `m${nextId++}`;

// El historial que devuelve el backend trae los turnos del modelo con las
// claves en otro orden y, a veces, sin `role`. Reenviarlo tal cual hace que
// la siguiente pregunta falle ("No puedo responder en este momento"), así
// que se reconstruye con la forma que el modelo espera.
// El backend responde esto de vez en cuando (aproximadamente 1 de cada 8
// veces) aunque la pregunta sea correcta: es un fallo intermitente suyo, no
// de la app. Se reintenta una vez antes de darlo por perdido.
const BACKEND_HICCUP = 'No puedo responder en este momento';

const isHiccup = (reply) => (reply || '').startsWith(BACKEND_HICCUP);

const normalizeHistory = (history) =>
  (Array.isArray(history) ? history : [])
    .map((turn) => {
      const text = turn?.parts?.map((p) => p?.text || '').join('') || '';
      if (!text) return null;
      return {
        role: turn?.role === 'model' ? 'model' : 'user',
        parts: [{ text }],
      };
    })
    .filter(Boolean);

export default function useLoginHelpChat() {
  const [messages, setMessages] = useState([
    { id: makeId(), role: 'model', text: WELCOME },
  ]);
  const [sending, setSending] = useState(false);
  // Tras responder, Panchita pregunta si sirvió: mientras esté en true la
  // pantalla muestra los botones de sí/no en vez de otra cosa.
  const [awaitingFeedback, setAwaitingFeedback] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [offerRecovery, setOfferRecovery] = useState(false);

  // El historial que el backend devuelve para mantener el hilo.
  const historyRef = useRef([]);

  const send = useCallback(
    async (text) => {
      const question = (text || '').trim();
      if (!question || sending) return;

      setMessages((prev) => [...prev, { id: makeId(), role: 'user', text: question }]);
      setSending(true);
      setAwaitingFeedback(false);

      // Una vez ofrecido, se queda a mano aunque después pregunte otra cosa.
      if (mentionsPasswordTrouble(question)) setOfferRecovery(true);

      try {
        const ask = () =>
          apiClient.post('/chat/login-help', {
            message: question,
            history: historyRef.current,
          });

        let { data } = await ask();

        // Reintento único ante el fallo intermitente del backend.
        if (isHiccup(data?.reply)) {
          ({ data } = await ask());
        }

        const reply =
          data?.reply ||
          data?.message ||
          'No pude responder a eso. ¿Quieres que te comunique con alguien del equipo?';

        if (Array.isArray(data?.history)) {
          historyRef.current = normalizeHistory(data.history);
        }

        setMessages((prev) => [...prev, { id: makeId(), role: 'model', text: reply }]);

        // Si ni con el reintento respondió, la salida es soporte directo.
        if (isHiccup(reply)) {
          setShowSupport(true);
          setAwaitingFeedback(false);
        } else {
          // Respondió: toca preguntar si con eso bastó.
          setAwaitingFeedback(true);
        }
      } catch (err) {
        console.error('Error al consultar a Panchita:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: 'model',
            text: 'No pude conectarme para responderte. Puedes escribirle directamente al equipo de El Corral.',
          },
        ]);
        // Sin conexión no hay nada que preguntar: la salida es soporte.
        setShowSupport(true);
      } finally {
        setSending(false);
      }
    },
    [sending],
  );

  // Pregunta predefinida: la respuesta ya está escrita, así que se contesta
  // al instante y el historial del modelo se mantiene al día por si después
  // sigue escribiendo por su cuenta.
  const askPreset = useCallback(
    (item) => {
      if (!item || sending) return;

      if (item.recovery) setOfferRecovery(true);

      historyRef.current = [
        ...historyRef.current,
        { role: 'user', parts: [{ text: item.question }] },
        { role: 'model', parts: [{ text: item.answer }] },
      ];

      setShowSupport(false);
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: 'user', text: item.question },
        { id: makeId(), role: 'model', text: item.answer },
      ]);
      // Igual que con una respuesta de la IA: se pregunta si bastó.
      setAwaitingFeedback(true);
    },
    [sending],
  );

  // El cliente dice que sí se resolvió.
  const confirmSolved = useCallback(() => {
    setAwaitingFeedback(false);
    setShowSupport(false);
    setMessages((prev) => [
      ...prev,
      { id: makeId(), role: 'user', text: 'Sí, ya se resolvió' },
      {
        id: makeId(),
        role: 'model',
        text: '¡Me alegra haberte ayudado! Si necesitas algo más, aquí estoy.',
      },
    ]);
  }, []);

  // El cliente dice que no: se abren los canales de soporte.
  const requestSupport = useCallback(() => {
    setAwaitingFeedback(false);
    setShowSupport(true);
    setMessages((prev) => [
      ...prev,
      { id: makeId(), role: 'user', text: 'No, sigo con el problema' },
      {
        id: makeId(),
        role: 'model',
        text: 'Lamento no haber podido resolverlo. Habla directamente con el equipo de El Corral por llamada o WhatsApp:',
      },
    ]);
  }, []);

  const reset = useCallback(() => {
    historyRef.current = [];
    setMessages([{ id: makeId(), role: 'model', text: WELCOME }]);
    setSending(false);
    setAwaitingFeedback(false);
    setShowSupport(false);
    setOfferRecovery(false);
  }, []);

  return {
    messages,
    sending,
    awaitingFeedback,
    showSupport,
    offerRecovery,
    send,
    askPreset,
    presets: LOGIN_FAQ,
    confirmSolved,
    requestSupport,
    reset,
    // Solo se han visto los saludos: sirve para mostrar los atajos.
    isFresh: messages.length === 1,
  };
}
