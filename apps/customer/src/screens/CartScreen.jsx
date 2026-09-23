import React, { useState } from 'react';
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
import Cart from './Cart';

const buildDescription = (item) => {
  const parts = [];
  if (item.selectedSauces?.length) parts.push(item.selectedSauces.join(', '));
  if (item.selectedExtras?.length) parts.push(item.selectedExtras.map((e) => e.name).join(', '));
  return parts.join(' · ');
};

export default function CartScreen({ navigation }) {
  const { items, updateQuantity, clearCart, subtotal, tip, total } = useCart();
  const { saveCombination } = useFavorites();
  const colors = getMenuColors(useColorScheme() === 'dark');

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
        subtotal={subtotal}
        tip={tip}
        total={total}
        onBack={() => navigation.goBack()}
        onClearCart={clearCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={() => navigation.navigate('PaymentVerification')}
        onSaveCombination={() => setNaming(true)}
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
