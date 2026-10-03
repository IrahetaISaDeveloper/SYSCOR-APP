import { Linking, Alert } from "react-native";

const cleanPhone = (phone) => String(phone || "").replace(/[^\d+]/g, "");

const open = (url) =>
  Linking.openURL(url).catch(() => Alert.alert("No disponible", "Este dispositivo no puede abrir esa acción."));

export const callPhone = (phone) => {
  if (!cleanPhone(phone)) return;
  open(`tel:${cleanPhone(phone)}`);
};

export const sendSms = (phone) => {
  if (!cleanPhone(phone)) return;
  open(`sms:${cleanPhone(phone)}`);
};
