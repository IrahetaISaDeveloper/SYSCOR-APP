import React from 'react';
import { Alert } from 'react-native';
import ProductDetails from './ProductDetails';

// Detalle de producto para quien explora el menú sin cuenta. Muestra lo mismo
// que la versión con sesión, pero al intentar pedir invita a identificarse:
// aquí no existe CartProvider, así que no hay carrito al que agregar.
export default function GuestProductDetailsScreen({ navigation, route }) {
  const promptSignIn = () => {
    Alert.alert(
      'Necesitas una cuenta',
      'Para agregar productos a tu pedido, inicia sesión o crea una cuenta.',
      [
        { text: 'Ahora no', style: 'cancel' },
        { text: 'Crear cuenta', onPress: () => navigation.navigate('RegisterCustomer') },
        { text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') },
      ],
    );
  };

  return (
    <ProductDetails
      navigation={navigation}
      route={route}
      onAddToCart={promptSignIn}
      onGoToCart={promptSignIn}
    />
  );
}
