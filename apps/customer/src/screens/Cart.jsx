import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { getMenuColors } from '../styles/CustomerMenu';
import { getOrderBandColor } from '../styles/Orders';
import PillStepper from '../components/PillStepper';

const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

// "Mi bolsa": los productos elegidos, un resumen y el botón para pagar.
export const Cart = ({
  cartItems = [],
  itemCount = 0,
  subtotal = 0,
  onBack,
  onClearCart,
  onUpdateQuantity,
  onRemoveItem,
  onAddMore,
  onCheckout,
  onSaveCombination,
  suggestions = [],
  onOpenSuggestion,
}) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const bandColor = getOrderBandColor(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();
  const total = Number(subtotal) || 0;
  const empty = cartItems.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ height: insets.top }} />

      {/* ── ENCABEZADO ── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: m.gutter,
          paddingVertical: ms(10),
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          style={{
            width: ms(44),
            height: ms(44),
            borderRadius: ms(22),
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Icon name="arrow-back" size={ms(20)} color={c.textDark} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(20) }]}>Mi bolsa</Text>
          <Text style={[textStyles.num, { color: c.textGray, fontSize: ms(11.5) }]}>
            {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onClearCart}
          disabled={empty}
          style={{ flexDirection: 'row', alignItems: 'center', gap: ms(4), minWidth: ms(44), justifyContent: 'flex-end', opacity: empty ? 0.4 : 1 }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Vaciar la bolsa"
        >
          <Icon name="trash-outline" size={ms(15)} color={c.textGray} />
          <Text style={[textStyles.num, { color: c.textGray, fontSize: ms(12) }]}>Vaciar</Text>
        </TouchableOpacity>
      </View>

      {empty ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: ms(10), paddingHorizontal: m.gutter }}>
          <Icon name="bag-handle-outline" size={ms(48)} color={c.textLight} />
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(17) }]}>Tu bolsa está vacía</Text>
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5), textAlign: 'center' }]}>
            Agrega tus platillos favoritos desde el menú.
          </Text>
          <TouchableOpacity
            onPress={onAddMore}
            style={{ marginTop: ms(6), paddingHorizontal: ms(20), height: ms(44), borderRadius: ms(14), backgroundColor: c.primary, justifyContent: 'center' }}
            accessibilityRole="button"
          >
            <Text style={[textStyles.button, { color: '#FFFFFF', fontSize: ms(14.5) }]}>Ver el menú</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: m.gutter, paddingTop: ms(6), paddingBottom: ms(20), gap: ms(12) }}
            showsVerticalScrollIndicator={false}
          >
            {/* ── PRODUCTOS ── */}
            {cartItems.map((item) => {
              const qty = Number(item.quantity) || 1;
              return (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    gap: ms(12),
                    padding: ms(12),
                    borderRadius: ms(18),
                    borderWidth: 1,
                    borderColor: c.border,
                    backgroundColor: c.surface,
                  }}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: ms(76), height: ms(76), borderRadius: ms(14), backgroundColor: c.imagePlaceholder }}
                    />
                  ) : (
                    <View style={{ width: ms(76), height: ms(76), borderRadius: ms(14), backgroundColor: c.imagePlaceholder }} />
                  )}
                  <View style={{ flex: 1, gap: ms(4) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: ms(8) }}>
                      <Text style={[textStyles.title, { flex: 1, color: c.textDark, fontSize: ms(15.5) }]} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={[textStyles.num, { color: c.primary, fontSize: ms(14.5) }]}>
                        {money((Number(item.price) || 0) * qty)}
                      </Text>
                    </View>
                    {item.description ? (
                      <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                    <View style={{ marginTop: ms(4) }}>
                      <PillStepper
                        size="sm"
                        min={qty === 1 && onRemoveItem ? 0 : 1}
                        value={qty}
                        onIncrement={() => onUpdateQuantity?.(item.id, qty + 1)}
                        onDecrement={() =>
                          qty > 1 ? onUpdateQuantity?.(item.id, qty - 1) : onRemoveItem?.(item.id)
                        }
                        colors={c}
                        bandColor={bandColor}
                        ms={ms}
                      />
                    </View>
                  </View>
                </View>
              );
            })}

            {/* ── AGREGAR OTROS PRODUCTOS ── */}
            <View style={{ gap: ms(10), marginTop: ms(4) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(16) }]}>Agregar otros productos</Text>
                <TouchableOpacity onPress={onAddMore} hitSlop={10} accessibilityRole="button">
                  <Text style={[textStyles.link, { color: c.primary, fontSize: ms(12.5) }]}>Ver menú</Text>
                </TouchableOpacity>
              </View>
              {suggestions.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  // Las tarjetas llegan al borde de la pantalla, como en el menú.
                  style={{ marginHorizontal: -m.gutter }}
                  contentContainerStyle={{ paddingHorizontal: m.gutter, gap: ms(10) }}
                >
                  {suggestions.map((dish) => (
                    <SuggestionCard key={`${dish.itemType}-${dish.id}`} dish={dish} colors={c} ms={ms} onPress={() => onOpenSuggestion?.(dish)} />
                  ))}
                </ScrollView>
              ) : (
                <TouchableOpacity
                  onPress={onAddMore}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: ms(8),
                    height: ms(48),
                    borderRadius: ms(16),
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: c.borderStrong,
                  }}
                  accessibilityRole="button"
                >
                  <Icon name="add" size={ms(16)} color={c.textGray} />
                  <Text style={[textStyles.num, { color: c.textGray, fontSize: ms(13) }]}>Agregar algo más</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── RESUMEN ── */}
            <View style={{ borderRadius: ms(20), backgroundColor: bandColor, padding: ms(16), gap: ms(10) }}>
              <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]}>RESUMEN DEL PEDIDO</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(14) }]}>Subtotal</Text>
                <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(14) }]}>{money(subtotal)}</Text>
              </View>
              <View style={{ height: 1, backgroundColor: c.border, marginVertical: ms(2) }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(16) }]}>Total</Text>
                <Text style={[textStyles.num, { color: c.primary, fontSize: ms(22) }]}>{money(total)}</Text>
              </View>
            </View>

            {onSaveCombination ? (
              <TouchableOpacity
                onPress={onSaveCombination}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ms(6), paddingVertical: ms(4) }}
                accessibilityRole="button"
              >
                <Icon name="bookmark-outline" size={ms(15)} color={c.primary} />
                <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13) }]}>Guardar como combinación</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>

          {/* ── PAGAR ── */}
          <View style={{ paddingHorizontal: m.gutter, paddingTop: ms(8), paddingBottom: ms(12) }}>
            <TouchableOpacity
              onPress={onCheckout}
              activeOpacity={0.9}
              style={{
                height: ms(56),
                borderRadius: ms(18),
                backgroundColor: c.primary,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: ms(20),
              }}
              accessibilityRole="button"
            >
              <Text style={[textStyles.button, { flex: 1, color: '#FFFFFF', fontSize: ms(16) }]}>Continuar al pago</Text>
              <View style={{ width: 1, height: ms(22), backgroundColor: 'rgba(255,255,255,0.45)', marginHorizontal: ms(14) }} />
              <Text style={[textStyles.num, { color: '#FFFFFF', fontSize: ms(16) }]}>{money(total)}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

// Tarjeta chica de un producto sugerido: foto, nombre y precio con un "+".
const SuggestionCard = ({ dish, colors: c, ms, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={{
      width: ms(132),
      borderRadius: ms(16),
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      overflow: 'hidden',
    }}
    accessibilityRole="button"
    accessibilityLabel={`${dish.name}, ${dish.priceLabel}`}
  >
    <View style={{ height: ms(86), backgroundColor: c.imagePlaceholder, alignItems: 'center', justifyContent: 'center' }}>
      {dish.imageUrl ? (
        <Image source={{ uri: dish.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Icon name="fast-food-outline" size={ms(24)} color={c.textLight} />
      )}
    </View>
    <View style={{ padding: ms(9), gap: ms(6) }}>
      <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(13) }]} numberOfLines={1}>
        {dish.name}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={[textStyles.num, { color: c.primary, fontSize: ms(13) }]}>{dish.priceLabel}</Text>
        <View style={{ width: ms(24), height: ms(24), borderRadius: ms(12), backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="add" size={ms(16)} color="#FFFFFF" />
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default Cart;
