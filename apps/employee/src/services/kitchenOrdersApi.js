import apiClient from '@syscor/shared/src/services/apiClient';

const asList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.carts)) return payload.carts;
  return [];
};

export const fetchCartOrders = async () => {
  const { data } = await apiClient.get("/orders/carts");
  return asList(data);
};

export const fetchApiOrders = async (params = {}) => {
  const { data } = await apiClient.get("/orders", { params });
  return asList(data);
};

export const fetchKitchenOrders = () => fetchApiOrders();

export const fetchKitchenFinishedOrders = (from) =>
  fetchApiOrders({ status: "ready,delivered", from: from.toISOString() });

export const updateCartOrderStatus = async (orderId, status) => {
  const { data } = await apiClient.patch(`/orders/carts/${orderId}`, { status });
  return data;
};

export const updateApiOrderStatusRequest = async (orderId, status) => {
  const { data } = await apiClient.put(`/orders/${orderId}/status`, { status });
  return data;
};
