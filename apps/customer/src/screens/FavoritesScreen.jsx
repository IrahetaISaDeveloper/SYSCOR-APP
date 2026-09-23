import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
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
import { getMenuColors } from '../styles/CustomerMenu';
import ordersStyles from '../styles/Orders';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useTabBarVisibility } from '../context/TabBarVisibilityContext';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'saucer', label: 'Platillos' },
  { id: 'combo', label: 'Combos' },
  { id: 'combination', label: 'Combinaciones' },
];

const TYPE_LABELS = { saucer: 'Platillo', combo: 'Combo', drink: 'Bebida' };

// ── PANTALLA ────────────────────────────────────────────────────────────
const FavoritesScreen = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();

  const [filter, setFilter] = useState('all');
  const { favorites, combinations, isLoaded, toggleFavorite, removeCombination } = useFavorites();
  const { addItem } = useCart();
  const { handleScroll, reset: resetTabBar } = useTabBarVisibility();

  useFocusEffect(useCallback(() => () => resetTabBar?.(), [resetTabBar]));

  const dishCount = favorites.filter((f) => f.type === 'saucer').length;
  const comboCount = favorites.filter((f) => f.type === 'combo').length;

  const visibleFavorites = useMemo(() => {
    if (filter === 'combination') return [];
    if (filter === 'all') return favorites;
    return favorites.filter((f) => f.type === filter);
  }, [favorites, filter]);
  const showCombinations = filter === 'all' || filter === 'combination';

  // Abre el detalle para que el cliente elija salsas, extras, etc. antes de
  // agregarlo, igual que desde el menú.
  const openProduct = (fav) =>
    navigation.navigate('ProductDetails', { id: fav.id, itemType: fav.type });

  const orderCombination = (combination) => {
    for (const item of combination.items) addItem(item);
    navigation.navigate('Cart');
  };

  const confirmRemoveCombination = (combination) =>
    Alert.alert('Borrar combinación', `¿Quieres borrar "${combination.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => removeCombination(combination.id) },
    ]);

  const nothingToShow =
    visibleFavorites.length === 0 && (!showCombinations || combinations.length === 0);

  return (
    <View style={[ordersStyles.container, { backgroundColor: c.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ height: insets.top }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: m.gutter, paddingBottom: ms(130) }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ── ENCABEZADO ── */}
        <View style={[ordersStyles.header, { marginTop: ms(18) }]}>
          <View style={{ flex: 1, gap: ms(4) }}>
            <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(26) }]}>
              Favoritos
            </Text>
            <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]}>
              {plural(dishCount, 'PLATILLO', 'PLATILLOS')} · {plural(comboCount, 'COMBO', 'COMBOS')} ·{' '}
              {plural(combinations.length, 'COMBINACIÓN', 'COMBINACIONES')}
            </Text>
          </View>
          <View
            style={[
              ordersStyles.roundButton,
              {
                backgroundColor: c.surface,
                borderColor: c.border,
                width: ms(44),
                height: ms(44),
                borderRadius: ms(22),
              },
            ]}
          >
            <Icon name="heart-outline" size={ms(19)} color={c.primary} />
          </View>
        </View>

        {/* ── FILTROS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -m.gutter, marginTop: ms(18) }}
          contentContainerStyle={{ paddingHorizontal: m.gutter, gap: ms(8) }}
        >
          {FILTERS.map((f) => {
            const selected = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setFilter(f.id)}
                activeOpacity={0.85}
                style={[
                  ordersStyles.pill,
                  {
                    backgroundColor: selected ? c.primary : c.surface,
                    borderColor: selected ? c.primary : c.border,
                    borderRadius: ms(20),
                    paddingHorizontal: ms(16),
                    height: ms(36),
                  },
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    selected ? textStyles.title : textStyles.body,
                    { color: selected ? c.white : c.textGray, fontSize: ms(13.5) },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {!isLoaded ? (
          <View style={[ordersStyles.centerBox, { paddingVertical: ms(60) }]}>
            <ActivityIndicator size="large" color={c.primary} />
          </View>
        ) : nothingToShow ? (
          <EmptyState filter={filter} colors={c} ms={ms} onGoToMenu={() => navigation.navigate('Menu')} />
        ) : (
          <>
            {/* ── COMBINACIONES ── */}
            {showCombinations && combinations.length > 0 ? (
              <View style={{ gap: ms(14), marginTop: ms(18) }}>
                {combinations.map((combination) => (
                  <CombinationCard
                    key={combination.id}
                    combination={combination}
                    colors={c}
                    ms={ms}
                    onOrder={() => orderCombination(combination)}
                    onRemove={() => confirmRemoveCombination(combination)}
                  />
                ))}
              </View>
            ) : null}

            {/* ── PRODUCTOS FAVORITOS ── */}
            {visibleFavorites.length > 0 ? (
              <>
                <Text
                  style={[
                    textStyles.kicker,
                    { color: c.textGray, fontSize: ms(11), marginTop: ms(24), marginBottom: ms(12) },
                  ]}
                >
                  {filter === 'combo' ? 'COMBOS FAVORITOS' : filter === 'saucer' ? 'PLATILLOS FAVORITOS' : 'TUS FAVORITOS'}
                </Text>
                <View style={{ gap: ms(12) }}>
                  {visibleFavorites.map((fav) => (
                    <FavoriteRow
                      key={fav.key}
                      fav={fav}
                      colors={c}
                      ms={ms}
                      onOpen={() => openProduct(fav)}
                      onToggle={() => toggleFavorite(fav)}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
};

// ── COMPONENTES ─────────────────────────────────────────────────────────

const CombinationCard = ({ combination, colors: c, ms, onOrder, onRemove }) => (
  <View
    style={[
      ordersStyles.activeCard,
      {
        backgroundColor: c.surface,
        borderColor: c.primary,
        borderRadius: ms(18),
        padding: ms(15),
        gap: ms(10),
      },
    ]}
  >
    <View style={[ordersStyles.spaceBetween, { alignItems: 'center' }]}>
      <View style={[ordersStyles.row, { gap: ms(6) }]}>
        <Icon name="bookmark-outline" size={ms(13)} color={c.primary} />
        <Text style={[textStyles.kicker, { color: c.primary, fontSize: ms(10) }]}>
          MI COMBINACIÓN GUARDADA
        </Text>
      </View>
      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={`Borrar ${combination.name}`}
      >
        <Icon name="trash-outline" size={ms(16)} color={c.textLight} />
      </TouchableOpacity>
    </View>

    <View style={[ordersStyles.spaceBetween, { gap: ms(10) }]}>
      <Text style={[textStyles.title, { flex: 1, color: c.textDark, fontSize: ms(18) }]}>
        {combination.name}
      </Text>
      <Text style={[textStyles.num, { color: c.primary, fontSize: ms(17) }]}>
        ${(Number(combination.total) || 0).toFixed(2)}
      </Text>
    </View>

    <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5), lineHeight: ms(18) }]}>
      {combination.items
        .map((item) => `${item.quantity > 1 ? `${item.quantity}× ` : ''}${item.name}`)
        .join(' · ')}
    </Text>

    <TouchableOpacity
      onPress={onOrder}
      activeOpacity={0.9}
      style={[
        ordersStyles.outlineButton,
        {
          backgroundColor: c.primary,
          borderColor: c.primary,
          borderRadius: ms(14),
          height: ms(48),
          gap: ms(8),
          marginTop: ms(4),
        },
      ]}
      accessibilityRole="button"
    >
      <Icon name="refresh" size={ms(17)} color="#FFFFFF" />
      <Text style={[textStyles.title, { color: '#FFFFFF', fontSize: ms(14.5) }]}>Pedir de nuevo</Text>
    </TouchableOpacity>
  </View>
);

const FavoriteRow = ({ fav, colors: c, ms, onOpen, onToggle }) => (
  <TouchableOpacity
    onPress={onOpen}
    activeOpacity={0.85}
    style={[
      ordersStyles.pastCard,
      {
        backgroundColor: c.surface,
        borderColor: c.border,
        borderRadius: ms(16),
        padding: ms(11),
        gap: ms(12),
      },
    ]}
    accessibilityRole="button"
    accessibilityLabel={`${fav.name}, $${fav.price.toFixed(2)}`}
  >
    <View
      style={[
        ordersStyles.pastIcon,
        {
          backgroundColor: c.imagePlaceholder,
          width: ms(66),
          height: ms(66),
          borderRadius: ms(12),
          overflow: 'hidden',
        },
      ]}
    >
      {fav.imageUrl ? (
        <Image source={{ uri: fav.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Icon name="fast-food-outline" size={ms(24)} color={c.textLight} />
      )}
    </View>

    <View style={{ flex: 1, gap: ms(3) }}>
      <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(15) }]} numberOfLines={1}>
        {fav.name}
      </Text>
      <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>
        {TYPE_LABELS[fav.type] || 'Producto'}
      </Text>
      <Text style={[textStyles.num, { color: c.primary, fontSize: ms(15) }]}>
        ${fav.price.toFixed(2)}
      </Text>
    </View>

    <View style={{ alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' }}>
      <TouchableOpacity
        onPress={onToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={`Quitar ${fav.name} de favoritos`}
      >
        <Icon name="heart" size={ms(21)} color={c.primary} />
      </TouchableOpacity>
      <View
        style={[
          ordersStyles.pastIcon,
          { backgroundColor: c.primary, width: ms(30), height: ms(30), borderRadius: ms(15) },
        ]}
      >
        <Icon name="add" size={ms(18)} color="#FFFFFF" />
      </View>
    </View>
  </TouchableOpacity>
);

const EmptyState = ({ filter, colors: c, ms, onGoToMenu }) => {
  const combination = filter === 'combination';
  return (
    <View style={[ordersStyles.centerBox, { paddingVertical: ms(56), paddingHorizontal: ms(20), gap: ms(8) }]}>
      <Icon name={combination ? 'bookmark-outline' : 'heart-outline'} size={ms(36)} color={c.textLight} />
      <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(15.5), textAlign: 'center' }]}>
        {combination ? 'Sin combinaciones guardadas' : 'Aún no tienes favoritos'}
      </Text>
      <Text
        style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5), lineHeight: ms(18), textAlign: 'center' }]}
      >
        {combination
          ? 'Arma tu pedido en el carrito y toca "Guardar combinación" para pedir todo junto la próxima vez.'
          : 'Toca el corazón en cualquier platillo o combo para tenerlo a la mano.'}
      </Text>
      <TouchableOpacity onPress={onGoToMenu} style={{ marginTop: ms(6) }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13.5) }]}>Ver el menú</Text>
      </TouchableOpacity>
    </View>
  );
};

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export default FavoritesScreen;
