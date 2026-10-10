import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { PAYMENT_SHORT, formatMoney, formatKm } from "../../constants/deliveryStatus";
import styles from "../../styles/deliveriesScreenStyles";

export default function AvailableDeliveryRow({ delivery, onPress }) {
  return (
    <TouchableOpacity style={styles.availableRow} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.availableIcon}>
        <SymbolIcon name="two_wheeler" size={19} color={employeePalette.muted} />
      </View>

      <View style={styles.availableTexts}>
        <View style={styles.availableCodeRow}>
          <Text style={styles.availableCode}>{delivery.code}</Text>
          <View style={styles.kmChip}>
            <Text style={styles.kmChipText}>{formatKm(delivery.distanceKm).toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.availableSubtitle} numberOfLines={1}>
          {delivery.dropoff.address} · {PAYMENT_SHORT[delivery.paymentMethod]}
        </Text>
      </View>

      <View style={styles.availableRight}>
        <Text style={styles.availableAmount}>{formatMoney(delivery.total)}</Text>
        <Text style={styles.acceptText}>Aceptar</Text>
      </View>
    </TouchableOpacity>
  );
}
