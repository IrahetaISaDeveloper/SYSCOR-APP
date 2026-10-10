import apiClient from '@syscor/shared/src/services/apiClient';

// Trae la versión más reciente del perfil (por si cambió algo, ej. un admin
// editó el estado o los permisos del empleado mientras había sesión activa)
export const refreshMyProfile = async () => {
  const { data } = await apiClient.get("/auth/me");
  return data;
};

// Comandas que tomó el mesero desde una fecha (para "Comandas hoy").
export const fetchMyOrdersSince = async (waiterId, from) => {
  const { data } = await apiClient.get("/orders", {
    params: { waiter: waiterId, orderType: "local", from: from.toISOString() },
  });
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
};

// El empleado solo puede cambiar sus datos de contacto y su foto; puesto,
// salario, estado y permisos los cambia un administrador (el backend lo
// valida en employeeController.updateEmployee).
export const updateMyContact = async (employeeId, { phone, address }) => {
  const { data } = await apiClient.patch(`/users/employees/${employeeId}`, { phone, address });
  return data;
};

// Foto de perfil: se manda como archivo (campo "image") y el backend la sube a
// Cloudinary y borra la anterior.
export const updateMyPhoto = async (employeeId, photo) => {
  const body = new FormData();
  body.append("image", {
    uri: photo.uri,
    name: photo.fileName || "perfil.jpg",
    type: photo.mimeType || "image/jpeg",
  });
  const { data } = await apiClient.patch(`/users/employees/${employeeId}`, body, {
    headers: { "Content-Type": "multipart/form-data" },
    // Subir una foto por datos móviles tarda más que una petición normal.
    timeout: 60000,
  });
  return data;
};

export const changeMyPassword = async ({ currentPassword, newPassword }) => {
  const { data } = await apiClient.patch("/auth/update-password", { currentPassword, newPassword });
  return data;
};
