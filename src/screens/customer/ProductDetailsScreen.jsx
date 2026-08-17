import React from 'react';
import { useCart } from '../../context/CartContext';
import ProductDetails from '../ProductDetails';

export default function ProductDetailsScreen({ navigation, route }) {
  const { addItem } = useCart();

  return (
    <ProductDetails
      navigation={navigation}
      route={route}
      onAddToCart={(payload) => {
        addItem(payload);
        navigation.goBack();
      }}
      onGoToCart={() => navigation.navigate('CustomerTabs', { screen: 'Cart' })}
    />
  );
}
