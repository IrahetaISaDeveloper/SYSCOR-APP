import React from "react";
import EmployeeProfileView from "../../components/profile/EmployeeProfileView";
import useEmployeeProfile from "../../hooks/useEmployeeProfile";
import { getShiftText } from "../../utils/workSchedule";

// Perfil del mesero: con lo que lleva hoy (comandas y mesas que atiende).
export default function WaiterProfileScreen({ navigation }) {
  const profile = useEmployeeProfile({ withOrderStats: true });
  const { stats, user } = profile;

  return (
    <EmployeeProfileView
      profile={profile}
      onBack={() => navigation.navigate("Dashboard")}
      statTiles={[
        { value: stats.ordersToday, label: "Comandas hoy" },
        { value: stats.activeTables, label: "Mesas activas" },
        { value: getShiftText(user?.workInfo || {}), label: "Turno" },
      ]}
    />
  );
}
