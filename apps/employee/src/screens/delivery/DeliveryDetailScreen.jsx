import React, { Fragment, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
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
import commonStyles from "../../styles/deliveryCommonStyles";
import styles from "../../styles/deliveryDetailScreenStyles";

export default function DeliveryDetailScreen({ navigation, route }) {
  const { getDeliveryById, start } = useDelivery();
  const delivery = getDeliveryById(route.params?.deliveryId);
  const [submitting, setSubmitting] = useState(false);

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

  const handleStart = async () => {
    try {
      setSubmitting(true);
      await start(delivery.id);
      navigation.replace("DeliveryRoute", { deliveryId: delivery.id });
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={commonStyles.screen} edges={["top", "left", "right"]}>
      <DeliveryTopBar title={delivery.code} monoTitle subtitle="LISTO PARA ENTREGAR" onBack={() => navigation.goBack()} />

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
              <SymbolIcon name="info" size={15} color={employeePalette.warnInk} />
              <Text style={styles.noteText}>{delivery.note}</Text>
            </View>
          ) : null}
        </View>

        {delivery.customer ? <CustomerContactCard customer={delivery.customer} /> : null}
      </ScrollView>

      <DeliveryFooter>
        <TouchableOpacity
          style={[commonStyles.primaryButton, submitting && { opacity: 0.7 }]}
          onPress={handleStart}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <SymbolIcon name="navigation" size={17} color="#FFFFFF" />
              <Text style={commonStyles.primaryButtonLabel}>Iniciar entrega</Text>
            </>
          )}
        </TouchableOpacity>
      </DeliveryFooter>
    </SafeAreaView>
  );
}
