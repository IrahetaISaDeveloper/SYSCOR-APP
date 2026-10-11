import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { registerForPush } from "../../services/pushApi";

// Registra el teléfono del repartidor para los avisos push y, al tocar uno,
// abre lo que corresponde: el chat del pedido o la lista de entregas. Se monta
// dentro de DeliveryNavigator. No dibuja nada.
export default function DeliveryPushManager() {
  const navigation = useNavigation();

  useEffect(() => {
    registerForPush();
  }, []);

  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const data = response?.notification?.request?.content?.data;
    if (!data) return;
    if (data.type === "order_chat" && data.orderId) {
      navigation.navigate("Deliveries", { screen: "OrderChat", params: { orderId: data.orderId } });
    } else if (data.type === "delivery_package") {
      navigation.navigate("Deliveries", { screen: "DeliveriesList" });
    }
  }, [response, navigation]);

  return null;
}
