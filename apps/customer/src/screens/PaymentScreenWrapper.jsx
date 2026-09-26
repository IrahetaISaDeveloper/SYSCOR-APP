import React from 'react';
import { useCart } from '../context/CartContext';
import PaymentScreen from './PaymentVerfication';

export default function PaymentScreenWrapper({ navigation }) {
  const { items, subtotal, total, clearCart } = useCart();

  const cartItems = items.map((item) => ({
    id: item.cartItemId,
    name: item.name,
    price: item.unitPrice,
    quantity: item.quantity,
  }));

  return (
    <PaymentScreen
      cartItems={cartItems}
      rawItems={items}
      subtotal={subtotal}
      total={total}
      onBack={() => navigation.goBack()}
      onGoHome={() => {
        clearCart();
        navigation.navigate('CustomerTabs', { screen: 'Menu' });
      }}
    />
  );
}
