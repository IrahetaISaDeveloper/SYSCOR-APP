import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { textStyles } from '../../styles/typography';
import useKeyboardHeight from '../../hooks/useKeyboardHeight';
import PanchitaImage from './PanchitaImage';
import useLoginHelpChat from '../../hooks/useLoginHelpChat';
import {
  SUPPORT_PHONE,
  SUPPORT_TEL_URL,
  SUPPORT_WHATSAPP_URL,
} from '../../constants/support';

// Panel de ayuda de Chef Panchita en la pantalla de acceso.
//
// Se abre desde la burbuja flotante. Las preguntas más comunes están siempre
// a mano, con su respuesta ya escrita: el cliente resuelve lo habitual con un
// solo toque. Al final de cada respuesta pregunta si el problema se resolvió
// y, si dice que no, muestra el teléfono directo y WhatsApp del equipo.
export default function PanchitaChatSheet({
  visible,
  onClose,
  tokens,
  metrics,
  isDark,
  onStartRecovery,
}) {
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardHeight();
  const ms = metrics.ms;
  const scrollRef = useRef(null);

  const {
    messages,
    sending,
    awaitingFeedback,
    showSupport,
    offerRecovery,
    send,
    askPreset,
    presets,
    confirmSolved,
    requestSupport,
  } = useLoginHelpChat();

  const [input, setInput] = useState('');
  // Las preguntas hechas ya no se vuelven a ofrecer.
  const [usedPresets, setUsedPresets] = useState([]);

  const remainingPresets = presets.filter((p) => !usedPresets.includes(p.id));

  // Cada mensaje nuevo desplaza la conversación al final. También al abrirse
  // el teclado: el panel cambia de altura y el último mensaje quedaría tapado.
  // Se hace dos veces porque el primer intento cae mientras el panel aún se
  // está redimensionando.
  useEffect(() => {
    if (!visible) return undefined;
    const toEnd = () => scrollRef.current?.scrollToEnd({ animated: true });
    const first = setTimeout(toEnd, 80);
    const second = setTimeout(toEnd, 320);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, [messages, sending, visible, keyboard]);

  const onSubmit = () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    send(text);
  };

  const onPressPreset = (item) => {
    setUsedPresets((prev) => [...prev, item.id]);
    askPreset(item);
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  // Espacio que hay que dejar libre abajo: el teclado cuando está abierto,
  // o el borde inferior seguro cuando no. No se usa KeyboardAvoidingView
  // porque con `edgeToEdgeEnabled` Android no redimensiona la ventana.
  const bottomInset = keyboard > 0 ? keyboard : Math.max(insets.bottom, ms(12));

  // Altura del panel. Tiene que ser una medida concreta, no `maxHeight`: el
  // ScrollView de la conversación lleva `flex: 1` y, dentro de un contenedor
  // que se ajusta a su contenido, colapsaría a cero y no se vería ningún
  // mensaje.
  //
  // El alto se mide siempre contra el espacio que queda LIBRE por encima del
  // teclado. Antes se restaba solo una fracción del teclado mientras el
  // `paddingBottom` crecía entero, así que en la mayoría de los teléfonos el
  // padding acababa siendo mayor que el propio panel y la barra de escritura
  // se salía de la pantalla.
  const available = metrics.height - bottomInset - insets.top;
  const sheetHeight =
    (keyboard > 0
      ? // Con el teclado abierto se ocupa casi todo el hueco disponible: así
        // la barra de escritura queda justo encima de él.
        available * 0.96
      : Math.min(available, metrics.height * 0.75)) + bottomInset;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        {/* Tocar fuera cierra el panel */}
        <TouchableOpacity style={styles.flex} activeOpacity={1} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: tokens.background,
              borderTopLeftRadius: ms(22),
              borderTopRightRadius: ms(22),
              paddingBottom: bottomInset,
              height: sheetHeight,
            },
          ]}
        >
          {/* Encabezado */}
          <View
            style={[
              styles.header,
              { borderBottomColor: tokens.border, padding: ms(16), gap: ms(11) },
            ]}
          >
            <View
              style={[
                styles.avatarRing,
                {
                  backgroundColor: tokens.accentSoft,
                  width: ms(42),
                  height: ms(42),
                  borderRadius: ms(21),
                },
              ]}
            >
              <PanchitaImage
                variant="icon"
                isDark={isDark}
                style={{ width: ms(30), height: ms(30) }}
              />
            </View>

            <View style={styles.flex}>
              <Text style={[styles.headerTitle, { color: tokens.textPrimary, fontSize: ms(15) }]}>
                Chef Panchita
              </Text>
              <Text style={[styles.headerNote, { color: tokens.textMuted, fontSize: ms(11.5) }]}>
                AYUDA PARA ENTRAR
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Cerrar ayuda"
            >
              <Icon name="close" size={ms(22)} color={tokens.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Conversación */}
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={{ padding: ms(16), gap: ms(12) }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m) =>
              m.role === 'user' ? (
                <View
                  key={m.id}
                  style={[
                    styles.userBubble,
                    {
                      backgroundColor: tokens.accentSoft,
                      borderColor: tokens.accent,
                      borderRadius: ms(14),
                      paddingHorizontal: ms(13),
                      paddingVertical: ms(9),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.bodyText,
                      { color: tokens.textPrimary, fontSize: ms(13.5), lineHeight: ms(19) },
                    ]}
                  >
                    {m.text}
                  </Text>
                </View>
              ) : (
                <View key={m.id} style={[styles.modelRow, { gap: ms(9) }]}>
                  <PanchitaImage
                    variant="answered"
                    isDark={isDark}
                    style={{ width: ms(26), height: ms(38) }}
                  />
                  <Text
                    style={[
                      styles.bodyText,
                      styles.flex,
                      { color: tokens.textSecondary, fontSize: ms(13.5), lineHeight: ms(19) },
                    ]}
                  >
                    {m.text}
                  </Text>
                </View>
              ),
            )}

            {sending ? (
              <View style={[styles.modelRow, { gap: ms(9) }]}>
                <PanchitaImage
                  variant="avatar"
                  isDark={isDark}
                  style={{ width: ms(26), height: ms(38) }}
                />
                <ActivityIndicator size="small" color={tokens.accent} />
              </View>
            ) : null}

            {/* Atajo a recuperar contraseña, si ese resultó ser el problema */}
            {offerRecovery && onStartRecovery && !sending ? (
              <TouchableOpacity
                onPress={() => {
                  onClose?.();
                  onStartRecovery();
                }}
                activeOpacity={0.8}
                style={[
                  styles.row,
                  {
                    backgroundColor: tokens.accentSoft,
                    borderColor: tokens.accent,
                    borderRadius: ms(12),
                    paddingHorizontal: ms(14),
                    paddingVertical: ms(13),
                    gap: ms(10),
                  },
                ]}
              >
                <Icon name="key-outline" size={ms(17)} color={tokens.accent} />
                <Text
                  style={[
                    styles.linkText,
                    styles.flex,
                    { color: tokens.textPrimary, fontSize: ms(13.5) },
                  ]}
                >
                  Recuperar mi contraseña
                </Text>
                <Icon name="chevron-forward" size={ms(16)} color={tokens.accent} />
              </TouchableOpacity>
            ) : null}

            {/* "¿Se ha solucionado su problema?" tras cada respuesta */}
            {awaitingFeedback && !sending ? (
              <View
                style={[
                  styles.feedbackBox,
                  {
                    backgroundColor: tokens.surface,
                    borderColor: tokens.border,
                    borderRadius: ms(12),
                    padding: ms(13),
                    gap: ms(10),
                  },
                ]}
              >
                <Text style={[styles.linkText, { color: tokens.textPrimary, fontSize: ms(13.5) }]}>
                  ¿Se ha solucionado su problema?
                </Text>

                <View style={[styles.feedbackRow, { gap: ms(9) }]}>
                  <TouchableOpacity
                    onPress={confirmSolved}
                    activeOpacity={0.8}
                    style={[
                      styles.feedbackButton,
                      {
                        backgroundColor: tokens.accent,
                        borderRadius: ms(10),
                        paddingVertical: ms(11),
                        gap: ms(6),
                      },
                    ]}
                  >
                    <Icon name="checkmark" size={ms(15)} color="#FFFFFF" />
                    <Text style={[styles.buttonText, { color: '#FFFFFF', fontSize: ms(13) }]}>
                      Sí, gracias
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={requestSupport}
                    activeOpacity={0.8}
                    style={[
                      styles.feedbackButton,
                      {
                        borderWidth: 1,
                        borderColor: tokens.borderStrong,
                        borderRadius: ms(10),
                        paddingVertical: ms(11),
                        gap: ms(6),
                      },
                    ]}
                  >
                    <Text
                      style={[styles.buttonText, { color: tokens.textPrimary, fontSize: ms(13) }]}
                    >
                      No, necesito ayuda
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {/* Salida real cuando Panchita no alcanza: llamada o WhatsApp */}
            {showSupport ? (
              <View style={{ gap: ms(8) }}>
                <TouchableOpacity
                  onPress={() => openLink(SUPPORT_TEL_URL)}
                  activeOpacity={0.8}
                  style={[
                    styles.row,
                    {
                      backgroundColor: tokens.surface,
                      borderColor: tokens.border,
                      borderRadius: ms(12),
                      paddingHorizontal: ms(14),
                      paddingVertical: ms(13),
                      gap: ms(11),
                    },
                  ]}
                >
                  <Icon name="call-outline" size={ms(18)} color={tokens.accent} />
                  <Text
                    style={[
                      styles.linkText,
                      styles.flex,
                      { color: tokens.textPrimary, fontSize: ms(13.5) },
                    ]}
                  >
                    Llamar al equipo
                  </Text>
                  <Text style={[styles.numText, { color: tokens.textMuted, fontSize: ms(12.5) }]}>
                    {SUPPORT_PHONE}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => openLink(SUPPORT_WHATSAPP_URL)}
                  activeOpacity={0.8}
                  style={[
                    styles.row,
                    {
                      backgroundColor: tokens.surface,
                      borderColor: tokens.border,
                      borderRadius: ms(12),
                      paddingHorizontal: ms(14),
                      paddingVertical: ms(13),
                      gap: ms(11),
                    },
                  ]}
                >
                  <Icon name="logo-whatsapp" size={ms(18)} color="#25D366" />
                  <Text
                    style={[
                      styles.linkText,
                      styles.flex,
                      { color: tokens.textPrimary, fontSize: ms(13.5) },
                    ]}
                  >
                    Escribir por WhatsApp
                  </Text>
                  <Text style={[styles.numText, { color: tokens.textMuted, fontSize: ms(12.5) }]}>
                    {SUPPORT_PHONE}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Preguntas listas para tocar. Siguen disponibles toda la
                conversación, no solo al abrir. */}
            {remainingPresets.length > 0 && !sending ? (
              <View style={{ gap: ms(8), marginTop: ms(4) }}>
                <Text style={[styles.presetsLabel, { color: tokens.textMuted, fontSize: ms(10.5) }]}>
                  {messages.length === 1 ? '¿CON QUÉ TE AYUDO?' : 'OTRAS PREGUNTAS'}
                </Text>

                {remainingPresets.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => onPressPreset(item)}
                    activeOpacity={0.7}
                    style={[
                      styles.row,
                      {
                        backgroundColor: tokens.surface,
                        borderColor: tokens.border,
                        borderRadius: ms(12),
                        paddingHorizontal: ms(14),
                        paddingVertical: ms(13),
                        gap: ms(11),
                      },
                    ]}
                  >
                    <Icon name={item.icon} size={ms(17)} color={tokens.accent} />
                    <Text
                      style={[
                        styles.bodyText,
                        styles.flex,
                        { color: tokens.textPrimary, fontSize: ms(13.5) },
                      ]}
                    >
                      {item.question}
                    </Text>
                    <Icon name="chevron-forward" size={ms(16)} color={tokens.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </ScrollView>

          {/* Entrada */}
          <View
            style={[
              styles.inputBar,
              {
                borderTopColor: tokens.border,
                paddingHorizontal: ms(16),
                paddingTop: ms(11),
                gap: ms(9),
              },
            ]}
          >
            <View
              style={[
                styles.inputField,
                {
                  backgroundColor: tokens.surface,
                  borderColor: tokens.border,
                  borderRadius: ms(12),
                  paddingHorizontal: ms(14),
                  minHeight: ms(46),
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: tokens.textPrimary, fontSize: ms(14) }]}
                value={input}
                onChangeText={setInput}
                placeholder="O escribe tu pregunta…"
                placeholderTextColor={tokens.textMuted}
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={onSubmit}
                editable={!sending}
              />
            </View>

            <TouchableOpacity
              onPress={onSubmit}
              disabled={sending || !input.trim()}
              activeOpacity={0.8}
              style={[
                styles.sendButton,
                {
                  backgroundColor: tokens.accent,
                  width: ms(46),
                  height: ms(46),
                  borderRadius: ms(12),
                },
                (sending || !input.trim()) && styles.sendDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Enviar pregunta"
            >
              <Icon name="send" size={ms(17)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  avatarRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...textStyles.title,
  },
  headerNote: {
    ...textStyles.kicker,
    marginTop: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    borderWidth: 1,
  },
  modelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bodyText: {
    ...textStyles.body,
  },
  linkText: {
    ...textStyles.link,
  },
  numText: {
    ...textStyles.num,
  },
  buttonText: {
    ...textStyles.button,
  },
  presetsLabel: {
    ...textStyles.kicker,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  feedbackBox: {
    borderWidth: 1,
  },
  feedbackRow: {
    flexDirection: 'row',
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  inputField: {
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
  },
  input: {
    ...textStyles.body,
    padding: 0,
  },
  sendButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.45,
  },
});
