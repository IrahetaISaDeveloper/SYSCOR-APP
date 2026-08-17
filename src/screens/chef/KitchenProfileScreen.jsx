import React from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, SafeAreaView } from "react-native";
import { useAuth } from "../../context/AuthContext";
import useKitchenProfile from "../../hooks/useKitchenProfile";
import ProfileHeader from "../../components/commons/ProfileHeader";
import InfoSection from "../../components/commons/InfoSection";
import InfoRow from "../../components/commons/InfoRow";
import kitchenProfileScreenStyles from "../../styles/kitchenProfileScreenStyles";

export default function KitchenProfileScreen({ navigation }) {
  const { logout } = useAuth();
  const { user, fullName, typeLabel, statusLabel, refreshing, onRefresh } = useKitchenProfile();

  const personalInfo = user?.personalInfo || {};
  const workInfo = user?.workInfo || {};

  return (
    <SafeAreaView style={kitchenProfileScreenStyles.container}>
      <View style={kitchenProfileScreenStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={kitchenProfileScreenStyles.backText}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={kitchenProfileScreenStyles.title}>Mi perfil</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView
        contentContainerStyle={kitchenProfileScreenStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3498DB" />}
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

        <TouchableOpacity onPress={logout} style={kitchenProfileScreenStyles.logoutButton}>
          <Text style={kitchenProfileScreenStyles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}