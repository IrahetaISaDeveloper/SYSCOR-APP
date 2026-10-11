import React, { Fragment, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SymbolIcon from "../../components/commons/SymbolIcon";
import DeliveryTopBar from "../../components/delivery/DeliveryTopBar";
import RouteTimeline from "../../components/delivery/RouteTimeline";
import DeliveryFooter from "../../components/delivery/DeliveryFooter";
import CustomerContactCard from "../../components/delivery/CustomerContactCard";
import {
  collectsOnDelivery,
  formatKm,
  formatMinutes,
  formatMoney,
  paymentLabel,
} from "../../constants/deliveryStatus";
import useDelivery from "../../hooks/useDelivery";
import useDeliveryCommonStyles from "../../styles/deliveryCommonStyles";
import useDeliveryDetailScreenStyles from "../../styles/deliveryDetailScreenStyles";
import { useTheme } from "../../theme/ThemeContext";

export default function DeliveryDetailScreen({ navigation, route }) {
  const { p } = useTheme();
  const commonStyles = useDeliveryCommonStyles();
  const styles = useDeliveryDetailScreenStyles();
  const { getDeliveryById, start, startRoute, pkg } = useDelivery();
  const delivery = getDeliveryById(route.params?.deliveryId);
  const [submitting, setSubmitting] = useState(false);
  // ¿Es una parada de mi paquete, o un pedido de la cola?
  const inMyPackage = Boolean(delivery && pkg?.stops?.some((stop) => String(stop.id) === String(delivery.id)));

  if (!delivery) {
    return (
      <SafeAreaView style={commonStyles.screen} edges={["top", "left", "right"]}>
        <DeliveryTopBar title="Entrega" onBack={() => navigation.goBack()} />
        <View style={[commonStyles.emptyBox, { marginTop: 40 }]}>
          <Text style={commonStyles.emptyText}>Este pedido ya no está en la cola.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const collects = collectsOnDelivery(delivery);

  // Mi paquete todavía en el local: se sale con todas las paradas. Pedido de
  // la cola sin paquete propio: se toma a mano (respaldo).
  const handleStart = async () => {
    try {
      setSubmitting(true);
      const updated = inMyPackage ? await startRoute() : await start(delivery.id);
      navigation.replace("DeliveryRoute", { deliveryId: updated?.currentStopId || delivery.id });
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const action = (() => {
    if (delivery.status === "delivered") return null;
    if (inMyPackage && pkg.status === "assigned") return { label: "Salir a ruta con el paquete", onPress: handleStart };
    if (inMyPackage) return { label: "Ir a esta parada", onPress: () => navigation.replace("DeliveryRoute", { deliveryId: delivery.id }) };
    if (!pkg) return { label: "Tomar este pedido", onPress: handleStart };
    return null;
  })();

  const subtitle = inMyPackage
    ? `PARADA ${delivery.sequence || 1} DE ${pkg.stops.length} · ${pkg.code}`
    : "ESPERANDO REPARTIDOR";

  return (
    <SafeAreaView style={commonStyles.screen} edges={["top", "left", "right"]}>
      <DeliveryTopBar title={delivery.code} monoTitle subtitle={subtitle} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <SymbolIcon name="two_wheeler" size={23} color="#FFFFFF" />
          </View>
          <View style={styles.summaryTexts}>
            <Text style={styles.summaryLabel}>DISTANCIA TOTAL</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>
              {formatKm(delivery.distanceKm)} · {formatMinutes(delivery.etaMinutes)} estimados
            </Text>
          </View>
          <View style={styles.summaryAmountBox}>
            <Text style={[styles.summaryAmount, !collects && styles.summaryAmountPaid]}>
              {formatMoney(collects ? delivery.amountToCollect : delivery.total)}
            </Text>
            <Text style={styles.summaryPayment}>{paymentLabel(delivery)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <RouteTimeline
            pickup={delivery.pickup}
            dropoff={delivery.dropoff}
            pickupLabel="RECOGER EN"
            dropoffLabel="ENTREGAR A"
          />
        </View>

        <View style={[styles.card, styles.itemsCard]}>
          <Text style={styles.cardLabel}>QUÉ LLEVAS</Text>
          {(delivery.items || []).map((item, index) => (
            <Fragment key={item.id || String(index)}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.itemRow}>
                <Text style={styles.itemQty}>{item.quantity}×</Text>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
            </Fragment>
          ))}
          {delivery.note ? (
            <View style={styles.noteBox}>
              <SymbolIcon name="info" size={15} color={p.warnInk} />
              <Text style={styles.noteText}>{delivery.note}</Text>
            </View>
          ) : null}
        </View>

        {delivery.customer ? <CustomerContactCard customer={delivery.customer} /> : null}
      </ScrollView>

      <DeliveryFooter>
        {action ? (
          <TouchableOpacity
            style={[commonStyles.primaryButton, submitting && { opacity: 0.7 }]}
            onPress={action.onPress}
            activeOpacity={0.85}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <SymbolIcon name="navigation" size={17} color="#FFFFFF" />
                <Text style={commonStyles.primaryButtonLabel}>{action.label}</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <Text style={[commonStyles.emptyText, { textAlign: "center" }]}>
            {delivery.status === "delivered"
              ? "Esta entrega ya se completó."
              : "Termina tu paquete; Chef Panchita le asignará este pedido a un repartidor libre."}
          </Text>
        )}
      </DeliveryFooter>
    </SafeAreaView>
  );
}
