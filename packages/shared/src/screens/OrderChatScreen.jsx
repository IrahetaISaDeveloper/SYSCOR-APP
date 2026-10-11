import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuthTheme } from '../styles/authTheme';
import { FONT } from '../styles/typography';
import useOrderChat from '../hooks/useOrderChat';
import useKeyboardHeight from '../hooks/useKeyboardHeight';

// Chat directo de un pedido a domicilio entre el cliente y su repartidor.
// Lo registran las dos apps en su navegación como "OrderChat" con
// { orderId }; quién es quién lo decide el backend por la sesión.

const MAX_TEXT = 500;

const formatTime = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'a. m.' : 'p. m.'}`;
};

const dayLabel = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  return date.toLocaleDateString('es-SV', { day: 'numeric', month: 'long' });
};

export default function OrderChatScreen({ navigation, route }) {
  const orderId = route?.params?.orderId;
  const { t, isDark } = useAuthTheme();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const { chat, messages, loading, error, sendError, clearSendError, send } = useOrderChat(orderId);
  const [draft, setDraft] = useState('');

  const side = chat?.side;
  const isCustomer = side === 'customer';
  const title = chat?.counterpart || (isCustomer ? 'Tu repartidor' : route?.params?.title || 'Cliente');

  // La lista va invertida (lo más nuevo abajo); se le intercalan los
  // separadores de día.
  const rows = useMemo(() => {
    const list = [];
    messages.forEach((message, index) => {
      const previous = messages[index - 1];
      if (!previous || new Date(previous.createdAt).toDateString() !== new Date(message.createdAt).toDateString()) {
        list.push({ type: 'day', id: `day-${message.createdAt}`, label: dayLabel(message.createdAt) });
      }
      list.push({ type: 'message', id: message.id, message });
    });
    return list.reverse();
  }, [messages]);

  // Mis mensajes que el otro ya leyó (doble palomita); el último lleva "Visto".
  const { readIds, seenId } = useMemo(() => {
    const readAt = chat?.readByOther ? new Date(chat.readByOther).getTime() : 0;
    const read = messages.filter((m) => m.from === side && !m.pending && new Date(m.createdAt).getTime() <= readAt);
    return { readIds: new Set(read.map((m) => m.id)), seenId: read[read.length - 1]?.id || null };
  }, [chat?.readByOther, messages, side]);

  const submit = async (text, preset = false) => {
    const clean = String(text || '').trim();
    if (!clean) return;
    if (!preset) setDraft('');
    const ok = await send(clean, preset);
    if (!ok && !preset) setDraft(clean);
  };

  const bottomPad = keyboardHeight > 0 ? keyboardHeight + (Platform.OS === 'ios' ? 0 : 8) : Math.max(insets.bottom, 10);

  const renderRow = ({ item }) => {
    if (item.type === 'day') {
      return (
        <View style={styles.dayWrap}>
          <Text style={[styles.dayLabel, { color: t.textMuted, backgroundColor: t.surfaceMuted }]}>{item.label}</Text>
        </View>
      );
    }
    const { message } = item;
    const mine = message.from === side;
    return (
      <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : null]}>
        <View
          style={[
            styles.bubble,
            mine
              ? [styles.bubbleMine, { backgroundColor: t.accent }]
              : [styles.bubbleTheirs, { backgroundColor: t.surface, borderColor: t.border }],
            message.pending ? { opacity: 0.6 } : null,
          ]}
        >
          {message.preset ? (
            <Text style={[styles.presetTag, { color: mine ? 'rgba(255,255,255,0.8)' : t.textMuted }]}>
              MENSAJE RÁPIDO
            </Text>
          ) : null}
          <Text style={[styles.bubbleText, { color: mine ? '#FFFFFF' : t.textPrimary }]}>{message.text}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: mine ? 'rgba(255,255,255,0.75)' : t.textMuted }]}>
              {message.pending ? 'Enviando…' : formatTime(message.createdAt)}
            </Text>
            {mine && !message.pending ? (
              <Icon
                name={readIds.has(message.id) ? 'checkmark-done' : 'checkmark'}
                size={13}
                color="rgba(255,255,255,0.85)"
              />
            ) : null}
          </View>
        </View>
        {message.id === seenId ? <Text style={[styles.seen, { color: t.textMuted }]}>Visto</Text> : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.background }]} edges={['top', 'left', 'right']}>
      {/* Encabezado */}
      <View style={[styles.header, { borderBottomColor: t.border, backgroundColor: t.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Icon name="chevron-back" size={24} color={t.textPrimary} />
        </TouchableOpacity>
        <View style={[styles.avatar, { backgroundColor: t.accentSoft }]}>
          <Icon name={isCustomer ? 'bicycle' : 'person'} size={18} color={t.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: t.textMuted }]} numberOfLines={1}>
            {chat ? `PEDIDO ${chat.code}${chat.open ? '' : ' · CERRADO'}` : ' '}
          </Text>
        </View>
      </View>

      {loading && !chat ? (
        <View style={styles.center}>
          <ActivityIndicator color={t.accent} />
        </View>
      ) : error && !chat ? (
        <View style={styles.center}>
          <Icon name="chatbubble-ellipses-outline" size={34} color={t.textMuted} />
          <Text style={[styles.emptyText, { color: t.textSecondary }]}>{error}</Text>
        </View>
      ) : (
        <View style={{ flex: 1, paddingBottom: bottomPad }}>
          {isCustomer && !chat?.hasDriver && chat?.open ? (
            <Notice
              t={t}
              icon="time-outline"
              text="Aún no hay repartidor asignado. Lo que escribas lo verá quien lleve tu pedido."
            />
          ) : null}

          {rows.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Icon name="chatbubbles-outline" size={34} color={t.textMuted} />
              <Text style={[styles.emptyText, { color: t.textSecondary }]}>
                {isCustomer
                  ? 'Escríbele a tu repartidor: indicaciones para llegar, dónde dejarlo o cualquier detalle.'
                  : 'Escríbele al cliente si necesitas indicaciones para llegar o avisarle algo.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={rows}
              inverted
              keyExtractor={(item) => item.id}
              renderItem={renderRow}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
            />
          )}

          {chat?.open ? (
            <View style={[styles.composerWrap, { borderTopColor: t.border, backgroundColor: t.surface }]}>
              {isCustomer && chat.quickMessages?.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.quickRow}
                >
                  {chat.quickMessages.map((text) => (
                    <TouchableOpacity
                      key={text}
                      onPress={() => submit(text, true)}
                      style={[styles.quickChip, { borderColor: t.border, backgroundColor: t.background }]}
                      accessibilityRole="button"
                      accessibilityLabel={`Enviar: ${text}`}
                    >
                      <Text style={[styles.quickText, { color: t.textPrimary }]}>{text}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : null}

              {sendError ? (
                <TouchableOpacity onPress={clearSendError} style={styles.sendErrorRow}>
                  <Icon name="alert-circle" size={14} color={t.danger} />
                  <Text style={[styles.sendErrorText, { color: t.danger }]}>{sendError}</Text>
                </TouchableOpacity>
              ) : null}

              <View style={styles.composer}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Escribe un mensaje"
                  placeholderTextColor={t.textMuted}
                  maxLength={MAX_TEXT}
                  multiline
                  keyboardAppearance={isDark ? 'dark' : 'light'}
                  style={[
                    styles.input,
                    { color: t.textPrimary, borderColor: t.border, backgroundColor: t.background },
                  ]}
                />
                <TouchableOpacity
                  onPress={() => submit(draft)}
                  disabled={!draft.trim()}
                  style={[styles.sendButton, { backgroundColor: t.accent, opacity: draft.trim() ? 1 : 0.45 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Enviar mensaje"
                >
                  <Icon name="send" size={17} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : chat ? (
            <Notice t={t} icon="lock-closed-outline" text="El pedido ya terminó. La conversación queda solo para consulta." />
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}

function Notice({ t, icon, text }) {
  return (
    <View style={[styles.notice, { backgroundColor: t.surfaceMuted, borderColor: t.border }]}>
      <Icon name={icon} size={16} color={t.textSecondary} />
      <Text style={[styles.noticeText, { color: t.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: FONT.display, fontSize: 17, letterSpacing: -0.2 },
  headerSubtitle: { fontFamily: FONT.monoMedium, fontSize: 11, letterSpacing: 0.6, marginTop: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  list: { paddingHorizontal: 14, paddingVertical: 12, flexGrow: 1 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24 },
  emptyText: { fontFamily: FONT.sans, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  dayWrap: { alignItems: 'center', marginVertical: 10 },
  dayLabel: {
    fontFamily: FONT.monoMedium,
    fontSize: 10.5,
    letterSpacing: 0.6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  bubbleRow: { alignItems: 'flex-start', marginVertical: 3 },
  bubbleRowMine: { alignItems: 'flex-end' },
  bubble: { maxWidth: '80%', paddingHorizontal: 13, paddingTop: 9, paddingBottom: 6, borderRadius: 18 },
  bubbleMine: { borderBottomRightRadius: 6 },
  bubbleTheirs: { borderBottomLeftRadius: 6, borderWidth: 1 },
  presetTag: { fontFamily: FONT.monoMedium, fontSize: 9, letterSpacing: 0.6, marginBottom: 2 },
  bubbleText: { fontFamily: FONT.sans, fontSize: 15, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 3 },
  metaText: { fontFamily: FONT.sans, fontSize: 10.5 },
  seen: { fontFamily: FONT.sans, fontSize: 11, marginTop: 3, marginRight: 4 },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 14,
    marginVertical: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  noticeText: { flex: 1, fontFamily: FONT.sans, fontSize: 13, lineHeight: 18 },
  composerWrap: { borderTopWidth: 1, paddingTop: 8 },
  quickRow: { gap: 8, paddingHorizontal: 12, paddingBottom: 8 },
  quickChip: { paddingHorizontal: 12, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center' },
  quickText: { fontFamily: FONT.sans, fontSize: 12.5 },
  sendErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingBottom: 6 },
  sendErrorText: { flex: 1, fontFamily: FONT.sans, fontSize: 12 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingBottom: 4 },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 21,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    fontFamily: FONT.sans,
    fontSize: 15,
  },
  sendButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
});
