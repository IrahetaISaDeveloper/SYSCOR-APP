import React from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@syscor/shared/src/context/AuthContext";
import { getFirstName } from "@syscor/shared/src/utils/userDisplay";
import { employeePalette } from "@syscor/shared/src/styles/employeePalette";
import useWaiterOrders, { ORDER_FILTERS } from "../../hooks/useWaiterOrders";
import WaiterHeader from "../../components/waiter/WaiterHeader";
import SymbolIcon from "../../components/commons/SymbolIcon";
import {
  getOrderStatusMeta,
  formatOrderId,
  formatMoney,
  formatElapsed,
  minutesSince,
} from "../../constants/waiterStatus";
import styles from "../../styles/waiterOrdersScreenStyles";

function OrderCard({ order, updating, onMarkDelivered }) {
  const meta = getOrderStatusMeta(order.status);
  const elapsed = formatElapsed(minutesSince(order.createdAt));
  const subtitle = [order.customerName || "Cliente sin nombre", elapsed ? `hace ${elapsed}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.tableAvatar}>
          <Text style={styles.tableAvatarNumber}>{order.tableNumber}</Text>
          <Text style={styles.tableAvatarLabel}>MESA</Text>
        </View>
        <View style={styles.cardTexts}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {formatOrderId(order._id)} · Mesa {order.tableNumber}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        <View style={styles.statusBox}>
          <SymbolIcon name={meta.icon} size={15} color={meta.color} />
          <Text style={[styles.statusLabel, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      {order.items?.length > 0 && (
        <View style={styles.itemsBox}>
          {order.items.map((item, index) => (
            <View key={item._id || index} style={styles.itemRow}>
              <Text style={styles.itemQuantity}>{item.quantity}×</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{formatMoney((item.price || 0) * (item.quantity || 1))}</Text>
            </View>
          ))}
        </View>
      )}

      {order.notes ? (
        <View style={styles.notesRow}>
          <SymbolIcon name="edit_note" size={15} color={employeePalette.muted} />
          <Text style={styles.notesText}>{order.notes}</Text>
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalAmount}>{formatMoney(order.total)}</Text>
        {order.status === "ready" && (
          <TouchableOpacity
            style={styles.deliverButton}
            onPress={() => onMarkDelivered(order._id)}
            disabled={updating}
            activeOpacity={0.85}
          >
            {updating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <SymbolIcon name="done_all" size={15} color="#FFFFFF" />
                <Text style={styles.deliverButtonLabel}>Marcar servida</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function WaiterOrdersScreen() {
  const { user } = useAuth();
  const firstName = getFirstName(user);

  const {
    orders,
    counts,
    loading,
    refreshing,
    error,
    onRefresh,
    activeFilter,
    setActiveFilter,
    updatingId,
    markDelivered,
  } = useWaiterOrders();

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <WaiterHeader
        eyebrow={firstName ? `HOLA, ${firstName.toUpperCase()} · MESERA` : "MESERA"}
        title="Comandas"
        subtitle="Sigue tus comandas y marca las que ya serviste"
        accessoryIcon="receipt_long"
      />

      <View style={styles.filters}>
        {ORDER_FILTERS.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterPill, active && styles.filterPillActive]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                {filter.label} · {counts[filter.key] ?? 0}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={employeePalette.accent} />
          <Text style={styles.stateText}>Cargando comandas...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(order) => String(order._id)}
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
          renderItem={({ item }) => (
            <OrderCard order={item} updating={updatingId === item._id} onMarkDelivered={markDelivered} />
          )}
          ListEmptyComponent={
            <View style={styles.stateBox}>
              <SymbolIcon name="receipt_long" size={28} color={employeePalette.muted} />
              <Text style={styles.stateText}>No hay comandas en esta vista.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
