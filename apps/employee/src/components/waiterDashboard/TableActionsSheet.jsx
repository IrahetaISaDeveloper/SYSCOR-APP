import React, { useMemo } from "react";
import { View, Text } from "react-native";
import SymbolIcon from "../commons/SymbolIcon";
import TableSummaryHeader from "./TableSummaryHeader";
import SheetActionRow from "./SheetActionRow";
import {
  getOrderStatusMeta,
  formatOrderId,
  formatMoney,
  formatElapsed,
  minutesSince,
  pluralize,
} from "../../constants/waiterStatus";
import styles from "../../styles/waiterSheetContentStyles";

export default function TableActionsSheet({ table, busy, onOpenOrder, onCharge, onSendToCleaning, onFreeTable }) {
  const orders = table.activeOrders || [];

  const total = useMemo(() => orders.reduce((sum, o) => sum + (o.total || 0), 0), [orders]);

  if (table.status === "limpieza") {
    return (
      <>
        <TableSummaryHeader
          tableNumber={table.number}
          title={`Mesa ${table.number}`}
          info="En limpieza · aún no disponible"
        />
        <View style={styles.actions}>
          <SheetActionRow
            icon="task_alt"
            label="Mesa limpia · marcar como libre"
            onPress={onFreeTable}
            disabled={busy}
          />
        </View>
      </>
    );
  }

  const elapsed = formatElapsed(minutesSince(table.occupiedAt || orders[0]?.createdAt));
  const infoParts = [];
  if (table.peopleCount) infoParts.push(pluralize(table.peopleCount, "persona"));
  if (elapsed) infoParts.push(`abierta hace ${elapsed}`);

  return (
    <>
      <TableSummaryHeader
        tableNumber={table.number}
        title={table.customerName || `Mesa ${table.number}`}
        info={infoParts.length ? infoParts.join(" · ") : "Mesa ocupada"}
        amount={formatMoney(total)}
        amountLabel={pluralize(orders.length, "COMANDA").toUpperCase()}
      />

      {orders.length > 0 && (
        <View style={styles.infoBox}>
          <Text style={styles.boxLabel}>ESTADO EN COCINA</Text>
          {orders.map((order) => {
            const meta = getOrderStatusMeta(order.status);
            return (
              <View key={order._id} style={styles.boxRow}>
                <SymbolIcon name={meta.icon} size={16} color={meta.color} />
                <Text style={styles.boxRowText} numberOfLines={1}>
                  {formatOrderId(order._id)} · {pluralize(order.itemCount || 0, "platillo")}
                </Text>
                <Text style={[styles.boxRowStatus, { color: meta.color }]}>{meta.label}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.actions}>
        <SheetActionRow icon="receipt_long" label="Ver / agregar comanda" onPress={onOpenOrder} disabled={busy} />
        <SheetActionRow
          icon="payments"
          label="Cobrar la cuenta"
          onPress={onCharge}
          disabled={busy || orders.length === 0}
        />
        <SheetActionRow
          icon="cleaning_services"
          label="Cliente se retiró · pasar a limpieza"
          onPress={onSendToCleaning}
          disabled={busy}
          warn
        />
      </View>
    </>
  );
}
