import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import ordersStyles, { colors as kitchenPalette } from '@syscor/shared/src/styles/Orders';
import useOrders from '../../hooks/useOrders';
import OrderCard from '@syscor/shared/src/components/commons/OrderCard';
import { useAuth } from '@syscor/shared/src/context/AuthContext';
import { getFirstName } from '@syscor/shared/src/utils/userDisplay';

const filterOptions = [
  { key: 'all',       label: 'Todas' },
  { key: 'pending',   label: 'Pendientes' },
  { key: 'preparing', label: 'En Prep.' },
  { key: 'late',      label: 'Retrasadas' },
];

const nextStatusMap = {
  pending:   'preparing',
  preparing: 'ready',
  late:      'ready',
};

const Orders = ({ navigation }) => {
  const { user } = useAuth();
  const firstName = getFirstName(user);

  const {
    orders:               cartOrders,
    isLoading:            cartLoading,
    error:                cartError,
    refetch:              refetchCarts,
    updateOrderStatus,
    updateApiOrderStatus,
    activeFilter,
    setActiveFilter,
    statusConfig,
    apiOrdersMapped,
    apiOrdersLoading,
    apiOrdersError,
    refetchApiOrders,
  } = useOrders();

  const allOrders = useMemo(() => {
    const carts = Array.isArray(cartOrders)      ? cartOrders      : [];
    const api   = Array.isArray(apiOrdersMapped) ? apiOrdersMapped : [];
    const seen  = new Set();
    return [...carts, ...api].filter((o) => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    });
  }, [cartOrders, apiOrdersMapped]);

  const isLoading = (cartLoading && cartOrders.length === 0) || (apiOrdersLoading && apiOrdersMapped.length === 0);
  const error = cartError && apiOrdersError ? `${cartError}\n${apiOrdersError}` : null;
  const refetch = () => { refetchCarts(); refetchApiOrders(); };

  const counts = {
    all:       allOrders.length,
    pending:   allOrders.filter((o) => o.status === 'pending').length,
    preparing: allOrders.filter((o) => o.status === 'preparing').length,
    late:      allOrders.filter((o) => o.status === 'late').length,
  };

  const filteredOrders = activeFilter === 'all'
    ? allOrders
    : allOrders.filter((o) => o.status === activeFilter);

  const apiOrderIds = useMemo(
    () => new Set(apiOrdersMapped.map((o) => o.id)),
    [apiOrdersMapped]
  );

  const handlePrimaryAction = (orderId) => {
    const order = filteredOrders.find((item) => item.id === orderId);
    if (!order) return;
    const next = nextStatusMap[order.status];
    if (!next) return;
    if (apiOrderIds.has(orderId)) {
      updateApiOrderStatus(orderId, next);
    } else {
      updateOrderStatus(orderId, next);
    }
  };

  const handleSecondaryAction = (orderId) => {
    if (apiOrderIds.has(orderId)) {
      updateApiOrderStatus(orderId, 'preparing');
    } else {
      updateOrderStatus(orderId, 'preparing');
    }
  };

  const renderFilterLabel = (option) => {
    if (option.key === 'all') return `${option.label} (${counts.all})`;
    return `${option.label} (${counts[option.key] ?? 0})`;
  };

  return (
    <SafeAreaView style={ordersStyles.container} edges={['top', 'left', 'right']}>
      {/* ── ENCABEZADO ── */}
      <View style={ordersStyles.header}>
        <View style={ordersStyles.headerTitleRow}>
          <Text style={ordersStyles.headerTitle}>Comandas</Text>
          <Text style={ordersStyles.headerSubtitle}>
            {firstName ? `HOLA, ${firstName.toUpperCase()} · COCINA` : 'COCINA'}
          </Text>
        </View>
        <View style={ordersStyles.headerActions}>
          <View style={ordersStyles.activeBadge}>
            <View style={ordersStyles.activeBadgeDot} />
            <Text style={ordersStyles.activeBadgeText}>{counts.all} activas</Text>
          </View>
          <TouchableOpacity style={ordersStyles.notificationButton}>
            <Icon name="notifications-outline" size={18} color={kitchenPalette.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── FILTROS POR ESTADO ── */}
      <View style={ordersStyles.filtersContainer}>
        <View style={ordersStyles.filtersRow}>
          {filterOptions.map((option) => {
            const isActive = activeFilter === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[ordersStyles.filterChip, isActive && ordersStyles.filterChipActive]}
                onPress={() => setActiveFilter(option.key)}
              >
                <Text style={[ordersStyles.filterChipText, isActive && ordersStyles.filterChipTextActive]}>
                  {renderFilterLabel(option)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── CONTENIDO PRINCIPAL ── */}
      {isLoading && allOrders.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={kitchenPalette.accent} />
          <Text style={{ color: kitchenPalette.muted, marginTop: 12, fontSize: 13 }}>
            Cargando comandas...
          </Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Icon name="cloud-offline-outline" size={48} color={kitchenPalette.muted} />
          <Text style={{ color: kitchenPalette.muted, textAlign: 'center', marginVertical: 12, fontSize: 14 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={refetch}
            style={{ backgroundColor: kitchenPalette.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 }}
          >
            <Text style={{ color: kitchenPalette.white, fontWeight: '700' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={ordersStyles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[kitchenPalette.accent]} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Icon name="checkmark-circle-outline" size={48} color={kitchenPalette.readyBg} />
              <Text style={{ textAlign: 'center', color: kitchenPalette.muted, marginTop: 12, fontSize: 14 }}>
                No hay comandas pendientes en este momento.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              statusLabel={statusConfig[item.status]?.label ?? item.status.toUpperCase()}
              onPrimaryAction={handlePrimaryAction}
              onSecondaryAction={handleSecondaryAction}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default Orders;