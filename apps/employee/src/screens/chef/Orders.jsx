import React from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@syscor/shared/src/context/AuthContext';
import { getFirstName } from '@syscor/shared/src/utils/userDisplay';
import { employeePalette } from '@syscor/shared/src/styles/employeePalette';
import useOrders from '../../hooks/useOrders';
import KitchenHeader from '../../components/kitchen/KitchenHeader';
import KitchenOrderCard from '../../components/kitchen/KitchenOrderCard';
import SymbolIcon from '../../components/commons/SymbolIcon';
import { KITCHEN_FILTERS } from '../../constants/kitchenStatus';
import styles from '../../styles/kitchenOrdersScreenStyles';

const EMPTY_MESSAGES = {
  all: 'Aún no hay comandas registradas.',
  pending: 'No hay comandas pendientes.',
  preparing: 'No hay comandas en preparación.',
  late: 'No hay comandas retrasadas.',
  ready: 'No hay comandas listas por entregar.',
  delivered: 'No hay comandas entregadas.',
  cancelled: 'No hay comandas canceladas.',
};

export default function Orders() {
  const { user } = useAuth();
  const firstName = getFirstName(user);

  const {
    orders,
    counts,
    activeFilter,
    setActiveFilter,
    isLoading,
    refreshing,
    error,
    onRefresh,
    reload,
    updatingId,
    advanceOrder,
    resumeOrder,
    newPendingCount,
    acknowledgeNewOrders,
  } = useOrders();

  const renderContent = () => {
    if (isLoading && orders.length === 0) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={employeePalette.accent} />
          <Text style={styles.stateText}>Cargando comandas...</Text>
        </View>
      );
    }

    if (error && orders.length === 0) {
      return (
        <View style={styles.stateBox}>
          <SymbolIcon name="cloud_off" size={40} color={employeePalette.muted} />
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => reload()} activeOpacity={0.85}>
            <SymbolIcon name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
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
        renderItem={({ item }) => (
          <KitchenOrderCard
            order={item}
            updating={updatingId === item.id}
            onAdvance={advanceOrder}
            onResume={resumeOrder}
          />
        )}
        ListEmptyComponent={
          <View style={styles.stateBox}>
            <SymbolIcon name="task_alt" size={40} color={employeePalette.muted} />
            <Text style={styles.stateText}>{EMPTY_MESSAGES[activeFilter]}</Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KitchenHeader
        title="Comandas"
        eyebrow={firstName ? `HOLA, ${firstName.toUpperCase()} · COCINA` : 'COCINA'}
        pillText={`${counts.active} ${counts.active === 1 ? 'activa' : 'activas'}`}
        icon="notifications"
        iconBadge={newPendingCount}
        onIconPress={acknowledgeNewOrders}
        iconLabel="Ver comandas nuevas"
      />

      <ScrollView
        horizontal
        style={styles.filtersScroll}
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}
      >
        {KITCHEN_FILTERS.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {filter.label} ({counts[filter.key] ?? 0})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {renderContent()}
    </SafeAreaView>
  );
}
