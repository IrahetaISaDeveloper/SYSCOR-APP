import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import { callPhone } from "../../utils/deliveryContact";
import useDeliveryDetailScreenStyles from "../../styles/deliveryDetailScreenStyles";
import { useTheme } from "../../theme/ThemeContext";

export default function CustomerContactCard({ customer }) {
  const { p } = useTheme();
  const styles = useDeliveryDetailScreenStyles();
  return (
    <View style={styles.customerCard}>
      <View style={styles.customerAvatar}>
        <SymbolIcon name="person" size={19} color={p.muted} />
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
          <SymbolIcon name="call" size={18} color={p.accent} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
