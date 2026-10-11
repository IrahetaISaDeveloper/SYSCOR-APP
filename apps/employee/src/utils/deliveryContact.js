import { Linking } from "react-native";
import { AppAlert } from "@syscor/shared/src/components/commons/AppAlert";

const cleanPhone = (phone) => String(phone || "").replace(/[^\d+]/g, "");

const open = (url) =>
  Linking.openURL(url).catch(() => AppAlert.alert("No disponible", "Este dispositivo no puede abrir esa acción."));

export const callPhone = (phone) => {
  if (!cleanPhone(phone)) return;
  open(`tel:${cleanPhone(phone)}`);
};
