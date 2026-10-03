import apiClient from '@syscor/shared/src/services/apiClient';

// Mesas con los datos de su ocupación y el detalle de su cuenta abierta.
//
// El tablero del mesero trae las comandas, pero no la planta, la zona, la
// capacidad ni el lugar de la mesa en el croquis: eso viene de `/tables`, que
// además sincroniza antes las reservas de la app (aparta o suelta mesas según
// la hora). Por eso se pide primero `/tables` y luego el tablero, y se juntan.
export const fetchWaiterDashboard = async () => {
  const { data: tablesData } = await apiClient.get("/tables");
  const { data } = await apiClient.get("/orders/waiter/dashboard");

  const layoutById = new Map(
    (Array.isArray(tablesData) ? tablesData : []).map((t) => [String(t._id), t])
  );

  return (Array.isArray(data) ? data : []).map((table) => {
    const layout = layoutById.get(String(table._id)) || {};
    const reserved = table.status === "reservada";
    return {
      ...table,
      capacity: layout.capacity || null,
      floor: layout.floor || 1,
      zone: layout.zone || null,
      position: layout.position && layout.position.w ? layout.position : null,
      // El tablero solo manda nombre y personas de las mesas ocupadas; en las
      // reservadas vienen de la reserva hecha desde la app.
      customerName: reserved ? layout.customerName || null : table.customerName,
      peopleCount: reserved ? layout.peopleCount || null : table.peopleCount,
      fromAppReservation: reserved && !!layout.reservation,
    };
  });
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
