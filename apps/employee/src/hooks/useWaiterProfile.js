import { useState, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from '@syscor/shared/src/context/AuthContext';
import {
  refreshMyProfile,
  fetchMyOrdersSince,
  updateMyContact,
  updateMyPhoto,
  changeMyPassword,
} from "../services/waiterProfileApi";
import { groupPermissions } from "../constants/permissions";

export const EMPLOYEE_TYPE_LABELS = {
  kitchen: "Cocinero",
  waiter: "Mesero",
  delivery: "Repartidor",
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

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const errorOf = (err, fallback) => ({
  title: err?.response?.data?.title || "No se pudo guardar",
  message: err?.response?.data?.message || fallback,
});

// Perfil del mesero: sus datos (de /auth/me), lo que lleva hoy y lo único
// que puede cambiar por su cuenta (teléfono, dirección y contraseña).
export default function useWaiterProfile() {
  const { user, updateUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [todayOrders, setTodayOrders] = useState(null);
  const [saving, setSaving] = useState(false);

  const myId = user?.id || user?._id;

  // Comandas que tomó hoy (sin las canceladas).
  const loadStats = useCallback(async () => {
    if (!myId) return;
    try {
      const orders = await fetchMyOrdersSince(myId, startOfToday());
      setTodayOrders(orders.filter((o) => o.status !== "cancelled"));
    } catch (err) {
      console.error("useWaiterProfile.loadStats:", err);
    }
  }, [myId]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const [freshData] = await Promise.all([refreshMyProfile(), loadStats()]);
      updateUser(freshData);
    } catch (err) {
      console.error("useWaiterProfile.onRefresh:", err);
      Alert.alert("Error", "No se pudo actualizar tu perfil.");
    } finally {
      setRefreshing(false);
    }
  }, [updateUser, loadStats]);

  const stats = useMemo(() => {
    if (!todayOrders) return { ordersToday: null, activeTables: null };
    // Mesas que atiende ahora: las de sus comandas que siguen sin cobrarse.
    const activeTables = new Set(
      todayOrders
        .filter((o) => o.paymentStatus !== "paid" && o.table)
        .map((o) => String(o.table?._id || o.table))
    );
    return { ordersToday: todayOrders.length, activeTables: activeTables.size };
  }, [todayOrders]);

  const saveContact = useCallback(
    async ({ phone, address }) => {
      setSaving(true);
      try {
        await updateMyContact(myId, { phone, address });
        updateUser(await refreshMyProfile());
        return true;
      } catch (err) {
        const { title, message } = errorOf(err, "Revisa los datos e inténtalo de nuevo.");
        Alert.alert(title, message);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [myId, updateUser]
  );

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // `photo` es el resultado de expo-image-picker (uri, fileName, mimeType).
  const savePhoto = useCallback(
    async (photo) => {
      setUploadingPhoto(true);
      try {
        await updateMyPhoto(myId, photo);
        updateUser(await refreshMyProfile());
        return true;
      } catch (err) {
        const { title, message } = errorOf(err, "No se pudo subir la foto. Intenta con otra o revisa tu conexión.");
        Alert.alert(title, message);
        return false;
      } finally {
        setUploadingPhoto(false);
      }
    },
    [myId, updateUser]
  );

  const savePassword = useCallback(async ({ currentPassword, newPassword }) => {
    setSaving(true);
    try {
      await changeMyPassword({ currentPassword, newPassword });
      return true;
    } catch (err) {
      const { title, message } = errorOf(err, "No se pudo cambiar la contraseña.");
      Alert.alert(title, message);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const personalInfo = user?.personalInfo || {};
  const fullName = `${personalInfo.name || user?.name || ""} ${personalInfo.lastname || user?.lastname || ""}`.trim();
  const type = personalInfo.type || user?.type;
  const typeLabel = EMPLOYEE_TYPE_LABELS[type] || type || "—";
  const status = user?.workInfo?.status;
  const statusLabel = EMPLOYEE_STATUS_LABELS[status] || status || "—";
  const permissions = useMemo(() => groupPermissions(user?.permissions), [user?.permissions]);

  return {
    user,
    fullName,
    typeLabel,
    status,
    statusLabel,
    permissions,
    stats,
    refreshing,
    onRefresh,
    saving,
    saveContact,
    savePassword,
    uploadingPhoto,
    savePhoto,
  };
}
