import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { useAuth } from '@syscor/shared/src/context/AuthContext';
import { getMenuColors } from '../styles/CustomerMenu';
import ordersStyles, { getOrderBandColor } from '../styles/Orders';
import Sheet from '../components/Sheet';
import SavedCardTile from '../components/SavedCardTile';
import {
  MAX_CARDS,
  getCards,
  addCard,
  updateCard,
  setDefaultCard,
  deleteCard,
  BRAND_LABELS,
  formatCardExpiry,
} from '../services/cardsApi';
import { detectCardBrand, isValidLuhn, formatCardNumber, formatExpiry } from '../utils/cardUtils';

// Otras formas de pago que acepta el restaurante (informativas).
const OTHER_METHODS = [
  { icon: 'cash-outline', title: 'Efectivo', text: 'Al recibir tu pedido o al pasar a recogerlo.' },
  { icon: 'card', title: 'Tarjeta contra entrega', text: 'El repartidor lleva el POS a tu puerta.' },
];

const EMPTY_FORM = { cardHolder: '', cardNumber: '', expiry: '', isDefault: false };

// Valida el formulario de tarjeta. No hay CVV: se pide en cada compra. Al
// editar (`editing`) el número no se toca, así que no se valida.
const validateCardForm = ({ cardHolder, cardNumber, expiry }, editing = false) => {
  const digits = cardNumber.replace(/\s/g, '');
  const [mm, yy] = expiry.split('/');
  if (cardHolder.trim().length < 3) return 'Escribe el nombre tal como aparece en la tarjeta.';
  if (!editing && (digits.length < 15 || digits.length > 19 || !isValidLuhn(digits))) return 'El número de tarjeta no es válido.';
  if (!editing && !detectCardBrand(digits).brand) return 'No reconocemos esa tarjeta. Revisa el número.';
  if (!/^\d{2}$/.test(mm || '') || !/^\d{2}$/.test(yy || '')) return 'El vencimiento debe tener el formato MM/AA.';
  const month = Number(mm);
  const year = Number(yy);
  if (month < 1 || month > 12) return 'El mes de vencimiento no es válido.';
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  if (year < currentYear || (year === currentYear && month < now.getMonth() + 1)) return 'La tarjeta está vencida.';
  return null;
};

// "Métodos de pago" en Más: las tarjetas que el cliente guarda para sus
// próximas compras, más las otras formas de pago que acepta el restaurante.
const SavedCardsScreen = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const bandColor = getOrderBandColor(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const customerId = user?.id || user?._id;

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  // Índice de la tarjeta con una operación en curso (predeterminar / borrar).
  const [busyIndex, setBusyIndex] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  // Tarjeta que se está editando (null = el formulario es para una nueva).
  const [editingCard, setEditingCard] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    const res = await getCards(customerId);
    if (res.success) {
      setCards(res.cards);
      setLoadError(null);
    } else {
      setLoadError(res.error);
    }
    setLoading(false);
  }, [customerId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const brand = detectCardBrand(form.cardNumber);

  const openForm = () => {
    setEditingCard(null);
    setForm({ ...EMPTY_FORM, isDefault: cards.length === 0 });
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (card) => {
    setEditingCard(card);
    setForm({ cardHolder: card.cardHolder || '', cardNumber: '', expiry: formatCardExpiry(card), isDefault: card.isDefault });
    setFormError(null);
    setFormOpen(true);
  };

  const setField = (field, formatter) => (text) => {
    setFormError(null);
    setForm((f) => ({ ...f, [field]: formatter ? formatter(text) : text }));
  };

  const submit = async () => {
    const problem = validateCardForm(form, !!editingCard);
    if (problem) {
      setFormError(problem);
      return;
    }
    const [expiryMonth, expiryYear] = form.expiry.split('/');
    setSaving(true);

    if (editingCard) {
      let res = await updateCard(customerId, editingCard.index, {
        cardHolder: form.cardHolder.trim(),
        expiryMonth,
        expiryYear,
      });
      // Marcarla como predeterminada es otra ruta: solo si cambió.
      if (res.success && form.isDefault && !editingCard.isDefault) {
        res = await setDefaultCard(customerId, editingCard.index);
      }
      setSaving(false);
      if (!res.success) {
        setFormError(res.error);
        return;
      }
      setCards(res.cards);
      setFormOpen(false);
      return;
    }

    const res = await addCard(customerId, {
      cardHolder: form.cardHolder.trim(),
      cardNumber: form.cardNumber,
      expiryMonth,
      expiryYear,
      isDefault: form.isDefault,
    });
    setSaving(false);
    if (!res.success) {
      setFormError(res.error);
      return;
    }
    setCards(res.cards);
    setFormOpen(false);
  };

  const makeDefault = async (card) => {
    setBusyIndex(card.index);
    const res = await setDefaultCard(customerId, card.index);
    setBusyIndex(null);
    if (res.success) setCards(res.cards);
    else Alert.alert('No se pudo cambiar', res.error);
  };

  const confirmDelete = (card) =>
    Alert.alert(
      'Eliminar tarjeta',
      `¿Eliminar la ${BRAND_LABELS[card.brand] || 'tarjeta'} terminada en ${card.lastFour}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setBusyIndex(card.index);
            const res = await deleteCard(customerId, card.index);
            setBusyIndex(null);
            if (res.success) setCards(res.cards);
            else Alert.alert('No se pudo eliminar', res.error);
          },
        },
      ],
    );

  const inputStyle = [
    textStyles.body,
    {
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      borderRadius: ms(12),
      paddingHorizontal: ms(14),
      paddingVertical: ms(12),
      fontSize: ms(15),
      color: c.textDark,
    },
  ];

  const fieldLabel = (text) => (
    <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10), marginTop: ms(12), marginBottom: ms(6) }]}>
      {text}
    </Text>
  );

  return (
    <View style={[ordersStyles.container, { backgroundColor: c.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ height: insets.top }} />

      {/* ── ENCABEZADO ── */}
      <View style={[ordersStyles.row, { paddingHorizontal: m.gutter, paddingVertical: ms(12), gap: ms(12) }]}>
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
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(20) }]}>Métodos de pago</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: m.gutter, paddingBottom: ms(40) }}>
        <View style={[ordersStyles.row, { justifyContent: 'space-between', marginTop: ms(12), marginBottom: ms(12) }]}>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(17) }]}>Mis tarjetas</Text>
          <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]}>
            {cards.length} DE {MAX_CARDS}
          </Text>
        </View>

        {loading && cards.length === 0 ? <ActivityIndicator color={c.primary} style={{ marginVertical: ms(24) }} /> : null}

        {!loading && loadError ? (
          <TouchableOpacity onPress={load} style={{ alignItems: 'center', paddingVertical: ms(20), gap: ms(6) }}>
            <Icon name="cloud-offline-outline" size={ms(26)} color={c.textGray} />
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13), textAlign: 'center' }]}>{loadError}</Text>
            <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13) }]}>Reintentar</Text>
          </TouchableOpacity>
        ) : null}

        {!loading && !loadError && cards.length === 0 ? (
          <View
            style={{
              alignItems: 'center',
              gap: ms(8),
              paddingVertical: ms(24),
              paddingHorizontal: ms(16),
              borderRadius: ms(18),
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.surface,
              marginBottom: ms(12),
            }}
          >
            <Icon name="card-outline" size={ms(30)} color={c.primary} />
            <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(15) }]}>Aún no tienes tarjetas</Text>
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13), textAlign: 'center' }]}>
              Guarda una y en tus próximas compras solo tendrás que escribir el CVV.
            </Text>
          </View>
        ) : null}

        {cards.map((card) => (
          <View key={`${card.index}-${card.lastFour}`} style={{ marginBottom: ms(14) }}>
            <SavedCardTile card={card} ms={ms} />
            <View style={[ordersStyles.row, { justifyContent: 'space-between', marginTop: ms(8), paddingHorizontal: ms(4) }]}>
              {busyIndex === card.index ? (
                <ActivityIndicator size="small" color={c.primary} />
              ) : card.isDefault ? (
                <View style={[ordersStyles.row, { gap: ms(6) }]}>
                  <Icon name="checkmark-circle" size={ms(16)} color={c.primary} />
                  <Text style={[textStyles.bodyMedium, { color: c.textDark, fontSize: ms(13) }]}>Predeterminada</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => makeDefault(card)} hitSlop={8} style={[ordersStyles.row, { gap: ms(6) }]}>
                  <Icon name="radio-button-off" size={ms(16)} color={c.textGray} />
                  <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]}>Usar como predeterminada</Text>
                </TouchableOpacity>
              )}
              <View style={[ordersStyles.row, { gap: ms(16) }]}>
                <TouchableOpacity
                  onPress={() => openEdit(card)}
                  disabled={busyIndex !== null}
                  hitSlop={8}
                  style={[ordersStyles.row, { gap: ms(4) }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar la tarjeta terminada en ${card.lastFour}`}
                >
                  <Icon name="create-outline" size={ms(15)} color={c.primary} />
                  <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13) }]}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmDelete(card)}
                  disabled={busyIndex !== null}
                  hitSlop={8}
                  style={[ordersStyles.row, { gap: ms(4) }]}
                  accessibilityRole="button"
                >
                  <Icon name="trash-outline" size={ms(15)} color={c.error} />
                  <Text style={[textStyles.link, { color: c.error, fontSize: ms(13) }]}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {!loadError && cards.length < MAX_CARDS ? (
          <TouchableOpacity
            onPress={openForm}
            activeOpacity={0.8}
            style={[
              ordersStyles.outlineButton,
              { borderColor: c.borderStrong, borderStyle: 'dashed', borderRadius: ms(14), height: ms(50), gap: ms(8) },
            ]}
            accessibilityRole="button"
          >
            <Icon name="add" size={ms(18)} color={c.primary} />
            <Text style={[textStyles.link, { color: c.primary, fontSize: ms(14) }]}>Agregar tarjeta</Text>
          </TouchableOpacity>
        ) : null}

        <View style={[ordersStyles.row, { gap: ms(8), marginTop: ms(14) }]}>
          <Icon name="lock-closed-outline" size={ms(14)} color={c.textGray} />
          <Text style={[textStyles.body, { flex: 1, color: c.textGray, fontSize: ms(12) }]}>
            Guardamos tu tarjeta cifrada y nunca el CVV. Te lo pediremos en cada compra.
          </Text>
        </View>

        {/* ── OTRAS FORMAS DE PAGO ── */}
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(17), marginTop: ms(28), marginBottom: ms(6) }]}>
          También aceptamos
        </Text>
        {OTHER_METHODS.map((method) => (
          <View key={method.title} style={[ordersStyles.row, { gap: ms(12), paddingVertical: ms(10) }]}>
            <View
              style={[
                ordersStyles.pastIcon,
                { width: ms(40), height: ms(40), borderRadius: ms(10), backgroundColor: bandColor },
              ]}
            >
              <Icon name={method.icon} size={ms(19)} color={c.primary} />
            </View>
            <View style={{ flex: 1, gap: ms(2) }}>
              <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(14.5) }]}>{method.title}</Text>
              <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}>{method.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ── NUEVA TARJETA / EDITAR ── */}
      <Sheet visible={formOpen} onClose={() => !saving && setFormOpen(false)} colors={c} ms={ms} bottomInset={insets.bottom}>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(18) }]}>
          {editingCard ? 'Editar tarjeta' : 'Nueva tarjeta'}
        </Text>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5), marginTop: ms(4) }]}>
          {editingCard
            ? 'Puedes cambiar el nombre y el vencimiento. Si el número cambió, agrégala como tarjeta nueva.'
            : 'Débito o crédito. No te pedimos el CVV para guardarla.'}
        </Text>

        {fieldLabel('NOMBRE EN LA TARJETA')}
        <TextInput
          value={form.cardHolder}
          onChangeText={setField('cardHolder')}
          placeholder="Juan Pérez"
          placeholderTextColor={c.textLight}
          autoCapitalize="characters"
          maxLength={40}
          style={inputStyle}
        />

        {fieldLabel('NÚMERO DE TARJETA')}
        {editingCard ? (
          <View style={[inputStyle, ordersStyles.row, { gap: ms(8), opacity: 0.7 }]}>
            <Text style={[textStyles.num, { flex: 1, fontSize: ms(15), color: c.textGray }]}>
              •••• •••• •••• {editingCard.lastFour}
            </Text>
            <Icon name="lock-closed-outline" size={ms(14)} color={c.textLight} />
          </View>
        ) : (
        <View style={[inputStyle, ordersStyles.row, { paddingVertical: 0, gap: ms(8) }]}>
          <TextInput
            value={form.cardNumber}
            onChangeText={setField('cardNumber', formatCardNumber)}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor={c.textLight}
            keyboardType="number-pad"
            maxLength={23}
            style={[textStyles.num, { flex: 1, fontSize: ms(15), color: c.textDark, paddingVertical: ms(12) }]}
          />
          <Text style={[textStyles.kicker, { color: brand.brand ? c.textDark : c.textLight, fontSize: ms(10) }]}>
            {brand.brand ? brand.brand.toUpperCase() : 'MARCA'}
          </Text>
        </View>
        )}

        {fieldLabel('VENCIMIENTO')}
        <TextInput
          value={form.expiry}
          onChangeText={setField('expiry', formatExpiry)}
          placeholder="MM/AA"
          placeholderTextColor={c.textLight}
          keyboardType="number-pad"
          maxLength={5}
          style={[inputStyle, textStyles.num, { width: ms(120) }]}
        />

        <TouchableOpacity
          onPress={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
          disabled={cards.length === 0 || !!editingCard?.isDefault}
          style={[ordersStyles.row, { gap: ms(8), marginTop: ms(16) }]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: form.isDefault }}
        >
          <Icon
            name={form.isDefault ? 'checkbox' : 'square-outline'}
            size={ms(20)}
            color={form.isDefault ? c.primary : c.textGray}
          />
          <Text style={[textStyles.body, { color: c.textDark, fontSize: ms(13.5) }]}>
            {cards.length === 0
              ? 'Será tu tarjeta predeterminada'
              : editingCard?.isDefault
                ? 'Es tu tarjeta predeterminada'
                : 'Usar como predeterminada'}
          </Text>
        </TouchableOpacity>

        {formError ? (
          <Text style={[textStyles.body, { color: c.error, fontSize: ms(12.5), marginTop: ms(12) }]}>{formError}</Text>
        ) : null}

        <TouchableOpacity
          onPress={submit}
          disabled={saving}
          activeOpacity={0.9}
          style={[
            ordersStyles.outlineButton,
            {
              backgroundColor: c.primary,
              borderColor: c.primary,
              borderRadius: ms(14),
              height: ms(52),
              marginTop: ms(18),
              gap: ms(8),
              opacity: saving ? 0.6 : 1,
            },
          ]}
          accessibilityRole="button"
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Icon name="lock-closed" size={ms(15)} color="#FFFFFF" />
              <Text style={[textStyles.title, { color: '#FFFFFF', fontSize: ms(15) }]}>
                {editingCard ? 'Guardar cambios' : 'Guardar tarjeta'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Sheet>
    </View>
  );
};

export default SavedCardsScreen;
