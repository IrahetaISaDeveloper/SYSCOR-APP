import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@syscor/shared/src/context/AuthContext";
import { getFirstName } from "@syscor/shared/src/utils/userDisplay";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import SymbolIcon from "../../components/commons/SymbolIcon";
import DeliveryStatTiles from "../../components/delivery/DeliveryStatTiles";
import ActiveDeliveryCard from "../../components/delivery/ActiveDeliveryCard";
import AvailableDeliveryRow from "../../components/delivery/AvailableDeliveryRow";
import { formatMoney, formatKm } from "../../constants/deliveryStatus";
import useDelivery from "../../hooks/useDelivery";
import commonStyles from "../../styles/deliveryCommonStyles";
import styles from "../../styles/deliveriesScreenStyles";

export default function DeliveriesScreen({ navigation }) {
  const { user } = useAuth();
  const firstName = getFirstName(user);
  const [onShift, setOnShift] = useState(true);

  const {
    activeDelivery,
    available,
    stats,
    loading,
    refreshing,
    onRefresh,
  } = useDelivery();

  return (
    <SafeAreaView style={commonStyles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.headerTexts}>
          <Text style={styles.eyebrow}>{firstName ? `HOLA, ${firstName.toUpperCase()} · REPARTO` : "REPARTO"}</Text>
          <Text style={styles.title}>Entregas</Text>
        </View>
        <TouchableOpacity
          style={[styles.shiftPill, !onShift && styles.shiftPillOff]}
          onPress={() => setOnShift((v) => !v)}
          activeOpacity={0.85}
        >
          <View style={[styles.shiftDot, !onShift && styles.shiftDotOff]} />
          <Text style={[styles.shiftText, !onShift && styles.shiftTextOff]}>{onShift ? "En turno" : "Fuera de turno"}</Text>
        </TouchableOpacity>
      </View>

      <DeliveryStatTiles
        tiles={[
          { label: "ENTREGADAS", value: String(stats.delivered) },
          { label: "POR COBRAR", value: formatMoney(stats.toCollect), color: employeePalette.price },
          { label: "RECORRIDO", value: formatKm(stats.distanceKm) },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={employeePalette.accent}
          />
        }
      >
        <Text style={commonStyles.sectionLabel}>MI ENTREGA ACTIVA</Text>
        {loading && !activeDelivery ? (
          <View style={[commonStyles.emptyBox, { paddingVertical: 20 }]}>
            <ActivityIndicator size="small" color={employeePalette.accent} />
          </View>
        ) : activeDelivery ? (
          <ActiveDeliveryCard
            delivery={activeDelivery}
            onContinue={() => navigation.navigate("DeliveryRoute", { deliveryId: activeDelivery.id })}
          />
        ) : (
          <View style={commonStyles.emptyBox}>
            <SymbolIcon name="two_wheeler" size={24} color={employeePalette.muted} />
            <Text style={commonStyles.emptyText}>No tienes una entrega en curso.</Text>
          </View>
        )}

        <Text style={[commonStyles.sectionLabel, { paddingTop: 2 }]}>DISPONIBLES CERCA</Text>
        {loading && available.length === 0 ? (
          <View style={[commonStyles.emptyBox, { paddingVertical: 20 }]}>
            <ActivityIndicator size="small" color={employeePalette.accent} />
          </View>
        ) : available.length > 0 ? (
          available.map((delivery) => (
            <AvailableDeliveryRow
              key={delivery.id}
              delivery={delivery}
              onPress={() => navigation.navigate("DeliveryDetail", { deliveryId: delivery.id })}
            />
          ))
        ) : (
          <View style={commonStyles.emptyBox}>
            <SymbolIcon name="location_on" size={24} color={employeePalette.muted} />
            <Text style={commonStyles.emptyText}>No hay entregas disponibles por ahora.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
