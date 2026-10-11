import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { textStyles } from "@syscor/shared/src/styles/typography";
import { useAuthMetrics } from "@syscor/shared/src/styles/authTheme";
import OrderCard from "../waiter/OrderCard";
import { formatElapsed, formatMoney, minutesSince, pluralize } from "../../constants/waiterStatus";
import { useTheme, makeStyles } from "../../theme/ThemeContext";

// Hoja de una mesa: todo lo de la cuenta abierta en un solo lugar.
//   - Arriba: cliente, personas, cuánto lleva abierta y el total.
//   - "Agregar productos" abre el menú (cada envío es una ronda nueva).
//   - Sus comandas, por ronda, con lo que lleva cada una y sus acciones
//     (marchar, yo la llevo, marcar servida).
//   - Cobrar la cuenta (o, con la caja abierta, enviarla a caja) y liberar
//     la mesa cuando el cliente se retira (pasa directo a Disponible).
export default function TableActionsSheet({
  table,
  busy,
  myId,
  orderActions,
  onAddProducts,
  onCharge,
  onClientLeft,
  cashierOpen = false,
  onSendToCashier,
}) {
  const { c } = useTheme();
  const styles = useStyles();
  const { ms } = useAuthMetrics();
  const orders = table.activeOrders || [];
  const total = useMemo(() => orders.reduce((sum, o) => sum + (o.total || 0), 0), [orders]);

  // Comandas agrupadas por ronda (las viejas sin ronda cuentan en orden).
  const rounds = useMemo(() => {
    const sorted = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const groups = new Map();
    sorted.forEach((order, i) => {
      const round = order.round || i + 1;
      if (!groups.has(round)) groups.set(round, []);
      groups.get(round).push(order);
    });
    return [...groups.entries()].sort(([a], [b]) => a - b);
  }, [orders]);

  const elapsed = formatElapsed(minutesSince(table.occupiedAt || orders[0]?.createdAt));
  const info = [
    table.customerName,
    table.peopleCount ? pluralize(table.peopleCount, "persona") : null,
    elapsed ? `abierta hace ${elapsed}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={{ gap: ms(16) }}>
      <Header
        table={table}
        info={info || "Mesa ocupada"}
        amount={formatMoney(total)}
        amountLabel={pluralize(orders.length, "COMANDA").toUpperCase()}
        ms={ms}
      />

      <BigButton icon="add-circle-outline" label="Agregar productos" color="#C9402F" onPress={onAddProducts} disabled={busy} ms={ms} />

      {/* ── COMANDAS DE LA MESA ── */}
      {rounds.length === 0 ? (
        <View style={[styles.empty, { borderRadius: ms(14), padding: ms(16), gap: ms(6) }]}>
          <Icon name="receipt-outline" size={ms(22)} color={c.textLight} />
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13), textAlign: "center" }]}>
            Aún no hay comandas en esta mesa.
          </Text>
        </View>
      ) : (
        rounds.map(([round, roundOrders]) => (
          <View key={round} style={{ gap: ms(10) }}>
            <View style={[styles.row, { gap: ms(8) }]}>
              <View style={{ width: ms(4), height: ms(14), borderRadius: ms(2), backgroundColor: "#C9402F" }} />
              <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]}>
                {round === 1 ? "PRIMERA RONDA" : `RONDA ${round} · LO QUE PIDIERON DESPUÉS`}
              </Text>
            </View>
            {roundOrders.map((order) => (
              <OrderCard key={order._id} order={order} myId={myId} actions={orderActions} showTable={false} />
            ))}
          </View>
        ))
      )}

      {/* ── CUENTA Y SALIDA ── */}
      <View style={{ gap: ms(8) }}>
        {cashierOpen ? (
          <>
            <BigButton
              outline
              icon="storefront-outline"
              label={table.billRequestedAt ? "Cuenta enviada a caja · reenviar" : "Enviar a caja"}
              color={c.textDark}
              onPress={onSendToCashier}
              disabled={busy || orders.length === 0}
              ms={ms}
            />
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12), textAlign: "center" }]}>
              La caja está abierta: el cliente paga en caja y la mesa se libera al cobrar.
            </Text>
          </>
        ) : (
          <BigButton
            outline
            icon="cash-outline"
            label="Cobrar la cuenta"
            color={c.textDark}
            onPress={onCharge}
            disabled={busy || orders.length === 0}
            ms={ms}
          />
        )}
        <TouchableOpacity
          onPress={onClientLeft}
          disabled={busy}
          style={[styles.row, { justifyContent: "center", gap: ms(6), paddingVertical: ms(8) }]}
          accessibilityRole="button"
        >
          <Icon name="exit-outline" size={ms(16)} color="#C9402F" />
          <Text style={[textStyles.link, { color: "#C9402F", fontSize: ms(13.5) }]}>Cliente se retiró · liberar mesa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Header({ table, info, amount, amountLabel, ms }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.row, { gap: ms(12) }]}>
      <View style={[styles.tableBadge, { width: ms(52), height: ms(52), borderRadius: ms(14) }]}>
        <Text style={[textStyles.kicker, { color: "rgba(255,255,255,0.6)", fontSize: ms(8) }]}>MESA</Text>
        <Text style={[textStyles.title, { color: c.white, fontSize: ms(21), lineHeight: ms(23) }]}>{table.number}</Text>
      </View>
      <View style={{ flex: 1, gap: ms(2) }}>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(19) }]}>Mesa {table.number}</Text>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]} numberOfLines={2}>
          {info}
        </Text>
      </View>
      {amount ? (
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(18) }]}>{amount}</Text>
          <Text style={[textStyles.kicker, { color: c.textLight, fontSize: ms(9) }]}>{amountLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

function BigButton({ icon, label, color, outline, onPress, disabled, ms }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.row,
        {
          justifyContent: "center",
          height: ms(50),
          borderRadius: ms(14),
          gap: ms(8),
          backgroundColor: outline ? c.surface : color,
          borderWidth: outline ? 1.5 : 0,
          borderColor: color,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      accessibilityRole="button"
    >
      <Icon name={icon} size={ms(19)} color={outline ? color : c.white} />
      <Text style={[textStyles.button, { color: outline ? color : c.white, fontSize: ms(15) }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const useStyles = makeStyles(({ c }) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#211C18",
  },
  empty: {
    alignItems: "center",
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
}));
