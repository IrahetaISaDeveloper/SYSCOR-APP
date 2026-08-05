import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import ordersStyles, { colors } from '../styles/Orders';
import useOrders from '../hooks/useOrders';
import OrderCard from '../components/commons/OrderCard';

// Pestañas de filtrado. Los conteos se muestran entre paréntesis (excepto "Todas")
const filterOptions = [
  { key: 'all',       label: 'Todas' },
  { key: 'pending',   label: 'Pendientes' },
  { key: 'preparing', label: 'En Prep.' },
  { key: 'late',      label: 'Retrasadas' },
];

// Determina cuál es el siguiente estado lógico al presionar el botón principal de acción
const nextStatusMap = {
  pending:   'preparing',
  preparing: 'ready',
  late:      'ready',
};

/**
 * Pantalla 'Orders' — Dashboard de Cocina
 * Muestra las comandas activas con filtros, el empleado asignado, los platillos a cocinar
 * con sus especificaciones, y botones para avanzar el estado de cada orden.
 */
const Orders = ({ navigation }) => {
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

  // ── Combinar ambas fuentes eliminando duplicados por ID ──
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

  // Cargando si cualquiera de los dos está cargando (primera vez)
  const isLoading = (cartLoading && cartOrders.length === 0) || (apiOrdersLoading && apiOrdersMapped.length === 0);

  // Error solo si ambos fallaron
  const error = cartError && apiOrdersError ? `${cartError}\n${apiOrdersError}` : null;

  // Recargar ambos endpoints
  const refetch = () => { refetchCarts(); refetchApiOrders(); };

  // Conteos sobre la lista combinada
  const counts = {
    all:       allOrders.length,
    pending:   allOrders.filter((o) => o.status === 'pending').length,
    preparing: allOrders.filter((o) => o.status === 'preparing').length,
    late:      allOrders.filter((o) => o.status === 'late').length,
  };

  // Filtrado local por estado
  const filteredOrders = activeFilter === 'all'
    ? allOrders
    : allOrders.filter((o) => o.status === activeFilter);

  // IDs de órdenes del nuevo endpoint para saber a cuál update llamar
  const apiOrderIds = useMemo(
    () => new Set(apiOrdersMapped.map((o) => o.id)),
    [apiOrdersMapped]
  );

  // Avanza la orden al siguiente estado (Pendiente → En Preparación → Lista)
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

  // Botón secundario: regresa una orden retrasada a "En Preparación"
  const handleSecondaryAction = (orderId) => {
    if (apiOrderIds.has(orderId)) {
      updateApiOrderStatus(orderId, 'preparing');
    } else {
      updateOrderStatus(orderId, 'preparing');
    }
  };

  // Etiqueta del chip con el conteo de órdenes en ese estado
  const renderFilterLabel = (option) => {
    if (option.key === 'all') return `${option.label} (${counts.all})`;
    return `${option.label} (${counts[option.key] ?? 0})`;
  };

  return (
    <SafeAreaView style={ordersStyles.container}>

      {/* ── ENCABEZADO ── */}
      <View style={ordersStyles.header}>
        <View style={ordersStyles.headerTitleRow}>
          <Image
            source={require('../../assets/logo-el-corral.png')}
            style={ordersStyles.headerLogo}
            resizeMode="contain"
          />
          <Text style={ordersStyles.headerTitle}>El Corral</Text>
        </View>
        <View style={ordersStyles.headerActions}>
          <View style={ordersStyles.activeBadge}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.white }} />
            <Text style={ordersStyles.activeBadgeText}>{counts.all} activas</Text>
          </View>
          <Icon name="notifications-outline" size={22} color={colors.textDark} />
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
        // Estado: cargando por primera vez
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textGray, marginTop: 12, fontSize: 13 }}>
            Cargando comandas...
          </Text>
        </View>
      ) : error ? (
        // Estado: error de conexión
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Icon name="cloud-offline-outline" size={48} color={colors.textGray} />
          <Text style={{ color: colors.textGray, textAlign: 'center', marginVertical: 12, fontSize: 14 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={refetch}
            style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
          >
            <Text style={{ color: colors.white, fontWeight: '700' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Estado: lista de comandas de cocina
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={ordersStyles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Icon name="checkmark-circle-outline" size={48} color={colors.success} />
              <Text style={{ textAlign: 'center', color: colors.textGray, marginTop: 12, fontSize: 14 }}>
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

      {/* ── BARRA INFERIOR DE NAVEGACIÓN ── */}
      <View style={ordersStyles.bottomNav}>
        <View style={[ordersStyles.bottomNavItem, ordersStyles.bottomNavItemActive]}>
          <Icon name="grid" size={20} color={colors.white} />
          <Text style={[ordersStyles.bottomNavText, ordersStyles.bottomNavTextActive]}>Dashboard</Text>
        </View>
        <TouchableOpacity
          style={ordersStyles.bottomNavItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="person-outline" size={20} color={colors.textGray} />
          <Text style={ordersStyles.bottomNavText}>Perfil</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default Orders;