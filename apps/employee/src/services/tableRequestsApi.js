import apiClient from "@syscor/shared/src/services/apiClient";

// Solicitudes de la página de la mesa (el cliente escanea el QR y pide la
// cuenta o llama a su mesero). Ver /table-service en el backend.

// Las que le tocan a este mesero: sus mesas, las que ya son de todos y las que tomó.
export const getActiveTableRequests = async () => {
  const { data } = await apiClient.get("/table-service/requests/active");
  return data?.requests || [];
};

// "Voy": se la queda el primero que la toma.
export const acknowledgeTableRequest = async (id) => {
  const { data } = await apiClient.patch(`/table-service/requests/${id}/acknowledge`);
  return data?.request || null;
};

// "Atendida".
export const resolveTableRequest = async (id) => {
  const { data } = await apiClient.patch(`/table-service/requests/${id}/resolve`);
  return data?.request || null;
};
