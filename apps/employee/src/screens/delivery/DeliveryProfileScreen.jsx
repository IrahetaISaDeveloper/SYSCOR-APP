import React from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@syscor/shared/src/context/AuthContext";
import useKitchenProfile from "../../hooks/useKitchenProfile";
import ProfileHeader from "@syscor/shared/src/components/commons/ProfileHeader";
import InfoSection from "@syscor/shared/src/components/commons/InfoSection";
import InfoRow from "@syscor/shared/src/components/commons/InfoRow";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { fonts } from "../../styles/fonts";

export default function DeliveryProfileScreen() {
  const { logout } = useAuth();
  const { user, fullName, typeLabel, statusLabel, refreshing, onRefresh } = useKitchenProfile();

  const personalInfo = user?.personalInfo || {};
  const workInfo = user?.workInfo || {};

  return (
    <SafeAreaView style={s.screen} edges={["top", "left", "right"]}>
      <View style={s.header}>
        <Text style={s.title}>Perfil</Text>
      </View>
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={employeePalette.accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          image={personalInfo.image}
          fullName={fullName}
          typeLabel={typeLabel}
          email={user?.email}
        />

        <InfoSection title="Información personal">
          <InfoRow label="Nombre completo" value={fullName} />
          <InfoRow label="Estado" value={statusLabel} />
          {personalInfo.phone ? <InfoRow label="Teléfono" value={personalInfo.phone} /> : null}
        </InfoSection>

        {workInfo.branch ? (
          <InfoSection title="Trabajo">
            <InfoRow label="Sucursal" value={workInfo.branch} />
            {workInfo.schedule ? <InfoRow label="Horario" value={workInfo.schedule} /> : null}
          </InfoSection>
        ) : null}

        <TouchableOpacity style={s.logoutButton} onPress={logout} activeOpacity={0.8}>
          <Text style={s.logoutLabel}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: employeePalette.bg },
  header: {
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  title: {
    fontFamily: fonts.sansBold,
    fontSize: 21,
    letterSpacing: -0.525,
    color: employeePalette.ink,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    gap: 16,
  },
  logoutButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: employeePalette.surface,
    borderWidth: 1,
    borderColor: employeePalette.line,
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
  },
  logoutLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: employeePalette.accent,
  },
});
