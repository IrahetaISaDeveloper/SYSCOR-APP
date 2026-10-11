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

// Paquete que Chef Panchita le asignó al repartidor (null si no tiene)
export const fetchMyPackage = async () => {
  const { data } = await apiClient.get(`${BASE}/package`);
  return data ?? null;
};

// Salir del local con el paquete asignado
export const startPackage = async () => {
  const { data } = await apiClient.patch(`${BASE}/package/start`);
  return data;
};

// Interruptor "En turno": solo a quien está en turno le asigna paquetes Panchita
export const fetchAvailability = async () => {
  const { data } = await apiClient.get(`${BASE}/availability`);
  return Boolean(data?.onShift);
};

export const updateAvailability = async (onShift) => {
  const { data } = await apiClient.patch(`${BASE}/availability`, { onShift });
  return data;
};
