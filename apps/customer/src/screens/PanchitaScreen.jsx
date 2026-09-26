import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import PanchitaImage from '@syscor/shared/src/components/panchita/PanchitaImage';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { getMenuColors } from '../styles/CustomerMenu';
import ordersStyles from '../styles/Orders';
import { usePanchita } from '../context/PanchitaContext';
import { useCart } from '../context/CartContext';
import usePanchitaChat from '../hooks/usePanchitaChat';
import OrderTrackingCard from '../components/OrderTrackingCard';

// Atajos para empezar la conversación sin escribir.
const QUICK_ACTIONS = [
  { icon: 'time-outline', label: '¿Dónde viene mi pedido?', message: '¿Dónde viene mi pedido y a qué hora llega?' },
  { icon: 'alert-circle-outline', label: 'Tuve un problema', message: 'Tuve un problema con mi pedido.' },
  { icon: 'repeat-outline', label: 'Lo de siempre', message: 'Quiero pedir lo de siempre.' },
  { icon: 'wallet-outline', label: 'Mi saldo', message: '¿Cuánto saldo a favor tengo y cómo van mis reclamos?' },
];

const CLAIM_STATUS = {
  approved: { label: 'APROBADO · SALDO A FAVOR', color: '#1FC47A', icon: 'checkmark-circle' },
  pending_refund: { label: 'APROBADO · REEMBOLSO EN PROCESO', color: '#1FC47A', icon: 'card' },
  refunded: { label: 'REEMBOLSADO', color: '#1FC47A', icon: 'checkmark-done-circle' },
  in_review: { label: 'EN REVISIÓN', color: '#F2A33A', icon: 'hourglass-outline' },
  rejected: { label: 'NO APROBADO', color: '#D93636', icon: 'close-circle' },
};

// Chef Panchita: seguimiento en tiempo real de los pedidos en curso,
// mensajes al repartidor y una conversación que resuelve problemas.
const PanchitaScreen = ({ navigation, route }) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [draft, setDraft] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const panchita = usePanchita();
  const { addItem } = useCart();
  const chat = usePanchitaChat({ onActionDone: panchita.refresh });

  // Al abrir, datos frescos. Si llegó con una pregunta (ej. desde "Pedidos"), se envía.
  useEffect(() => {
    panchita.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const initialPrompt = route?.params?.prompt;
  const sentInitial = useRef(false);
  useEffect(() => {
    if (initialPrompt && !chat.loading && !sentInitial.current) {
      sentInitial.current = true;
      chat.send(initialPrompt);
    }
  }, [initialPrompt, chat.loading, chat]);

  // Con el teclado abierto el margen inferior de la barra de gestos sobra.
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true);
      scrollRef.current?.scrollToEnd({ animated: true });
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [chat.messages.length, chat.sending]);

  const submit = () => {
    if (!draft.trim()) return;
    chat.send(draft);
    setDraft('');
  };

  const addUsualToCart = (usual) => {
    // El aviso de "se agregó a tu bolsa" (con "Ver bolsa") sale solo.
    usual.items.forEach((item) => addItem(item));
  };

  const confirmReset = () =>
    Alert.alert('Nueva conversación', 'Panchita olvidará esta charla. Tus pedidos y reclamos no cambian.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Empezar de nuevo', onPress: chat.reset },
    ]);

  const balance = Number(panchita.wallet?.balance || 0);

  return (
    // Con edge-to-edge en Android la ventana ya no se redimensiona sola al abrir
    // el teclado, así que también ahí hay que dejarle espacio con padding.
    <KeyboardAvoidingView
      behavior="padding"
      style={[ordersStyles.container, { backgroundColor: c.background }]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ height: insets.top }} />

      {/* ── ENCABEZADO ── */}
      <View style={[ordersStyles.row, { paddingHorizontal: m.gutter, paddingVertical: ms(10), gap: ms(12) }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            ordersStyles.roundButton,
            { backgroundColor: c.surface, borderColor: c.border, width: ms(40), height: ms(40), borderRadius: ms(20) },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Icon name="chevron-back" size={ms(20)} color={c.textDark} />
        </TouchableOpacity>
        <View style={{ width: ms(42), height: ms(42), borderRadius: ms(21), overflow: 'hidden', backgroundColor: c.surfaceMuted }}>
          <PanchitaImage variant="icon" isDark={isDark} style={{ width: ms(42), height: ms(42) }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(18) }]}>Chef Panchita</Text>
          <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(9.5) }]}>TU PEDIDO, EN TIEMPO REAL</Text>
        </View>
        <TouchableOpacity onPress={confirmReset} hitSlop={10} accessibilityLabel="Nueva conversación">
          <Icon name="refresh" size={ms(20)} color={c.textGray} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingHorizontal: m.gutter, paddingBottom: ms(16), gap: ms(12) }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── SEGUIMIENTO ── */}
        {panchita.activeOrders.map((order) => (
          <OrderTrackingCard key={order.id} order={order} colors={c} ms={ms} onSent={panchita.refresh} />
        ))}

        {balance > 0 ? (
          <View style={[ordersStyles.row, { gap: ms(8), padding: ms(12), borderRadius: ms(14), backgroundColor: 'rgba(31,196,122,0.12)' }]}>
            <Icon name="wallet" size={ms(18)} color="#1FC47A" />
            <Text style={[textStyles.bodyMedium, { flex: 1, color: c.textDark, fontSize: ms(13) }]}>
              Tienes ${balance.toFixed(2)} de saldo a favor. Úsalo al pagar tu próximo pedido.
            </Text>
          </View>
        ) : null}

        {/* ── CONVERSACIÓN ── */}
        {chat.loading ? <ActivityIndicator color={c.primary} style={{ marginTop: ms(20) }} /> : null}

        {chat.messages.map((message) => (
          <View key={message.id} style={{ gap: ms(8) }}>
            <Bubble message={message} colors={c} ms={ms} />
            {(message.cards || []).map((card, i) => (
              <ChatCard
                key={`${message.id}-${i}`}
                card={card}
                colors={c}
                ms={ms}
                onAddUsual={addUsualToCart}
              />
            ))}
          </View>
        ))}

        {chat.sending ? (
          <View style={[ordersStyles.row, { gap: ms(8) }]}>
            <ActivityIndicator size="small" color={c.primary} />
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}>Panchita está escribiendo…</Text>
          </View>
        ) : null}

        {/* Atajos: al inicio de la conversación */}
        {!chat.loading && chat.isFresh ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: ms(8) }}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                onPress={() => chat.send(action.message)}
                style={[
                  ordersStyles.row,
                  {
                    gap: ms(6),
                    paddingHorizontal: ms(12),
                    height: ms(38),
                    borderRadius: ms(19),
                    borderWidth: 1,
                    borderColor: c.border,
                    backgroundColor: c.surface,
                  },
                ]}
                accessibilityRole="button"
              >
                <Icon name={action.icon} size={ms(15)} color={c.primary} />
                <Text style={[textStyles.bodyMedium, { color: c.textDark, fontSize: ms(13) }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </ScrollView>

      {/* ── ESCRIBIR ── */}
      <View
        style={[
          ordersStyles.row,
          {
            gap: ms(8),
            paddingHorizontal: m.gutter,
            paddingTop: ms(10),
            paddingBottom: keyboardOpen ? ms(10) : Math.max(insets.bottom, ms(10)),
            borderTopWidth: 1,
            borderTopColor: c.border,
            backgroundColor: c.background,
          },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Escríbele a Panchita…"
          placeholderTextColor={c.textLight}
          maxLength={600}
          multiline
          style={[
            textStyles.body,
            {
              flex: 1,
              maxHeight: ms(110),
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.surface,
              borderRadius: ms(20),
              paddingHorizontal: ms(14),
              paddingVertical: ms(10),
              color: c.textDark,
              fontSize: ms(14.5),
            },
          ]}
        />
        <TouchableOpacity
          onPress={submit}
          disabled={!draft.trim() || chat.sending}
          style={{
            width: ms(44),
            height: ms(44),
            borderRadius: ms(22),
            backgroundColor: c.primary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: draft.trim() && !chat.sending ? 1 : 0.5,
          }}
          accessibilityRole="button"
          accessibilityLabel="Enviar"
        >
          <Icon name="send" size={ms(18)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ── COMPONENTES ─────────────────────────────────────────────────────────

const Bubble = ({ message, colors: c, ms }) => {
  const mine = message.role === 'user';
  return (
    <View
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        paddingHorizontal: ms(14),
        paddingVertical: ms(10),
        borderRadius: ms(18),
        borderBottomRightRadius: mine ? ms(4) : ms(18),
        borderBottomLeftRadius: mine ? ms(18) : ms(4),
        backgroundColor: mine ? c.primary : c.surface,
        borderWidth: mine ? 0 : 1,
        borderColor: message.failed ? c.error : c.border,
      }}
    >
      <Text style={[textStyles.body, { color: mine ? '#FFFFFF' : c.textDark, fontSize: ms(14.5), lineHeight: ms(20) }]}>
        {message.text}
      </Text>
    </View>
  );
};

// Tarjetas que acompañan una respuesta de Panchita.
const ChatCard = ({ card, colors: c, ms, onAddUsual }) => {
  const box = {
    marginLeft: ms(8),
    padding: ms(12),
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    gap: ms(6),
  };

  if (card.type === 'claim') {
    const status = CLAIM_STATUS[card.claim.status] || CLAIM_STATUS.in_review;
    return (
      <View style={[box, { borderColor: status.color }]}>
        <View style={[ordersStyles.row, { gap: ms(6) }]}>
          <Icon name={status.icon} size={ms(16)} color={status.color} />
          <Text style={[textStyles.kicker, { color: status.color, fontSize: ms(9.5) }]}>{status.label}</Text>
        </View>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(14.5) }]}>
          {card.claim.typeLabel} · Pedido #{card.orderShortId}
        </Text>
        {card.claim.amount > 0 ? (
          <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(18) }]}>${Number(card.claim.amount).toFixed(2)}</Text>
        ) : null}
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}>{card.claim.reason}</Text>
      </View>
    );
  }

  if (card.type === 'usual') {
    const { usual } = card;
    return (
      <View style={box}>
        <Text style={[textStyles.kicker, { color: c.primary, fontSize: ms(9.5) }]}>{usual.label.toUpperCase()}</Text>
        {usual.items.map((item) => (
          <View key={`${item.productId}-${item.name}`} style={[ordersStyles.row, { justifyContent: 'space-between' }]}>
            <Text style={[textStyles.body, { flex: 1, color: c.textDark, fontSize: ms(13.5) }]}>
              {item.quantity} × {item.name}
              {item.selectedExtras?.length ? ` + ${item.selectedExtras.map((e) => e.name).join(', ')}` : ''}
            </Text>
            <Text style={[textStyles.num, { color: c.textGray, fontSize: ms(12.5) }]}>${Number(item.totalPrice).toFixed(2)}</Text>
          </View>
        ))}
        {usual.unavailable?.length ? (
          <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(11.5) }]}>
            Hoy no hay: {usual.unavailable.join(', ')}
          </Text>
        ) : null}
        <TouchableOpacity
          onPress={() => onAddUsual(usual)}
          style={[
            ordersStyles.outlineButton,
            { backgroundColor: c.primary, borderColor: c.primary, borderRadius: ms(12), height: ms(42), gap: ms(6), marginTop: ms(4) },
          ]}
          accessibilityRole="button"
        >
          <Icon name="cart" size={ms(16)} color="#FFFFFF" />
          <Text style={[textStyles.button, { color: '#FFFFFF', fontSize: ms(14) }]}>
            Agregar al carrito · ${Number(usual.total).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (card.type === 'driver_message') {
    return (
      <View style={[box, ordersStyles.row, { gap: ms(8) }]}>
        <Icon name="bicycle" size={ms(18)} color={c.primary} />
        <Text style={[textStyles.body, { flex: 1, color: c.textDark, fontSize: ms(13) }]}>
          Enviado al repartidor (#{card.orderShortId}): “{card.text}”
        </Text>
      </View>
    );
  }

  if (card.type === 'eta' && card.eta) {
    return (
      <View style={[box, ordersStyles.row, { gap: ms(10) }]}>
        <Icon name="time" size={ms(20)} color={c.primary} />
        <Text style={[textStyles.bodyMedium, { flex: 1, color: c.textDark, fontSize: ms(13) }]}>
          Pedido #{card.order.shortId}: unos {card.eta.minutes} min (entre {card.eta.window?.[0]} y {card.eta.window?.[1]}).
        </Text>
      </View>
    );
  }

  return null;
};

export default PanchitaScreen;
