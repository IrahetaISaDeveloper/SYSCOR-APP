import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import ordersStyles, { colors } from '../../styles/Orders';

// ── ESTILOS LOCALES (para las secciones nuevas de esta tarjeta) ──────
const local = StyleSheet.create({
  // Sección de empleado asignado
  waiterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
  },
  waiterLabel: {
    fontSize: 11,
    color: '#5B6A99',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  waiterName: {
    fontSize: 12,
    color: '#2B3E82',
    fontWeight: '700',
  },

  // Cabecera de la sección "Qué cocinar"
  cookSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 5,
  },
  cookSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textGray,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Tarjeta de cada ítem a cocinar
  itemCard: {
    marginHorizontal: 14,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    overflow: 'hidden',
  },
  itemCardLate: {
    borderColor: '#E8B4B4',
    backgroundColor: '#FFF8F8',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  itemTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },

  // Caja de especificaciones / notas del cliente
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3CD',
    borderTopWidth: 1,
    borderTopColor: '#FFE08A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    color: '#7A5C00',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A07800',
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  notesColumn: {
    flex: 1,
  },
});

// Colores de los puntos indicadores según el tipo de ítem
const itemTypeDotColor = {
  combo: '#8B1E1E',
  extra: '#E38B29',
  drink: '#2E8B57',
};

// Configuración de estilos del badge de estado
const statusBadgeStyleMap = {
  late:      ordersStyles.statusLate,
  preparing: ordersStyles.statusInProgress,
  pending:   ordersStyles.statusPending,
  ready:     ordersStyles.statusReady,
  cancelled: ordersStyles.statusPending,
};

// Color del reloj según urgencia
const getTimeColor = (status) => {
  if (status === 'late')    return colors.danger;
  if (status === 'ready')   return colors.success;
  if (status === 'preparing') return colors.warning;
  return colors.textDark;
};

/**
 * Componente OrderCard
 * Muestra una comanda de cocina con:
 *  - Número de orden, estado y tiempo
 *  - Empleado (mesero) asignado
 *  - Lista de platillos a cocinar con sus especificaciones (ej. "sin cebolla")
 *  - Botones de acción para cambiar el estado
 */
const OrderCard = ({ order, statusLabel, onPrimaryAction, onSecondaryAction }) => {
  const isLate  = order.status === 'late';
  const isReady = order.status === 'ready';

  // ── BOTONES DE ACCIÓN según el estado actual ──────────────────────
  const renderActions = () => {
    if (order.status === 'late') {
      return (
        <View style={ordersStyles.actionsRow}>
          <TouchableOpacity
            style={[ordersStyles.actionButton, ordersStyles.secondaryButton, ordersStyles.actionButtonSpacing]}
            onPress={() => onSecondaryAction(order.id)}
          >
            <Text style={[ordersStyles.actionButtonText, ordersStyles.secondaryButtonText]}>Continuar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[ordersStyles.actionButton, ordersStyles.primaryButton]}
            onPress={() => onPrimaryAction(order.id)}
          >
            <Icon name="checkmark" size={16} color={colors.white} style={{ marginRight: 4 }} />
            <Text style={ordersStyles.actionButtonText}>Lista</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (order.status === 'preparing') {
      return (
        <View style={ordersStyles.actionsRow}>
          <TouchableOpacity
            style={[ordersStyles.actionButton, ordersStyles.primaryButton]}
            onPress={() => onPrimaryAction(order.id)}
          >
            <Icon name="checkmark" size={16} color={colors.white} style={{ marginRight: 4 }} />
            <Text style={ordersStyles.actionButtonText}>Marcar Lista</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (order.status === 'pending') {
      return (
        <View style={ordersStyles.actionsRow}>
          <TouchableOpacity
            style={[ordersStyles.actionButton, ordersStyles.darkButton]}
            onPress={() => onPrimaryAction(order.id)}
          >
            <Icon name="flame" size={16} color={colors.white} style={{ marginRight: 4 }} />
            <Text style={ordersStyles.actionButtonText}>Empezar a Preparar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (order.status === 'ready') {
      return (
        <View style={ordersStyles.actionsRow}>
          <View style={[ordersStyles.actionButton, ordersStyles.disabledButton, { flexDirection: 'row' }]}>
            <Icon name="checkmark-circle" size={16} color={colors.success} style={{ marginRight: 4 }} />
            <Text style={[ordersStyles.actionButtonText, { color: colors.success }]}>Entregada al mesero</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[
      ordersStyles.card,
      isLate  && ordersStyles.cardLate,
      isReady && ordersStyles.readyCard,
    ]}>

      {/* ── ENCABEZADO: #ID, Estado y Tiempo ── */}
      <View style={ordersStyles.cardHeader}>
        <View style={ordersStyles.cardHeaderLeft}>
          <View style={ordersStyles.orderNumberRow}>
            <Text style={ordersStyles.orderNumber}>#{order.displayId || order.id}</Text>
            <View style={[ordersStyles.statusBadge, statusBadgeStyleMap[order.status] || ordersStyles.statusPending]}>
              <Text style={ordersStyles.statusBadgeText}>{statusLabel}</Text>
            </View>
          </View>
          {order.tableLabel && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 }}>
              <Icon name="grid-outline" size={12} color={colors.textGray} />
              <Text style={ordersStyles.customerName}>{order.tableLabel}</Text>
            </View>
          )}
        </View>
        <View style={ordersStyles.cardHeaderRight}>
          <View style={ordersStyles.timeRow}>
            {isReady
              ? <Icon name="checkmark-circle" size={16} color={colors.success} />
              : <Icon name="time-outline" size={16} color={getTimeColor(order.status)} />
            }
            <Text style={[ordersStyles.timeText, { color: getTimeColor(order.status) }]}>
              {order.time}
            </Text>
          </View>
          {!!order.timeAgo && (
            <Text style={ordersStyles.timeAgoText}>{order.timeAgo}</Text>
          )}
        </View>
      </View>

      {/* ── EMPLEADO ASIGNADO (mesero) ── */}
      {order.waiterName && (
        <View style={local.waiterRow}>
          <Icon name="person-circle-outline" size={15} color="#5B6A99" />
          <Text style={local.waiterLabel}>ASIGNADO A </Text>
          <Text style={local.waiterName}>{order.waiterName}</Text>
        </View>
      )}

      <View style={ordersStyles.divider} />

      {/* ── PLATILLOS A COCINAR con sus especificaciones ── */}
      <View style={local.cookSectionHeader}>
        <Icon name="restaurant-outline" size={13} color={colors.textGray} />
        <Text style={local.cookSectionLabel}>Qué cocinar</Text>
      </View>

      <View style={{ paddingBottom: 6 }}>
        {(order.items || []).map((item) => (
          <View
            key={item.id}
            style={[local.itemCard, isLate && local.itemCardLate]}
          >
            {/* Nombre del platillo con punto de color según tipo (combo / extra / bebida) */}
            <View style={local.itemHeader}>
              <View style={[
                local.itemTypeDot,
                { backgroundColor: itemTypeDotColor[item.itemType] || colors.primary },
              ]} />
              <Text style={local.itemName}>{item.name}</Text>
              {item.hasNotes && (
                <Icon name="alert-circle" size={16} color="#E38B29" />
              )}
            </View>

            {/* Especificaciones del cliente (notas como "sin cebolla", "extra salsa") */}
            {item.hasNotes && (
              <View style={local.notesBox}>
                <Icon name="create-outline" size={14} color="#A07800" />
                <View style={local.notesColumn}>
                  <Text style={local.notesLabel}>ESPECIFICACIONES</Text>
                  <Text style={local.notesText}>{item.notes}</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* ── BOTONES DE ACCIÓN ── */}
      {renderActions()}

    </View>
  );
};

export default OrderCard;