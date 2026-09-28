import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@syscor/shared/src/context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { registerForPush, unregisterFromPush } from '../services/pushApi';
import { navigate } from '../navigation/navigationRef';

// Registra el teléfono para los avisos de pedidos mientras haya sesión y el
// interruptor "Avisos de mi pedido" (Más) esté encendido. Al tocar un aviso
// se abre "Mis pedidos". No dibuja nada.
const PushNotificationsManager = () => {
  const { user } = useAuth();
  const customerId = user?.id || user?._id;
  const { orderAlerts } = usePreferences();

  useEffect(() => {
    if (!customerId) return;
    if (orderAlerts) registerForPush(customerId);
    else unregisterFromPush(customerId);
  }, [customerId, orderAlerts]);

  // Aviso tocado, con la app abierta, en segundo plano o cerrada.
  const response = Notifications.useLastNotificationResponse();
  // El de "entregado" abre además la hoja para calificarlo.
  useEffect(() => {
    const data = response?.notification?.request?.content?.data;
    if (data?.type !== 'order_status') return;
    navigate('CustomerTabs', {
      screen: 'Orders',
      params: data.status === 'delivered' ? { rateOrderId: data.orderId } : undefined,
    });
  }, [response]);

  return null;
};

export default PushNotificationsManager;
