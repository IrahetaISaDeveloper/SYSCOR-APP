import React from 'react';
import { useCart } from '../context/CartContext';
import { Alert } from 'react-native';
import PaymentScreen from './PaymentVerfication';

export default function PaymentScreenWrapper({ navigation }) {
  const { items, subtotal, total, clearCart, addMode, endAddMode, setPayingAdd } = useCart();

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
      addMode={addMode}
      onPayingAdd={setPayingAdd}
      // Productos agregados a un pedido: se sumaron al mismo pedido, que
      // vuelve a la cola. Regresa el carrito de antes.
      onAddPaid={() => {
        const code = addMode?.code;
        endAddMode();
        navigation.navigate('CustomerTabs', { screen: 'Orders' });
        Alert.alert('¡Listo!', `Agregamos tus productos al pedido ${code}. Ya volvió a la cola de cocina.`);
      }}
      onAddWindowClosed={(message) => {
        endAddMode();
        navigation.navigate('CustomerTabs', { screen: 'Orders' });
        Alert.alert('Se acabó el tiempo', message);
      }}
      // Comer en el local: ya pagado, Panchita le busca mesa. Se reemplaza la
      // pantalla de pago para que "atrás" no vuelva a ella.
      onDineInPaid={(orderId) => {
        clearCart();
        navigation.replace('TableReservation', { orderId });
      }}
      onGoHome={() => {
        clearCart();
        navigation.navigate('CustomerTabs', { screen: 'Menu' });
      }}
    />
  );
}
