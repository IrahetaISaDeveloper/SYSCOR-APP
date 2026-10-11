import { useCallback, useEffect, useRef, useState } from "react";
import { Vibration } from "react-native";
import { AppAlert } from "@syscor/shared/src/components/commons/AppAlert";
import { useLiveRefresh } from "@syscor/shared/src/realtime/RealtimeProvider";
import { EVENTS } from "@syscor/shared/src/realtime/events";
import {
  getActiveTableRequests,
  acknowledgeTableRequest,
  resolveTableRequest,
} from "../services/tableRequestsApi";

const apiMessage = (err, fallback) => err?.response?.data?.message || fallback;

// Solicitudes de las mesas para el mesero: llegan por tiempo real y vibra el
// teléfono cuando aparece una nueva. "Voy" la toma; "Atendida" la cierra.
export default function useTableRequests() {
  const [requests, setRequests] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const knownIdsRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const next = await getActiveTableRequests();
      // Vibra solo por las nuevas que esperan respuesta (no al abrir la app).
      const known = knownIdsRef.current;
      const fresh = known ? next.filter((r) => r.status !== "acknowledged" && !known.has(r._id)) : [];
      if (fresh.length > 0) Vibration.vibrate([0, 350, 150, 350]);
      knownIdsRef.current = new Set(next.map((r) => r._id));
      setRequests(next);
    } catch {
      // Se reintenta con el siguiente evento o la revisión periódica.
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useLiveRefresh([EVENTS.TABLE_REQUEST_CHANGED], load, { offlineMs: 10000, safetyMs: 60000, debounceMs: 150 });

  const run = useCallback(
    async (id, action, errorTitle) => {
      setBusyId(id);
      try {
        await action(id);
      } catch (err) {
        AppAlert.alert(err?.response?.data?.title || errorTitle, apiMessage(err, "Inténtalo de nuevo."));
      } finally {
        setBusyId(null);
        load();
      }
    },
    [load]
  );

  const acknowledge = useCallback((id) => run(id, acknowledgeTableRequest, "No se pudo tomar"), [run]);
  const resolve = useCallback((id) => run(id, resolveTableRequest, "No se pudo cerrar"), [run]);

  return { requests, busyId, acknowledge, resolve, reload: load };
}
