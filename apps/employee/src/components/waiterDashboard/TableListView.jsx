import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { waiterColors as c, getTableState, ZONE_LABELS } from '../../styles/waiterTheme';
import { formatElapsed, formatMoney, minutesSince, pluralize } from '../../constants/waiterStatus';

// Detalle de una mesa en una línea: quién está, cuánto lleva y su cuenta.
const describe = (table) => {
  const orders = table.activeOrders || [];

  if (table.status === 'ocupada') {
    const parts = [];
    if (table.customerName) parts.push(table.customerName);
    if (table.peopleCount) parts.push(pluralize(table.peopleCount, 'persona'));
    const elapsed = formatElapsed(minutesSince(table.occupiedAt));
    if (elapsed) parts.push(elapsed);
    return parts.join(' · ') || 'Con clientes';
  }
  if (table.status === 'reservada') {
    const parts = [table.fromAppReservation ? 'Reserva de la app' : 'Reservada'];
    if (table.customerName) parts.push(table.customerName);
    if (table.peopleCount) parts.push(pluralize(table.peopleCount, 'persona'));
    return parts.join(' · ');
  }
  if (table.status === 'limpieza') return 'Pendiente de limpiar';
  return orders.length ? pluralize(orders.length, 'comanda') : 'Lista para recibir clientes';
};

export default function TableListView({ tables, onTablePress }) {
  const { ms } = useAuthMetrics();

  return (
    <View style={{ gap: ms(10) }}>
      {tables.map((table) => {
        const state = getTableState(table.status);
        const orders = table.activeOrders || [];
        const total = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const readyCount = orders.filter((o) => o.status === 'ready').length;
        const meta = [
          table.zone ? ZONE_LABELS[table.zone] : null,
          table.capacity ? `${table.capacity} lugares` : null,
        ]
          .filter(Boolean)
          .join(' · ');

        return (
          <TouchableOpacity
            key={table._id}
            onPress={() => onTablePress(table)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Mesa ${table.number}, ${state.label.toLowerCase()}`}
            style={[
              styles.card,
              { borderRadius: ms(16), padding: ms(14), gap: ms(12) },
            ]}
          >
            {/* Número de la mesa con el color de su estado */}
            <View
              style={[
                styles.badge,
                {
                  width: ms(50),
                  height: ms(50),
                  borderRadius: ms(14),
                  backgroundColor: table.status === 'ocupada' ? state.color : state.tint,
                  borderColor: state.color,
                },
              ]}
            >
              <Text
                style={[
                  textStyles.title,
                  { fontSize: ms(19), color: table.status === 'ocupada' ? c.white : c.textDark },
                ]}
              >
                {table.number}
              </Text>
            </View>

            <View style={{ flex: 1, gap: ms(3) }}>
              <View style={[styles.row, { gap: ms(8) }]}>
                <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(15.5) }]}>
                  Mesa {table.number}
                </Text>
                <View
                  style={[
                    styles.row,
                    styles.pill,
                    {
                      backgroundColor: state.tint,
                      borderRadius: ms(8),
                      paddingHorizontal: ms(7),
                      paddingVertical: ms(2),
                      gap: ms(4),
                    },
                  ]}
                >
                  <Icon name={state.icon} size={ms(11)} color={state.color} />
                  <Text style={[textStyles.kicker, { color: state.color, fontSize: ms(9.5) }]}>
                    {state.label.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text
                style={[textStyles.body, { color: c.textGray, fontSize: ms(12.5) }]}
                numberOfLines={1}
              >
                {describe(table)}
              </Text>

              {meta ? (
                <Text style={[textStyles.body, { color: c.textLight, fontSize: ms(11.5) }]} numberOfLines={1}>
                  {meta}
                </Text>
              ) : null}

              {readyCount > 0 ? (
                <View style={[styles.row, { gap: ms(5), marginTop: ms(2) }]}>
                  <Icon name="checkmark-circle" size={ms(13)} color={c.success} />
                  <Text style={[textStyles.link, { color: c.success, fontSize: ms(12) }]}>
                    {readyCount === 1 ? 'Comanda lista para servir' : `${readyCount} comandas listas para servir`}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={{ alignItems: 'flex-end', gap: ms(4) }}>
              {total > 0 ? (
                <>
                  <Text style={[textStyles.title, { color: c.textDark, fontSize: ms(15) }]}>
                    {formatMoney(total)}
                  </Text>
                  <Text style={[textStyles.kicker, { color: c.textLight, fontSize: ms(9) }]}>
                    {pluralize(orders.length, 'COMANDA').toUpperCase()}
                  </Text>
                </>
              ) : null}
              <Icon name="chevron-forward" size={ms(18)} color={c.textLight} />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    alignSelf: 'flex-start',
  },
});
