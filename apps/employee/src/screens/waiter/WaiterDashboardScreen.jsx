import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons as Icon } from "@expo/vector-icons";
import { textStyles } from "@syscor/shared/src/styles/typography";
import { useAuthMetrics } from "@syscor/shared/src/styles/authTheme";
import { useAuth } from "@syscor/shared/src/context/AuthContext";
import { getFirstName } from "@syscor/shared/src/utils/userDisplay";
import useWaiterDashboard from "../../hooks/useWaiterDashboard";
import useOrderActions from "../../hooks/useOrderActions";
import WaiterSheet from "../../components/waiter/WaiterSheet";
import WaiterFloorPlan from "../../components/waiterDashboard/WaiterFloorPlan";
import TableListView from "../../components/waiterDashboard/TableListView";
import TableActionsSheet from "../../components/waiterDashboard/TableActionsSheet";
import ChargeTableSheet from "../../components/waiterDashboard/ChargeTableSheet";
import { waiterColors as c, TABLE_STATE, TABLE_STATE_ORDER, FLOORS } from "../../styles/waiterTheme";

// Rojo de las pestañas de planta (el mismo de las mesas ocupadas).
const ACCENT = TABLE_STATE.ocupada.color;

const shiftLabel = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return "TURNO MAÑANA";
  if (hour < 18) return "TURNO TARDE";
  return "TURNO NOCHE";
};

const VIEW_MODES = [
  { id: "map", icon: "map-outline", label: "Croquis" },
  { id: "list", icon: "list-outline", label: "Lista" },
];

export default function WaiterDashboardScreen({ navigation, route }) {
  const { ms, gutter } = useAuthMetrics();
  const { user } = useAuth();
  const firstName = getFirstName(user);
  const [viewMode, setViewMode] = useState("map");
  const [floor, setFloor] = useState(1);

  const {
    tables,
    loading,
    refreshing,
    error,
    onRefresh,
    selectedTable,
    activeSheet,
    busy,
    openTable,
    closeSheet,
    openCharge,
    backToActions,
    clientLeft,
    chargeTable,
    markOccupied,
    reload,
  } = useWaiterDashboard();
  const orderActions = useOrderActions(reload);
  const myId = user?.id || user?._id || null;

  // Al volver del menú con una comanda enviada, la mesa ya está ocupada.
  const sentAt = route.params?.sentAt;
  const sentTableId = route.params?.sentTableId;
  useEffect(() => {
    if (sentAt && sentTableId) markOccupied(sentTableId);
  }, [sentAt, sentTableId, markOccupied]);

  const lastSheetRef = useRef(null);

  const floorTables = useMemo(
    () => tables.filter((t) => (t.floor || 1) === floor).sort((a, b) => a.number - b.number),
    [tables, floor]
  );

  // Cuántas mesas hay en cada estado, en todo el local.
  const counts = useMemo(() => {
    const result = {};
    for (const t of tables) result[t.status] = (result[t.status] || 0) + 1;
    return result;
  }, [tables]);

  // Abre el menú para tomar la orden. Se manda la mesa completa: si está
  // libre o reservada, se ocupa al enviar la comanda (con la capacidad de la
  // mesa o las personas de la reserva, sin preguntarlas).
  const goToNewOrder = useCallback(
    (table) =>
      navigation.navigate("NewOrder", {
        table: {
          _id: table._id,
          number: table.number,
          status: table.status,
          capacity: table.capacity || null,
          customerName: table.customerName || null,
          peopleCount: table.peopleCount || null,
        },
      }),
    [navigation]
  );

  // Mesa libre o reservada: directo al menú. Ocupada: sus acciones.
  const handleTablePress = useCallback(
    (table) => {
      if (table.status === "libre" || table.status === "reservada") goToNewOrder(table);
      else openTable(table);
    },
    [goToNewOrder, openTable]
  );

  const handleOpenOrder = () => {
    if (!selectedTable) return;
    closeSheet();
    goToNewOrder(selectedTable);
  };

  if (activeSheet) lastSheetRef.current = activeSheet;
  const sheetType = activeSheet || lastSheetRef.current;

  const renderSheetContent = () => {
    if (!selectedTable) return null;
    if (sheetType === "charge") {
      return <ChargeTableSheet table={selectedTable} busy={busy} onBack={backToActions} onConfirm={chargeTable} />;
    }
    return (
      <TableActionsSheet
        table={selectedTable}
        busy={busy}
        myId={myId}
        orderActions={orderActions}
        onAddProducts={handleOpenOrder}
        onCharge={openCharge}
        onClientLeft={clientLeft}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: ms(32) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} colors={[c.primary]} />
        }
      >
        {/* ── ENCABEZADO ── */}
        <View style={[styles.row, { marginTop: ms(14), gap: ms(12) }]}>
          <View style={{ flex: 1, gap: ms(2) }}>
            <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]} numberOfLines={1}>
              {shiftLabel()}
              {firstName ? ` · ${firstName.toUpperCase()}` : ""}
            </Text>
            <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(28) }]}>Mesas</Text>
          </View>

          {/* Cambia entre el croquis y la lista */}
          <View
            style={[styles.row, styles.toggle, { borderRadius: ms(14), padding: ms(4), gap: ms(4) }]}
            accessibilityRole="tablist"
          >
            {VIEW_MODES.map((mode) => {
              const selected = viewMode === mode.id;
              return (
                <TouchableOpacity
                  key={mode.id}
                  onPress={() => setViewMode(mode.id)}
                  activeOpacity={0.85}
                  style={[
                    styles.toggleButton,
                    {
                      width: ms(38),
                      height: ms(32),
                      borderRadius: ms(10),
                      backgroundColor: selected ? c.textDark : "transparent",
                    },
                  ]}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Ver en ${mode.label.toLowerCase()}`}
                >
                  <Icon name={mode.icon} size={ms(17)} color={selected ? c.white : c.textGray} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── CONTEO POR ESTADO (todo el local) ── */}
        <View style={[styles.row, { gap: ms(7), marginTop: ms(14) }]}>
          {TABLE_STATE_ORDER.map((key) => {
            const state = TABLE_STATE[key];
            return (
              <View
                key={key}
                style={[styles.statCard, { borderRadius: ms(14), paddingHorizontal: ms(10), paddingVertical: ms(9), gap: ms(4) }]}
              >
                <View style={[styles.row, { gap: ms(5) }]}>
                  <View style={{ width: ms(7), height: ms(7), borderRadius: ms(3.5), backgroundColor: state.color }} />
                  <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(9) }]} numberOfLines={1}>
                    {state.short}
                  </Text>
                </View>
                <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(20) }]}>
                  {loading ? "–" : counts[key] || 0}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── PLANTA BAJA / PLANTA ALTA ── */}
        <View style={[styles.row, { gap: ms(8), marginTop: ms(12) }]}>
          {FLOORS.map((f) => {
            const selected = floor === f.floor;
            const count = tables.filter((t) => (t.floor || 1) === f.floor).length;
            return (
              <TouchableOpacity
                key={f.floor}
                onPress={() => setFloor(f.floor)}
                activeOpacity={0.85}
                style={[
                  styles.pill,
                  {
                    flex: 1,
                    backgroundColor: selected ? ACCENT : c.surface,
                    borderColor: selected ? ACCENT : c.border,
                    borderRadius: ms(22),
                    height: ms(40),
                    gap: ms(6),
                  },
                ]}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
              >
                {/* Etiqueta y conteo en un solo Text: comparten línea base y
                    quedan alineados aunque cambie el tamaño de letra. */}
                <Text style={[textStyles.title, styles.pillText, { color: selected ? c.white : c.textDark, fontSize: ms(13.5), lineHeight: ms(18) }]}>
                  {f.label}
                  {!loading ? (
                    <Text style={{ color: selected ? "rgba(255,255,255,0.7)" : c.textLight }}>{`  ${count}`}</Text>
                  ) : null}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {error ? (
          <View
            style={[
              styles.row,
              styles.errorBox,
              { borderRadius: ms(12), padding: ms(12), gap: ms(10), marginTop: ms(14) },
            ]}
          >
            <Icon name="cloud-offline-outline" size={ms(18)} color={c.error} />
            <Text style={[textStyles.body, { flex: 1, color: c.textGray, fontSize: ms(13) }]}>{error}</Text>
          </View>
        ) : null}

        {/* ── CONTENIDO ── */}
        <View style={{ marginTop: ms(14) }}>
          {loading ? (
            <View style={[styles.center, { paddingVertical: ms(60), gap: ms(12) }]}>
              <ActivityIndicator size="large" color={c.primary} />
              <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13) }]}>Cargando mesas…</Text>
            </View>
          ) : floorTables.length === 0 ? (
            <View style={[styles.center, { paddingVertical: ms(50), gap: ms(10) }]}>
              <Icon name="restaurant-outline" size={ms(30)} color={c.textLight} />
              <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(16) }]}>Sin mesas en esta planta</Text>
              <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(13), textAlign: "center" }]}>
                Cuando administración registre mesas aquí, aparecerán en esta vista.
              </Text>
            </View>
          ) : viewMode === "map" ? (
            <WaiterFloorPlan floor={floor} tables={floorTables} onTablePress={handleTablePress} />
          ) : (
            <TableListView tables={floorTables} onTablePress={handleTablePress} />
          )}
        </View>
      </ScrollView>

      <WaiterSheet visible={!!activeSheet && !!selectedTable} onClose={closeSheet}>
        {renderSheetContent()}
      </WaiterSheet>
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
  toggle: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  toggleButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  statCard: {
    flex: 1,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  pillText: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.error,
  },
});
