import apiClient from "./apiClient";

// Trae el dashboard combinando mesas + comandas activas del mesero autenticado
export const fetchWaiterDashboard = async () => {
  console.log('🌐 URL completa:', apiClient.defaults.baseURL + "/orders/waiter/dashboard");
  const { data } = await apiClient.get("/orders/waiter/dashboard");
  return data;
};

// Trae el menú (combos, bebidas, extras) para armar la comanda
export const fetchMenu = async () => {
  const [combos, drinks, extras] = await Promise.all([
    apiClient.get("/menu/combos/active"),
    apiClient.get("/menu/drinks/active"),
    apiClient.get("/menu/extras/active"),
  ]);

  console.log('combos:', JSON.stringify(combos.data).slice(0, 300));
  console.log('drinks:', JSON.stringify(drinks.data).slice(0, 300));
  console.log('extras:', JSON.stringify(extras.data).slice(0, 300));

  return {
    combos: combos.data,
    drinks: drinks.data,
    extras: extras.data,
  };
};

// Cambia el estado de una mesa (libre, ocupada, limpieza, reservada)
export const updateTableStatus = async (tableId, status) => {
  const { data } = await apiClient.put(`/tables/${tableId}`, { status });
  return data;
};

// Crea una nueva comanda para una mesa ya ocupada
export const createOrder = async ({ table, items, customerName, peopleCount }) => {
  const { data } = await apiClient.post("/orders", {
    table,
    items,
    customerName,
    peopleCount,
  });
  return data;
};

// Cambia el estado de una comanda (pending, preparing, ready, delivered, cancelled)
export const updateOrderStatus = async (orderId, status) => {
  const { data } = await apiClient.put(`/orders/${orderId}/status`, { status });
  return data;
};