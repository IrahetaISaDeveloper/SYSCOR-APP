import apiClient from "./apiClient";

// Trae la versión más reciente del perfil (por si cambió algo, ej. un admin
// editó el salario o el estado del empleado mientras había sesión activa)
export const refreshMyProfile = async () => {
  const { data } = await apiClient.get("/auth/me");
  return data;
};