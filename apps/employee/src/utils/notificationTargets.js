// Qué abre cada aviso del empleado, al tocar el push o la fila en la bandeja.
// `navigate` sube por los navegadores hasta encontrar la ruta, así que sirve
// igual desde la raíz del rol que desde una pantalla anidada.

export const NOTIFICATION_ICONS = {
  delivery_package: "cube-outline",
  order_chat: "chatbubble-ellipses-outline",
  order_ready: "restaurant-outline",
  table_request: "hand-left-outline",
  cashier_waiter_call: "people-outline",
};

export const iconForNotification = (type) => NOTIFICATION_ICONS[type] || "notifications-outline";

export const openNotificationTarget = (data, navigation) => {
  switch (data?.type) {
    // Repartidor
    case "order_chat":
      if (data.orderId) navigation.navigate("Deliveries", { screen: "OrderChat", params: { orderId: data.orderId } });
      break;
    case "delivery_package":
      navigation.navigate("Deliveries", { screen: "DeliveriesList" });
      break;
    // Mesero: abre la mesa en el tablero (la comanda lista, o la mesa que
    // pide la cuenta o lo llama; el "Voy" está en el aviso de arriba).
    case "order_ready":
    case "table_request":
    case "cashier_waiter_call":
      navigation.navigate("WaiterTabs", {
        screen: "Dashboard",
        params: { openTableId: data.tableId || null, openAt: Date.now() },
      });
      break;
    default:
      break;
  }
};
