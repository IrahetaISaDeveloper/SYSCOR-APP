import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { useAuth } from "../context/AuthContext";
import { refreshMyProfile } from "../services/waiterProfileApi";

export const EMPLOYEE_TYPE_LABELS = {
  kitchen: "Cocinero",
  waiter: "Mesero",
  cashier: "Cajero",
  manager: "Gerente",
  cleaner: "Personal de limpieza",
  other: "Otro",
};

export const EMPLOYEE_STATUS_LABELS = {
  active: "Activo",
  inactive: "Inactivo",
  suspended: "Suspendido",
  on_leave: "De permiso",
};

export default function useWaiterProfile() {
  const { user, updateUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const freshData = await refreshMyProfile();
      updateUser(freshData);
    } catch (err) {
      console.error("useWaiterProfile.onRefresh:", err);
      Alert.alert("Error", "No se pudo actualizar tu perfil.");
    } finally {
      setRefreshing(false);
    }
  }, [updateUser]);

  const fullName = `${user?.personalInfo?.name || ""} ${user?.personalInfo?.lastname || ""}`.trim();
  const typeLabel = EMPLOYEE_TYPE_LABELS[user?.personalInfo?.type] || user?.personalInfo?.type || "—";
  const statusLabel = EMPLOYEE_STATUS_LABELS[user?.workInfo?.status] || user?.workInfo?.status || "—";

  return {
    user,
    fullName,
    typeLabel,
    statusLabel,
    refreshing,
    onRefresh,
  };
}