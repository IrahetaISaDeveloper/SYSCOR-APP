import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import TableSummaryHeader from "./TableSummaryHeader";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import {
  IN_KITCHEN_STATUSES,
  orderCode,
  formatMoney,
  pluralize,
} from "../../constants/waiterStatus";
import styles from "../../styles/waiterSheetContentStyles";

const PAYMENT_METHODS = [
  { key: "cash", label: "Efectivo", icon: "payments" },
  { key: "card", label: "Tarjeta", icon: "credit_card" },
];

export default function ChargeTableSheet({ table, busy, onBack, onConfirm }) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const orders = table.activeOrders || [];

  const total = useMemo(() => orders.reduce((sum, o) => sum + (o.total || 0), 0), [orders]);
  const inKitchen = orders.filter((o) => IN_KITCHEN_STATUSES.includes(o.status)).length;

  return (
    <>
      <TableSummaryHeader
        tableNumber={table.number}
        title="Cobrar la cuenta"
        info={table.customerName ? `Mesa ${table.number} · ${table.customerName}` : `Mesa ${table.number}`}
        amount={formatMoney(total)}
        amountLabel={pluralize(orders.length, "COMANDA").toUpperCase()}
      />

      <View style={styles.infoBox}>
        <Text style={styles.boxLabel}>DETALLE DE LA CUENTA</Text>
        {orders.map((order) => (
          <View key={order._id} style={styles.boxRow}>
            <SymbolIcon name="receipt_long" size={16} color={employeePalette.muted} />
            <Text style={styles.boxRowText} numberOfLines={1}>
              {orderCode(order) || "Comanda"} · {pluralize(order.itemCount || 0, "platillo")}
            </Text>
            <Text style={styles.boxRowAmount}>{formatMoney(order.total)}</Text>
          </View>
        ))}
        <View style={styles.boxDivider} />
        <View style={styles.boxRow}>
          <Text style={styles.boxTotalLabel}>TOTAL</Text>
          <Text style={styles.boxTotalAmount}>{formatMoney(total)}</Text>
        </View>
      </View>

      {inKitchen > 0 && (
        <View style={styles.warnBox}>
          <SymbolIcon name="warning" size={16} color={employeePalette.warnInk} />
          <Text style={styles.warnText}>
            {inKitchen === 1 ? "Hay 1 comanda que sigue" : `Hay ${inKitchen} comandas que siguen`} en cocina.
            Al cobrar se marcarán como servidas.
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <Text style={styles.boxLabel}>MÉTODO DE PAGO</Text>
        {PAYMENT_METHODS.map((method) => {
          const selected = paymentMethod === method.key;
          return (
            <TouchableOpacity
              key={method.key}
              style={[styles.actionRow, selected && styles.actionRowSelected]}
              onPress={() => setPaymentMethod(method.key)}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconBox}>
                <SymbolIcon name={method.icon} size={19} color={employeePalette.accent} />
              </View>
              <Text style={[styles.actionLabel, styles.actionTexts]}>{method.label}</Text>
              <SymbolIcon
                name={selected ? "check_circle" : "chevron_right"}
                size={selected ? 19 : 17}
                color={selected ? employeePalette.accent : employeePalette.muted}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.primaryButton, busy && styles.buttonDisabled]}
          onPress={() => onConfirm(paymentMethod)}
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <SymbolIcon name="payments" size={17} color="#FFFFFF" />
              <Text style={styles.primaryButtonLabel}>Cobrar {formatMoney(total)}</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onBack} disabled={busy} activeOpacity={0.85}>
          <Text style={styles.secondaryButtonLabel}>Volver</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
