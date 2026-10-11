import React from 'react';
import ProductDetails from './ProductDetails';
import { setPendingCartItem } from '../utils/guestCart';

// Detalle de producto para quien explora el menú sin cuenta. Muestra lo mismo
// que la versión con sesión; al pedir se le preguntan solo nombre y apellidos
// (GuestCheckout) y el producto queda guardado para meterlo a la bolsa en
// cuanto se abre su sesión de invitado.
export default function GuestProductDetailsScreen({ navigation, route }) {
  const startGuestOrder = (payload) => {
    if (payload) setPendingCartItem(payload);
    navigation.navigate('GuestCheckout');
  };

  return (
    <ProductDetails
      navigation={navigation}
      route={route}
      onAddToCart={startGuestOrder}
      onGoToCart={() => startGuestOrder(null)}
    />
  );
}
