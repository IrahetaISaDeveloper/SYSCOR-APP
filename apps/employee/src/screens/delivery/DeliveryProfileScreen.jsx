import React from "react";
import EmployeeProfileView from "../../components/profile/EmployeeProfileView";
import useEmployeeProfile from "../../hooks/useEmployeeProfile";
import useDelivery from "../../hooks/useDelivery";
import { getShiftText } from "../../utils/workSchedule";

// Perfil del repartidor: con las entregas y los kilómetros de hoy.
export default function DeliveryProfileScreen({ navigation }) {
  const profile = useEmployeeProfile();
  const { stats } = useDelivery();

  return (
    <EmployeeProfileView
      profile={profile}
      onBack={() => navigation.navigate("Deliveries")}
      statTiles={[
        { value: stats.delivered, label: "Entregas hoy" },
        { value: `${stats.distanceKm} km`, label: "Recorrido" },
        { value: getShiftText(profile.user?.workInfo || {}), label: "Turno" },
      ]}
    />
  );
}
