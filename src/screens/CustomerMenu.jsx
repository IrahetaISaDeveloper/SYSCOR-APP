import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import menuStyles, { colors } from '../styles/CustomerMenu';
import useMenu from '../hooks/useMenu';
import { useAuth } from '../context/AuthContext';
import { getFirstName } from '../utils/userDisplay';

// Categorías de productos estáticas para filtrar en el menú del cliente
const CATEGORIES = [
  { id: 'all', label: 'Tacos' },
  { id: 'tortas', label: 'Tortas' },
  { id: 'burritos', label: 'Burritos' },
  { id: 'quesadillas', label: 'Quesadillas' },
  { id: 'bebidas', label: 'Bebidas' },
];

// Lista de promociones destacadas en el banner horizontal
const PROMOS = [
  {
    id: '1',
    badge: 'TIEMPO LIMITADO',
    badgeVariant: 'primary',
    title: '2x1 en tacos\nal pastor',
    subtitle: 'cada martes de 4 a 8 pm',
    image: require('../../assets/promo-tacos-pastor.png'),
  },
  {
    id: '2',
    badge: 'NUEVO',
    badgeVariant: 'new',
    title: 'Burrito\nincluyendo...',
    subtitle: 'Relleno especial de la casa',
    image: require('../../assets/promo-burrito.png'),
  },
];

// Imágenes locales de respaldo (fallback) cuando un platillo retornado por la API no cuenta con URL de imagen
const FALLBACK_IMAGES = [
  require('../../assets/taco-pastor-single.png'),
  require('../../assets/quesadilla-birria.png'),
  require('../../assets/torta-milanesa.png'),
  require('../../assets/agua-jamaica.png'),
];

// ── COMPONENTES INTERNOS DE LA PANTALLA ────────────────────────────────

// Componente para la tarjeta de promoción en el carrusel
const PromoCard = ({ item }) => (
  <TouchableOpacity style={menuStyles.promoCard} activeOpacity={0.88}>
    <Image source={item.image} style={menuStyles.promoImage} resizeMode="cover" />
    <View style={menuStyles.promoOverlay}>
      <View style={[menuStyles.promoBadge, item.badgeVariant === 'new' && menuStyles.promoBadgeNew]}>
        <Text style={menuStyles.promoBadgeText}>{item.badge}</Text>
      </View>
      <Text style={menuStyles.promoTitle}>{item.title}</Text>
      <Text style={menuStyles.promoSubtitle}>{item.subtitle}</Text>
    </View>
  </TouchableOpacity>
);

// Componente para la tarjeta individual de un platillo del menú
const DishCard = ({ item, index, onPress }) => {
  // Si el platillo tiene URL de imagen provista por la API la usamos; si no, usamos la imagen local de fallback
  const imageSource = item.imageUrl
    ? { uri: item.imageUrl }
    : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  return (
    <TouchableOpacity style={menuStyles.dishCard} activeOpacity={0.85} onPress={() => onPress(item)}>
      <Image source={imageSource} style={menuStyles.dishImage} resizeMode="cover" />
      <View style={menuStyles.dishInfo}>
        <Text style={menuStyles.dishName}>{item.name}</Text>
        <Text style={menuStyles.dishDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={menuStyles.dishPrice}>{item.price}</Text>
          {item.quantity > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Icon name="flame-outline" size={13} color={colors.primary} />
              <Text style={menuStyles.dishQty}>{item.quantity} pedidos</Text>
            </View>
          )}
        </View>
      </View>
      {/* Botón "+" para configurar el producto (bebida/salsas/extras) antes de agregarlo al carrito */}
      <TouchableOpacity style={menuStyles.addButton} onPress={() => onPress(item)} activeOpacity={0.8}>
        <Icon name="add" size={20} color={colors.white} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// Componente de esqueleto ("Skeleton") visual mostrado mientras se realiza el fetch de platillos
const PopularSkeleton = () => (
  <View style={{ paddingHorizontal: 16 }}>
    {[1, 2, 3, 4].map((i) => (
      <View
        key={i}
        style={[
          menuStyles.dishCard,
          { height: 108, backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={[menuStyles.dishImage, { backgroundColor: '#E5E5E5' }]} />
        <View style={{ flex: 1, paddingHorizontal: 12, gap: 8 }}>
          <View style={{ height: 14, width: '60%', backgroundColor: '#E5E5E5', borderRadius: 6 }} />
          <View style={{ height: 11, width: '90%', backgroundColor: '#EFEFEF', borderRadius: 6 }} />
          <View style={{ height: 11, width: '75%', backgroundColor: '#EFEFEF', borderRadius: 6 }} />
          <View style={{ height: 14, width: '30%', backgroundColor: '#E5E5E5', borderRadius: 6 }} />
        </View>
      </View>
    ))}
  </View>
);

// ── PANTALLA PRINCIPAL DEL MENÚ DEL CLIENTE ─────────────────────────────
const CustomerMenu = ({ navigation }) => {
  // Estado para controlar la categoría activa seleccionada
  const [activeCategory, setActiveCategory] = useState('all');
  // Estado para el texto escrito en la barra de búsqueda
  const [searchText, setSearchText] = useState('');

  // Hook que consume la API del menú (obtiene los platillos más vendidos)
  const { popularDishes, isLoading, error, refetch } = useMenu();
  const { user } = useAuth();
  const firstName = getFirstName(user);

  // Abre ProductDetails para configurar el platillo (bebida/salsas/extras) antes de agregarlo
  const handleDishPress = (item) => {
    navigation.navigate('ProductDetails', { saucerId: item.id, itemType: 'saucer' });
  };

  // Filtrado reactivo por texto sobre los platillos recibidos de la API
  const filteredDishes =
    searchText.trim().length > 0
      ? popularDishes.filter(
          (d) =>
            d.name.toLowerCase().includes(searchText.toLowerCase()) ||
            d.description.toLowerCase().includes(searchText.toLowerCase())
        )
      : popularDishes;

  return (
    <SafeAreaView style={menuStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* ── ENCABEZADO (Menú hamburguesa, Logo El Corral, Buscador) ── */}
      <View style={menuStyles.header}>
        <TouchableOpacity>
          <Icon name="menu" size={26} color={colors.textDark} />
        </TouchableOpacity>

        <View style={menuStyles.headerLogo}>
          <Image
            source={require('../../assets/logo-el-corral.png')}
            style={menuStyles.headerLogoImage}
            resizeMode="contain"
          />
          <Text style={menuStyles.headerBrandText}>El Corral</Text>
        </View>

        <View style={menuStyles.headerIcons}>
          <TouchableOpacity>
            <Icon name="search-outline" size={24} color={colors.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {firstName ? (
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textDark, paddingHorizontal: 16, paddingTop: 12 }}>
            Hola, {firstName}
          </Text>
        ) : null}

        {/* ── BARRA DE BÚSQUEDA ── */}
        <View style={menuStyles.searchContainer}>
          <Icon name="search-outline" size={18} color={colors.textLight} />
          <TextInput
            style={menuStyles.searchInput}
            placeholder="Busca tacos, burritos..."
            placeholderTextColor={colors.textLight}
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity>
            <Icon name="options-outline" size={20} color={colors.textGray} />
          </TouchableOpacity>
        </View>

        {/* ── FILTRO HORIZONTAL DE CATEGORÍAS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={menuStyles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[menuStyles.categoryChip, isActive && menuStyles.categoryChipActive]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    menuStyles.categoryChipText,
                    isActive && menuStyles.categoryChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── SECCIÓN DE PROMOCIONES DE HOY ── */}
        <View style={menuStyles.sectionHeader}>
          <Text style={menuStyles.sectionTitle}>Promociones de Hoy</Text>
          <TouchableOpacity>
            <Text style={menuStyles.seeAllText}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={menuStyles.promosContainer}
        >
          {PROMOS.map((promo) => (
            <PromoCard key={promo.id} item={promo} />
          ))}
        </ScrollView>

        {/* ── SECCIÓN DE PLATILLOS POPULARES ── */}
        <View style={menuStyles.sectionHeader}>
          <Text style={menuStyles.sectionTitle}>Platillos populares</Text>
          {!isLoading && (
            <TouchableOpacity onPress={refetch}>
              <Icon name="refresh-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Estado 1: cargando con efecto Skeleton */}
        {isLoading && <PopularSkeleton />}

        {/* Estado 2: error en la carga */}
        {!isLoading && error && (
          <View style={menuStyles.errorContainer}>
            <Icon name="cloud-offline-outline" size={36} color={colors.textLight} />
            <Text style={menuStyles.errorText}>{error}</Text>
            <TouchableOpacity style={menuStyles.retryButton} onPress={refetch}>
              <Text style={menuStyles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Estado 3: platillos cargados correctamente */}
        {!isLoading && !error && (
          <View style={menuStyles.dishesContainer}>
            {filteredDishes.length === 0 ? (
              <Text style={menuStyles.emptyText}>No se encontraron platillos.</Text>
            ) : (
              filteredDishes.map((dish, index) => (
                <DishCard key={dish.id} item={dish} index={index} onPress={handleDishPress} />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerMenu;
