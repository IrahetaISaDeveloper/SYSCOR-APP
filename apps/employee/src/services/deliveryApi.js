import apiClient from "@syscor/shared/src/services/apiClient";

const BASE = "/orders/delivery";

export const fetchAvailableDeliveries = async () => {
  const { data } = await apiClient.get(`${BASE}/available`);
  return Array.isArray(data) ? data : [];
};

export const fetchMyActiveDelivery = async () => {
  const { data } = await apiClient.get(`${BASE}/mine`);
  return data ?? null;
};

export const fetchDeliveryHistory = async () => {
  const { data } = await apiClient.get(`${BASE}/history`);
  return Array.isArray(data) ? data : [];
};

export const acceptDelivery = async (id) => {
  const { data } = await apiClient.patch(`${BASE}/${id}/accept`);
  return data;
};

export const rejectDelivery = async (id) => {
  const { data } = await apiClient.patch(`${BASE}/${id}/reject`);
  return data;
};

export const confirmDelivery = async (id, { deliveryMethod, driverNote } = {}) => {
  const { data } = await apiClient.patch(`${BASE}/${id}/confirm`, {
    deliveryMethod,
    driverNote: driverNote || undefined,
  });
  return data;
};
