import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  BackHandler,
  RefreshControl,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, usePreventRemove } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import useWaiterMenu, { normalizeText } from '../../hooks/useWaiterMenu';
import { MENU_CATEGORIES } from '../../constants/menuCategories';
import { waiterColors as c, getTableState } from '../../styles/waiterTheme';
import OrderReviewSheet from '../../components/waiter/OrderReviewSheet';
import ProductCustomizeSheet from '../../components/waiter/ProductCustomizeSheet';
import { formatMoney } from '../../utils/productOptions';

const PILL = '#1C1C1E';

// Menú para tomar la comanda de una mesa. Mismo formato que el menú del
// cliente (buscador, tarjetas de categoría y rejilla de platillos), pero:
//   - el buscador va fijo arriba: es lo más rápido para encontrar lo que pide
//     la mesa;
//   - un producto sin opciones se agrega con un toque; uno con opciones
//     (combo armable, bebida, ingredientes, extras) abre su personalización;
//   - el botón (i) de cada tarjeta abre el detalle con sus ingredientes, para
//     leérselos al cliente;
//   - el precio va junto al nombre, como en el menú del cliente.
export default function WaiterMenuScreen({ navigation, route }) {
  const table = route.params?.table || {};
  const { ms, gutter } = useAuthMetrics();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);
  const searchRef = useRef(null);

  const [searchText, setSearchText] = useState('');
  const [openCategory, setOpenCategory] = useState(null);
  const [subFilter, setSubFilter] = useState('all');
  const [reviewOpen, setReviewOpen] = useState(false);
  // Producto que se está personalizando (null = hoja cerrada).
  const [customizing, setCustomizing] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sent, setSent] = useState(false);

  const menu = useWaiterMenu(table);
  const { products, loading, error, reload, itemCount, quantityOf, changeQuantity } = menu;

  const state = getTableState(table.status);
  const query = normalizeText(searchText.trim());
  const searching = query.length > 0;

  const visible = useMemo(() => {
    if (searching) {
      return products.filter((p) =>
        [p.name, p.description, p.subcategory, p.category].some((field) => normalizeText(field).includes(query))
      );
    }
    if (!openCategory) return [];
    return products.filter((p) => p.category === openCategory);
  }, [products, searching, query, openCategory]);

  const countByCategory = useMemo(() => {
    const acc = {};
    for (const p of products) if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, [products]);

  const subcategories = useMemo(() => {
    if (!openCategory || searching) return [];
    return [...new Set(visible.map((p) => p.subcategory).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }, [visible, openCategory, searching]);

  const shown = subFilter === 'all' || searching ? visible : visible.filter((p) => p.subcategory === subFilter);

  const openCategoryCard = (id) => {
    setSubFilter('all');
    setOpenCategory(id);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const closeCategory = useCallback(() => {
    setOpenCategory(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  // "Atrás" de Android: primero cierra la búsqueda o la categoría.
  useFocusEffect(
    useCallback(() => {
      if (!openCategory && !searchText) return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (searchText) setSearchText('');
        else closeCategory();
        return true;
      });
      return () => sub.remove();
    }, [openCategory, searchText, closeCategory])
  );

  // Salir con productos sin enviar pide confirmación.
  usePreventRemove(itemCount > 0 && !sent, ({ data }) => {
    Alert.alert('Descartar orden', 'Los productos elegidos no se enviarán a cocina.', [
      { text: 'Seguir tomando', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  const handleSend = async () => {
    const result = await menu.sendToKitchen();
    if (!result.ok) return;
    setSent(true);
    setReviewOpen(false);
    const message = result.waiting
      ? `El 1er tiempo de la mesa ${table.number} ya está en cocina. El 2º queda en espera: márchalo desde la mesa o desde Comandas cuando terminen.`
      : `La orden de la mesa ${table.number} ya está en cocina.`;
    Alert.alert('Comanda enviada', message, [
      {
        text: 'Listo',
        // Regresa a Mesas avisando qué mesa quedó ocupada (ver WaiterDashboardScreen).
        onPress: () =>
          navigation.navigate('WaiterTabs', {
            screen: 'Dashboard',
            params: { sentTableId: table._id, sentAt: Date.now() },
            merge: true,
          }),
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await reload({ silent: true });
    setRefreshing(false);
  };

  const subtitle = [
    state.label.toUpperCase(),
    table.customerName ? table.customerName.toUpperCase() : null,
    table.capacity ? `${table.capacity} LUGARES` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const cardWidth = (width - gutter * 2 - ms(12)) / 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* ── ENCABEZADO FIJO: mesa y buscador ── */}
      <View style={{ paddingHorizontal: gutter, paddingTop: ms(10), paddingBottom: ms(12), gap: ms(12) }}>
        <View style={[styles.row, { gap: ms(12) }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={[styles.circleButton, { width: ms(38), height: ms(38), borderRadius: ms(19) }]}
            accessibilityRole="button"
            accessibilityLabel="Regresar a las mesas"
          >
            <Icon name="chevron-back" size={ms(20)} color={c.textDark} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(22) }]}>Mesa {table.number}</Text>
            <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10) }]} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        </View>

        <View style={[styles.search, { borderRadius: ms(16), paddingHorizontal: ms(16), minHeight: ms(52), gap: ms(11) }]}>
          <Icon name="search" size={ms(19)} color={c.primary} />
          <TextInput
            ref={searchRef}
            style={[textStyles.body, styles.searchInput, { fontSize: ms(15) }]}
            placeholder="Busca lo que te piden: pastor, horchata…"
            placeholderTextColor={c.textLight}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searching ? (
            <TouchableOpacity onPress={() => setSearchText('')} hitSlop={10} accessibilityLabel="Borrar búsqueda">
              <Icon name="close-circle" size={ms(18)} color={c.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: ms(130) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} colors={[c.primary]} />}
      >
        {/* ── TÍTULO DE LA SECCIÓN ── */}
        {openCategory && !searching ? (
          <View style={[styles.row, { paddingHorizontal: gutter, marginTop: ms(8), marginBottom: ms(14), gap: ms(12) }]}>
            <TouchableOpacity
              onPress={closeCategory}
              hitSlop={10}
              style={[styles.circleButton, { width: ms(38), height: ms(38), borderRadius: ms(19) }]}
              accessibilityRole="button"
              accessibilityLabel="Volver a las categorías"
            >
              <Icon name="grid-outline" size={ms(17)} color={c.textDark} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(21) }]}>{openCategory}</Text>
              <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}>
                {countByCategory[openCategory] || 0} {countByCategory[openCategory] === 1 ? 'producto' : 'productos'}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(19), paddingHorizontal: gutter, marginTop: ms(8), marginBottom: ms(14) }]}>
            {searching ? `Resultados (${shown.length})` : 'Menú'}
          </Text>
        )}

        {loading ? (
          <View style={[styles.center, { paddingVertical: ms(40), gap: ms(12) }]}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]}>Cargando el menú…</Text>
          </View>
        ) : error ? (
          <View style={[styles.center, { paddingVertical: ms(40), paddingHorizontal: gutter, gap: ms(10) }]}>
            <Icon name="cloud-offline-outline" size={ms(30)} color={c.textLight} />
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5) }]}>{error}</Text>
            <TouchableOpacity onPress={() => reload()}>
              <Text style={[textStyles.link, { color: c.primary, fontSize: ms(14) }]}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : !searching && !openCategory ? (
          // ── TARJETAS DE CATEGORÍA ──
          <View style={[styles.grid, { paddingHorizontal: gutter, gap: ms(14) }]}>
            {MENU_CATEGORIES.filter((cat) => countByCategory[cat.id]).map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                count={countByCategory[cat.id]}
                ms={ms}
                cardWidth={(width - gutter * 2 - ms(14)) / 2}
                onPress={() => openCategoryCard(cat.id)}
              />
            ))}
          </View>
        ) : (
          <>
            {subcategories.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: gutter, gap: ms(8), marginBottom: ms(12) }}
              >
                {['all', ...subcategories].map((sub) => {
                  const active = sub === subFilter;
                  return (
                    <TouchableOpacity
                      key={sub}
                      onPress={() => setSubFilter(sub)}
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
                      <Text style={[active ? textStyles.link : textStyles.body, { color: active ? c.white : c.textGray, fontSize: ms(13) }]}>
                        {sub === 'all' ? 'Todos' : sub}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}

            {shown.length === 0 ? (
              <View style={[styles.center, { paddingVertical: ms(36), paddingHorizontal: gutter, gap: ms(10) }]}>
                <Icon name="search-outline" size={ms(30)} color={c.textLight} />
                <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5), textAlign: 'center' }]}>
                  {searching ? `No hay nada con "${searchText.trim()}".` : 'No hay productos en esta categoría.'}
                </Text>
              </View>
            ) : (
              <View style={[styles.grid, { paddingHorizontal: gutter, gap: ms(12) }]}>
                {shown.map((product) => (
                  <ProductCard
                    key={product.key}
                    product={product}
                    quantity={quantityOf(product.key)}
                    onChange={(delta) => changeQuantity(product, delta)}
                    onCustomize={() => setCustomizing(product)}
                    hasInfo={!!(product.raw?.recipe?.length || product.raw?.saucers?.length || product.raw?.selectiveOptions?.length)}
                    ms={ms}
                    cardWidth={cardWidth}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ── PÍLDORA "VER ORDEN" ── */}
      {itemCount > 0 ? (
        <TouchableOpacity
          style={[
            styles.pill,
            {
              bottom: Math.max(insets.bottom, ms(12)) + ms(6),
              borderRadius: ms(36),
              paddingLeft: ms(24),
              paddingRight: ms(10),
              paddingVertical: ms(10),
              gap: ms(18),
            },
          ]}
          activeOpacity={0.9}
          onPress={() => setReviewOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`Ver orden, ${itemCount} productos`}
        >
          <View style={{ gap: ms(2) }}>
            <Text style={[textStyles.title, { color: c.white, fontSize: ms(17) }]}>Ver orden</Text>
            <Text style={[textStyles.num, { color: 'rgba(255,255,255,0.7)', fontSize: ms(13) }]}>
              {itemCount} {itemCount === 1 ? 'producto' : 'productos'} · {formatMoney(menu.total)}
            </Text>
          </View>
          <View style={[styles.pillIcon, { width: ms(50), height: ms(50), borderRadius: ms(25) }]}>
            <Icon name="receipt-outline" size={ms(23)} color={c.white} />
            <View style={[styles.pillBadge, { minWidth: ms(23), height: ms(23), borderRadius: ms(12), top: -ms(5), right: -ms(5), paddingHorizontal: ms(5) }]}>
              <Text style={[textStyles.num, { color: c.white, fontSize: ms(11) }]}>{itemCount}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : null}

      <ProductCustomizeSheet
        product={customizing}
        extras={menu.extras}
        houseDrinks={menu.houseDrinks}
        onClose={() => setCustomizing(null)}
        onAdd={(selection) => {
          // Un producto sin opciones abierto solo para ver sus ingredientes se
          // suma a su renglón, salvo que lleve comentario.
          if (!customizing.customizable && !selection.notes) changeQuantity(customizing, selection.quantity);
          else menu.addCustomized(customizing, selection);
          setCustomizing(null);
        }}
      />

      <OrderReviewSheet
        visible={reviewOpen}
        onClose={() => setReviewOpen(false)}
        table={table}
        lines={menu.orderLines}
        total={menu.total}
        onChangeQuantity={changeQuantity}
        onChangeLineNotes={menu.setLineNotes}
        splitCourses={menu.splitCourses}
        onChangeSplitCourses={menu.setSplitCourses}
        coursesActive={menu.coursesActive}
        onChangeLineCourse={menu.setLineCourse}
        waitSecond={menu.waitSecond}
        onChangeWaitSecond={menu.setWaitSecond}
        notes={menu.notes}
        onChangeNotes={menu.setNotes}
        submitting={menu.submitting}
        onSend={handleSend}
      />
    </View>
  );
}

// ── COMPONENTES ─────────────────────────────────────────────────────────

// Franjas del degradado de la tarjeta de categoría (igual que en el cliente).
const SHADE_STEPS = Array.from({ length: 14 }, (_, i) => `${Math.round(75 - i * 5)}%`);

function CategoryCard({ category, count, ms, cardWidth, onPress }) {
  const cardHeight = Math.round(cardWidth * 0.95);
  return (
    <TouchableOpacity
      style={[styles.categoryCard, { width: cardWidth, height: cardHeight, borderRadius: ms(20) }]}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${category.label}`}
    >
      <Image source={category.image} style={[styles.categoryImage, { width: cardWidth, height: cardHeight }]} resizeMode="cover" />
      {SHADE_STEPS.map((h) => (
        <View key={h} style={[styles.categoryShade, { height: h }]} />
      ))}
      <View style={[styles.row, { padding: ms(14), gap: ms(8) }]}>
        <View style={{ flex: 1 }}>
          <Text style={[textStyles.title, styles.categoryTitle, { fontSize: ms(19) }]} numberOfLines={2}>
            {category.label}
          </Text>
          <Text style={[textStyles.kicker, { color: 'rgba(255,255,255,0.85)', fontSize: ms(9.5) }]}>{count} PRODUCTOS</Text>
        </View>
        <View style={[styles.categoryArrow, { width: ms(26), height: ms(26), borderRadius: ms(13) }]}>
          <Icon name="arrow-forward" size={ms(14)} color={c.white} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Tarjeta de producto: foto, nombre y descripción como en el menú del
// cliente; abajo, en lugar del precio, el control para agregarlo a la orden.
// Tocar la tarjeta suma uno, o abre la personalización si tiene opciones.
function ProductCard({ product, quantity, onChange, onCustomize, hasInfo, ms, cardWidth }) {
  const selected = quantity > 0;
  const custom = product.customizable;
  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        { width: cardWidth, borderRadius: ms(18), borderColor: selected ? c.primary : c.border, borderWidth: selected ? 1.5 : 1 },
      ]}
      activeOpacity={0.85}
      onPress={() => (custom ? onCustomize() : onChange(1))}
      accessibilityRole="button"
      accessibilityLabel={`${custom ? 'Personalizar' : 'Agregar'} ${product.name}${selected ? `, llevas ${quantity}` : ''}`}
    >
      <View style={[styles.productImageArea, { height: cardWidth * 0.72 }]}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.fill} resizeMode="cover" />
        ) : (
          <Icon name="fast-food-outline" size={ms(28)} color={c.textLight} />
        )}
        {product.tacosPerOrder ? (
          <View style={[styles.badge, { borderRadius: ms(8), paddingHorizontal: ms(8), paddingVertical: ms(4), top: ms(8), left: ms(8) }]}>
            <Text style={[textStyles.link, { color: c.white, fontSize: ms(10.5) }]}>Orden de {product.tacosPerOrder}</Text>
          </View>
        ) : null}
        {/* Ver ingredientes sin agregar nada */}
        {hasInfo ? (
          <TouchableOpacity
            onPress={onCustomize}
            hitSlop={8}
            style={[styles.infoButton, { width: ms(30), height: ms(30), borderRadius: ms(15), bottom: ms(8), right: ms(8) }]}
            accessibilityRole="button"
            accessibilityLabel={`Ver ingredientes de ${product.name}`}
          >
            <Icon name="information" size={ms(18)} color={c.white} />
          </TouchableOpacity>
        ) : null}
        {selected ? (
          <View style={[styles.qtyBadge, { minWidth: ms(26), height: ms(26), borderRadius: ms(13), top: ms(8), right: ms(8) }]}>
            <Text style={[textStyles.num, { color: c.white, fontSize: ms(12.5) }]}>{quantity}</Text>
          </View>
        ) : null}
      </View>

      <View style={{ padding: ms(12), gap: ms(4) }}>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(14.5) }]} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(11.5), lineHeight: ms(15.5), height: ms(31) }]} numberOfLines={2}>
          {product.description || product.subcategory || product.category}
        </Text>
        <Text style={[textStyles.num, { color: c.primary, fontSize: ms(15.5), marginTop: ms(2) }]}>
          {formatMoney(product.price)}
        </Text>

        <View style={{ marginTop: ms(6) }}>
          {custom ? (
            <View style={[styles.row, selected ? styles.addButtonSolid : styles.addButton, { borderRadius: ms(12), height: ms(36), gap: ms(6) }]}>
              <Icon name="options-outline" size={ms(16)} color={selected ? c.white : c.primary} />
              <Text style={[textStyles.link, { color: selected ? c.white : c.primary, fontSize: ms(13) }]}>
                {selected ? 'Agregar otro' : 'Personalizar'}
              </Text>
            </View>
          ) : selected ? (
            <View style={[styles.row, styles.stepper, { borderRadius: ms(12), height: ms(36) }]}>
              <TouchableOpacity onPress={() => onChange(-1)} hitSlop={6} style={styles.stepperButton} accessibilityLabel={`Quitar un ${product.name}`}>
                <Icon name={quantity === 1 ? 'trash-outline' : 'remove'} size={ms(17)} color={c.primary} />
              </TouchableOpacity>
              <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(15) }]}>{quantity}</Text>
              <TouchableOpacity onPress={() => onChange(1)} hitSlop={6} style={styles.stepperButton} accessibilityLabel={`Agregar otro ${product.name}`}>
                <Icon name="add" size={ms(18)} color={c.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.row, styles.addButton, { borderRadius: ms(12), height: ms(36), gap: ms(6) }]}>
              <Icon name="add" size={ms(17)} color={c.primary} />
              <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13) }]}>Agregar</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.border,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    color: c.textDark,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
  },
  categoryCard: {
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: c.surfaceMuted,
  },
  categoryImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  categoryShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  categoryTitle: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  categoryArrow: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primary,
  },
  productCard: {
    overflow: 'hidden',
    backgroundColor: c.surface,
  },
  productImageArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F1EB',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  infoButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  qtyBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primary,
    borderWidth: 2,
    borderColor: c.white,
  },
  stepper: {
    justifyContent: 'space-between',
    backgroundColor: c.primaryTint,
  },
  stepperButton: {
    width: 40,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: c.primary,
  },
  addButtonSolid: {
    justifyContent: 'center',
    backgroundColor: c.primary,
  },
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PILL,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  pillIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primary,
  },
  pillBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primary,
    borderWidth: 2,
    borderColor: PILL,
  },
});
