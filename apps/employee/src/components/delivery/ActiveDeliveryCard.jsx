import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import RouteTimeline from "./RouteTimeline";
import {
  DELIVERY_BADGE,
  collectsOnDelivery,
  formatKm,
  formatMinutes,
  formatMoney,
  paymentLabel,
  platillosLabel,
} from "../../constants/deliveryStatus";
import styles from "../../styles/deliveriesScreenStyles";

export default function ActiveDeliveryCard({ delivery, onContinue }) {
  const badge = DELIVERY_BADGE[delivery.status] || DELIVERY_BADGE.on_route;
  const collects = collectsOnDelivery(delivery);

  return (
    <View style={styles.activeCard}>
      <View style={styles.activeTop}>
        <View style={styles.activeTopLeft}>
          <View style={styles.codeRow}>
            <Text style={styles.code}>{delivery.code}</Text>
            <View style={[styles.badge, { backgroundColor: badge.color }]}>
              <Text style={styles.badgeText}>{badge.label}</Text>
            </View>
          </View>
          <Text style={styles.activeSubtitle} numberOfLines={1}>
            {delivery.customer?.name} · {platillosLabel(delivery.items)}
          </Text>
        </View>
        <View style={styles.amountBox}>
          <Text style={[styles.amount, !collects && styles.amountPaid]}>
            {formatMoney(collects ? delivery.amountToCollect : delivery.total)}
          </Text>
          <Text style={styles.amountLabel}>{paymentLabel(delivery)}</Text>
        </View>
      </View>

      <View style={styles.activeRoute}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <RouteTimeline
            size="sm"
            pickup={delivery.pickup}
            dropoff={delivery.dropoff}
            pickupLabel="RECOGIDA"
            dropoffLabel="ENTREGA"
            showPickupDetail={false}
          />
        </View>
        <View style={styles.activeRouteMetrics}>
          <Text style={styles.routeKm}>{formatKm(delivery.distanceKm)}</Text>
          <Text style={styles.routeMin}>{formatMinutes(delivery.etaMinutes).toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.activeAction}>
        <TouchableOpacity style={styles.activeButton} onPress={onContinue} activeOpacity={0.85}>
          <SymbolIcon name="navigation" size={17} color="#FFFFFF" />
          <Text style={styles.activeButtonLabel}>Continuar la ruta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
