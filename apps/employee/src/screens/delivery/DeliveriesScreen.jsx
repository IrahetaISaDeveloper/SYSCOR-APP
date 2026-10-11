import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@syscor/shared/src/context/AuthContext";
import { getFirstName } from "@syscor/shared/src/utils/userDisplay";
import SymbolIcon from "../../components/commons/SymbolIcon";
import DeliveryStatTiles from "../../components/delivery/DeliveryStatTiles";
import PackageCard from "../../components/delivery/PackageCard";
import PendingDeliveryRow from "../../components/delivery/PendingDeliveryRow";
import { formatKm, formatMoney } from "../../constants/deliveryStatus";
import useDelivery from "../../hooks/useDelivery";
import useDeliveryCommonStyles from "../../styles/deliveryCommonStyles";
import useDeliveriesScreenStyles from "../../styles/deliveriesScreenStyles";
import { useTheme } from "../../theme/ThemeContext";

export default function DeliveriesScreen({ navigation }) {
  const { p } = useTheme();
  const commonStyles = useDeliveryCommonStyles();
  const styles = useDeliveriesScreenStyles();
  const { user } = useAuth();
  const firstName = getFirstName(user);
  const [starting, setStarting] = useState(false);

  const {
    pkg,
    activeDelivery,
    queue,
    stats,
    onShift,
    shiftSaving,
    loading,
    refreshing,
    error,
    onRefresh,
    startRoute,
    toggleShift,
  } = useDelivery();

  const handleStart = async () => {
    try {
      setStarting(true);
      const updated = await startRoute();
      if (updated?.currentStopId) navigation.navigate("DeliveryRoute", { deliveryId: updated.currentStopId });
    } catch {
    } finally {
      setStarting(false);
    }
  };

  const emptyPackageText = onShift
    ? "Sin paquete por ahora. Chef Panchita te asigna uno en cuanto haya pedidos listos."
    : "Estás fuera de turno: enciende “En turno” para que Panchita te asigne entregas.";

  return (
    <SafeAreaView style={commonStyles.screen} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.headerTexts}>
          <Text style={styles.eyebrow}>{firstName ? `HOLA, ${firstName.toUpperCase()} · REPARTO` : "REPARTO"}</Text>
          <Text style={styles.title}>Entregas</Text>
        </View>
        <TouchableOpacity
          style={[styles.shiftPill, !onShift && styles.shiftPillOff, shiftSaving && { opacity: 0.6 }]}
          onPress={toggleShift}
          activeOpacity={0.85}
          disabled={shiftSaving}
        >
          <View style={[styles.shiftDot, !onShift && styles.shiftDotOff]} />
          <Text style={[styles.shiftText, !onShift && styles.shiftTextOff]}>{onShift ? "En turno" : "Fuera de turno"}</Text>
        </TouchableOpacity>
      </View>

      <DeliveryStatTiles
        tiles={[
          { label: "ENTREGADAS", value: String(stats.delivered) },
          { label: "EFECTIVO", value: formatMoney(stats.cashCollected), color: p.price },
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
            tintColor={p.accent}
          />
        }
      >
        <Text style={commonStyles.sectionLabel}>MI PAQUETE</Text>
        {loading && !pkg ? (
          <View style={[commonStyles.emptyBox, { paddingVertical: 20 }]}>
            <ActivityIndicator size="small" color={p.accent} />
          </View>
        ) : pkg ? (
          <PackageCard
            pkg={pkg}
            starting={starting}
            onStart={handleStart}
            onContinue={() => activeDelivery && navigation.navigate("DeliveryRoute", { deliveryId: activeDelivery.id })}
            onOpenStop={(stop) =>
              navigation.navigate(pkg.status === "on_route" && stop.status === "on_route" ? "DeliveryRoute" : "DeliveryDetail", {
                deliveryId: stop.id,
              })
            }
          />
        ) : (
          <View style={commonStyles.emptyBox}>
            <SymbolIcon name="two_wheeler" size={24} color={p.muted} />
            <Text style={commonStyles.emptyText}>{emptyPackageText}</Text>
          </View>
        )}

        <Text style={[commonStyles.sectionLabel, { paddingTop: 2 }]}>ESPERANDO REPARTIDOR</Text>
        {queue.length > 0 ? (
          <Text style={styles.queueHint}>
            Panchita los asigna sola al repartidor libre. Si no tienes paquete, puedes tomar uno.
          </Text>
        ) : null}
        {loading && queue.length === 0 ? (
          <View style={[commonStyles.emptyBox, { paddingVertical: 20 }]}>
            <ActivityIndicator size="small" color={p.accent} />
          </View>
        ) : queue.length > 0 ? (
          queue.map((delivery) => (
            <PendingDeliveryRow
              key={delivery.id}
              delivery={delivery}
              onPress={() => navigation.navigate("DeliveryDetail", { deliveryId: delivery.id })}
            />
          ))
        ) : (
          <View style={commonStyles.emptyBox}>
            <SymbolIcon name={error ? "error" : "location_on"} size={24} color={p.muted} />
            <Text style={commonStyles.emptyText}>{error || "No hay pedidos esperando repartidor."}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
