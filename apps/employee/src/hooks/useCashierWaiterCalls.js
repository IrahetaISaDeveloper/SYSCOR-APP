import { useCallback, useEffect, useState } from "react";
import { AppAlert } from "@syscor/shared/src/components/commons/AppAlert";
import { useLiveRefresh } from "@syscor/shared/src/realtime/RealtimeProvider";
import { EVENTS } from "@syscor/shared/src/realtime/events";
import apiClient from "@syscor/shared/src/services/apiClient";

export default function useCashierWaiterCalls() {
  const [calls, setCalls] = useState([]);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/cashier/waiter-calls/active");
      const next = data?.calls || [];
      setCalls(next);
    } catch (error) {
      console.error("useCashierWaiterCalls.load:", error);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useLiveRefresh([EVENTS.CASHIER_WAITER_CALL_CHANGED], load, {
    offlineMs: 10000,
    safetyMs: 60000,
    debounceMs: 150,
  });

  const acknowledge = useCallback(async (id) => {
    setBusyId(id);
    try {
      await apiClient.patch(`/cashier/waiter-calls/${id}/acknowledge`);
      await load();
    } catch (error) {
      AppAlert.alert(
        error?.response?.data?.title || "Llamado no disponible",
        error?.response?.data?.message || "No se pudo aceptar el llamado. Inténtalo de nuevo.",
      );
      await load();
    } finally {
      setBusyId(null);
    }
  }, [load]);

  return { calls, busyId, acknowledge };
}
