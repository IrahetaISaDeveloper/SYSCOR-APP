import apiClient from "./apiClient";

export const fetchCartOrders = async () => {
  const { data } = await apiClient.get("/orders/carts");
  return data;
};

export const fetchApiOrders = async () => {
  const { data } = await apiClient.get("/orders");
  return data;
};

export const updateCartOrderStatus = async (orderId, status) => {
  const { data } = await apiClient.patch(`/orders/carts/${orderId}`, { status });
  return data;
};

export const updateApiOrderStatusRequest = async (orderId, status) => {
  const { data } = await apiClient.put(`/orders/${orderId}/status`, { status });
  return data;
};