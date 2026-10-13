import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons as Icon } from "@expo/vector-icons";
import { textStyles } from "@syscor/shared/src/styles/typography";
import { useAuthMetrics } from "@syscor/shared/src/styles/authTheme";
import { ORDER_EVENTS } from "@syscor/shared/src/realtime/events";
import { useLiveRefresh } from "@syscor/shared/src/realtime/RealtimeProvider";
import { fetchUnassignedCounterOrders } from "../../services/waiterDashboardApi";
import { formatMoney, minutesSince, formatElapsed } from "../../constants/waiterStatus";
import { useTheme, makeStyles } from "../../theme/ThemeContext";

export default function TableAssignmentSheet({
  table,
  busy,
  showOrders,
  onCreateOrder,
  onShowOrders,
  onBack,
  onAssign,
}) {
  const { c } = useTheme();
  const styles = useStyles();
  const { ms } = useAuthMetrics();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchUnassignedCounterOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error("TableAssignmentSheet.loadOrders:", err);
      setError("No se pudieron cargar las comandas de caja.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showOrders) loadOrders();
  }, [showOrders, loadOrders]);

  useLiveRefresh(ORDER_EVENTS, () => loadOrders({ silent: true }), {
    enabled: showOrders,
    offlineMs: 15000,
  });

  if (!showOrders) {
    return (
      <View style={{ gap: ms(12) }}>
        <View style={{ gap: ms(3), marginBottom: ms(4) }}>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(20) }]}>Asignar a Mesa {table.number}</Text>
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]}>
            Elige cómo quieres agregar una comanda a esta mesa.
          </Text>
        </View>
        <OptionButton
          icon="add-circle-outline"
          label="Crear nueva comanda"
          description="Abrir el menú y tomar un pedido para esta mesa."
          onPress={onCreateOrder}
          ms={ms}
        />
        <OptionButton
          icon="receipt-outline"
          label="Asignar comanda de caja"
          description="Elegir un pedido pagado para consumir en el local."
          onPress={onShowOrders}
          disabled={table.status === "reservada"}
          ms={ms}
        />
        {table.status === "reservada" ? (
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>
            Una mesa reservada no puede recibir una comanda de caja.
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={{ gap: ms(12) }}>
      <View style={{ gap: ms(3) }}>
        <TouchableOpacity onPress={onBack} style={styles.back} accessibilityRole="button">
          <Icon name="chevron-back" size={ms(16)} color={c.primary} />
          <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13) }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(20) }]}>Comandas de caja</Text>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]}>
          Solo aparecen pedidos pagados para consumir en el local y aún activos.
        </Text>
      </View>

      {error ? (
        <View style={[styles.notice, { borderRadius: ms(12), padding: ms(11), gap: ms(8) }]}>
          <Icon name="cloud-offline-outline" size={ms(18)} color={c.error} />
          <Text style={[textStyles.body, { flex: 1, color: c.textGray, fontSize: ms(12) }]}>{error}</Text>
          <TouchableOpacity onPress={() => loadOrders()} accessibilityRole="button">
            <Text style={[textStyles.link, { color: c.primary, fontSize: ms(12) }]}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading ? (
        <View style={[styles.center, { paddingVertical: ms(28), gap: ms(8) }]}>
          <ActivityIndicator size="small" color={c.primary} />
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>Cargando comandas…</Text>
        </View>
      ) : orders.length === 0 && !error ? (
        <View style={[styles.empty, { borderRadius: ms(14), padding: ms(18), gap: ms(8) }]}>
          <Icon name="receipt-outline" size={ms(23)} color={c.textLight} />
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13), textAlign: "center" }]}>
            No hay comandas de caja disponibles para asignar.
          </Text>
          <TouchableOpacity onPress={() => loadOrders()} accessibilityRole="button">
            <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13) }]}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        orders.map((order) => {
          const elapsed = formatElapsed(minutesSince(order.createdAt));
          return (
            <TouchableOpacity
              key={order._id}
              onPress={() => onAssign(order._id)}
              disabled={busy}
              activeOpacity={0.85}
              style={[styles.order, { borderRadius: ms(14), padding: ms(13), gap: ms(8), opacity: busy ? 0.6 : 1 }]}
              accessibilityRole="button"
            >
              <View style={[styles.row, { gap: ms(8) }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(15) }]}>
                    {order.code ? `Comanda ${order.code}` : "Comanda de caja"}
                  </Text>
                  <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]} numberOfLines={1}>
                    {order.localCustomerName || "Cliente de mostrador"}{elapsed ? ` · ${elapsed}` : ""}
                  </Text>
                </View>
                <Text style={[textStyles.num, { color: c.textDark, fontSize: ms(14) }]}>{formatMoney(order.total)}</Text>
              </View>
              {(order.items || []).slice(0, 3).map((item, index) => (
                <Text key={item._id || index} style={[textStyles.body, { color: c.textDark, fontSize: ms(12.5) }]} numberOfLines={1}>
                  {item.quantity || 1}× {item.name}
                </Text>
              ))}
              {(order.items || []).length > 3 ? (
                <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(11.5) }]}>
                  +{order.items.length - 3} productos más
                </Text>
              ) : null}
              <View style={[styles.row, { justifyContent: "flex-end", gap: ms(5), marginTop: ms(2) }]}>
                {busy ? <ActivityIndicator size="small" color={c.primary} /> : null}
                <Text style={[textStyles.link, { color: c.primary, fontSize: ms(13) }]}>
                  {busy ? "Asignando…" : `Asignar a Mesa ${table.number}`}
                </Text>
                {!busy ? <Icon name="arrow-forward" size={ms(15)} color={c.primary} /> : null}
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

function OptionButton({ icon, label, description, onPress, disabled = false, ms }) {
  const { c } = useTheme();
  const styles = useStyles();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.option, styles.row, { borderRadius: ms(14), padding: ms(14), gap: ms(12), opacity: disabled ? 0.5 : 1 }]}
      accessibilityRole="button"
    >
      <Icon name={icon} size={ms(20)} color={c.primary} />
      <View style={{ flex: 1, gap: ms(2) }}>
        <Text style={[textStyles.button, { color: c.textDark, fontSize: ms(14.5) }]}>{label}</Text>
        <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(12) }]}>{description}</Text>
      </View>
      <Icon name="chevron-forward" size={ms(18)} color={c.textLight} />
    </TouchableOpacity>
  );
}

const useStyles = makeStyles(({ c }) => ({
  row: { flexDirection: "row", alignItems: "center" },
  center: { alignItems: "center", justifyContent: "center" },
  back: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 2, paddingVertical: 4 },
  option: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  order: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  empty: { alignItems: "center", backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  notice: { flexDirection: "row", alignItems: "center", backgroundColor: c.surface, borderWidth: 1, borderColor: c.error },
}));
