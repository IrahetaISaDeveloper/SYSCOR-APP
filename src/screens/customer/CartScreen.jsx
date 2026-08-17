import React from 'react';
import { useCart } from '../../context/CartContext';
import Cart from '../Cart';

const buildDescription = (item) => {
  const parts = [];
  if (item.selectedSauces?.length) parts.push(item.selectedSauces.join(', '));
  if (item.selectedExtras?.length) parts.push(item.selectedExtras.map((e) => e.name).join(', '));
  return parts.join(' · ');
};

export default function CartScreen({ navigation }) {
  const { items, updateQuantity, clearCart, subtotal, tip, total } = useCart();

  const cartItems = items.map((item) => ({
    id: item.cartItemId,
    name: item.name,
    price: item.unitPrice,
    quantity: item.quantity,
    imageUrl: item.imageUrl,
    description: buildDescription(item),
  }));

  return (
    <Cart
      cartItems={cartItems}
      subtotal={subtotal}
      tip={tip}
      total={total}
      onBack={() => navigation.goBack()}
      onClearCart={clearCart}
      onUpdateQuantity={updateQuantity}
      onCheckout={() => navigation.navigate('PaymentVerification')}
    />
  );
}
