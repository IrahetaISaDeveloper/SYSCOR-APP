import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { getMenuColors } from '../styles/CustomerMenu';
import useMenu from '../hooks/useMenu';
import { describeRemovals } from '../utils/ingredients';
import { useIsFocused } from '@react-navigation/native';
import Cart from './Cart';
import UpsellModal from '../components/UpsellModal';

const SUGGESTION_COUNT = 8;

// Sugerencias para "Agregar otros productos": lo que no está ya en la bolsa,
// tomando uno de cada categoría por turnos para que haya variedad (y no ocho
// tacos seguidos).
const pickSuggestions = (dishes, cartItems) => {
  const inCart = new Set(cartItems.map((item) => String(item.productId)));
  const byCategory = new Map();
  dishes
    .filter((dish) => !inCart.has(dish.id))
    .forEach((dish) => {
      const key = dish.category || 'Otros';
      if (!byCategory.has(key)) byCategory.set(key, []);
      byCategory.get(key).push(dish);
    });

  const queues = [...byCategory.values()];
  const picks = [];
  while (picks.length < SUGGESTION_COUNT && queues.some((q) => q.length)) {
    queues.forEach((q) => {
      if (q.length && picks.length < SUGGESTION_COUNT) picks.push(q.shift());
    });
  }
  return picks;
};

// "¿No quieres algo más?": dos bebidas de la casa y un postre que no estén
// ya en la bolsa, al azar para que no sean siempre los mismos.
const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);
const pickUpsell = (dishes, cartItems) => {
  const inCart = new Set(cartItems.map((item) => String(item.productId)));
  const available = dishes.filter((dish) => !inCart.has(dish.id) && dish.price > 0);
  const houseDrinks = available.filter((d) => d.itemType === 'drink' && d.subcategory === 'De la casa');
  const desserts = available.filter((d) => d.itemType === 'saucer' && d.category === 'Postres');
  return [...shuffle(houseDrinks).slice(0, 2), ...shuffle(desserts).slice(0, 1)];
};

const buildDescription = (item) => {
  const parts = [];
  const removals = describeRemovals(item.removedIngredients);
  if (removals) parts.push(removals);
  if (item.selectedDrinkName) {
    parts.push(
      item.drinkSurcharge > 0
        ? `${item.selectedDrinkName} (+$${Number(item.drinkSurcharge).toFixed(2)})`
        : item.selectedDrinkName,
    );
  }
  if (item.selectedSauces?.length) parts.push(item.selectedSauces.join(', '));
  // En un combo, cada extra dice a qué platillo va: "Taco al pastor: + queso".
  if (item.selectedExtras?.length) {
    parts.push(item.selectedExtras.map((e) => (e.forSaucer ? `${e.forSaucer}: + ${e.name}` : e.name)).join(', '));
  }
  return parts.join(' · ');
};

export default function CartScreen({ navigation }) {
  const { items, addItem, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();
  const { saveCombination } = useFavorites();
  const colors = getMenuColors(useColorScheme() === 'dark');
  const { dishes } = useMenu();
  const suggestions = useMemo(() => pickSuggestions(dishes, items), [dishes, items]);

  // Al entrar a la bolsa se ofrece "algo más" una sola vez por pedido: vuelve
  // a salir hasta que la bolsa se vacíe (se pagó o se vació a mano).
  const isFocused = useIsFocused();
  const offered = useRef(false);
  const [upsell, setUpsell] = useState([]);
  // Lo que ya se agregó desde el aviso: { [id de la oferta]: { cartItemId, quantity } }.
  const [upsellAdded, setUpsellAdded] = useState({});
  useEffect(() => {
    if (items.length === 0) offered.current = false;
  }, [items.length]);
  useEffect(() => {
    if (!isFocused || offered.current || items.length === 0 || dishes.length === 0) return;
    const offers = pickUpsell(dishes, items);
    offered.current = true;
    if (offers.length) {
      setUpsellAdded({});
      setUpsell(offers);
    }
    // Solo al entrar (o cuando termina de cargar el menú), no con cada cambio.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, dishes]);

  // Cada "+" / "−" cambia la bolsa en el momento: tiene que ser rápido.
  const changeUpsell = (offer, delta) => {
    const current = upsellAdded[offer.id];
    const quantity = Math.max(0, (current?.quantity || 0) + delta);
    let cartItemId = current?.cartItemId;
    if (!cartItemId && quantity > 0) {
      cartItemId = addItem({
        productType: offer.itemType,
        productId: offer.id,
        name: offer.name,
        imageUrl: offer.imageUrl,
        quantity,
        unitPrice: offer.price,
        totalPrice: offer.price * quantity,
        selectedDrinkId: null,
        selectedSauces: [],
        selectedSelectiveItems: [],
        removedIngredients: [],
        selectedExtras: [],
      });
    } else if (cartItemId && quantity === 0) {
      removeItem(cartItemId);
      cartItemId = null;
    } else if (cartItemId) {
      updateQuantity(cartItemId, quantity);
    }
    setUpsellAdded((prev) => ({ ...prev, [offer.id]: cartItemId ? { cartItemId, quantity } : undefined }));
  };

  // Cuadro para ponerle nombre a la combinación antes de guardarla.
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');

  const cartItems = items.map((item) => ({
    id: item.cartItemId,
    name: item.name,
    price: item.unitPrice,
    quantity: item.quantity,
    imageUrl: item.imageUrl,
    description: buildDescription(item),
  }));

  const confirmSave = () => {
    saveCombination(name, items);
    setNaming(false);
    setName('');
    navigation.navigate('Favorites');
  };

  return (
    <>
      <Cart
        cartItems={cartItems}
        itemCount={itemCount}
        subtotal={subtotal}
        onBack={() => navigation.goBack()}
        onClearCart={clearCart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onAddMore={() => navigation.navigate('Menu')}
        suggestions={suggestions}
        onOpenSuggestion={(dish) =>
          navigation.navigate('ProductDetails', { id: dish.id, itemType: dish.itemType || 'saucer' })
        }
        onCheckout={() => navigation.navigate('PaymentVerification')}
        onSaveCombination={() => setNaming(true)}
      />

      <UpsellModal
        visible={upsell.length > 0}
        offers={upsell}
        quantities={Object.fromEntries(Object.entries(upsellAdded).map(([id, v]) => [id, v?.quantity || 0]))}
        onChange={changeUpsell}
        onClose={() => setUpsell([])}
      />

      <Modal visible={naming} transparent animationType="fade" onRequestClose={() => setNaming(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}
        >
          <View style={{ backgroundColor: colors.surface, borderRadius: 18, padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textDark }}>
              Guardar combinación
            </Text>
            <Text style={{ fontSize: 13, color: colors.textGray }}>
              Ponle un nombre para encontrarla en Favoritos y pedir todo junto la próxima vez.
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej. Mi martes de pastor"
              placeholderTextColor={colors.textLight}
              autoFocus
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={confirmSave}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
                color: colors.textDark,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 18, marginTop: 4 }}>
              <TouchableOpacity onPress={() => setNaming(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textGray }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: colors.primary }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
