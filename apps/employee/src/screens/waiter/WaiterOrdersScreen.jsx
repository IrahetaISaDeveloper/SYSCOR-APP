import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useAuth } from "@syscor/shared/src/context/AuthContext";
import { getFirstName } from "@syscor/shared/src/utils/userDisplay";
import { textStyles } from "@syscor/shared/src/styles/typography";
import { useAuthMetrics } from "@syscor/shared/src/styles/authTheme";
import useWaiterOrders, { ORDER_FILTERS, ORDER_SCOPES } from "../../hooks/useWaiterOrders";
import OrderCard from "../../components/waiter/OrderCard";
import { waiterColors as c } from "../../styles/waiterTheme";

const shiftLabel = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return "TURNO MAÑANA";
  if (hour < 18) return "TURNO TARDE";
  return "TURNO NOCHE";
};

// Comandas de todo el restaurante: cualquier mesero puede llevar a la mesa
// una comanda lista, aunque la haya tomado otro. "Yo la llevo" avisa a los
// demás para que no vayan dos al mismo plato; "Mías" deja solo las propias.
export default function WaiterOrdersScreen() {
  const { ms, gutter } = useAuthMetrics();
  const { user } = useAuth();
  const firstName = getFirstName(user);

  const {
    myId,
    orders,
    counts,
    loading,
    refreshing,
    error,
    onRefresh,
    activeFilter,
    setActiveFilter,
    scope,
    setScope,
    actions,
  } = useWaiterOrders();

  const header = (
    <View style={{ gap: ms(14), marginBottom: ms(14) }}>
      {/* ── ENCABEZADO ── */}
      <View style={[styles.row, { marginTop: ms(14), gap: ms(12) }]}>
        <View style={{ flex: 1, gap: ms(2) }}>
          <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]} numberOfLines={1}>
            {shiftLabel()}
            {firstName ? ` · ${firstName.toUpperCase()}` : ""}
          </Text>
          <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(28) }]}>Comandas</Text>
        </View>
      </View>

      {/* ── TODAS / MÍAS ── */}
      <View style={[styles.row, { gap: ms(8) }]}>
        {ORDER_SCOPES.map((s) => {
          const active = scope === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={() => setScope(s.key)}
              activeOpacity={0.85}
              style={[
                styles.row,
                styles.scope,
                {
                  borderRadius: ms(20),
                  paddingHorizontal: ms(14),
                  height: ms(34),
                  gap: ms(6),
                  backgroundColor: active ? "#C9402F" : c.surface,
                  borderColor: active ? "#C9402F" : c.border,
                },
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Icon name={s.key === "mine" ? "person-outline" : "people-outline"} size={ms(15)} color={active ? c.white : c.textGray} />
              <Text style={[active ? textStyles.link : textStyles.body, { color: active ? c.white : c.textGray, fontSize: ms(13) }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── FILTROS POR ESTADO ── */}
      <View style={[styles.row, styles.filters, { borderRadius: ms(16), padding: ms(4), gap: ms(4) }]}>
        {ORDER_FILTERS.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filter, { borderRadius: ms(12), paddingVertical: ms(8), backgroundColor: active ? c.textDark : "transparent" }]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[textStyles.title, { color: active ? c.white : c.textDark, fontSize: ms(16) }]}>
                {counts[filter.key] ?? 0}
              </Text>
              <Text style={[active ? textStyles.link : textStyles.body, { color: active ? c.white : c.textDark, fontSize: ms(11.5) }]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? (
        <View style={[styles.row, styles.errorBox, { borderRadius: ms(12), padding: ms(12), gap: ms(10) }]}>
          <Icon name="cloud-offline-outline" size={ms(18)} color={c.error} />
          <Text style={[textStyles.body, { flex: 1, color: c.textGray, fontSize: ms(13) }]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      {loading ? (
        <View style={{ paddingHorizontal: gutter }}>
          {header}
          <View style={[styles.center, { paddingVertical: ms(50), gap: ms(12) }]}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]}>Cargando comandas…</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(order) => String(order._id)}
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: ms(32), gap: ms(12) }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} colors={[c.primary]} />
          }
          renderItem={({ item }) => <OrderCard order={item} myId={myId} actions={actions} />}
          ListEmptyComponent={
            <View style={[styles.center, { paddingVertical: ms(50), gap: ms(10) }]}>
              <Icon name="receipt-outline" size={ms(30)} color={c.textLight} />
              <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13.5) }]}>
                {scope === "mine" ? "No tienes comandas en esta vista." : "No hay comandas en esta vista."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  scope: {
    borderWidth: 1,
  },
  filters: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  filter: {
    flex: 1,
    alignItems: "center",
  },
  errorBox: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.error,
  },
});
