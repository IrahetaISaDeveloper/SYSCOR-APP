import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { textStyles } from "@syscor/shared/src/styles/typography";
import { useAuthMetrics } from "@syscor/shared/src/styles/authTheme";
import { TABLE_STATE_ORDER, getTableStates } from "../../styles/waiterTheme";
import { useTheme, makeStyles } from "../../theme/ThemeContext";

export default function TableStatusSheet({ table, busy, onSelectStatus }) {
  const { c, isDark } = useTheme();
  const styles = useStyles();
  const { ms } = useAuthMetrics();
  const states = getTableStates(isDark);
  const hasKitchenOrders = (table.activeOrders || []).some((order) => order.status !== "delivered");
  const hasUnpaidServedOrders = (table.activeOrders || []).some(
    (order) => order.status === "delivered" && order.paymentStatus !== "paid"
  );

  return (
    <View style={{ gap: ms(12) }}>
      <View style={{ gap: ms(3), marginBottom: ms(4) }}>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(20) }]}>Estado de Mesa {table.number}</Text>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]}>
          Elige el nuevo estado de la mesa.
        </Text>
      </View>
      {hasKitchenOrders ? (
        <View style={[styles.notice, { borderRadius: ms(12), padding: ms(11), gap: ms(8) }]}>
          <Icon name="information-circle-outline" size={ms(18)} color={c.warning} />
          <Text style={[textStyles.body, { flex: 1, color: c.textGray, fontSize: ms(12) }]}>
            Al dejarla disponible, las comandas que siguen en cocina se cancelarán.
          </Text>
        </View>
      ) : null}
      {hasUnpaidServedOrders ? (
        <View style={[styles.notice, { borderRadius: ms(12), padding: ms(11), gap: ms(8) }]}>
          <Icon name="alert-circle-outline" size={ms(18)} color={c.error} />
          <Text style={[textStyles.body, { flex: 1, color: c.textGray, fontSize: ms(12) }]}>
            Hay comandas servidas pendientes de cobro. Cobra la cuenta antes de cambiar la mesa a Disponible.
          </Text>
        </View>
      ) : null}
      {TABLE_STATE_ORDER.map((status) => {
        const state = states[status];
        const selected = table.status === status;
        const blocked = busy || selected || (status === "libre" && hasUnpaidServedOrders)
          || (status === "reservada" && (table.activeOrders || []).length > 0);
        return (
          <TouchableOpacity
            key={status}
            onPress={() => onSelectStatus(status)}
            disabled={blocked}
            activeOpacity={0.85}
            style={[
              styles.option,
              styles.row,
              { borderRadius: ms(14), padding: ms(14), gap: ms(11), opacity: blocked ? 0.5 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: blocked, selected }}
          >
            <Icon name={state.icon} size={ms(21)} color={state.color} />
            <Text style={[textStyles.button, { flex: 1, color: c.textDark, fontSize: ms(14.5) }]}>{state.label}</Text>
            {selected ? <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(9) }]}>ACTUAL</Text> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(({ c }) => ({
  row: { flexDirection: "row", alignItems: "center" },
  option: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  notice: { flexDirection: "row", alignItems: "flex-start", backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
}));
