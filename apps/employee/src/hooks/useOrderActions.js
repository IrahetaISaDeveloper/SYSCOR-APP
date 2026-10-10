import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { claimOrder, fireOrder, updateOrderStatus } from "../services/waiterDashboardApi";

const errorOf = (err, fallback) => ({
  title: err?.response?.data?.title || "No se pudo completar",
  message: err?.response?.data?.message || fallback,
});

// Acciones del mesero sobre una comanda, las mismas en Comandas y en la hoja
// de cada mesa:
//   serve  → marcarla servida (cualquier mesero, no solo el que la tomó)
//   claim  → "Yo la llevo" / soltarla (aviso para los demás, no candado)
//   fire   → "Marchar": cocina ya puede preparar el 2º tiempo en espera
//   cancel → cancelar un 2º tiempo en espera (el cliente ya no lo quiere)
// `onDone` recarga la pantalla que la usa.
export default function useOrderActions(onDone) {
  const [busyId, setBusyId] = useState(null);

  const run = useCallback(
    async (orderId, action, fallback) => {
      setBusyId(orderId);
      try {
        await action();
        await onDone?.();
      } catch (err) {
        console.error("useOrderActions:", err);
        const { title, message } = errorOf(err, fallback);
        Alert.alert(title, message);
        await onDone?.();
      } finally {
        setBusyId(null);
      }
    },
    [onDone]
  );

  const serve = useCallback(
    (order) => run(order._id, () => updateOrderStatus(order._id, "delivered"), "No se pudo marcar como servida."),
    [run]
  );

  const claim = useCallback(
    (order, take = true) => run(order._id, () => claimOrder(order._id, take), "No se pudo avisar que la llevas."),
    [run]
  );

  const fire = useCallback(
    (order) => run(order._id, () => fireOrder(order._id), "No se pudo marchar la comanda."),
    [run]
  );

  const cancel = useCallback(
    (order) =>
      Alert.alert("Cancelar este tiempo", "La comanda en espera se cancela y no se cobra.", [
        { text: "No", style: "cancel" },
        {
          text: "Cancelar comanda",
          style: "destructive",
          onPress: () => run(order._id, () => updateOrderStatus(order._id, "cancelled"), "No se pudo cancelar."),
        },
      ]),
    [run]
  );

  return { busyId, serve, claim, fire, cancel };
}
