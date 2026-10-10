import apiClient from "@syscor/shared/src/services/apiClient";

const BASE = "/orders/delivery";

export const fetchDeliveryQueue = async () => {
  const { data } = await apiClient.get(`${BASE}/queue`);
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

export const startDelivery = async (id) => {
  const { data } = await apiClient.patch(`${BASE}/${id}/start`);
  return data;
};

export const confirmDelivery = async (id, { deliveryMethod, driverNote, proof } = {}) => {
  if (!proof) {
    const { data } = await apiClient.patch(`${BASE}/${id}/confirm`, {
      deliveryMethod,
      driverNote: driverNote || undefined,
    });
    return data;
  }

  const body = new FormData();
  if (deliveryMethod) body.append("deliveryMethod", deliveryMethod);
  if (driverNote) body.append("driverNote", driverNote);
  body.append("proof", {
    uri: proof.uri,
    name: proof.fileName || "entrega.jpg",
    type: proof.mimeType || "image/jpeg",
  });
  const { data } = await apiClient.patch(`${BASE}/${id}/confirm`, body, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
  return data;
};
