import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import { callPhone } from "../../utils/deliveryContact";
import styles from "../../styles/deliveryDetailScreenStyles";

export default function CustomerContactCard({ customer }) {
  return (
    <View style={styles.customerCard}>
      <View style={styles.customerAvatar}>
        <SymbolIcon name="person" size={19} color={employeePalette.muted} />
      </View>
      <View style={styles.customerTexts}>
        <Text style={styles.customerName} numberOfLines={1}>{customer.name}</Text>
        {customer.phone ? <Text style={styles.customerPhone}>{customer.phone}</Text> : null}
      </View>
      {customer.phone ? (
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => callPhone(customer.phone)}
          activeOpacity={0.8}
          accessibilityLabel="Llamar al cliente"
        >
          <SymbolIcon name="call" size={18} color={employeePalette.accent} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
