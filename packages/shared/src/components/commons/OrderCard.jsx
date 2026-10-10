import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import ordersStyles, { kitchenPalette } from '../../styles/Orders';

// ── ESTILOS LOCALES (secciones que no están en la hoja de estilos general) ──
const local = StyleSheet.create({
  // Barra de empleado (mesero) asignado
  waiterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: kitchenPalette.surface2,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 7,
  },
  waiterLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 0.4,
    color: kitchenPalette.muted,
  },
  waiterName: {
    fontSize: 11.5,
    color: kitchenPalette.ink,
    fontWeight: '700',
  },

  // Cabecera de la sección "Qué cocinar"
  cookSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 6,
  },
  cookSectionLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 0.6,
    color: kitchenPalette.muted,
  },

  // Tarjeta de cada ítem a cocinar
  itemsList: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 7,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: kitchenPalette.line,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 9,
    gap: 9,
  },
  itemTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: kitchenPalette.ink,
  },

  // Caja de especificaciones / notas del cliente
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: kitchenPalette.warnSurface,
    borderTopWidth: 1,
    borderTopColor: kitchenPalette.warnLine,
    paddingHorizontal: 11,
    paddingVertical: 7,
    gap: 7,
  },
  notesColumn: {
    flex: 1,
    gap: 1,
  },
  notesLabel: {
    fontFamily: 'monospace',
    fontSize: 9.5,
    letterSpacing: 0.4,
    color: kitchenPalette.warnInk,
  },
  notesText: {
    fontSize: 11.5,
    fontWeight: '500',
    fontStyle: 'italic',
    color: kitchenPalette.warnText,
  },
});

// Colores de los puntos indicadores según el tipo de ítem
const itemTypeDotColor = {
  combo: kitchenPalette.comboDot,
  extra: kitchenPalette.extraDot,
  drink: kitchenPalette.drinkDot,
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
  if (status === 'late')      return kitchenPalette.price;
  if (status === 'ready')     return kitchenPalette.ready;
  if (status === 'preparing') return kitchenPalette.preparing;
  return kitchenPalette.ink;
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
            style={[ordersStyles.actionButton, ordersStyles.secondaryButton]}
            onPress={() => onSecondaryAction(order.id)}
          >
            <Text style={[ordersStyles.actionButtonText, ordersStyles.secondaryButtonText]}>Continuar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[ordersStyles.actionButton, ordersStyles.primaryButton]}
            onPress={() => onPrimaryAction(order.id)}
          >
            <Icon name="checkmark" size={16} color={kitchenPalette.white} style={{ marginRight: 4 }} />
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
            <Icon name="checkmark" size={16} color={kitchenPalette.white} style={{ marginRight: 4 }} />
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
            <Icon name="flame" size={16} color={kitchenPalette.bg} style={{ marginRight: 4 }} />
            <Text style={[ordersStyles.actionButtonText, ordersStyles.darkButtonText]}>Empezar a preparar</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (order.status === 'ready') {
      return (
        <View style={ordersStyles.actionsRow}>
          <View style={[ordersStyles.actionButton, ordersStyles.disabledButton, { flexDirection: 'row' }]}>
            <Icon name="checkmark-circle" size={16} color={kitchenPalette.ready} style={{ marginRight: 4 }} />
            <Text style={[ordersStyles.actionButtonText, { color: kitchenPalette.ready }]}>Entregada al mesero</Text>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Icon name="grid-outline" size={13} color={kitchenPalette.muted} />
              <Text style={ordersStyles.customerName}>{order.tableLabel}</Text>
            </View>
          )}
        </View>
        <View style={ordersStyles.cardHeaderRight}>
          <View style={ordersStyles.timeRow}>
            {isReady
              ? <Icon name="checkmark-circle" size={15} color={kitchenPalette.ready} />
              : <Icon name="time-outline" size={15} color={getTimeColor(order.status)} />
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
          <Icon name="person-circle-outline" size={15} color={kitchenPalette.muted} />
          <Text style={local.waiterLabel}>ASIGNADO A</Text>
          <Text style={local.waiterName}>{order.waiterName}</Text>
        </View>
      )}

      <View style={ordersStyles.divider} />

      {/* ── PLATILLOS A COCINAR con sus especificaciones ── */}
      <View style={local.cookSectionHeader}>
        <Icon name="restaurant-outline" size={14} color={kitchenPalette.muted} />
        <Text style={local.cookSectionLabel}>QUÉ COCINAR</Text>
      </View>

      <View style={local.itemsList}>
        {(order.items || []).map((item) => (
          <View key={item.id} style={local.itemCard}>
            {/* Nombre del platillo con punto de color según tipo (combo / extra / bebida) */}
            <View style={local.itemHeader}>
              <View style={[
                local.itemTypeDot,
                { backgroundColor: itemTypeDotColor[item.itemType] || kitchenPalette.accent },
              ]} />
              <Text style={local.itemName}>{item.name}</Text>
              {item.hasNotes && (
                <Icon name="alert-circle" size={16} color={kitchenPalette.warnInk} />
              )}
            </View>

            {/* Especificaciones del cliente (notas como "sin cebolla", "extra salsa") */}
            {item.hasNotes && (
              <View style={local.notesBox}>
                <Icon name="create-outline" size={14} color={kitchenPalette.warnInk} />
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
