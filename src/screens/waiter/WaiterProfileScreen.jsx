import React from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, SafeAreaView } from "react-native";
import { useAuth } from "../../context/AuthContext";
import useWaiterProfile from "../../hooks/useWaiterProfile";
import ProfileHeader from "../../components/commons/ProfileHeader";
import InfoSection from "../../components/commons/InfoSection";
import InfoRow from "../../components/commons/InfoRow";
import waiterProfileScreenStyles from "../../styles/waiterProfileScreenStyles";

export default function WaiterProfileScreen({ navigation  }) {
  const { logout } = useAuth();
  const { user, fullName, typeLabel, statusLabel, refreshing, onRefresh } = useWaiterProfile();

  const personalInfo = user?.personalInfo || {};
  const workInfo = user?.workInfo || {};

  return (
    <SafeAreaView style={waiterProfileScreenStyles.container}>
      <View style={waiterProfileScreenStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
      <Text style={waiterProfileScreenStyles.backText}>‹ Volver</Text>
    </TouchableOpacity>
        <Text style={waiterProfileScreenStyles.title}>Mi perfil</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={waiterProfileScreenStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E74C3C" />}
      >
        <ProfileHeader
          image={personalInfo.image}
          fullName={fullName}
          typeLabel={typeLabel}
          email={user?.email}
        />

        <InfoSection title="Información personal">
          <InfoRow label="Nombre completo" value={fullName} />
          <InfoRow label="Correo" value={user?.email} />
          <InfoRow label="Teléfono" value={personalInfo.phone} />
          <InfoRow label="DUI / NIT" value={personalInfo.duiNit} />
          <InfoRow label="Dirección" value={personalInfo.address} />
        </InfoSection>

        <InfoSection title="Información laboral">
          <InfoRow label="Puesto" value={typeLabel} />
          <InfoRow label="Estado" value={statusLabel} />
          <InfoRow label="Turno" value={workInfo.shift} />
          <InfoRow label="Horario" value={workInfo.schedule} />
          <InfoRow label="Seguro médico" value={workInfo.workInsurance ? "Sí" : "No"} />
        </InfoSection>

        <InfoSection title="Información salarial">
          <InfoRow label="Salario base" value={workInfo.salary != null ? `$${Number(workInfo.salary).toFixed(2)}` : "—"} />
          <InfoRow label="AFP" value={workInfo.AFP != null ? `$${Number(workInfo.AFP).toFixed(2)}` : "—"} />
          <InfoRow label="Renta" value={workInfo.rent != null ? `$${Number(workInfo.rent).toFixed(2)}` : "—"} />
          <InfoRow label="Pago adicional" value={workInfo.additionalPay != null ? `$${Number(workInfo.additionalPay).toFixed(2)}` : "—"} />
        </InfoSection>

        {user?.permissions?.length > 0 && (
          <InfoSection title="Permisos">
            {user.permissions.map((perm) => (
              <InfoRow key={perm} label={perm} value="Habilitado" />
            ))}
          </InfoSection>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}