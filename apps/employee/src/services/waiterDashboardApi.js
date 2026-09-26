import apiClient from '@syscor/shared/src/services/apiClient';

// Mesas con los datos de su ocupación y el detalle de su cuenta abierta
export const fetchWaiterDashboard = async () => {
  const { data } = await apiClient.get("/orders/waiter/dashboard");
  return Array.isArray(data) ? data : [];
};

// Menú activo (combos, bebidas, extras) para armar la comanda
export const fetchMenu = async () => {
  const [combos, drinks, extras] = await Promise.all([
    apiClient.get("/menu/combos/active"),
    apiClient.get("/menu/drinks/active"),
    apiClient.get("/menu/extras/active"),
  ]);

  const asList = (payload) => (Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : []);

  return {
    combos: asList(combos.data),
    drinks: asList(drinks.data),
    extras: asList(extras.data),
  };
};

// Cambia el estado de una mesa; al ocuparla se pueden mandar cliente y personas
export const updateTableStatus = async (tableId, status, occupation = {}) => {
  const { data } = await apiClient.put(`/tables/${tableId}`, { status, ...occupation });
  return data;
};

// Crea una comanda para una mesa ocupada
export const createOrder = async ({ table, items, customerName, notes }) => {
  const { data } = await apiClient.post("/orders", {
    orderType: "local",
    table,
    items,
    localCustomerName: customerName || undefined,
    notes: notes || undefined,
  });
  return data;
};

// Cambia el estado de una comanda (pending, preparing, ready, delivered, cancelled)
export const updateOrderStatus = async (orderId, status) => {
  const { data } = await apiClient.put(`/orders/${orderId}/status`, { status });
  return data;
};

// Cobra la cuenta abierta de una mesa ('cash' o 'card')
export const checkoutTable = async (tableId, paymentMethod) => {
  const { data } = await apiClient.post(`/orders/table/${tableId}/checkout`, { paymentMethod });
  return data;
};
