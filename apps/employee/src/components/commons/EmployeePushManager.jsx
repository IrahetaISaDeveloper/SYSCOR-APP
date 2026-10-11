import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { registerForPush } from "../../services/pushApi";
import { useEmployeeNotifications } from "../../hooks/useEmployeeNotifications";

// Registra el teléfono del empleado para los avisos push y, al tocar uno, lo
// marca como leído en su bandeja y llama a `onOpen(data, navigation)` para que
// cada rol abra lo que le corresponde. Se monta dentro del navegador de cada
// rol (necesita la navegación). No dibuja nada.
export default function EmployeePushManager({ onOpen }) {
  const navigation = useNavigation();
  const { markRead } = useEmployeeNotifications();
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  // El último aviso tocado sigue disponible al volver a montar: se abre una vez.
  const handledRef = useRef(null);

  useEffect(() => {
    registerForPush();
  }, []);

  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    const request = response?.notification?.request;
    const data = request?.content?.data;
    if (!data || handledRef.current === request.identifier) return;
    handledRef.current = request.identifier;
    if (data.notificationId) markRead(data.notificationId);
    onOpenRef.current?.(data, navigation);
  }, [response, navigation, markRead]);

  return null;
}
