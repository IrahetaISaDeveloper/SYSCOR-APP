import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import apiClient from "@syscor/shared/src/services/apiClient";

// Notificaciones push de los empleados: paquete asignado por Chef Panchita y
// mensajes del cliente (repartidor), comanda lista (mesero). Las manda el
// backend por el servicio de Expo (pushUtils.sendPushToEmployee); aquí solo
// se registra el teléfono.

// Canal de Android: el backend manda los avisos con channelId "work".
const ANDROID_CHANNEL = "work";

let registeredToken = null;

// Avisos que la app ya muestra por su cuenta cuando está abierta (diálogo de
// useDelivery, aviso de mesas de TableRequestsOverlay): ahí el aviso del
// sistema saldría repetido.
const SHOWN_IN_APP = ["delivery_package", "order_chat", "table_request"];
// Aunque se muestren en la app, estos suenan: el mesero puede no estar viendo.
const ALWAYS_SOUND = ["table_request"];

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const type = notification?.request?.content?.data?.type;
    const showBanner = !SHOWN_IN_APP.includes(type);
    return {
      shouldShowBanner: showBanner,
      shouldShowList: true,
      shouldPlaySound: showBanner || ALWAYS_SOUND.includes(type),
      shouldSetBadge: false,
    };
  },
});

const projectIdOf = () =>
  Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId || null;

const getPushToken = async () => {
  if (!Device.isDevice) return { error: "Las notificaciones push solo funcionan en un teléfono real." };

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: "Avisos del trabajo",
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
