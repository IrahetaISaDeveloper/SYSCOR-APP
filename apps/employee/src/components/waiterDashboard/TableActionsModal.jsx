import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import BottomSheetModal from '@syscor/shared/src/components/commons/BottomSheetModal';
import tableActionsModalStyles from "../../styles/tableActionsModalStyles";
import { employeePalette as palette } from '@syscor/shared/src/styles/employeePalette';

// Config visual por estado de comanda (icono, color, etiqueta corta como en el mockup)
const ORDER_STATE_META = {
  pending:   { icon: "time-outline",       color: palette.muted,  label: "PENDIENTE" },
  preparing: { icon: "flame",              color: palette.warnInk, label: "EN PREP." },
  ready:     { icon: "checkmark-circle",   color: palette.okInk,   label: "LISTA" },
  delivered: { icon: "checkmark-done",     color: palette.muted,   label: "ENTREGADA" },
  cancelled: { icon: "close-circle",       color: palette.accent,  label: "CANCELADA" },
};

const getMinutesAgo = (date) => {
  if (!date) return null;
  const t = new Date(date).getTime();
  if (isNaN(t)) return null;
  return Math.max(0, Math.floor((Date.now() - t) / 60000));
};

export default function TableActionsModal({
  visible,
  table,
  onClose,
  onOpenOrder,
  onSendToCleaning,
  onFreeTable,
}) {
  const activeOrders = table?.activeOrders || [];

  const totals = useMemo(() => {
    const amount = activeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return { amount, count: activeOrders.length };
  }, [activeOrders]);

  const minutesAgo = getMinutesAgo(table?.openedAt || table?.assignedAt || table?.updatedAt);

  if (!table) return null;

  const infoParts = [];
  if (table.peopleCount) infoParts.push(`${table.peopleCount} personas`);
  if (minutesAgo !== null) infoParts.push(`abierta hace ${minutesAgo} min`);

  return (
    <BottomSheetModal visible={visible} onClose={onClose} hideHeader>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* ── ENCABEZADO: mesa, cliente y total ── */}
        <View style={tableActionsModalStyles.summaryRow}>
          <View style={tableActionsModalStyles.tableAvatar}>
            <Text style={tableActionsModalStyles.tableAvatarNumber}>{table.number}</Text>
            <Text style={tableActionsModalStyles.tableAvatarLabel}>MESA</Text>
          </View>
          <View style={tableActionsModalStyles.summaryTextGroup}>
            <Text style={tableActionsModalStyles.customerName} numberOfLines={1}>
              {table.customerName || `Mesa ${table.number}`}
            </Text>
            <Text style={tableActionsModalStyles.customerInfo} numberOfLines={1}>
              {infoParts.length > 0 ? infoParts.join(' · ') : 'Mesa ocupada'}
            </Text>
          </View>
          {totals.count > 0 && (
            <View style={tableActionsModalStyles.summaryTotals}>
              <Text style={tableActionsModalStyles.totalAmount}>${totals.amount.toFixed(2)}</Text>
              <Text style={tableActionsModalStyles.totalOrders}>
                {totals.count} COMANDA{totals.count === 1 ? '' : 'S'}
              </Text>
            </View>
          )}
        </View>

        {/* ── ESTADO EN COCINA: productos de cada comanda activa ── */}
        {activeOrders.length > 0 && (
          <View style={tableActionsModalStyles.kitchenBox}>
            <Text style={tableActionsModalStyles.kitchenBoxLabel}>ESTADO EN COCINA</Text>
            {activeOrders.map((order) => {
              const meta = ORDER_STATE_META[order.status] || ORDER_STATE_META.pending;
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <View key={order._id} style={tableActionsModalStyles.orderBlock}>
                  <View style={tableActionsModalStyles.orderRow}>
                    <Icon name={meta.icon} size={16} color={meta.color} />
                    <Text style={tableActionsModalStyles.orderRowText} numberOfLines={1}>
                      {order.displayId ? `#${order.displayId}` : `#${String(order._id).slice(-4).toUpperCase()}`}
                      {' · '}{order.itemCount ?? items.length} platillo{(order.itemCount ?? items.length) === 1 ? '' : 's'}
                    </Text>
                    <Text style={[tableActionsModalStyles.orderRowStatus, { color: meta.color }]}>
                      {meta.label}
                    </Text>
                  </View>

                  {/* Productos concretos de la comanda, cuando el backend los incluye */}
                  {items.length > 0 && (
                    <View style={tableActionsModalStyles.productsList}>
                      {items.map((item, idx) => (
                        <Text key={item._id || idx} style={tableActionsModalStyles.productItem}>
                          · {item.quantity ? `${item.quantity}× ` : ''}{item.name}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ── ACCIONES ── */}
        <View style={tableActionsModalStyles.body}>
          {table.status === "ocupada" && (
            <>
              <ActionRow
                icon="receipt-outline"
                label="Ver / agregar comanda"
                onPress={onOpenOrder}
              />
              <ActionRow
                icon="sparkles-outline"
                label="Cliente se retiró · pasar a limpieza"
                onPress={onSendToCleaning}
                warn
              />
            </>
          )}

          {table.status === "limpieza" && (
            <ActionRow
              icon="checkmark-circle-outline"
              label="Marcar mesa como libre"
              onPress={() => onFreeTable(table)}
            />
          )}

          {table.status !== "ocupada" && table.status !== "limpieza" && (
            <View style={{ paddingVertical: 20 }}>
              <Text style={{ color: palette.muted, fontSize: 13, textAlign: "center" }}>
                Estado no reconocido: "{String(table.status)}"
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </BottomSheetModal>
  );
}

function ActionRow({ icon, label, onPress, warn = false }) {
  return (
    <TouchableOpacity style={tableActionsModalStyles.row} onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          tableActionsModalStyles.iconCircle,
          warn && tableActionsModalStyles.iconCircleWarn,
        ]}
      >
        <Icon name={icon} size={19} color={warn ? palette.warnInk : palette.accent} />
      </View>
      <Text style={[tableActionsModalStyles.rowLabel, warn && tableActionsModalStyles.rowLabelWarn]}>
        {label}
      </Text>
      <Icon name="chevron-forward" size={17} color={palette.muted} />
    </TouchableOpacity>
  );
}
