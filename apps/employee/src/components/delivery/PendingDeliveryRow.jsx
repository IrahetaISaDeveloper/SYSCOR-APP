import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import { collectsOnDelivery, formatKm, formatMoney, waitingLabel } from "../../constants/deliveryStatus";
import useDeliveriesScreenStyles from "../../styles/deliveriesScreenStyles";
import { useTheme } from "../../theme/ThemeContext";

export default function PendingDeliveryRow({ delivery, onPress }) {
  const { p } = useTheme();
  const styles = useDeliveriesScreenStyles();
  const collects = collectsOnDelivery(delivery);

  return (
    <TouchableOpacity style={styles.pendingRow} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.pendingIcon}>
        <SymbolIcon name="two_wheeler" size={19} color={p.muted} />
      </View>

      <View style={styles.pendingTexts}>
        <View style={styles.pendingCodeRow}>
          <Text style={styles.pendingCode}>{delivery.code}</Text>
          <View style={styles.kmChip}>
            <Text style={styles.kmChipText}>{formatKm(delivery.distanceKm).toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.pendingSubtitle} numberOfLines={1}>
          {delivery.dropoff?.address} · {delivery.customer?.name}
        </Text>
      </View>

      <View style={styles.pendingRight}>
        <Text style={[styles.pendingAmount, !collects && styles.amountPaid]}>
          {collects ? formatMoney(delivery.amountToCollect) : "PAGADO"}
        </Text>
        <Text style={styles.pendingWait}>{waitingLabel(delivery.readyAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}
