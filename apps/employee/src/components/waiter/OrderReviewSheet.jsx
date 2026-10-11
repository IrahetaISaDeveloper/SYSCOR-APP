import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useKeyboardHeight from '@syscor/shared/src/hooks/useKeyboardHeight';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useAuth } from '@syscor/shared/src/context/AuthContext';
import { getDisplayName } from '@syscor/shared/src/utils/userDisplay';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { describeCustomization, formatMoney } from '../../utils/productOptions';
import { useTheme, makeStyles } from "../../theme/ThemeContext";

const TYPE_LABELS = { saucer: 'PLATILLO', combo: 'COMBO', drink: 'BEBIDA', extra: 'EXTRA' };

const formatTime = (date) =>
  date.toLocaleTimeString('es-SV', { hour: 'numeric', minute: '2-digit', hour12: true });

// La orden de la mesa en dos pasos:
//   1. "Orden": cantidades, un comentario por producto y comentarios para
//      cocina. El botón de abajo es "Resumen de orden".
//   2. "Resumen": lo que el mesero le lee al cliente para confirmar (mesa,
//      cliente, quién la toma, cada producto con lo que cambió). Desde aquí
//      se manda a cocina.
// Con precios por producto y total. El pago queda pendiente y el método se
// define al cobrar.
export default function OrderReviewSheet({
  visible,
  onClose,
  table,
  lines,
  total,
  onChangeQuantity,
  onChangeLineNotes,
  splitCourses,
  onChangeSplitCourses,
  coursesActive,
  onChangeLineCourse,
  waitSecond,
  onChangeWaitSecond,
  notes,
  onChangeNotes,
  submitting,
  onSend,
}) {
  const { c } = useTheme();
  const styles = useStyles();
  const { ms, gutter, height: windowHeight } = useAuthMetrics();
  const insets = useSafeAreaInsets();
  // Sin KeyboardAvoidingView: con edge-to-edge Android no redimensiona la
  // ventana y la hoja brincaba. Se mide el teclado y se sube el contenido a
  // mano, igual que el chat de Panchita (PanchitaChatSheet).
  const keyboard = useKeyboardHeight();
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const waiterName = getDisplayName(user);
  const [step, setStep] = useState('review');
  // Productos con el campo de comentario abierto.
  const [openNotes, setOpenNotes] = useState({});

  // Cada vez que se abre, empieza en la orden.
  useEffect(() => {
    if (visible) setStep('review');
  }, [visible]);

  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const isSummary = step === 'summary';

  // En el resumen, por tiempos se lee primero lo que sale ya.
  const summaryGroups = coursesActive
    ? [
        { key: 1, title: 'PRIMER TIEMPO · SALE YA', lines: lines.filter((l) => l.course === 1) },
        {
          key: 2,
          title: waitSecond ? 'SEGUNDO TIEMPO · CUANDO LO MARCHES' : 'SEGUNDO TIEMPO · SE PREPARA YA',
          lines: lines.filter((l) => l.course !== 1),
        },
      ]
    : [{ key: 0, title: null, lines }];

  const people = table.peopleCount || table.capacity;
  const details = [
    { icon: 'restaurant-outline', label: 'Servicio', value: 'Para comer en el restaurante' },
    { icon: 'grid-outline', label: 'Mesa', value: `Mesa ${table.number}${people ? ` · ${people} personas` : ''}` },
    table.customerName ? { icon: 'person-outline', label: 'Cliente', value: table.customerName } : null,
    { icon: 'id-card-outline', label: 'Tomada por', value: waiterName || 'Mesero' },
    { icon: 'time-outline', label: 'Hora', value: formatTime(new Date()) },
    coursesActive
      ? {
          icon: 'git-branch-outline',
          label: 'Tiempos',
          value: waitSecond ? '1º sale ya · 2º cuando lo marches' : '1º y 2º se preparan ya, por separado',
        }
      : null,
    { icon: 'wallet-outline', label: 'Pago', value: 'Pendiente · método por definir' },
  ].filter(Boolean);

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="slide" onRequestClose={isSummary ? () => setStep('review') : onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View style={[styles.sheet, {
              // Con el teclado abierto la hoja se apoya encima de él y cabe en el
              // espacio libre que queda arriba.
              marginBottom: keyboard,
              maxHeight: (windowHeight - keyboard - insets.top) * (keyboard > 0 ? 0.97 : 0.9),
              borderTopLeftRadius: ms(24), borderTopRightRadius: ms(24), paddingTop: ms(10) }]}>
          <View style={[styles.handle, { width: ms(40), marginBottom: ms(14) }]} />

          {/* ── ENCABEZADO ── */}
          <View style={[styles.row, { paddingHorizontal: gutter, gap: ms(12), marginBottom: ms(12) }]}>
            {isSummary ? (
              <TouchableOpacity
                onPress={() => setStep('review')}
                hitSlop={10}
                style={[styles.circle, { width: ms(36), height: ms(36), borderRadius: ms(18) }]}
                accessibilityLabel="Volver a la orden"
              >
                <Icon name="chevron-back" size={ms(19)} color={c.textDark} />
              </TouchableOpacity>
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>
                MESA {table.number} · {itemCount} {itemCount === 1 ? 'PRODUCTO' : 'PRODUCTOS'}
              </Text>
              <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(22) }]}>
                {isSummary ? 'Resumen de orden' : 'Orden'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={10}
              style={[styles.circle, { width: ms(36), height: ms(36), borderRadius: ms(18) }]}
              accessibilityLabel="Seguir agregando"
            >
              <Icon name="close" size={ms(19)} color={c.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            style={{ flexGrow: 0, flexShrink: 1 }}
            contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: ms(12), gap: ms(10) }}
            keyboardShouldPersistTaps="handled"
          >
            {isSummary ? (
              <>
                {/* ── DATOS DE LA ORDEN ── */}
                <View style={[styles.card, { borderRadius: ms(16), padding: ms(14), gap: ms(10) }]}>
                  {details.map((d) => (
                    <View key={d.label} style={[styles.row, { gap: ms(10) }]}>
                      <Icon name={d.icon} size={ms(16)} color={c.textGray} />
                      <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(9.5), width: ms(78) }]}>
                        {d.label.toUpperCase()}
                      </Text>
                      <Text style={[textStyles.bodyMedium, { flex: 1, color: c.textDark, fontSize: ms(13.5) }]}>{d.value}</Text>
                    </View>
                  ))}
                </View>

                {/* ── LO QUE SE LE LEE AL CLIENTE ── */}
                <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10), marginTop: ms(6) }]}>
                  LÉASELO AL CLIENTE
                </Text>
                <View style={[styles.card, { borderRadius: ms(16), paddingHorizontal: ms(14) }]}>
                  {summaryGroups.map((group, gi) => (
                    <React.Fragment key={group.key}>
                    {group.title ? (
                      <Text
                        style={[
                          textStyles.kicker,
                          { color: '#C9402F', fontSize: ms(9.5), paddingTop: ms(12) },
                          gi > 0 && styles.divider,
                        ]}
                      >
                        {group.title}
                      </Text>
                    ) : null}
                    {group.lines.map((line, i) => {
                    const rows = describeCustomization(line.custom);
                    return (
                      <View
                        key={line.lineKey}
                        style={[
                          styles.row,
                          { alignItems: 'flex-start', gap: ms(12), paddingVertical: ms(12) },
                          i > 0 && styles.divider,
                        ]}
                      >
                        <Text style={[textStyles.title, { color: c.primary, fontSize: ms(17), minWidth: ms(30) }]}>
                          {line.quantity}×
                        </Text>
                        <View style={{ flex: 1, gap: ms(3) }}>
                          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(16) }]}>{line.name}</Text>
                          {rows.map((row) => (
                            <Text key={row} style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5) }]}>
                              • {row}
                            </Text>
                          ))}
                          {line.notes?.trim() ? (
                            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5), fontStyle: 'italic' }]}>
                              “{line.notes.trim()}”
                            </Text>
                          ) : null}
                        </View>
                        <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(14.5) }]}>
                          {formatMoney(line.unitPrice * line.quantity)}
                        </Text>
                      </View>
                    );
                    })}
                    </React.Fragment>
                  ))}
                  <View style={[styles.row, styles.divider, { paddingVertical: ms(12) }]}>
                    <Text style={[textStyles.title, { flex: 1, color: c.textDark, fontSize: ms(16) }]}>Total</Text>
                    <Text style={[textStyles.num, { color: c.primary, fontSize: ms(19) }]}>{formatMoney(total)}</Text>
                  </View>
                </View>

                {notes.trim() ? (
                  <View style={[styles.card, { borderRadius: ms(16), padding: ms(14), gap: ms(4) }]}>
                    <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(9.5) }]}>COMENTARIOS PARA COCINA</Text>
                    <Text style={[textStyles.body, { color: c.textDark, fontSize: ms(13.5) }]}>{notes.trim()}</Text>
                  </View>
                ) : null}
              </>
            ) : lines.length === 0 ? (
              <View style={[styles.center, { paddingVertical: ms(30), gap: ms(8) }]}>
                <Icon name="receipt-outline" size={ms(28)} color={c.textLight} />
                <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5) }]}>
                  La orden está vacía. Agrega productos desde el menú.
                </Text>
              </View>
            ) : (
              <>
                {lines.map((line) => {
                  const showNotes = openNotes[line.lineKey] || !!line.notes;
                  const rows = describeCustomization(line.custom);
                  return (
                    <View key={line.lineKey} style={[styles.card, { borderRadius: ms(16), padding: ms(12), gap: ms(10) }]}>
                      <View style={[styles.row, { gap: ms(10) }]}>
                        <View style={{ flex: 1, gap: ms(2) }}>
                          <Text style={[textStyles.kicker, { color: c.textLight, fontSize: ms(9) }]}>
                            {TYPE_LABELS[line.itemType] || ''}
                            {line.subcategory ? ` · ${line.subcategory.toUpperCase()}` : ''}
                          </Text>
                          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(15) }]} numberOfLines={2}>
                            {line.name}
                          </Text>
                          {rows.length ? (
                            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>{rows.join(' · ')}</Text>
                          ) : null}
                          <Text style={[textStyles.num, { color: c.primary, fontSize: ms(14), marginTop: ms(2) }]}>
                            {formatMoney(line.unitPrice * line.quantity)}
                            {line.quantity > 1 ? (
                              <Text style={{ color: c.textLight, fontSize: ms(11.5) }}>{`  ${formatMoney(line.unitPrice)} c/u`}</Text>
                            ) : null}
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

                      {/* Tiempo de este producto */}
                      {splitCourses ? (
                        <View style={[styles.row, { gap: ms(6) }]}>
                          {[1, 2].map((course) => {
                            const active = (line.course === 1 ? 1 : 2) === course;
                            return (
                              <TouchableOpacity
                                key={course}
                                onPress={() => onChangeLineCourse(line.lineKey, course)}
                                style={[
                                  styles.courseChip,
                                  {
                                    borderRadius: ms(10),
                                    paddingHorizontal: ms(10),
                                    paddingVertical: ms(5),
                                    backgroundColor: active ? c.textDark : c.surface,
                                    borderColor: active ? c.textDark : c.border,
                                  },
                                ]}
                                accessibilityRole="radio"
                                accessibilityState={{ selected: active }}
                              >
                                <Text style={[active ? textStyles.link : textStyles.body, { color: active ? c.white : c.textGray, fontSize: ms(12) }]}>
                                  {course === 1 ? '1er tiempo' : '2º tiempo'}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ) : null}

                      {showNotes ? (
                        <View style={[styles.row, styles.noteInput, { borderRadius: ms(10), paddingHorizontal: ms(10), gap: ms(8) }]}>
                          <Icon name="chatbubble-ellipses-outline" size={ms(15)} color={c.textGray} />
                          <TextInput
                            style={[textStyles.body, { flex: 1, color: c.textDark, fontSize: ms(13), paddingVertical: ms(8) }]}
                            value={line.notes}
                            onChangeText={(text) => onChangeLineNotes(line.lineKey, text)}
                            placeholder="Ej. bien dorado, salsa aparte"
                            placeholderTextColor={c.textLight}
                            maxLength={120}
                            autoFocus={!line.notes && openNotes[line.lineKey]}
                          />
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => setOpenNotes((prev) => ({ ...prev, [line.lineKey]: true }))}
                          style={[styles.row, { gap: ms(6), alignSelf: 'flex-start' }]}
                          hitSlop={6}
                        >
                          <Icon name="add-circle-outline" size={ms(15)} color={c.primary} />
                          <Text style={[textStyles.link, { color: c.primary, fontSize: ms(12.5) }]}>Agregar comentario</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}

                {/* ── ¿CÓMO SALE LA ORDEN? ── */}
                <View style={[styles.card, { borderRadius: ms(16), padding: ms(14), gap: ms(10), marginTop: ms(4) }]}>
                  <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>¿CÓMO SALE LA ORDEN?</Text>
                  <Segmented
                    options={[
                      { key: false, label: 'Todo junto', icon: 'albums-outline' },
                      { key: true, label: 'Por tiempos', icon: 'git-branch-outline' },
                    ]}
                    value={!!splitCourses}
                    onChange={onChangeSplitCourses}
                    ms={ms}
                  />
                  {splitCourses ? (
                    <>
                      <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5), lineHeight: ms(17) }]}>
                        Bebidas y entradas salen en el 1er tiempo; el plato fuerte, en el 2º. Cambia cualquier producto de tiempo arriba.
                      </Text>
                      <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(9.5), marginTop: ms(2) }]}>EL 2º TIEMPO</Text>
                      <Segmented
                        options={[
                          { key: true, label: 'Cuando lo marche', icon: 'hand-left-outline' },
                          { key: false, label: 'Prepararlo ya', icon: 'flame-outline' },
                        ]}
                        value={!!waitSecond}
                        onChange={onChangeWaitSecond}
                        ms={ms}
                      />
                      <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(12), lineHeight: ms(16) }]}>
                        {waitSecond
                          ? 'Cocina no lo empieza hasta que toques "Marchar a cocina" (en la mesa o en Comandas). Ideal para entradas.'
                          : 'Cocina recibe las dos comandas a la vez; el 1er tiempo sale antes. Ideal para "las bebidas primero".'}
                      </Text>
                      {!coursesActive ? (
                        <Text style={[textStyles.link, { color: '#B7791F', fontSize: ms(12) }]}>
                          Todos los productos están en el mismo tiempo: saldrá todo junto.
                        </Text>
                      ) : null}
                    </>
                  ) : null}
                </View>

                {/* ── COMENTARIOS GENERALES ── */}
                <View style={{ gap: ms(8), marginTop: ms(4) }}>
                  <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>COMENTARIOS PARA COCINA</Text>
                  <TextInput
                    style={[textStyles.body, styles.notesBox, { borderRadius: ms(14), padding: ms(12), fontSize: ms(13.5), minHeight: ms(76) }]}
                    value={notes}
                    onChangeText={onChangeNotes}
                    placeholder="Ej. traer todo junto, un niño en la mesa…"
                    placeholderTextColor={c.textLight}
                    multiline
                    maxLength={300}
                    // El campo está al final: al abrirse el teclado se baja
                    // hasta él para que no quede tapado.
                    onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250)}
                    textAlignVertical="top"
                  />
                </View>
              </>
            )}
          </ScrollView>

          {/* ── PIE ── */}
          <View style={[styles.footer, { paddingHorizontal: gutter, paddingTop: ms(12), paddingBottom: keyboard > 0 ? ms(10) : Math.max(insets.bottom, ms(14)), gap: ms(10) }]}>
            {!isSummary && lines.length ? (
              <View style={styles.row}>
                <Text style={[textStyles.body, { flex: 1, color: c.textGray, fontSize: ms(13) }]}>
                  Total · pago pendiente, método por definir
                </Text>
                <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(18) }]}>{formatMoney(total)}</Text>
              </View>
            ) : null}
            {isSummary ? (
              <TouchableOpacity
                onPress={onSend}
                disabled={submitting}
                activeOpacity={0.9}
                style={[styles.row, styles.mainButton, { height: ms(54), borderRadius: ms(16), gap: ms(8) }]}
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
            ) : (
              <TouchableOpacity
                onPress={() => setStep('summary')}
                disabled={lines.length === 0}
                activeOpacity={0.9}
                style={[styles.row, styles.mainButton, { height: ms(54), borderRadius: ms(16), gap: ms(8), opacity: lines.length === 0 ? 0.5 : 1 }]}
                accessibilityRole="button"
              >
                <Icon name="document-text-outline" size={ms(19)} color={c.white} />
                <Text style={[textStyles.button, { color: c.white, fontSize: ms(16) }]}>Resumen de orden</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Segmented({ options, value, onChange, ms }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.row, styles.segmented, { borderRadius: ms(12), padding: ms(3), gap: ms(3) }]}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <TouchableOpacity
            key={String(opt.key)}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.85}
            style={[
              styles.row,
              { flex: 1, justifyContent: 'center', gap: ms(6), height: ms(38), borderRadius: ms(10), backgroundColor: active ? c.textDark : 'transparent' },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            <Icon name={opt.icon} size={ms(15)} color={active ? c.white : c.textGray} />
            <Text style={[active ? textStyles.link : textStyles.body, { color: active ? c.white : c.textGray, fontSize: ms(12.5) }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(({ c, p }) => ({
  segmented: {
    backgroundColor: c.surfaceMuted,
  },
  courseChip: {
    borderWidth: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
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
  circle: {
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
  divider: {
    borderTopWidth: 1,
    borderTopColor: c.border,
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
  mainButton: {
    justifyContent: 'center',
    backgroundColor: c.primary,
  },
}));
