import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import apiClient from "@syscor/shared/src/services/apiClient";

// Notificaciones push del repartidor: paquete asignado por Chef Panchita y
// mensajes del cliente en el chat. Las manda el backend por el servicio de
// Expo (pushUtils.sendPushToEmployee); aquí solo se registra el teléfono.

// Canal de Android: el backend manda los avisos con channelId "work".
const ANDROID_CHANNEL = "work";

let registeredToken = null;

// Con la app abierta no se muestra el aviso del sistema: la app ya avisa con
// su propio diálogo (ver useDelivery), y saldría repetido.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const projectIdOf = () =>
  Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId || null;

const getPushToken = async () => {
  if (!Device.isDevice) return { error: "Las notificaciones push solo funcionan en un teléfono real." };

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: "Entregas",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") ({ status } = await Notifications.requestPermissionsAsync());
  if (status !== "granted") return { error: "Sin permiso para mostrar notificaciones." };

  const projectId = projectIdOf();
  if (!projectId) return { error: "Falta el projectId de EAS en app.json." };

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { token: data };
  } catch (error) {
    return { error: error.message };
  }
};

export const registerForPush = async () => {
  const { token, error } = await getPushToken();
  if (!token) {
    console.warn("Notificaciones push no disponibles:", error);
    return { success: false, error };
  }
  try {
    await apiClient.post("/auth/push-token", { token });
    registeredToken = token;
    return { success: true };
  } catch (err) {
    console.warn("No se pudo registrar el token de notificaciones:", err.message);
    return { success: false, error: err.message };
  }
};

// Se llama ANTES de cerrar sesión: después ya no hay cookie para el backend.
export const unregisterFromPush = async () => {
  const token = registeredToken;
  registeredToken = null;
  if (!token) return;
  try {
    await apiClient.delete("/auth/push-token", { data: { token } });
  } catch {
    // Si falla, Expo lo dará de baja solo cuando el token deje de servir.
  }
};
