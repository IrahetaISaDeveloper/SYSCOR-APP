import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { waiterColors as c } from '../../styles/waiterTheme';

const TYPE_LABELS = { saucer: 'PLATILLO', combo: 'COMBO', drink: 'BEBIDA', extra: 'EXTRA' };

// Revisión de la orden antes de mandarla a cocina: cantidades, un comentario
// por producto ("sin cebolla") y uno general para toda la comanda. Sin
// precios: el pago queda pendiente y el método se define al cobrar.
export default function OrderReviewSheet({
  visible,
  onClose,
  table,
  lines,
  onChangeQuantity,
  onChangeLineNotes,
  notes,
  onChangeNotes,
  submitting,
  onSend,
}) {
  const { ms, gutter } = useAuthMetrics();
  const insets = useSafeAreaInsets();
  // Productos con el campo de comentario abierto.
  const [openNotes, setOpenNotes] = useState({});

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            { borderTopLeftRadius: ms(24), borderTopRightRadius: ms(24), paddingTop: ms(10) },
          ]}
        >
          <View style={[styles.handle, { width: ms(40), marginBottom: ms(14) }]} />

          {/* ── ENCABEZADO ── */}
          <View style={[styles.row, { paddingHorizontal: gutter, gap: ms(12), marginBottom: ms(12) }]}>
            <View style={{ flex: 1 }}>
              <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>
                MESA {table.number} · {itemCount} {itemCount === 1 ? 'PRODUCTO' : 'PRODUCTOS'}
              </Text>
              <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(22) }]}>Orden</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={10}
              style={[styles.closeButton, { width: ms(36), height: ms(36), borderRadius: ms(18) }]}
              accessibilityLabel="Seguir agregando"
            >
              <Icon name="close" size={ms(19)} color={c.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: ms(12), gap: ms(10) }}
            keyboardShouldPersistTaps="handled"
          >
            {lines.length === 0 ? (
              <View style={[styles.center, { paddingVertical: ms(30), gap: ms(8) }]}>
                <Icon name="receipt-outline" size={ms(28)} color={c.textLight} />
                <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5) }]}>
                  La orden está vacía. Agrega productos desde el menú.
                </Text>
              </View>
            ) : (
              lines.map((line) => {
                const showNotes = openNotes[line.key] || !!line.notes;
                return (
                  <View key={line.key} style={[styles.card, { borderRadius: ms(16), padding: ms(12), gap: ms(10) }]}>
                    <View style={[styles.row, { gap: ms(10) }]}>
                      <View style={{ flex: 1, gap: ms(2) }}>
                        <Text style={[textStyles.kicker, { color: c.textLight, fontSize: ms(9) }]}>
                          {TYPE_LABELS[line.itemType] || ''}
                          {line.subcategory ? ` · ${line.subcategory.toUpperCase()}` : ''}
                        </Text>
                        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(15) }]} numberOfLines={2}>
                          {line.name}
                        </Text>
                      </View>

                      <View style={[styles.row, styles.stepper, { borderRadius: ms(12), height: ms(36) }]}>
                        <TouchableOpacity
                          onPress={() => onChangeQuantity(line, -1)}
                          style={[styles.stepperButton, { width: ms(36) }]}
                          accessibilityLabel={`Quitar un ${line.name}`}
                        >
                          <Icon name={line.quantity === 1 ? 'trash-outline' : 'remove'} size={ms(16)} color={c.primary} />
                        </TouchableOpacity>
                        <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(15), minWidth: ms(20), textAlign: 'center' }]}>
                          {line.quantity}
                        </Text>
                        <TouchableOpacity
                          onPress={() => onChangeQuantity(line, 1)}
                          style={[styles.stepperButton, { width: ms(36) }]}
                          accessibilityLabel={`Agregar otro ${line.name}`}
                        >
                          <Icon name="add" size={ms(17)} color={c.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {showNotes ? (
                      <View style={[styles.row, styles.noteInput, { borderRadius: ms(10), paddingHorizontal: ms(10), gap: ms(8) }]}>
                        <Icon name="chatbubble-ellipses-outline" size={ms(15)} color={c.textGray} />
                        <TextInput
                          style={[textStyles.body, { flex: 1, color: c.textDark, fontSize: ms(13), paddingVertical: ms(8) }]}
                          value={line.notes}
                          onChangeText={(text) => onChangeLineNotes(line.key, text)}
                          placeholder="Ej. sin cebolla, salsa aparte"
                          placeholderTextColor={c.textLight}
                          maxLength={120}
                          autoFocus={!line.notes && openNotes[line.key]}
                        />
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setOpenNotes((prev) => ({ ...prev, [line.key]: true }))}
                        style={[styles.row, { gap: ms(6), alignSelf: 'flex-start' }]}
                        hitSlop={6}
                      >
                        <Icon name="add-circle-outline" size={ms(15)} color={c.primary} />
                        <Text style={[textStyles.link, { color: c.primary, fontSize: ms(12.5) }]}>Agregar comentario</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}

            {/* ── COMENTARIOS GENERALES ── */}
            {lines.length > 0 ? (
              <View style={{ gap: ms(8), marginTop: ms(4) }}>
                <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>COMENTARIOS PARA COCINA</Text>
                <TextInput
                  style={[
                    textStyles.body,
                    styles.notesBox,
                    { borderRadius: ms(14), padding: ms(12), fontSize: ms(13.5), minHeight: ms(76) },
                  ]}
                  value={notes}
                  onChangeText={onChangeNotes}
                  placeholder="Ej. traer todo junto, un niño en la mesa…"
                  placeholderTextColor={c.textLight}
                  multiline
                  maxLength={300}
                  textAlignVertical="top"
                />
              </View>
            ) : null}
          </ScrollView>

          {/* ── PIE: pago y envío ── */}
          <View
            style={[
              styles.footer,
              { paddingHorizontal: gutter, paddingTop: ms(12), paddingBottom: Math.max(insets.bottom, ms(14)), gap: ms(10) },
            ]}
          >
            <View style={[styles.row, { gap: ms(8) }]}>
              <Icon name="wallet-outline" size={ms(15)} color={c.textGray} />
              <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5), flex: 1 }]}>
                Pago pendiente · método por definir al cobrar
              </Text>
            </View>
            <TouchableOpacity
              onPress={onSend}
              disabled={submitting || lines.length === 0}
              activeOpacity={0.9}
              style={[
                styles.row,
                styles.sendButton,
                { height: ms(54), borderRadius: ms(16), gap: ms(8), opacity: lines.length === 0 ? 0.5 : 1 },
              ]}
              accessibilityRole="button"
            >
              {submitting ? (
                <ActivityIndicator color={c.white} />
              ) : (
                <>
                  <Icon name="flame-outline" size={ms(19)} color={c.white} />
                  <Text style={[textStyles.button, { color: c.white, fontSize: ms(16) }]}>Enviar a cocina</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: c.background,
  },
  handle: {
    alignSelf: 'center',
    height: 4,
    borderRadius: 2,
    backgroundColor: c.borderStrong,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  card: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  stepper: {
    backgroundColor: c.primaryTint,
  },
  stepperButton: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteInput: {
    backgroundColor: c.surfaceMuted,
  },
  notesBox: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    color: c.textDark,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.background,
  },
  sendButton: {
    justifyContent: 'center',
    backgroundColor: c.primary,
  },
});
