import apiClient from "@syscor/shared/src/services/apiClient";

// Bandeja personal del empleado (/notifications/mine): paquete asignado,
// comanda lista... Cada respuesta trae el total de no leídas.

// `before`: createdAt de la última que ya se tiene, para la página siguiente.
export const getMyNotifications = async ({ before } = {}) => {
  const { data } = await apiClient.get("/notifications/mine", { params: before ? { before } : undefined });
  return {
    notifications: data?.notifications || [],
    hasMore: !!data?.hasMore,
    unreadCount: data?.unreadCount || 0,
  };
};

export const markNotificationRead = async (id) => {
  const { data } = await apiClient.patch(`/notifications/mine/${id}/read`);
  return data?.unreadCount ?? null;
};

export const markAllNotificationsRead = async () => {
  await apiClient.patch("/notifications/mine/read-all");
};
