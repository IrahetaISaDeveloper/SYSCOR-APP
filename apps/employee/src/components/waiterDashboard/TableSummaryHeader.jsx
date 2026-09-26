import React from "react";
import { View, Text } from "react-native";
import styles from "../../styles/waiterSheetContentStyles";

export default function TableSummaryHeader({ tableNumber, title, info, amount, amountLabel }) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.tableAvatar}>
        <Text style={styles.tableAvatarNumber}>{tableNumber}</Text>
        <Text style={styles.tableAvatarLabel}>MESA</Text>
      </View>

      <View style={styles.summaryTexts}>
        <Text style={styles.summaryTitle} numberOfLines={1}>{title}</Text>
        {info ? <Text style={styles.summaryInfo} numberOfLines={1}>{info}</Text> : null}
      </View>

      {amount ? (
        <View style={styles.summaryTotals}>
          <Text style={styles.totalAmount}>{amount}</Text>
          {amountLabel ? <Text style={styles.totalLabel}>{amountLabel}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}
