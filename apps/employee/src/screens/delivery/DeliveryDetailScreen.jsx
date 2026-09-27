import React, { Fragment } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import SymbolIcon from "../../components/commons/SymbolIcon";
import DeliveryTopBar from "../../components/delivery/DeliveryTopBar";
import RouteTimeline from "../../components/delivery/RouteTimeline";
import DeliveryFooter from "../../components/delivery/DeliveryFooter";
import CustomerContactCard from "../../components/delivery/CustomerContactCard";
import { PAYMENT_LABELS, formatMoney, formatKm } from "../../constants/deliveryStatus";
import { findMockDelivery } from "../../mocks/deliveryMock";
import commonStyles from "../../styles/deliveryCommonStyles";
import styles from "../../styles/deliveryDetailScreenStyles";

export default function DeliveryDetailScreen({ navigation, route }) {
  const delivery = findMockDelivery(route.params?.deliveryId);

  const handleReject = () => {
    Alert.alert("Rechazar entrega", `La entrega ${delivery.code} quedará disponible para otro repartidor.`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Rechazar", style: "destructive", onPress: () => navigation.goBack() },
    ]);
  };

  const handleAccept = () => navigation.replace("DeliveryRoute", { deliveryId: delivery.id });

  return (
    <SafeAreaView style={commonStyles.screen} edges={["top", "left", "right"]}>
      <DeliveryTopBar title={delivery.code} monoTitle subtitle="NUEVA ASIGNACIÓN" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <SymbolIcon name="two_wheeler" size={23} color="#FFFFFF" />
          </View>
          <View style={styles.summaryTexts}>
            <Text style={styles.summaryLabel}>DISTANCIA TOTAL</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>
              {formatKm(delivery.distanceKm)} · {delivery.etaMinutes} min estimados
            </Text>
          </View>
          <View style={styles.summaryAmountBox}>
            <Text style={styles.summaryAmount}>{formatMoney(delivery.total)}</Text>
            <Text style={styles.summaryPayment}>{PAYMENT_LABELS[delivery.paymentMethod]}</Text>
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
          {delivery.items.map((item, index) => (
            <Fragment key={item.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.itemRow}>
                <Text style={styles.itemQty}>{item.quantity}×</Text>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
            </Fragment>
          ))}
          {delivery.note ? (
            <View style={styles.noteBox}>
              <SymbolIcon name="info" size={15} color={employeePalette.warnInk} />
              <Text style={styles.noteText}>{delivery.note}</Text>
            </View>
          ) : null}
        </View>

        <CustomerContactCard customer={delivery.customer} />
      </ScrollView>

      <DeliveryFooter>
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject} activeOpacity={0.8}>
            <Text style={styles.rejectLabel}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[commonStyles.primaryButton, { flex: 1 }]} onPress={handleAccept} activeOpacity={0.85}>
            <SymbolIcon name="check" size={17} color="#FFFFFF" />
            <Text style={commonStyles.primaryButtonLabel}>Aceptar entrega</Text>
          </TouchableOpacity>
        </View>
      </DeliveryFooter>
    </SafeAreaView>
  );
}
