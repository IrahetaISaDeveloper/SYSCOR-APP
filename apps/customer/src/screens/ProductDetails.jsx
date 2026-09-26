import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import Toast from '@syscor/shared/src/components/commons/Toast';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';

import { useProduct } from '../hooks/useProduct';
import { useFavorites } from '../context/FavoritesContext';
import { getProductDetailsStyles } from '../styles/ProductDetails';
import { getMenuColors } from '../styles/CustomerMenu';
import { getOrderBandColor } from '../styles/Orders';
import PillStepper from '../components/PillStepper';

const PLACEHOLDER = 'https://via.placeholder.com/600x400';

// Color del puntito de cada salsa, por su nombre.
const SAUCE_DOTS = [
  { match: /roja|red|chile rojo/i, color: '#E23D28' },
  { match: /verde|green/i, color: '#4F8A2B' },
  { match: /habanero|picante/i, color: '#E07A1F' },
  { match: /guacamole|aguacate/i, color: '#7BA23F' },
  { match: /chipotle/i, color: '#9A4A1C' },
];
const sauceDot = (name) => SAUCE_DOTS.find((s) => s.match.test(name))?.color;

const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;
const idOf = (item, fallback) => item?._id?.$oid || item?._id || fallback;
const PRIMARY_TINT = 'rgba(226,61,40,0.10)';

const TYPE_LABELS = { saucer: 'PLATILLO', combo: 'COMBO', drink: 'BEBIDA' };

// Detalle de un platillo, combo o bebida: foto oscurecida arriba con el
// nombre junto a la flecha de regresar; debajo el precio y las opciones.
// Los platillos del combo y las bebidas son tarjetas que se deslizan de lado;
// quitar ingredientes y agregar extras son listas con casillas, por platillo.
// Abajo queda fija la cantidad y "Agregar a la bolsa".

export const ProductDetails = ({ route, navigation, onAddToCart, onGoToCart, onBack, productIdProp, itemTypeProp }) => {
  const isDark = useColorScheme() === 'dark';
  const styles = getProductDetailsStyles(isDark);
  const c = getMenuColors(isDark);
  const bandColor = getOrderBandColor(isDark);
  const m = useAuthMetrics();
  const ms = m.ms;
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const {
    loading,
    errorMessage,
    productData,
    quantity,
    setQuantity,
    selectedDrinkId,
    setSelectedDrinkId,
    selectedSauces,
    selectedSelectiveItems,
    removedByDish,
    extrasByDish,
    dishes,
    toast,
    hideToast,
    totalAmount,
    drinkOptions,
    fixedSaucers,
    selectiveOptions,
    saucesOptions,
    fetchProductAndExtras,
    handleToggleSelectiveOption,
    handleToggleExtra,
    handleToggleSauce,
    handleToggleIngredient,
    handleAddToCartPress,
  } = useProduct({ route, navigation, onAddToCart, productIdProp, itemTypeProp });

  // Sin sesión (detalle de invitado) no hay favoritos y no se muestra el corazón.
  const favorites = useFavorites();
  const itemType = route?.params?.itemType || itemTypeProp || 'combo';
  const favorite = favorites && productData ? favorites.isFavorite(itemType, productData._id) : false;
  const toggleFavorite = () =>
    favorites?.toggleFavorite({
      type: itemType,
      id: productData._id,
      name: productData.name,
      price: productData.price,
      imageUrl: productData.image,
    });

  // La bebida del combo viene incluida: se deja elegida la primera para que
  // el cliente solo la cambie si quiere otra.
  const firstDrinkId = drinkOptions.length > 0 ? drinkOptions[0].id : null;
  useEffect(() => {
    if (firstDrinkId && !selectedDrinkId) setSelectedDrinkId(firstDrinkId);
  }, [firstDrinkId, selectedDrinkId, setSelectedDrinkId]);

  // Listas que se abren y se cierran (quitar ingredientes, extras).
  const [closedSections, setClosedSections] = useState({});
  const toggleSection = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setClosedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // En un combo con varios platillos, el que se está personalizando.
  const [activeDishKey, setActiveDishKey] = useState(null);
  const activeDish = dishes.find((d) => d.key === activeDishKey) || dishes[0] || null;
  const chooseDish = (key) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveDishKey(key);
  };

  const maxPicks = productData?.selectiveMaxPicks || 1;

  // El encabezado va sobre la foto (transparente, nombre en blanco) y al
  // bajar toma fondo sólido para que el nombre no quede flotando sobre las
  // opciones.
  const heroHeight = Math.round(Math.min(height * 0.38, ms(310)));
  const headerHeight = insets.top + ms(64);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [headerSolid, setHeaderSolid] = useState(false);
  const solidFrom = Math.max(heroHeight - headerHeight - ms(40), 1);
  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (event) => {
      const solid = event.nativeEvent.contentOffset.y > solidFrom + ms(20);
      if (solid !== headerSolid) setHeaderSolid(solid);
    },
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[textStyles.body, { marginTop: 12, color: c.textGray }]}>Cargando producto…</Text>
      </View>
    );
  }

  if (errorMessage || !productData) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle-outline" size={32} color={c.error} style={{ marginBottom: 8 }} />
        <Text style={[textStyles.title, { color: c.textDark, fontSize: 17, marginBottom: 6 }]}>No se pudo cargar</Text>
        <Text style={styles.errorText}>{errorMessage || 'No se encontró información del producto.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProductAndExtras}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const solidOpacity = scrollY.interpolate({
    inputRange: [solidFrom, solidFrom + ms(40)],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const clearOpacity = scrollY.interpolate({
    inputRange: [solidFrom, solidFrom + ms(40)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  // La foto se agranda un poco al jalar hacia abajo.
  const heroScale = scrollY.interpolate({
    inputRange: [-ms(120), 0],
    outputRange: [1.35, 1],
    extrapolateRight: 'clamp',
  });

  // Cuántas cosas se le cambiaron a cada platillo, para marcarlo en su pestaña.
  const changesOf = (dish) =>
    (removedByDish[dish.key] || []).filter((n) => dish.ingredients.includes(n)).length +
    (extrasByDish[dish.key] || []).filter((x) => dish.extras.some((e) => e._id === x)).length;

  // Lo cambiado del platillo que se está personalizando; cerrado, se resume.
  const removedHere = activeDish
    ? (removedByDish[activeDish.key] || []).filter((n) => activeDish.ingredients.includes(n))
    : [];
  const extrasHere = activeDish
    ? activeDish.extras.filter((e) => (extrasByDish[activeDish.key] || []).includes(e._id))
    : [];
  const summaries = {
    remove: removedHere.length
      ? `Sin ${removedHere.map((n) => n.toLowerCase()).join(', ')}`
      : 'Con todos sus ingredientes',
    extras: extrasHere.length
      ? `${extrasHere.map((e) => e.name).join(', ')} · +${money(extrasHere.reduce((sum, e) => sum + (Number(e.price) || 0), 0))}`
      : 'Nada extra',
  };
  const hasHouseDrinks = drinkOptions.some((opt) => !opt.included);

  // Botón redondo del encabezado.
  const roundButton = {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(21),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? 'rgba(20,20,20,0.72)' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.12)' : c.border,
  };

  const headerName = (color, opacity) => (
    <Animated.Text
      style={[
        textStyles.title,
        {
          position: 'absolute',
          left: 0,
          right: 0,
          color,
          opacity,
          fontSize: ms(19),
          lineHeight: ms(23),
        },
        color === '#FFFFFF'
          ? { textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }
          : null,
      ]}
      numberOfLines={2}
    >
      {productData.name}
    </Animated.Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <StatusBar style={headerSolid && !isDark ? 'dark' : 'light'} />
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: ms(130) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Foto a sangre, oscurecida para que se lea el nombre encima */}
        <View style={{ height: heroHeight, backgroundColor: c.imagePlaceholder, overflow: 'visible' }}>
          <Animated.Image
            source={{ uri: productData.image || PLACEHOLDER }}
            style={{ width: '100%', height: '100%', transform: [{ scale: heroScale }] }}
            resizeMode="cover"
          />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.38)' }} />
          {/* Más oscuro arriba, donde va el nombre */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: headerHeight + ms(24), backgroundColor: 'rgba(0,0,0,0.22)' }} />
        </View>

        {/* El contenido sube un poco sobre la foto, como una hoja */}
        <View
          style={{
            marginTop: -ms(26),
            borderTopLeftRadius: ms(26),
            borderTopRightRadius: ms(26),
            backgroundColor: c.background,
            paddingHorizontal: m.gutter,
            paddingTop: ms(20),
            gap: ms(26),
          }}
        >
          {/* Precio y descripción (el nombre va sobre la foto) */}
          <View style={{ gap: ms(6), marginBottom: ms(4) }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]}>
                {TYPE_LABELS[itemType] || 'PRODUCTO'}
              </Text>
              <Text style={[textStyles.num, { color: c.primary, fontSize: ms(24) }]}>{money(productData.price)}</Text>
            </View>
            {productData.description ? (
              <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(14), lineHeight: ms(20) }]}>
                {productData.description}
              </Text>
            ) : null}
          </View>

          {/* Combo fijo: lo que trae */}
          {fixedSaucers.length > 0 ? (
            <Block title="Tu combo incluye" colors={c} ms={ms}>
              <CardRail gutter={m.gutter} ms={ms}>
                {fixedSaucers.map((saucer, index) => (
                  <ChoiceCard
                    key={`${idOf(saucer, 'fixed')}-${index}`}
                    image={saucer.image}
                    title={saucer.name || 'Platillo'}
                    caption="Incluido"
                    colors={c}
                    ms={ms}
                  />
                ))}
              </CardRail>
            </Block>
          ) : null}

          {/* Combo armable: el cliente elige sus platillos */}
          {productData.selective && selectiveOptions.length > 0 ? (
            <Block
              title="Elige tus platillos"
              subtitle={maxPicks === 1 ? 'Elige 1.' : `Elige ${maxPicks}.`}
              badge={`${selectedSelectiveItems.length}/${maxPicks}`}
              colors={c}
              ms={ms}
            >
              <CardRail gutter={m.gutter} ms={ms}>
                {selectiveOptions.map((opt, index) => {
                  const optId = idOf(opt, `opt-${index}`);
                  return (
                    <ChoiceCard
                      key={optId}
                      multi
                      image={opt.saucerId?.image}
                      title={opt.saucerId?.name || `Opción ${index + 1}`}
                      selected={selectedSelectiveItems.includes(optId)}
                      onPress={() => handleToggleSelectiveOption(optId)}
                      colors={c}
                      ms={ms}
                    />
                  );
                })}
              </CardRail>
            </Block>
          ) : null}

          {/* Personalizar: en un combo con varios platillos, primero se elige cuál */}
          {itemType === 'combo' && dishes.length > 0 ? (
            <Block
              title={dishes.length > 1 ? 'Personaliza tus platillos' : 'Personaliza tu platillo'}
              subtitle={dishes.length > 1 ? 'Elige cuál quieres cambiar.' : activeDish?.name}
              colors={c}
              ms={ms}
            >
              {dishes.length > 1 ? (
                <CardRail gutter={m.gutter} ms={ms} gap={ms(8)}>
                  {dishes.map((dish) => (
                    <DishTab
                      key={dish.key}
                      dish={dish}
                      active={activeDish?.key === dish.key}
                      changes={changesOf(dish)}
                      onPress={() => chooseDish(dish.key)}
                      colors={c}
                      ms={ms}
                    />
                  ))}
                </CardRail>
              ) : null}
            </Block>
          ) : null}

          {/* Quitar ingredientes del platillo (o del platillo elegido del combo) */}
          {activeDish && activeDish.ingredients.length > 0 ? (
            <Block
              title="Quitar ingredientes"
              subtitle={closedSections.remove ? summaries.remove : 'Desmarca los ingredientes que no deseas.'}
              badge={removedHere.length ? `${removedHere.length}` : null}
              open={!closedSections.remove}
              onToggle={() => toggleSection('remove')}
              colors={c}
              ms={ms}
            >
              {activeDish.ingredients.map((name) => {
                const removed = removedHere.includes(name);
                return (
                  <CheckRow
                    key={name}
                    title={name}
                    checked={!removed}
                    strike={removed}
                    onPress={() => handleToggleIngredient(activeDish.key, name)}
                    accessibilityLabel={removed ? `Sin ${name}` : name}
                    colors={c}
                    ms={ms}
                  />
                );
              })}
            </Block>
          ) : null}

          {/* Agregar extras al platillo */}
          {activeDish && activeDish.extras.length > 0 ? (
            <Block
              title="Agrégale algo"
              subtitle={closedSections.extras ? summaries.extras : 'Marca lo que quieras sumarle.'}
              badge={extrasHere.length ? `${extrasHere.length}` : null}
              open={!closedSections.extras}
              onToggle={() => toggleSection('extras')}
              colors={c}
              ms={ms}
            >
              {activeDish.extras.map((extra) => (
                <CheckRow
                  key={extra._id}
                  image={extra.image || null}
                  title={extra.name}
                  trailing={`+${money(extra.price)}`}
                  checked={extrasHere.some((e) => e._id === extra._id)}
                  onPress={() => handleToggleExtra(activeDish.key, extra._id)}
                  colors={c}
                  ms={ms}
                />
              ))}
            </Block>
          ) : null}

          {/* Bebida: la incluida o una de la casa pagando la diferencia */}
          {drinkOptions.length > 0 ? (
            <Block
              title="Elige tu bebida"
              subtitle={
                hasHouseDrinks
                  ? 'Viene incluida. Si prefieres una de la casa, pagas solo la diferencia.'
                  : 'Viene incluida en tu combo.'
              }
              colors={c}
              ms={ms}
            >
              <CardRail gutter={m.gutter} ms={ms}>
                {drinkOptions.map((opt) => (
                  <ChoiceCard
                    key={opt.id}
                    image={opt.drink?.image}
                    title={opt.drink?.name || 'Bebida'}
                    tag={opt.included ? null : 'DE LA CASA'}
                    caption={opt.included ? 'Incluida' : opt.surcharge > 0 ? `+${money(opt.surcharge)}` : 'Sin costo extra'}
                    captionAccent={!opt.included && opt.surcharge > 0}
                    selected={selectedDrinkId === opt.id}
                    onPress={() => setSelectedDrinkId(opt.id)}
                    colors={c}
                    ms={ms}
                  />
                ))}
              </CardRail>
            </Block>
          ) : null}

          {/* Salsas */}
          {saucesOptions.length > 0 ? (
            <Block title="Salsas de tu elección" colors={c} ms={ms}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: ms(8) }}>
                {saucesOptions.map((sauce) => {
                  const name = typeof sauce === 'string' ? sauce : sauce.name;
                  const selected = selectedSauces.includes(name);
                  const dot = sauceDot(name);
                  return (
                    <Chip
                      key={name}
                      colors={c}
                      ms={ms}
                      label={name}
                      active={selected}
                      solid
                      onPress={() => handleToggleSauce(name)}
                      leading={
                        dot ? (
                          <View style={{ width: ms(7), height: ms(7), borderRadius: ms(4), backgroundColor: selected ? '#FFFFFF' : dot }} />
                        ) : null
                      }
                    />
                  );
                })}
              </View>
            </Block>
          ) : null}
        </View>
      </Animated.ScrollView>

      {/* Encabezado: flecha, nombre y botones */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: headerHeight }}>
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: solidOpacity,
            backgroundColor: c.background,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
          }}
        />
        <View
          style={{
            flex: 1,
            marginTop: insets.top,
            paddingHorizontal: m.gutter,
            flexDirection: 'row',
            alignItems: 'center',
            gap: ms(12),
          }}
        >
          <TouchableOpacity
            style={roundButton}
            onPress={() => (onBack ? onBack() : navigation?.goBack())}
            accessibilityRole="button"
            accessibilityLabel="Volver"
          >
            <Icon name="arrow-back" size={ms(20)} color={c.textDark} />
          </TouchableOpacity>
          {/* Dos capas del nombre: blanco sobre la foto, del tema sobre el fondo */}
          <View style={{ flex: 1, justifyContent: 'center', height: ms(48) }} accessibilityRole="header" accessible accessibilityLabel={productData.name}>
            {headerName('#FFFFFF', clearOpacity)}
            {headerName(c.textDark, solidOpacity)}
          </View>
          <View style={{ flexDirection: 'row', gap: ms(8) }}>
            {favorites ? (
              <TouchableOpacity
                style={roundButton}
                onPress={toggleFavorite}
                accessibilityRole="button"
                accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Icon name={favorite ? 'heart' : 'heart-outline'} size={ms(19)} color={favorite ? c.primary : c.textDark} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={roundButton}
              onPress={() => onGoToCart?.()}
              accessibilityRole="button"
              accessibilityLabel="Ver mi bolsa"
            >
              <Icon name="bag-handle-outline" size={ms(19)} color={c.textDark} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Cantidad y agregar */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'row',
          alignItems: 'center',
          gap: ms(12),
          paddingHorizontal: m.gutter,
          paddingTop: ms(14),
          paddingBottom: Math.max(insets.bottom, ms(14)),
          backgroundColor: c.surface,
          borderTopLeftRadius: ms(28),
          borderTopRightRadius: ms(28),
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: c.border,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
        }}
      >
        <PillStepper
          value={quantity}
          onIncrement={() => setQuantity((q) => q + 1)}
          onDecrement={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
          colors={c}
          bandColor={bandColor}
          ms={ms}
        />
        <TouchableOpacity
          onPress={handleAddToCartPress}
          activeOpacity={0.9}
          style={{
            flex: 1,
            height: ms(54),
            borderRadius: ms(16),
            backgroundColor: c.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: ms(18),
          }}
          accessibilityRole="button"
        >
          <Text style={[textStyles.button, { color: '#FFFFFF', fontSize: ms(15) }]}>Agregar a la bolsa</Text>
          <Text style={[textStyles.num, { color: '#FFFFFF', fontSize: ms(15) }]}>{money(totalAmount)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Bloque de opciones: título grande y, si se puede cerrar, la flecha a la
// derecha. Cerrado, el subtítulo resume lo elegido.
const Block = ({ title, subtitle, badge, open = true, onToggle, colors: c, ms, children }) => {
  const Header = onToggle ? TouchableOpacity : View;
  const headerProps = onToggle
    ? { onPress: onToggle, activeOpacity: 0.7, accessibilityRole: 'button', accessibilityState: { expanded: open } }
    : {};
  return (
    <View style={{ gap: ms(12) }}>
      <Header {...headerProps} style={{ gap: ms(4) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: ms(8) }}>
          <Text style={[textStyles.title, { flexShrink: 1, color: c.textDark, fontSize: ms(19) }]} numberOfLines={2}>
            {title}
          </Text>
          {badge ? (
            <View style={{ paddingHorizontal: ms(7), paddingVertical: ms(2), borderRadius: ms(7), backgroundColor: PRIMARY_TINT }}>
              <Text style={[textStyles.kicker, { color: c.primary, fontSize: ms(9.5) }]}>{badge}</Text>
            </View>
          ) : null}
          <View style={{ flex: 1 }} />
          {onToggle ? <Icon name={open ? 'chevron-up' : 'chevron-down'} size={ms(20)} color={c.textDark} /> : null}
        </View>
        {subtitle ? (
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </Header>
      {open ? children : null}
    </View>
  );
};

// Fila de tarjetas que se desliza de izquierda a derecha, de orilla a orilla.
const CardRail = ({ gutter, ms, gap, children }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ marginHorizontal: -gutter }}
    contentContainerStyle={{ paddingHorizontal: gutter, paddingVertical: ms(2), gap: gap ?? ms(12) }}
  >
    {children}
  </ScrollView>
);

// Tarjeta con foto y nombre (platillos del combo, bebidas). Sin `onPress` es
// solo informativa; elegida lleva borde y palomita arriba a la derecha.
const ChoiceCard = ({ image, title, caption, captionAccent, tag, selected, multi, onPress, colors: c, ms }) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress
    ? {
        onPress,
        activeOpacity: 0.85,
        accessibilityRole: multi ? 'checkbox' : 'radio',
        accessibilityState: multi ? { checked: !!selected } : { selected: !!selected },
        accessibilityLabel: [title, caption].filter(Boolean).join(', '),
      }
    : {};
  return (
    <Wrapper
      {...wrapperProps}
      style={{
        width: ms(146),
        borderRadius: ms(18),
        borderWidth: selected ? 1.5 : 1,
        borderColor: selected ? c.primary : c.border,
        backgroundColor: c.surface,
        padding: ms(10),
        gap: ms(8),
      }}
    >
      <View style={{ height: ms(96), borderRadius: ms(12), overflow: 'hidden', backgroundColor: c.imagePlaceholder }}>
        {image ? (
          <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="fast-food-outline" size={ms(30)} color={c.textLight} />
          </View>
        )}
        {tag ? (
          <View
            style={{
              position: 'absolute',
              left: ms(6),
              top: ms(6),
              paddingHorizontal: ms(6),
              paddingVertical: ms(2),
              borderRadius: ms(6),
              backgroundColor: c.primary,
            }}
          >
            <Text style={[textStyles.kicker, { color: '#FFFFFF', fontSize: ms(8.5) }]}>{tag}</Text>
          </View>
        ) : null}
      </View>
      <Text
        style={[
          textStyles.bodyMedium,
          { color: c.textDark, fontSize: ms(14), lineHeight: ms(18), textAlign: 'center', minHeight: ms(36) },
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>
      {caption ? (
        <Text style={[textStyles.num, { color: captionAccent ? c.primary : c.textGray, fontSize: ms(12), textAlign: 'center' }]}>
          {caption}
        </Text>
      ) : null}
      {selected ? (
        <View
          style={{
            position: 'absolute',
            top: ms(6),
            right: ms(6),
            width: ms(24),
            height: ms(24),
            borderRadius: ms(12),
            backgroundColor: c.primary,
            borderWidth: 2,
            borderColor: c.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="checkmark" size={ms(14)} color="#FFFFFF" />
        </View>
      ) : null}
    </Wrapper>
  );
};

// Pestaña de un platillo del combo, para elegir cuál se personaliza. El
// numerito dice cuántas cosas ya se le cambiaron.
const DishTab = ({ dish, active, changes, onPress, colors: c, ms }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(8),
      paddingLeft: ms(5),
      paddingRight: ms(12),
      height: ms(44),
      borderRadius: ms(22),
      borderWidth: 1,
      borderColor: active ? c.primary : c.border,
      backgroundColor: active ? PRIMARY_TINT : c.surface,
    }}
    accessibilityRole="tab"
    accessibilityState={{ selected: active }}
    accessibilityLabel={changes ? `${dish.name}, ${changes} cambios` : dish.name}
  >
    <Thumb uri={dish.image} size={ms(34)} colors={c} ms={ms} round />
    <Text style={[textStyles.bodyMedium, { color: active ? c.primary : c.textDark, fontSize: ms(13.5) }]} numberOfLines={1}>
      {dish.name}
    </Text>
    {changes ? (
      <View
        style={{
          minWidth: ms(18),
          height: ms(18),
          borderRadius: ms(9),
          paddingHorizontal: ms(4),
          backgroundColor: c.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={[textStyles.num, { color: '#FFFFFF', fontSize: ms(10.5) }]}>{changes}</Text>
      </View>
    ) : null}
  </TouchableOpacity>
);

// Fila de lista con casilla (ingredientes, extras). `image` agrega la foto
// (null = hueco con ícono); `strike` tacha el ingrediente que se quitó.
const CheckRow = ({ image, title, trailing, checked, strike, onPress, accessibilityLabel, colors: c, ms }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{ flexDirection: 'row', alignItems: 'center', gap: ms(14), paddingVertical: ms(6) }}
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
    accessibilityLabel={accessibilityLabel || title}
  >
    <View
      style={{
        width: ms(26),
        height: ms(26),
        borderRadius: ms(6),
        borderWidth: checked ? 0 : 1.5,
        borderColor: c.borderStrong,
        backgroundColor: checked ? c.primary : c.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked ? <Icon name="checkmark" size={ms(17)} color="#FFFFFF" /> : null}
    </View>
    {image !== undefined ? <Thumb uri={image} size={ms(48)} colors={c} ms={ms} /> : null}
    <Text
      style={[
        textStyles.body,
        {
          flex: 1,
          color: strike ? c.textLight : c.textDark,
          fontSize: ms(15),
          textDecorationLine: strike ? 'line-through' : 'none',
        },
      ]}
    >
      {title}
    </Text>
    {trailing ? <Text style={[textStyles.num, { color: c.textGray, fontSize: ms(13) }]}>{trailing}</Text> : null}
  </TouchableOpacity>
);

// Pastilla que se prende y se apaga (salsas, ingredientes). `solid` la pinta
// de rojo al activarse; `strike` tacha el texto (ingrediente quitado).
const Chip = ({ label, active, solid, strike, leading, onPress, accessibilityLabel, colors: c, ms }) => {
  const filled = active && solid;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: ms(6),
        paddingHorizontal: ms(13),
        height: ms(38),
        borderRadius: ms(19),
        borderWidth: 1,
        borderColor: active ? c.primary : c.border,
        backgroundColor: filled ? c.primary : active ? PRIMARY_TINT : c.surfaceMuted,
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: active }}
      accessibilityLabel={accessibilityLabel || label}
    >
      {leading}
      <Text
        style={[
          textStyles.bodyMedium,
          {
            color: filled ? '#FFFFFF' : active ? c.primary : c.textDark,
            fontSize: ms(13.5),
            textDecorationLine: active && strike ? 'line-through' : 'none',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const Thumb = ({ uri, size, colors: c, ms, round }) => {
  const radius = round ? size / 2 : ms(10);
  return uri ? (
    <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius, backgroundColor: c.imagePlaceholder }} />
  ) : (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: c.imagePlaceholder, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="fast-food-outline" size={size * 0.5} color={c.textLight} />
    </View>
  );
};

export default ProductDetails;
