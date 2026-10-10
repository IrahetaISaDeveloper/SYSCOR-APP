import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useKeyboardHeight from '@syscor/shared/src/hooks/useKeyboardHeight';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { waiterColors as c } from '../../styles/waiterTheme';
import { dishesOf, drinkOptionsOf, describeCustomization, formatMoney, ingredientGroupsOf } from '../../utils/productOptions';

const idOf = (item, fallback) => String(item?._id?.$oid || item?._id || fallback);

// Detalle de un producto para el mesero: arriba sus ingredientes (para
// leérselos al cliente) y después las opciones para personalizarlo: las mismas
// que el detalle de producto de la app de clientes (platillos del combo
// armable, bebida, salsas, quitar ingredientes y agregar extras por
// platillo), con sus precios. Abajo, la cantidad, un comentario y "Agregar"
// con el total.
export default function ProductCustomizeSheet({ product, extras, houseDrinks, onClose, onAdd }) {
  const { ms, gutter, height: windowHeight } = useAuthMetrics();
  const insets = useSafeAreaInsets();
  // Sin KeyboardAvoidingView: con edge-to-edge Android no redimensiona la
  // ventana y la hoja brincaba. Se mide el teclado y se sube el contenido a
  // mano, igual que el chat de Panchita (PanchitaChatSheet).
  const keyboard = useKeyboardHeight();
  const scrollRef = useRef(null);
  const raw = product?.raw;
  const itemType = product?.itemType;

  const [picked, setPicked] = useState([]);
  const [drinkId, setDrinkId] = useState(null);
  const [sauces, setSauces] = useState([]);
  const [removedByDish, setRemovedByDish] = useState({});
  const [extrasByDish, setExtrasByDish] = useState({});
  const [activeDishKey, setActiveDishKey] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState('');
  const [warning, setWarning] = useState('');

  const drinkOptions = useMemo(
    () => (itemType === 'combo' ? drinkOptionsOf(raw, houseDrinks) : []),
    [itemType, raw, houseDrinks]
  );

  // Cada producto nuevo arranca limpio; la bebida incluida queda elegida.
  useEffect(() => {
    setPicked([]);
    setSauces([]);
    setRemovedByDish({});
    setExtrasByDish({});
    setActiveDishKey(null);
    setQuantity(1);
    setComment('');
    setWarning('');
    setDrinkId(drinkOptions[0]?.id || null);
  }, [product?.key, drinkOptions]);

  const selectiveOptions = raw?.selective ? raw.selectiveOptions || [] : [];
  const maxPicks = raw?.selectiveMaxPicks || 1;
  const sauceOptions = (raw?.sauces || []).map((s) => (typeof s === 'string' ? s : s?.name)).filter(Boolean);
  const dishes = useMemo(() => dishesOf(itemType, raw, extras, picked), [itemType, raw, extras, picked]);
  const ingredientGroups = useMemo(() => ingredientGroupsOf(itemType, raw), [itemType, raw]);
  const activeDish = dishes.find((d) => d.key === activeDishKey) || dishes[0] || null;

  const togglePick = (optId) => {
    setWarning('');
    setPicked((prev) => {
      if (prev.includes(optId)) return prev.filter((x) => x !== optId);
      if (prev.length >= maxPicks) {
        setWarning(`Solo se pueden elegir ${maxPicks}.`);
        return prev;
      }
      return [...prev, optId];
    });
  };

  const toggleIn = (setter, dishKey, value) =>
    setter((prev) => {
      const current = prev[dishKey] || [];
      return { ...prev, [dishKey]: current.includes(value) ? current.filter((x) => x !== value) : [...current, value] };
    });

  const buildCustom = () => {
    const drink = drinkOptions.find((o) => o.id === drinkId);
    return {
      selectedDrinkId: drink ? drink.id : null,
      selectedDrinkName: drink?.drink?.name || null,
      selectedSauces: sauces,
      selectedSelectiveItems: selectiveOptions
        .map((opt, i) => ({ optionId: idOf(opt, `opt-${i}`), name: opt.saucerId?.name }))
        .filter((p) => picked.includes(p.optionId)),
      removedIngredients: dishes
        .map((d) => ({ saucer: d.name, ingredients: (removedByDish[d.key] || []).filter((n) => d.ingredients.includes(n)) }))
        .filter((g) => g.ingredients.length),
      selectedExtras: dishes.flatMap((d) =>
        d.extras
          .filter((e) => (extrasByDish[d.key] || []).includes(String(e._id)))
          .map((e) => ({ extraId: String(e._id), name: e.name, forSaucer: d.name }))
      ),
    };
  };

  // Precio de una unidad: el producto, más el cambio de bebida y los extras.
  const selectedDrink = drinkOptions.find((o) => o.id === drinkId);
  const extrasTotal = dishes.reduce(
    (sum, d) =>
      sum +
      d.extras
        .filter((e) => (extrasByDish[d.key] || []).includes(String(e._id)))
        .reduce((acc, e) => acc + (Number(e.price) || 0), 0),
    0
  );
  const unitPrice = (product?.price || 0) + (selectedDrink?.surcharge || 0) + extrasTotal;

  const handleAdd = () => {
    if (selectiveOptions.length && picked.length < maxPicks) {
      const missing = maxPicks - picked.length;
      setWarning(`Falta${missing === 1 ? '' : 'n'} ${missing} platillo${missing === 1 ? '' : 's'} por elegir.`);
      return;
    }
    onAdd({ quantity, custom: buildCustom(), unitPrice, notes: comment.trim() });
  };

  const preview = product ? describeCustomization(buildCustom()) : [];

  return (
    <Modal visible={!!product} transparent statusBarTranslucent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        {product ? (
          <View style={[styles.sheet, {
              // Con el teclado abierto la hoja se apoya encima de él y cabe en el
              // espacio libre que queda arriba.
              marginBottom: keyboard,
              maxHeight: (windowHeight - keyboard - insets.top) * (keyboard > 0 ? 0.97 : 0.9),
              borderTopLeftRadius: ms(24), borderTopRightRadius: ms(24) }]}>
            {/* ── FOTO Y NOMBRE ── */}
            <View style={{ height: ms(150) }}>
              {product.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
                  <Icon name="fast-food-outline" size={ms(34)} color={c.textLight} />
                </View>
              )}
              <View style={[StyleSheet.absoluteFill, styles.shade]} />
              <TouchableOpacity
                onPress={onClose}
                hitSlop={10}
                style={[styles.close, { top: ms(12), right: ms(12), width: ms(34), height: ms(34), borderRadius: ms(17) }]}
                accessibilityLabel="Cerrar"
              >
                <Icon name="close" size={ms(18)} color={c.white} />
              </TouchableOpacity>
              <View style={{ position: 'absolute', left: gutter, right: gutter, bottom: ms(14) }}>
                <Text style={[textStyles.kicker, { color: 'rgba(255,255,255,0.85)', fontSize: ms(10) }]}>
                  {(product.subcategory || product.category || '').toUpperCase()}
                </Text>
                <Text style={[textStyles.title, { color: c.white, fontSize: ms(22) }]} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={[textStyles.num, { color: c.white, fontSize: ms(16), marginTop: ms(2) }]}>
                  {formatMoney(product.price)}
                </Text>
              </View>
            </View>

            <ScrollView
              ref={scrollRef}
            style={{ flexGrow: 0, flexShrink: 1 }}
              contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: ms(16), paddingBottom: ms(12), gap: ms(20) }}
              keyboardShouldPersistTaps="handled"
            >
              {product.description ? (
                <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5), lineHeight: ms(19) }]}>
                  {product.description}
                </Text>
              ) : null}

              {/* Ingredientes, para leérselos al cliente */}
              {ingredientGroups.length ? (
                <Block title="Ingredientes" subtitle="Léaselos al cliente si pregunta." ms={ms}>
                  <View style={[styles.card, { borderRadius: ms(14), padding: ms(12), gap: ms(12) }]}>
                    {ingredientGroups.map((group) => (
                      <View key={group.key} style={{ gap: ms(8) }}>
                        {group.name ? (
                          <Text style={[textStyles.link, { color: c.textDark, fontSize: ms(13.5) }]}>{group.name}</Text>
                        ) : null}
                        <View style={[styles.wrap, { gap: ms(6) }]}>
                          {group.ingredients.map((name) => (
                            <View key={name} style={[styles.ingredient, { borderRadius: ms(8), paddingHorizontal: ms(9), paddingVertical: ms(5) }]}>
                              <Text style={[textStyles.body, { color: c.textDark, fontSize: ms(12.5) }]}>{name}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                </Block>
              ) : null}

              {/* Platillos fijos del combo */}
              {itemType === 'combo' && (raw.saucers || []).length ? (
                <Block title="Incluye" ms={ms}>
                  <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]}>
                    {(raw.saucers || []).map((s) => s?.saucerId?.name).filter(Boolean).join(' · ')}
                  </Text>
                </Block>
              ) : null}

              {/* Combo armable */}
              {selectiveOptions.length ? (
                <Block title="Elige los platillos" subtitle={`Elige ${maxPicks}.`} badge={`${picked.length}/${maxPicks}`} ms={ms}>
                  <View style={{ gap: ms(8) }}>
                    {selectiveOptions.map((opt, i) => {
                      const optId = idOf(opt, `opt-${i}`);
                      return (
                        <CheckRow
                          key={optId}
                          label={opt.saucerId?.name || `Opción ${i + 1}`}
                          image={opt.saucerId?.image}
                          checked={picked.includes(optId)}
                          onPress={() => togglePick(optId)}
                          ms={ms}
                        />
                      );
                    })}
                  </View>
                </Block>
              ) : null}

              {/* Platillo que se está personalizando (en un combo con varios) */}
              {dishes.length > 1 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: ms(8) }}>
                  {dishes.map((d) => {
                    const active = d.key === activeDish?.key;
                    return (
                      <Chip key={d.key} label={d.name} active={active} onPress={() => setActiveDishKey(d.key)} ms={ms} />
                    );
                  })}
                </ScrollView>
              ) : null}

              {activeDish && activeDish.ingredients.length ? (
                <Block title={activeDish.name ? `Quitar a ${activeDish.name}` : 'Quitar ingredientes'} subtitle="Marca lo que no lleva." ms={ms}>
                  <View style={{ gap: ms(8) }}>
                    {activeDish.ingredients.map((name) => (
                      <CheckRow
                        key={name}
                        label={`Sin ${name.toLowerCase()}`}
                        checked={(removedByDish[activeDish.key] || []).includes(name)}
                        onPress={() => toggleIn(setRemovedByDish, activeDish.key, name)}
                        ms={ms}
                      />
                    ))}
                  </View>
                </Block>
              ) : null}

              {activeDish && activeDish.extras.length ? (
                <Block title={activeDish.name ? `Extras para ${activeDish.name}` : 'Agregar extras'} subtitle="Marca lo que quiere sumarle." ms={ms}>
                  <View style={{ gap: ms(8) }}>
                    {activeDish.extras.map((extra) => (
                      <CheckRow
                        key={String(extra._id)}
                        label={extra.name}
                        image={extra.image}
                        tag={`+${formatMoney(extra.price)}`}
                        checked={(extrasByDish[activeDish.key] || []).includes(String(extra._id))}
                        onPress={() => toggleIn(setExtrasByDish, activeDish.key, String(extra._id))}
                        ms={ms}
                      />
                    ))}
                  </View>
                </Block>
              ) : null}

              {/* Bebida del combo */}
              {drinkOptions.length ? (
                <Block title="Bebida" subtitle="Viene incluida; se puede cambiar." ms={ms}>
                  <View style={{ gap: ms(8) }}>
                    {drinkOptions.map((opt) => (
                      <CheckRow
                        key={opt.id}
                        radio
                        label={opt.drink?.name || 'Bebida'}
                        image={opt.drink?.image}
                        tag={opt.surcharge > 0 ? `+${formatMoney(opt.surcharge)}` : opt.included ? 'Incluida' : 'Sin cargo'}
                        checked={drinkId === opt.id}
                        onPress={() => setDrinkId(opt.id)}
                        ms={ms}
                      />
                    ))}
                  </View>
                </Block>
              ) : null}

              {/* Salsas */}
              {sauceOptions.length ? (
                <Block title="Salsas" ms={ms}>
                  <View style={[styles.wrap, { gap: ms(8) }]}>
                    {sauceOptions.map((name) => (
                      <Chip
                        key={name}
                        label={name}
                        active={sauces.includes(name)}
                        onPress={() => setSauces((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]))}
                        ms={ms}
                      />
                    ))}
                  </View>
                </Block>
              ) : null}

              <Block title="Comentario" ms={ms}>
                <TextInput
                  style={[textStyles.body, styles.input, { borderRadius: ms(12), paddingHorizontal: ms(12), paddingVertical: ms(10), fontSize: ms(13.5) }]}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Ej. bien dorado, salsa aparte"
                  placeholderTextColor={c.textLight}
                  maxLength={120}
                  onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 250)}
                />
              </Block>
            </ScrollView>

            {/* ── PIE: resumen, cantidad y agregar ── */}
            <View style={[styles.footer, { paddingHorizontal: gutter, paddingTop: ms(10), paddingBottom: keyboard > 0 ? ms(10) : Math.max(insets.bottom, ms(14)), gap: ms(10) }]}>
              {warning ? (
                <Text style={[textStyles.link, { color: c.error, fontSize: ms(12.5) }]}>{warning}</Text>
              ) : preview.length ? (
                <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]} numberOfLines={2}>
                  {preview.join(' · ')}
                </Text>
              ) : null}
              <View style={[styles.row, { gap: ms(10) }]}>
                <View style={[styles.row, styles.stepper, { borderRadius: ms(14), height: ms(52) }]}>
                  <TouchableOpacity onPress={() => setQuantity((q) => Math.max(1, q - 1))} style={[styles.stepperButton, { width: ms(44) }]} accessibilityLabel="Uno menos">
                    <Icon name="remove" size={ms(18)} color={c.primary} />
                  </TouchableOpacity>
                  <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(16), minWidth: ms(22), textAlign: 'center' }]}>{quantity}</Text>
                  <TouchableOpacity onPress={() => setQuantity((q) => Math.min(50, q + 1))} style={[styles.stepperButton, { width: ms(44) }]} accessibilityLabel="Uno más">
                    <Icon name="add" size={ms(18)} color={c.primary} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={handleAdd}
                  activeOpacity={0.9}
                  style={[styles.row, styles.addButton, { flex: 1, height: ms(52), borderRadius: ms(14), gap: ms(8) }]}
                  accessibilityRole="button"
                >
                  <Icon name="add-circle-outline" size={ms(19)} color={c.white} />
                  <Text style={[textStyles.button, { color: c.white, fontSize: ms(15.5) }]}>
                    Agregar · {formatMoney(unitPrice * quantity)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function Block({ title, subtitle, badge, children, ms }) {
  return (
    <View style={{ gap: ms(10) }}>
      <View style={[styles.row, { gap: ms(8) }]}>
        <View style={{ flex: 1 }}>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(16) }]}>{title}</Text>
          {subtitle ? <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>{subtitle}</Text> : null}
        </View>
        {badge ? (
          <View style={[styles.badge, { borderRadius: ms(8), paddingHorizontal: ms(8), paddingVertical: ms(3) }]}>
            <Text style={[textStyles.num, { color: c.primary, fontSize: ms(11.5) }]}>{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function CheckRow({ label, image, tag, checked, radio, onPress, ms }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.row,
        styles.checkRow,
        {
          borderRadius: ms(12),
          paddingHorizontal: ms(12),
          paddingVertical: ms(10),
          gap: ms(10),
          borderColor: checked ? c.primary : c.border,
          borderWidth: checked ? 1.5 : 1,
        },
      ]}
      accessibilityRole={radio ? 'radio' : 'checkbox'}
      accessibilityState={radio ? { selected: checked } : { checked }}
    >
      {image ? <Image source={{ uri: image }} style={{ width: ms(36), height: ms(36), borderRadius: ms(8) }} /> : null}
      <Text style={[checked ? textStyles.link : textStyles.body, { flex: 1, color: c.textDark, fontSize: ms(13.5) }]}>{label}</Text>
      {tag ? <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(9) }]}>{tag.toUpperCase()}</Text> : null}
      <Icon
        name={radio ? (checked ? 'radio-button-on' : 'radio-button-off') : checked ? 'checkbox' : 'square-outline'}
        size={ms(20)}
        color={checked ? c.primary : c.textLight}
      />
    </TouchableOpacity>
  );
}

function Chip({ label, active, onPress, ms }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        {
          backgroundColor: active ? c.primary : c.surface,
          borderColor: active ? c.primary : c.border,
          borderRadius: ms(20),
          paddingHorizontal: ms(14),
          paddingVertical: ms(8),
        },
      ]}
    >
      <Text style={[active ? textStyles.link : textStyles.body, { color: active ? c.white : c.textGray, fontSize: ms(13) }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    overflow: 'hidden',
    backgroundColor: c.background,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F1EB',
  },
  shade: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  close: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: c.primaryTint,
  },
  checkRow: {
    backgroundColor: c.surface,
  },
  card: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  ingredient: {
    backgroundColor: c.surfaceMuted,
  },
  chip: {
    borderWidth: 1,
  },
  input: {
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
  stepper: {
    backgroundColor: c.primaryTint,
  },
  stepperButton: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    justifyContent: 'center',
    backgroundColor: c.primary,
  },
});
