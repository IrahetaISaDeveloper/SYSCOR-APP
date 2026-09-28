import React from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@syscor/shared/src/context/AuthContext";
import { getFirstName } from "@syscor/shared/src/utils/userDisplay";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import useKitchenHistory from "../../hooks/useKitchenHistory";
import KitchenHeader from "../../components/kitchen/KitchenHeader";
import SymbolIcon from "../../components/commons/SymbolIcon";
import { KITCHEN_STATUS } from "../../constants/kitchenStatus";
import { formatClock, formatDuration } from "../../utils/kitchenOrderMapper";
import styles from "../../styles/kitchenHistoryScreenStyles";

function StatTile({ label, value, unit }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.statValue}>
        {value}
        {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

function HistoryCard({ order }) {
  const meta = KITCHEN_STATUS[order.status] || KITCHEN_STATUS.ready;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.displayId}>{order.displayId}</Text>
        <View style={[styles.badge, { backgroundColor: meta.badge }]}>
          <Text style={styles.badgeText}>{order.status === "ready" ? "POR SERVIR" : meta.label}</Text>
        </View>
        <View style={styles.readyClock}>
          <SymbolIcon name="check_circle" size={15} color={employeePalette.okInk} />
          <Text style={styles.readyClockText}>{formatClock(order.readyAt || order.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.contextRow}>
        <SymbolIcon name={order.context.icon} size={13} color={employeePalette.muted} />
        <Text style={styles.contextText} numberOfLines={1}>
          {order.context.text} · {order.assignee.name}
        </Text>
      </View>

      <Text style={styles.itemsText} numberOfLines={2}>
        {order.items.map((item) => item.label).join(" · ")}
      </Text>

      {typeof order.prepMinutes === "number" ? (
        <View style={styles.prepRow}>
          <SymbolIcon name="timer" size={13} color={employeePalette.muted} />
          <Text style={styles.prepText}>
            ENTRÓ {order.clock} · PREPARADA EN {formatDuration(order.prepMinutes)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function KitchenHistoryScreen() {
  const { user } = useAuth();
  const firstName = getFirstName(user);
  const { orders, stats, isLoading, refreshing, error, onRefresh } = useKitchenHistory();

  const renderContent = () => {
    if (isLoading && orders.length === 0) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={employeePalette.accent} />
          <Text style={styles.stateText}>Cargando historial...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={orders}
        keyExtractor={(item) => `${item.source}-${item.id}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={employeePalette.accent}
            colors={[employeePalette.accent]}
          />
        }
        renderItem={({ item }) => <HistoryCard order={item} />}
        ListEmptyComponent={
          <View style={styles.stateBox}>
            <SymbolIcon name={error ? "cloud_off" : "history"} size={40} color={employeePalette.muted} />
            <Text style={styles.stateText}>{error || "Aún no hay comandas terminadas hoy."}</Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KitchenHeader
        title="Historial"
        eyebrow={firstName ? `HOLA, ${firstName.toUpperCase()} · COCINA` : "COCINA"}
        pillText={`${stats.total} hoy`}
      />

      <View style={styles.stats}>
        <StatTile label="TERMINADAS" value={stats.total} />
        <StatTile label="POR SERVIR" value={stats.waiting} />
        <StatTile
          label="PREP. PROMEDIO"
          value={stats.averagePrep ?? "--"}
          unit={stats.averagePrep !== null ? "min" : null}
        />
      </View>

      <Text style={styles.sectionLabel}>TERMINADAS HOY</Text>

      {renderContent()}
    </SafeAreaView>
  );
}
