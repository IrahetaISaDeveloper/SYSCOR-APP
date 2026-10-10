import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import SymbolIcon from "../../components/commons/SymbolIcon";
import DeliveryTopBar from "../../components/delivery/DeliveryTopBar";
import DeliveryFooter from "../../components/delivery/DeliveryFooter";
import NavigationCard from "../../components/delivery/NavigationCard";
import DeliveryProgress from "../../components/delivery/DeliveryProgress";
import { callPhone, sendSms } from "../../utils/deliveryContact";
import { formatKm, formatClock } from "../../constants/deliveryStatus";
import useDelivery from "../../hooks/useDelivery";
import useDeliveryRoute from "../../hooks/useDeliveryRoute";
import DeliveryMap from "../../components/delivery/DeliveryMap";
import commonStyles from "../../styles/deliveryCommonStyles";
import styles from "../../styles/deliveryRouteScreenStyles";

const PROBLEM_OPTIONS = [
  "El cliente no responde",
  "Dirección incorrecta",
  "Pedido dañado",
];

export default function DeliveryRouteScreen({ navigation, route }) {
  const { getDeliveryById } = useDelivery();
  const delivery = getDeliveryById(route.params?.deliveryId);
  const routeInfo = useDeliveryRoute(delivery);

  if (!delivery) {
    return (
      <SafeAreaView style={commonStyles.screen} edges={["top", "left", "right"]}>
        <DeliveryTopBar title="En ruta" onBack={() => navigation.goBack()} />
        <View style={[commonStyles.emptyBox, { marginTop: 40 }]}>
          <Text style={commonStyles.emptyText}>Entrega no encontrada.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const nav = routeInfo.navigation || {
    icon: "navigation",
    instruction: "Dirígete al destino",
    street: delivery.dropoff?.address,
    distance: formatKm(delivery.distanceKm),
  };
  const distanceKm = routeInfo.distanceKm ?? delivery.distanceKm;
  const etaMinutes = routeInfo.etaMinutes ?? delivery.etaMinutes;
  const arrivalClock = routeInfo.arrivalAt
    ? formatClock(routeInfo.arrivalAt)
    : delivery.etaMinutes
    ? formatClock(new Date(delivery.startedAt || Date.now()).getTime() + delivery.etaMinutes * 60000)
    : null;

  const handleProblem = () => {
    Alert.alert("Reportar un problema", "Se avisará a la sucursal.", [
      ...PROBLEM_OPTIONS.map((reason) => ({
        text: reason,
        onPress: () => Alert.alert("Reporte enviado", `"${reason}" se notificó a la sucursal.`),
      })),
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const handleOpenMap = () => {
    const { address, latitude, longitude } = delivery.dropoff || {};
    const hasCoords = latitude != null && longitude != null;
    if (!address && !hasCoords) return;
    const query = encodeURIComponent(hasCoords ? `${latitude},${longitude}` : address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    });
  };

  return (
    <SafeAreaView style={commonStyles.screen} edges={["top", "left", "right"]}>
      <DeliveryTopBar
        title={delivery.code}
        monoTitle
        subtitle="EN RUTA"
        subtitleColor={employeePalette.warnInk}
        onBack={() => navigation.goBack()}
        rightIcon="call"
        rightLabel="Llamar al cliente"
        onRightPress={() => callPhone(delivery.customer?.phone)}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleOpenMap}>
          <NavigationCard
            navigation={nav}
            arrivalClock={arrivalClock || "--:--"}
            distanceKm={distanceKm}
            etaMinutes={etaMinutes}
          />
        </TouchableOpacity>

        <DeliveryMap
          origin={routeInfo.origin}
          destination={routeInfo.destination}
          coordinates={routeInfo.route?.coordinates}
          loading={routeInfo.loading}
          error={routeInfo.error}
          onRetry={routeInfo.destination ? routeInfo.recalculate : null}
        />

        {routeInfo.permissionDenied ? (
          <Text style={styles.permissionNote}>
            Sin permiso de ubicación: la ruta se traza desde el local.
          </Text>
        ) : null}

        <DeliveryProgress stage="on_route" />

        <TouchableOpacity
          style={styles.destinationCard}
          activeOpacity={0.85}
          onPress={handleOpenMap}
        >
          <View style={styles.destinationHeader}>
            <SymbolIcon name="home_pin" size={16} color={employeePalette.accent} />
            <Text style={styles.destinationLabel}>DESTINO</Text>
          </View>
          <Text style={styles.destinationAddress}>{delivery.dropoff?.address || "Sin dirección"}</Text>
          {delivery.dropoff?.detail ? (
            <Text style={styles.destinationDetail}>{delivery.dropoff.detail}</Text>
          ) : null}
          <View style={styles.destinationContact}>
            <SymbolIcon name="person" size={15} color={employeePalette.muted} />
            <Text style={styles.destinationName} numberOfLines={1}>{delivery.customer?.name}</Text>
            {delivery.customer?.phone ? (
              <Text style={styles.destinationPhone}>{delivery.customer.phone}</Text>
            ) : null}
          </View>
        </TouchableOpacity>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => sendSms(delivery.customer?.phone)}
            activeOpacity={0.8}
          >
            <SymbolIcon name="chat" size={16} color={employeePalette.muted} />
            <Text style={[styles.actionLabel, { color: employeePalette.muted }]}>Mensaje</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleProblem}
            activeOpacity={0.8}
          >
            <SymbolIcon name="report" size={16} color={employeePalette.warnInk} />
            <Text style={[styles.actionLabel, { color: employeePalette.warnInk }]}>Problema</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DeliveryFooter>
        <TouchableOpacity
          style={commonStyles.primaryButton}
          onPress={() => navigation.navigate("DeliveryConfirm", { deliveryId: delivery.id })}
          activeOpacity={0.85}
        >
          <SymbolIcon name="where_to_vote" size={17} color="#FFFFFF" />
          <Text style={commonStyles.primaryButtonLabel}>Llegué al destino</Text>
        </TouchableOpacity>
      </DeliveryFooter>
    </SafeAreaView>
  );
}
