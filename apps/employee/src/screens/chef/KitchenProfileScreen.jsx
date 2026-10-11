import React from "react";
import EmployeeProfileView from "../../components/profile/EmployeeProfileView";
import useEmployeeProfile from "../../hooks/useEmployeeProfile";
import useKitchenHistory from "../../hooks/useKitchenHistory";
import { getShiftText } from "../../utils/workSchedule";

// Perfil de cocina: con los pedidos que terminó hoy y su tiempo promedio.
export default function KitchenProfileScreen({ navigation }) {
  const profile = useEmployeeProfile();
  const { stats } = useKitchenHistory();

  return (
    <EmployeeProfileView
      profile={profile}
      onBack={() => navigation.navigate("Dashboard")}
      statTiles={[
        { value: stats.total, label: "Pedidos hoy" },
        { value: stats.averagePrep != null ? `${stats.averagePrep} min` : null, label: "Prep. promedio" },
        { value: getShiftText(profile.user?.workInfo || {}), label: "Turno" },
      ]}
    />
  );
}
