import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import apiClient from '@syscor/shared/src/services/apiClient';

// Notificaciones push de los pedidos ("Tu pedido está en cocina", "Va en
// camino", "Entregado"). Las manda el backend por el servicio de Expo al
// cambiar el estado del pedido; aquí solo se registra el teléfono.

// Canal de Android: el backend manda los avisos con channelId "orders".
const ANDROID_CHANNEL = 'orders';

// Token registrado en esta sesión, para quitarlo al cerrar sesión.
let registeredToken = null;

// Con la app abierta el aviso también se muestra arriba.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// El projectId de EAS lo exige Expo para dar el token. Sale de app.json
// (extra.eas.projectId), que se llena con `eas init`.
const projectIdOf = () =>
  Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId || null;

// Pide permiso y devuelve el ExpoPushToken, o { error } explicando por qué no.
const getPushToken = async () => {
  if (!Device.isDevice) return { error: 'Las notificaciones push solo funcionan en un teléfono real.' };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: 'Mis pedidos',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
  if (status !== 'granted') return { error: 'Sin permiso para mostrar notificaciones.' };

  const projectId = projectIdOf();
  if (!projectId) return { error: 'Falta el projectId de EAS en app.json (corre `eas init`).' };

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { token: data };
  } catch (error) {
    return { error: error.message };
  }
};

// Activa los avisos en este teléfono para el cliente.
export const registerForPush = async (customerId) => {
  if (!customerId) return { success: false };
  const { token, error } = await getPushToken();
  if (!token) {
    console.warn('Notificaciones push no disponibles:', error);
    return { success: false, error };
  }
  try {
    await apiClient.post(`/users/customers/${customerId}/push-token`, { token });
    registeredToken = token;
    return { success: true };
  } catch (err) {
    console.warn('No se pudo registrar el token de notificaciones:', err.message);
    return { success: false, error: err.message };
  }
};

// Deja de mandar avisos a este teléfono (al cerrar sesión o apagarlos). Se
// llama ANTES de cerrar sesión: después ya no hay cookie para el backend.
export const unregisterFromPush = async (customerId) => {
  const token = registeredToken;
  registeredToken = null;
  if (!customerId || !token) return;
  try {
    await apiClient.delete(`/users/customers/${customerId}/push-token`, { data: { token } });
  } catch {
    // Si falla, Expo lo dará de baja solo cuando el token deje de servir.
  }
};
