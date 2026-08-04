import React, { useState, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import ProductDetails from './src/screens/ProductDetails';
import ProfileScreen from './src/screens/Profile';
import Cart from './src/screens/Cart';
import PaymentScreen from './src/screens/PaymentVerfication';

export default function App() {
  const [screen, setScreen] = useState('profile');
  const [cartItems, setCartItems] = useState([]);

  const { subtotal, tip, total } = useMemo(() => {
    const sub = cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
    const propina = sub * 0.05;
    return { subtotal: sub, tip: propina, total: sub + propina };
  }, [cartItems]);

  const handleAddToCart = (payload) => {
    setCartItems((prev) => [
      ...prev,
      {
        id: `${payload.productId}-${prev.length}`,
        name: payload.name,
        description: payload.name,
        price: payload.unitPrice,
        quantity: payload.quantity,
        imageUrl: payload.imageUrl,
      },
    ]);
    setScreen('cart');
  };

  const handleUpdateQuantity = (id, quantity) => {
    setCartItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {screen === 'profile' && <ProfileScreen />}

      {screen === 'product' && (
        <ProductDetails
          itemTypeProp="combo"
          onAddToCart={handleAddToCart}
          onGoToCart={() => setScreen('cart')}
        />
      )}

      {screen === 'cart' && (
        <Cart
          cartItems={cartItems}
          subtotal={subtotal}
          tip={tip}
          total={total}
          onBack={() => setScreen('product')}
          onClearCart={() => setCartItems([])}
          onUpdateQuantity={handleUpdateQuantity}
          onCheckout={() => setScreen('payment')}
        />
      )}

      {screen === 'payment' && (
        <PaymentScreen
          cartItems={cartItems}
          subtotal={subtotal}
          tip={tip}
          total={total}
          onBack={() => setScreen('cart')}
          onGoHome={() => {
            setCartItems([]);
            setScreen('product');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
});

