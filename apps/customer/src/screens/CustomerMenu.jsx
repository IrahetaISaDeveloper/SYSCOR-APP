import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
  BackHandler,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons as Icon } from '@expo/vector-icons';
import menuStyles, { getMenuColors } from '../styles/CustomerMenu';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import useMenu from '../hooks/useMenu';
import { MENU_CATEGORIES } from '../constants/menuCategories';
import CartContext from '../context/CartContext';
import { useTabBarVisibility } from '../context/TabBarVisibilityContext';
import { useFavorites } from '../context/FavoritesContext';

// Promociones del carrusel. Son fijas: el backend todavía no expone
// promociones, así que viven aquí hasta que exista ese endpoint.
const PROMOS = [
  {
    id: 'pastor',
    badge: 'Martes de pastor',
    title: 'Orden de 5 + agua fresca',
    price: '$7.50',
    oldPrice: '$9.75',
    image: require('../../assets/promo-tacos-pastor.png'),
  },
  {
    id: 'burrito',
    badge: 'Nuevo',
    title: 'Burrito de la casa',
    price: '$6.25',
    oldPrice: '$7.80',
    image: require('../../assets/promo-burrito.png'),
  },
  {
    id: 'quesabirria',
    badge: 'Recomendado',
    title: 'Quesabirria + consomé',
    price: '$8.00',
    oldPrice: '$9.50',
    image: require('../../assets/quesadilla-birria.png'),
  },
];

// Formas de ordenar la lista. El botón de la derecha del buscador abre este
// panel; antes era un icono decorativo que no hacía nada.
const SORT_OPTIONS = [
  // El backend no expone ventas por platillo al cliente, así que el orden
  // por defecto es el que trae el menú.
  { id: 'recommended', label: 'Recomendados', icon: 'star-outline' },
  { id: 'priceAsc', label: 'Precio: menor a mayor', icon: 'arrow-up-outline' },
  { id: 'priceDesc', label: 'Precio: mayor a menor', icon: 'arrow-down-outline' },
  { id: 'nameAsc', label: 'Nombre (A-Z)', icon: 'text-outline' },
];

// ── PANTALLA ────────────────────────────────────────────────────────────
const CustomerMenu = ({ navigation }) => {
  const isDark = useColorScheme() === 'dark';
  const c = getMenuColors(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Categoría abierta desde las tarjetas. `null` = se ven las tarjetas.
  const [openCategory, setOpenCategory] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [promoIndex, setPromoIndex] = useState(0);
  const [sortBy, setSortBy] = useState('recommended');
  // Proteína elegida dentro de la categoría abierta. 'all' = todas.
  const [subFilter, setSubFilter] = useState('all');
  const scrollRef = useRef(null);
  const [sortOpen, setSortOpen] = useState(false);

  const { dishes, isLoading, error, needsAuth, refetch } = useMenu();
  // Avisa a la barra inferior para que se esconda al bajar.
  const { handleScroll, reset: resetTabBar } = useTabBarVisibility();

  // Al salir del menú la barra vuelve a verse: si no, la siguiente pestaña
  // se abriría con la barra escondida.
  useFocusEffect(
    useCallback(() => () => resetTabBar?.(), [resetTabBar]),
  );

  // La tarjeta de promo deja ver un trozo de la siguiente, como en el diseño.
  const promoWidth = Math.round(width - m.gutter * 2 - ms(46));
  const promoGap = ms(12);


  const query = searchText.trim().toLowerCase();
  const searching = query.length > 0;

  const visibleDishes = useMemo(() => {
    if (searching) {
      return dishes.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          (d.subcategory || '').toLowerCase().includes(query),
      );
    }
    if (!openCategory) return dishes;
    return dishes.filter((d) => d.category === openCategory);
  }, [dishes, query, searching, openCategory]);

  // Cuántos platillos hay por categoría, para la etiqueta de cada tarjeta.
  const countByCategory = useMemo(() => {
    const acc = {};
    for (const dish of dishes) {
      if (dish.category) acc[dish.category] = (acc[dish.category] || 0) + 1;
    }
    return acc;
  }, [dishes]);

  // El orden se aplica sobre el resultado ya filtrado.
  const sortedDishes = useMemo(() => {
    const list = [...visibleDishes];
    if (sortBy === 'priceAsc') return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceDesc') return list.sort((a, b) => b.price - a.price);
    if (sortBy === 'nameAsc') return list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [visibleDishes, sortBy]);

  // Proteínas (subcategorías) que hay dentro de la categoría abierta, para
  // los chips de filtro. Sopas y Especiales no suelen tener.
  const subcategories = useMemo(() => {
    if (!openCategory) return [];
    const set = new Set();
    for (const dish of dishes) {
      if (dish.category === openCategory && dish.subcategory) set.add(dish.subcategory);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [dishes, openCategory]);

  // Dentro de una categoría los platillos se separan por proteína, cada una
  // con su título. En la búsqueda se muestran todos juntos.
  const dishGroups = useMemo(() => {
    if (searching || !openCategory) return [{ key: 'all', title: null, items: sortedDishes }];

    const filtered =
      subFilter === 'all' ? sortedDishes : sortedDishes.filter((d) => d.subcategory === subFilter);

    // Sin proteínas no tiene sentido poner un solo título "Otros".
    if (subcategories.length === 0) return [{ key: 'all', title: null, items: filtered }];

    const groups = new Map();
    for (const dish of filtered) {
      const key = dish.subcategory || 'Otros';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(dish);
    }
    return [...groups.entries()]
      // "Otros" siempre al final.
      .sort(([a], [b]) => (a === 'Otros') - (b === 'Otros') || a.localeCompare(b))
      .map(([title, items]) => ({ key: title, title, items }));
  }, [searching, openCategory, subFilter, sortedDishes, subcategories]);

  // Abrir una categoría se comporta como entrar a otra página: arranca
  // arriba y sin lo de la portada (promos).
  const openCategoryCard = (id) => {
    setSubFilter('all');
    setOpenCategory(id);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const closeCategory = useCallback(() => {
    setOpenCategory(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  // El botón "atrás" de Android regresa a las categorías en vez de salir.
  useFocusEffect(
    useCallback(() => {
      if (!openCategory) return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        closeCategory();
        return true;
      });
      return () => sub.remove();
    }, [openCategory, closeCategory]),
  );

  // El 401/403 del backend significa que /menu/saucers pide sesión, no que
  // el cliente no tenga internet: conviene decirlo en sus palabras.
  const errorHint = needsAuth
    ? 'Inicia sesión para ver los platillos de cada categoría.'
    : 'Revisa tu conexión e inténtalo de nuevo.';

  const openDish = (item) => {
    navigation.navigate('ProductDetails', { id: item.id, itemType: item.itemType || 'saucer' });
  };

  const onPromoScroll = (event) => {
    setPromoIndex(Math.round(event.nativeEvent.contentOffset.x / (promoWidth + promoGap)));
  };

  return (
    <View style={[menuStyles.container, { backgroundColor: c.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={{ height: insets.top }} />

      {/* ── LOGO ── */}
      <View style={[menuStyles.header, { paddingBottom: ms(10) }]}>
        <Image
          // `logo-el-corral.png` trae el fondo pintado de blanco opaco (aunque
          // el PNG tenga canal alfa), por eso se veía un recuadro. Estos dos
          // sí son transparentes de verdad.
          source={
            isDark
              ? require('../../assets/logo-horizontal-blanco.png')
              : require('../../assets/logo-horizontal-negro.png')
          }
          // El PNG es cuadrado con la marca en su franja central; los márgenes
          // negativos recortan el espacio transparente sobrante.
          style={{
            width: ms(250),
            height: ms(250),
            marginVertical: -ms(92),
          }}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: ms(150) }}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* ── BUSCADOR ── */}
        <View
          style={[
            menuStyles.searchContainer,
            {
              backgroundColor: c.surface,
              borderColor: c.border,
              marginHorizontal: m.gutter,
              borderRadius: ms(16),
              paddingHorizontal: ms(16),
              minHeight: ms(52),
              gap: ms(11),
            },
          ]}
        >
          <Icon name="search" size={ms(19)} color={c.primary} />
          <TextInput
            style={[
              menuStyles.searchInput,
              textStyles.body,
              { color: c.textDark, fontSize: ms(14) },
            ]}
            placeholder="Busca tacos, burritos, bebidas..."
            placeholderTextColor={c.textLight}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searching ? (
            <TouchableOpacity
              onPress={() => setSearchText('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Borrar búsqueda"
            >
              <Icon name="close-circle" size={ms(18)} color={c.textLight} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setSortOpen(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Ordenar el menú"
            >
              <Icon
                name="options-outline"
                size={ms(19)}
                // Se tiñe cuando hay un orden distinto del normal, para que se
                // note que está aplicado.
                color={sortBy === 'recommended' ? c.textGray : c.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ── DE LA PLANCHA HOY ── (solo en la portada del menú) */}
        {!searching && !openCategory ? (
          <>
            <View
              style={[
                menuStyles.sectionHeader,
                {
                  paddingHorizontal: m.gutter,
                  marginTop: ms(26),
                  marginBottom: ms(14),
                  gap: ms(10),
                },
              ]}
            >
              <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(19) }]}>
                De la plancha hoy
              </Text>
              <View
                style={[
                  menuStyles.sectionBadge,
                  {
                    backgroundColor: c.surfaceMuted,
                    borderColor: c.border,
                    borderRadius: ms(8),
                    paddingHorizontal: ms(9),
                    paddingVertical: ms(5),
                  },
                ]}
              >
                <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(9.5) }]}>
                  2×1 HASTA LAS 6
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={promoWidth + promoGap}
              decelerationRate="fast"
              onScroll={onPromoScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ paddingHorizontal: m.gutter, gap: promoGap }}
            >
              {PROMOS.map((promo) => (
                <View
                  key={promo.id}
                  style={[
                    menuStyles.promoCard,
                    {
                      width: promoWidth,
                      backgroundColor: c.surface,
                      borderColor: c.border,
                      borderRadius: ms(18),
                    },
                  ]}
                >
                  <View>
                    <Image
                      source={promo.image}
                      style={[menuStyles.promoImage, { height: ms(168) }]}
                      resizeMode="cover"
                    />
                    <View
                      style={[
                        menuStyles.promoBadge,
                        {
                          backgroundColor: c.primary,
                          borderRadius: ms(10),
                          paddingHorizontal: ms(12),
                          paddingVertical: ms(7),
                          top: ms(14),
                          left: ms(14),
                        },
                      ]}
                    >
                      <Text style={[textStyles.link, { color: c.white, fontSize: ms(12.5) }]}>
                        {promo.badge}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      menuStyles.promoFooter,
                      { borderTopColor: c.border, padding: ms(15), gap: ms(7) },
                    ]}
                  >
                    <Text
                      style={[textStyles.title, { color: c.textDark, fontSize: ms(15.5) }]}
                      numberOfLines={1}
                    >
                      {promo.title}
                    </Text>
                    <View style={[menuStyles.promoPriceRow, { gap: ms(9) }]}>
                      <Text style={[textStyles.num, { color: c.primary, fontSize: ms(19) }]}>
                        {promo.price}
                      </Text>
                      <Text
                        style={[
                          textStyles.num,
                          {
                            color: c.textLight,
                            fontSize: ms(13),
                            textDecorationLine: 'line-through',
                          },
                        ]}
                      >
                        {promo.oldPrice}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Puntos del carrusel */}
            <View style={[menuStyles.dotsRow, { gap: ms(4), marginTop: ms(14) }]}>
              {PROMOS.map((promo, index) => (
                <View
                  key={promo.id}
                  style={[
                    menuStyles.dot,
                    {
                      width: index === promoIndex ? ms(16) : ms(4),
                      backgroundColor: index === promoIndex ? c.primary : c.borderStrong,
                    },
                  ]}
                />
              ))}
            </View>
          </>
        ) : null}

        {/* ── DEL MENÚ ── */}
        {openCategory && !searching ? (
          // Encabezado de la "página" de la categoría.
          <View
            style={[
              menuStyles.sectionHeader,
              { paddingHorizontal: m.gutter, marginTop: ms(22), marginBottom: ms(14), gap: ms(12) },
            ]}
          >
            <TouchableOpacity
              onPress={closeCategory}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Volver a las categorías"
              style={[
                menuStyles.backButton,
                {
                  backgroundColor: c.surface,
                  borderColor: c.border,
                  width: ms(38),
                  height: ms(38),
                  borderRadius: ms(19),
                },
              ]}
            >
              <Icon name="chevron-back" size={ms(20)} color={c.textDark} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(22) }]}>
                {openCategory}
              </Text>
              {!isLoading ? (
                <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}>
                  {countByCategory[openCategory] || 0}{' '}
                  {countByCategory[openCategory] === 1 ? 'platillo' : 'platillos'}
                </Text>
              ) : null}
            </View>
            {!isLoading ? (
              <TouchableOpacity
                onPress={refetch}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Recargar"
              >
                <Icon name="refresh-outline" size={ms(18)} color={c.textLight} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View
            style={[
              menuStyles.sectionHeader,
              { paddingHorizontal: m.gutter, marginTop: ms(28), marginBottom: ms(14), gap: ms(10) },
            ]}
          >
            <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(19) }]}>
              {searching ? 'Resultados' : 'Menú'}
            </Text>
            {!isLoading ? (
              <TouchableOpacity
                onPress={refetch}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Recargar"
              >
                <Icon name="refresh-outline" size={ms(18)} color={c.textLight} />
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {isLoading ? (
          <View style={[menuStyles.centerBox, { paddingVertical: ms(40), gap: ms(12) }]}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]}>
              Cargando el menú…
            </Text>
          </View>
        ) : null}


        {/* Sin búsqueda ni categoría abierta se muestran las categorías como
            tarjetas; al tocar una se entra a sus platillos. */}
        {!isLoading && !searching && !openCategory ? (
          <View style={[menuStyles.dishGrid, { paddingHorizontal: m.gutter, gap: ms(14) }]}>
            {MENU_CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                count={countByCategory[cat.id] || 0}
                colors={c}
                ms={ms}
                cardWidth={(width - m.gutter * 2 - ms(14)) / 2}
                onPress={() => openCategoryCard(cat.id)}
              />
            ))}
          </View>
        ) : null}

        {/* Chips de proteína: filtran la categoría abierta. */}
        {!isLoading && !error && openCategory && !searching && subcategories.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: m.gutter, gap: ms(8), marginBottom: ms(6) }}
          >
            {['all', ...subcategories].map((sub) => {
              const active = sub === subFilter;
              return (
                <TouchableOpacity
                  key={sub}
                  onPress={() => setSubFilter(sub)}
                  activeOpacity={0.8}
                  style={[
                    menuStyles.chip,
                    {
                      backgroundColor: active ? c.primary : c.surface,
                      borderColor: active ? c.primary : c.border,
                      borderRadius: ms(20),
                      paddingHorizontal: ms(14),
                      paddingVertical: ms(8),
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      active ? textStyles.link : textStyles.body,
                      { color: active ? c.white : c.textGray, fontSize: ms(13) },
                    ]}
                  >
                    {sub === 'all' ? 'Todos' : sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}

        {!isLoading && !error && (searching || openCategory) ? (
          sortedDishes.length === 0 ? (
            <View
              style={[
                menuStyles.centerBox,
                { paddingVertical: ms(36), paddingHorizontal: m.gutter, gap: ms(10) },
              ]}
            >
              <Icon name="restaurant-outline" size={ms(34)} color={c.textLight} />
              <Text
                style={[
                  textStyles.body,
                  { color: c.textGray, fontSize: ms(13.5), textAlign: 'center' },
                ]}
              >
                {searching
                  ? `No encontramos nada para "${searchText.trim()}".`
                  : 'No hay platillos en esta categoría todavía.'}
              </Text>
            </View>
          ) : (
            dishGroups.map((group) => (
              <View key={group.key}>
                {group.title ? (
                  <View
                    style={[
                      menuStyles.groupHeader,
                      {
                        paddingHorizontal: m.gutter,
                        marginTop: ms(18),
                        marginBottom: ms(12),
                        gap: ms(8),
                      },
                    ]}
                  >
                    <View
                      style={{ width: ms(4), height: ms(16), borderRadius: ms(2), backgroundColor: c.primary }}
                    />
                    <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(16) }]}>
                      {group.title}
                    </Text>
                    <Text style={[textStyles.num, { color: c.textLight, fontSize: ms(12) }]}>
                      {group.items.length}
                    </Text>
                  </View>
                ) : null}

                <View
                  style={[
                    menuStyles.dishGrid,
                    { paddingHorizontal: m.gutter, gap: ms(12), marginTop: group.title ? 0 : ms(6) },
                  ]}
                >
                  {group.items.map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      colors={c}
                      ms={ms}
                      cardWidth={(width - m.gutter * 2 - ms(12)) / 2}
                      onPress={() => openDish(dish)}
                    />
                  ))}
                </View>
              </View>
            ))
          )
        ) : null}
        {/* Aviso de carga fallida. Va al final y en tono menor: las
            categorías ya se ven, lo que falta son los platillos. */}
        {!isLoading && error ? (
          <View
            style={[
              menuStyles.errorNotice,
              {
                backgroundColor: c.surface,
                borderColor: c.border,
                marginHorizontal: m.gutter,
                marginTop: ms(18),
                borderRadius: ms(14),
                padding: ms(14),
                gap: ms(11),
              },
            ]}
          >
            <Icon name="cloud-offline-outline" size={ms(20)} color={c.textLight} />
            <View style={{ flex: 1, gap: ms(3) }}>
              <Text style={[textStyles.link, { color: c.textDark, fontSize: ms(13.5) }]}>
                No pudimos cargar los platillos
              </Text>
              <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12), lineHeight: ms(17) }]}>
                {errorHint}
              </Text>
            </View>
            <TouchableOpacity
              onPress={refetch}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Reintentar"
            >
              <Icon name="refresh" size={ms(19)} color={c.primary} />
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {/* ── PANEL DE ORDEN ── */}
      <SortSheet
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        value={sortBy}
        onChange={(id) => {
          setSortBy(id);
          setSortOpen(false);
        }}
        colors={c}
        ms={ms}
        gutter={m.gutter}
        bottomInset={insets.bottom}
      />

      {/* ── PÍLDORA "VER MI BOLSA" ── */}
      <BagPill
        colors={c}
        ms={ms}
        // Queda justo encima de la barra inferior, sin pegarse a ella.
        bottom={ms(18)}
        onPress={() => navigation.navigate('Cart')}
      />
    </View>
  );
};

// ── COMPONENTES ─────────────────────────────────────────────────────────

// Tarjeta de un platillo: foto arriba, nombre y descripción corta, y abajo el
// precio con un botón para abrir el detalle y agregarlo.
const DishCard = ({ dish, colors: c, ms, cardWidth, onPress }) => {
  // null en el menú de invitado: ahí no se muestra el corazón.
  const favorites = useFavorites();
  const favorite = favorites?.isFavorite(dish.itemType || 'saucer', dish.id) ?? false;

  return (
    <TouchableOpacity
      style={[
        menuStyles.dishCard,
        {
          width: cardWidth,
          backgroundColor: c.surface,
          borderColor: c.border,
          borderRadius: ms(18),
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${dish.name}, ${dish.priceLabel}`}
    >
      <View
        style={[
          menuStyles.dishImageArea,
          { height: cardWidth * 0.8, backgroundColor: c.imagePlaceholder },
        ]}
      >
        {dish.imageUrl ? (
          <Image source={{ uri: dish.imageUrl }} style={menuStyles.dishImage} resizeMode="cover" />
        ) : (
          <Icon name="fast-food-outline" size={ms(30)} color={c.textLight} />
        )}

        {favorites ? (
          <TouchableOpacity
            onPress={() =>
              favorites.toggleFavorite({
                type: dish.itemType || 'saucer',
                id: dish.id,
                name: dish.name,
                price: dish.price,
                imageUrl: dish.imageUrl,
              })
            }
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              menuStyles.dishFavorite,
              {
                backgroundColor: 'rgba(0,0,0,0.45)',
                width: ms(30),
                height: ms(30),
                borderRadius: ms(15),
                top: ms(8),
                right: ms(8),
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={favorite ? `Quitar ${dish.name} de favoritos` : `Agregar ${dish.name} a favoritos`}
          >
            <Icon name={favorite ? 'heart' : 'heart-outline'} size={ms(16)} color={favorite ? c.primary : '#FFFFFF'} />
          </TouchableOpacity>
        ) : null}

        {/* Los tacos se venden por orden de 3, 4 o 5. */}
        {dish.tacosPerOrder ? (
          <View
            style={[
              menuStyles.dishBadge,
              {
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: ms(8),
                paddingHorizontal: ms(8),
                paddingVertical: ms(4),
                top: ms(8),
                left: ms(8),
              },
            ]}
          >
            <Text style={[textStyles.link, { color: '#FFFFFF', fontSize: ms(10.5) }]}>
              Orden de {dish.tacosPerOrder}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[menuStyles.dishBody, { padding: ms(12), gap: ms(4) }]}>
        <Text
          style={[textStyles.title, { color: c.textDark, fontSize: ms(14.5) }]}
          numberOfLines={1}
        >
          {dish.name}
        </Text>
        <Text
          style={[
            textStyles.body,
            // Alto fijo de dos líneas para que todas las tarjetas midan igual.
            { color: c.textGray, fontSize: ms(11.5), lineHeight: ms(15.5), height: ms(31) },
          ]}
          numberOfLines={2}
        >
          {dish.description}
        </Text>

        <View style={[menuStyles.dishPriceRow, { marginTop: ms(6) }]}>
          <Text style={[textStyles.num, { color: c.primary, fontSize: ms(16) }]}>
            {dish.priceLabel}
          </Text>
          <View
            style={[
              menuStyles.dishAddButton,
              { backgroundColor: c.primary, width: ms(30), height: ms(30), borderRadius: ms(15) },
            ]}
          >
            <Icon name="add" size={ms(18)} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Píldora flotante con el resumen del carrito.
//
// Se lee el contexto directamente en vez de usar `useCart`: el menú también
// se muestra sin sesión (GuestMenu), donde no hay CartProvider montado y el
// hook lanzaría.
//
// Se muestra siempre, con el carrito vacío o sin sesión: es parte del
// diseño de la pantalla. Cuando no hay nada dentro enseña 0 productos.
const BagPill = ({ colors: c, ms, bottom, onPress }) => {
  const cart = useContext(CartContext);
  const itemCount = cart?.itemCount ?? 0;
  const subtotal = cart?.subtotal ?? 0;

  return (
    <TouchableOpacity
      style={[
        menuStyles.bagPill,
        {
          backgroundColor: c.pill,
          // Muy redondeada, como en el diseño.
          borderRadius: ms(36),
          paddingLeft: ms(26),
          paddingRight: ms(11),
          paddingVertical: ms(11),
          gap: ms(20),
          bottom,
        },
      ]}
      activeOpacity={0.9}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver mi bolsa, ${itemCount} productos`}
    >
      <View style={{ gap: ms(2) }}>
        <Text style={[textStyles.title, { color: '#FFFFFF', fontSize: ms(17) }]}>
          Ver mi bolsa
        </Text>
        <Text style={[textStyles.num, { color: 'rgba(255,255,255,0.7)', fontSize: ms(13.5) }]}>
          Total ${subtotal.toFixed(2)}
        </Text>
      </View>

      <View
        style={[
          menuStyles.bagIconWrap,
          { backgroundColor: c.primary, width: ms(52), height: ms(52), borderRadius: ms(26) },
        ]}
      >
        <Icon name="bag-handle" size={ms(25)} color="#FFFFFF" />
        {itemCount > 0 ? (
          <View
            style={[
              menuStyles.bagCountBadge,
              {
                backgroundColor: c.primary,
                borderWidth: ms(2),
                borderColor: c.pill,
                minWidth: ms(23),
                height: ms(23),
                borderRadius: ms(12),
                top: -ms(5),
                right: -ms(5),
                paddingHorizontal: ms(5),
              },
            ]}
          >
            <Text style={[textStyles.num, { color: '#FFFFFF', fontSize: ms(11) }]}>
              {itemCount}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

// Franjas del degradado de la tarjeta de categoría, de la más alta a la más
// baja. Cada una oscurece un poco; al apilarse, la parte de abajo queda más
// oscura y el paso entre una y otra no se nota. Así se evita instalar una
// librería de degradados.
const SHADE_STEPS = Array.from({ length: 14 }, (_, i) => `${Math.round(75 - i * 5)}%`);

// Tarjeta de una categoría: la foto ocupa toda la tarjeta y el nombre va
// encima, sobre un degradado oscuro. Al tocarla se abren sus platillos.
const CategoryCard = ({ category, count, colors: c, ms, cardWidth, onPress }) => {
  const cardHeight = Math.round(cardWidth * 1.1);

  return (
    <TouchableOpacity
      style={[
        menuStyles.categoryCard,
        {
          width: cardWidth,
          height: cardHeight,
          borderRadius: ms(20),
          backgroundColor: c.imagePlaceholder,
        },
      ]}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${category.label}, ${count} platillos`}
    >
      {/* Medidas en números y no en %: con % Android dejaba la foto a media
          tarjeta y abajo se veía el fondo claro. */}
      <Image
        source={category.image}
        style={[menuStyles.categoryImage, { width: cardWidth, height: cardHeight }]}
        resizeMode="cover"
      />

      {SHADE_STEPS.map((h) => (
        <View key={h} style={[menuStyles.categoryShade, { height: h }]} />
      ))}

      <View style={[menuStyles.categoryContent, { padding: ms(14), gap: ms(4) }]}>
        <Text
          style={[textStyles.title, menuStyles.categoryTitle, { fontSize: ms(20) }]}
          numberOfLines={1}
        >
          {category.label}
        </Text>
        <View style={[menuStyles.categoryMeta, { gap: ms(6) }]}>
          <Text
            style={[textStyles.body, menuStyles.categoryCount, { fontSize: ms(12) }]}
            numberOfLines={1}
          >
            {count > 0 ? `${count} ${count === 1 ? 'platillo' : 'platillos'}` : 'Ver platillos'}
          </Text>
          <View
            style={[
              menuStyles.categoryArrow,
              { backgroundColor: c.primary, width: ms(26), height: ms(26), borderRadius: ms(13) },
            ]}
          >
            <Icon name="arrow-forward" size={ms(14)} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Panel para elegir cómo ordenar el menú. Sale desde abajo, como el resto de
// las hojas de la app.
const SortSheet = ({ visible, onClose, value, onChange, colors: c, ms, gutter, bottomInset }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={menuStyles.sheetBackdrop}>
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

      <View
        style={[
          menuStyles.sheet,
          {
            backgroundColor: c.background,
            borderTopLeftRadius: ms(22),
            borderTopRightRadius: ms(22),
            paddingTop: ms(10),
            paddingHorizontal: gutter,
            paddingBottom: Math.max(bottomInset, ms(16)),
          },
        ]}
      >
        <View
          style={[
            menuStyles.sheetHandle,
            { backgroundColor: c.borderStrong, width: ms(40), marginBottom: ms(16) },
          ]}
        />

        <Text
          style={[
            textStyles.title,
            { color: c.textDark, fontSize: ms(17), marginBottom: ms(14) },
          ]}
        >
          Ordenar por
        </Text>

        <View style={{ gap: ms(8) }}>
          {SORT_OPTIONS.map((option) => {
            const active = option.id === value;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => onChange(option.id)}
                activeOpacity={0.8}
                style={[
                  menuStyles.sortRow,
                  {
                    backgroundColor: active ? c.surface : 'transparent',
                    borderColor: active ? c.primary : c.border,
                    borderRadius: ms(12),
                    paddingHorizontal: ms(14),
                    paddingVertical: ms(13),
                    gap: ms(11),
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Icon
                  name={option.icon}
                  size={ms(18)}
                  color={active ? c.primary : c.textGray}
                />
                <Text
                  style={[
                    active ? textStyles.link : textStyles.body,
                    { flex: 1, color: active ? c.textDark : c.textGray, fontSize: ms(14) },
                  ]}
                >
                  {option.label}
                </Text>
                {active ? (
                  <Icon name="checkmark-circle" size={ms(19)} color={c.primary} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  </Modal>
);

export default CustomerMenu;
