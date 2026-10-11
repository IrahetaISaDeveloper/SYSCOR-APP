import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { textStyles, FONT } from '@syscor/shared/src/styles/typography';
import { useAuthMetrics } from '@syscor/shared/src/styles/authTheme';
import { getTableState, getTableStates, TABLE_STATE_ORDER } from '../../styles/waiterTheme';
import { useTheme, makeStyles } from "../../theme/ThemeContext";

// Croquis del comedor de una planta, a partir de los planos del local (el
// mismo que ve el cliente al reservar):
//
//   Planta baja: arriba la cocina, a la izquierda el parqueo y a la derecha
//   los ventanales; abajo la entrada, los baños y la terraza.
//   Planta alta: la terraza, con la escalera y el baño a la derecha.
//
// Las mesas traen su lugar en `position` (porcentaje del plano de su planta,
// guardado por scripts/setupTableLayout.js del backend). `source` es el
// rectángulo de ese plano que ocupan las mesas y `area` el hueco del dibujo
// donde se acomodan, así el croquis respeta el orden real pero se ve amplio.
const PLANS = {
  1: {
    aspectRatio: 0.62,
    source: { x: 3, y: 35, w: 94, h: 52 },
    area: { x: 14, y: 16.5, w: 72, h: 58 },
    zones: [
      { label: 'COCINA', icon: 'restaurant-outline', x: 22, y: 2.5, w: 56, h: 8 },
      { label: 'PARQUEO', icon: 'car-outline', x: 2, y: 16, w: 7, h: 61, vertical: true },
      { label: 'VENTANALES', icon: 'grid-outline', x: 91, y: 16, w: 7, h: 61, vertical: true },
      { label: 'ENTRADA', icon: 'enter-outline', x: 2, y: 86.5, w: 25, h: 11 },
      { label: 'BAÑOS', icon: 'people-outline', x: 29, y: 86.5, w: 18.5, h: 11 },
      { label: 'TERRAZA', icon: 'leaf-outline', x: 52, y: 80, w: 46, h: 17.5, green: true },
    ],
  },
  2: {
    aspectRatio: 0.62,
    source: { x: 0, y: 0, w: 100, h: 100 },
    area: { x: 4, y: 13, w: 92, h: 85 },
    zones: [
      { label: 'TERRAZA', icon: 'leaf-outline', x: 22, y: 2, w: 56, h: 8, green: true },
      // Escalera y baño, en las mismas coordenadas que las mesas (source).
      { label: 'ESCALERA', icon: 'trending-up-outline', x: 63.5, y: 50.5, w: 18.25, h: 49.5, vertical: true, inArea: true },
      { label: 'BAÑO', icon: 'people-outline', x: 81.75, y: 38, w: 18.25, h: 62, vertical: true, inArea: true },
    ],
  },
};

// Pasa un rectángulo del plano del backend al hueco del dibujo.
const toArea = (plan, r) => ({
  left: `${plan.area.x + ((r.x - plan.source.x) / plan.source.w) * plan.area.w}%`,
  top: `${plan.area.y + ((r.y - plan.source.y) / plan.source.h) * plan.area.h}%`,
  width: `${(r.w / plan.source.w) * plan.area.w}%`,
  height: `${(r.h / plan.source.h) * plan.area.h}%`,
});

const DOT_GAP = 16;

// Fondo punteado del plano. Solo depende del tamaño, así que no se vuelve a
// dibujar cuando cambian las mesas.
const DotGrid = memo(function DotGrid({ width, height }) {
  const styles = useStyles();
  if (!width || !height) return null;
  const dots = [];
  for (let y = DOT_GAP / 2; y < height; y += DOT_GAP) {
    for (let x = DOT_GAP / 2; x < width; x += DOT_GAP) {
      dots.push(<View key={`${x}-${y}`} style={[styles.dot, { left: x, top: y }]} />);
    }
  }
  return <View style={StyleSheet.absoluteFill} pointerEvents="none">{dots}</View>;
});

const hasReadyOrder = (table) => (table.activeOrders || []).some((o) => o.status === 'ready');

export default function WaiterFloorPlan({ floor, tables, onTablePress }) {
  const { c, isDark } = useTheme();
  const styles = useStyles();
  const { ms } = useAuthMetrics();
  const plan = PLANS[floor] || PLANS[1];
  const [size, setSize] = useState({ width: 0, height: 0 });

  const placed = tables.filter((t) => t.position);
  const unplaced = tables.filter((t) => !t.position);

  return (
    <View style={{ gap: ms(12) }}>
      <View
        style={[styles.plan, { aspectRatio: plan.aspectRatio, borderRadius: ms(16) }]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width !== size.width || height !== size.height) setSize({ width, height });
        }}
      >
        <DotGrid width={size.width} height={size.height} />

        {/* ── ZONAS DEL LOCAL ── */}
        {plan.zones.map((z) => (
          <View
            key={z.label}
            style={[
              styles.zone,
              z.green && styles.zoneGreen,
              { borderRadius: ms(8) },
              z.inArea
                ? toArea(plan, z)
                : { left: `${z.x}%`, top: `${z.y}%`, width: `${z.w}%`, height: `${z.h}%` },
            ]}
          >
            <View
              style={[
                styles.zoneLabel,
                { gap: ms(5) },
                z.vertical && { transform: [{ rotate: '90deg' }], width: ms(140) },
              ]}
            >
              <Icon name={z.icon} size={ms(12)} color={c.textGray} />
              <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(9.5) }]} numberOfLines={1}>
                {z.label}
              </Text>
            </View>
          </View>
        ))}

        {/* ── MESAS ── */}
        {placed.map((table) => {
          const state = getTableState(table.status, isDark);
          const ready = table.status === 'ocupada' && hasReadyOrder(table);
          return (
            <TouchableOpacity
              key={table._id}
              onPress={() => onTablePress(table)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Mesa ${table.number}, ${state.label.toLowerCase()}`}
              style={[
                styles.table,
                toArea(plan, table.position),
                { backgroundColor: state.fill, borderColor: state.border, borderRadius: ms(9) },
              ]}
            >
              <Text style={{ fontFamily: FONT.monoSemiBold, fontSize: ms(15), color: state.ink }}>
                {table.number}
              </Text>
              {table.capacity ? (
                <Text style={{ fontFamily: FONT.mono, fontSize: ms(9), color: state.ink, opacity: 0.75 }}>
                  {table.capacity}p
                </Text>
              ) : null}
              {/* Hay platillos listos para llevar a esta mesa */}
              {ready ? (
                <View
                  style={[
                    styles.readyDot,
                    { width: ms(14), height: ms(14), borderRadius: ms(7), top: -ms(6), right: -ms(6) },
                  ]}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── LEYENDA ── */}
      <View style={[styles.legend, { columnGap: ms(12), rowGap: ms(6) }]}>
        {TABLE_STATE_ORDER.map((key) => {
          const state = getTableStates(isDark)[key];
          return (
            <View key={key} style={[styles.row, { gap: ms(5) }]}>
              <View
                style={[
                  styles.swatch,
                  { width: ms(12), height: ms(12), borderColor: state.border, backgroundColor: state.fill },
                ]}
              />
              <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(11.5) }]}>{state.label}</Text>
            </View>
          );
        })}
        <View style={[styles.row, { gap: ms(5) }]}>
          <View style={[styles.readyLegend, { width: ms(9), height: ms(9), borderRadius: ms(4.5) }]} />
          <Text style={[textStyles.body, { color: c.textGray, fontSize: ms(11.5) }]}>Comanda lista</Text>
        </View>
      </View>

      {/* Mesas que aún no tienen lugar en el croquis: se pueden tocar igual */}
      {unplaced.length > 0 ? (
        <View style={{ gap: ms(8) }}>
          <Text style={[textStyles.kicker, { color: c.textGray, fontSize: ms(10.5) }]}>
            SIN LUGAR EN EL CROQUIS
          </Text>
          <View style={[styles.wrap, { gap: ms(8) }]}>
            {unplaced.map((table) => {
              const state = getTableState(table.status, isDark);
              return (
                <TouchableOpacity
                  key={table._id}
                  onPress={() => onTablePress(table)}
                  activeOpacity={0.75}
                  style={[
                    styles.chip,
                    {
                      borderColor: state.border,
                      backgroundColor: state.fill,
                      borderRadius: ms(10),
                      paddingHorizontal: ms(12),
                      paddingVertical: ms(7),
                    },
                  ]}
                >
                  <Text style={{ fontFamily: FONT.monoSemiBold, color: state.ink, fontSize: ms(12.5) }}>
                    Mesa {table.number}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ c, p, isDark }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  plan: {
    width: '100%',
    borderWidth: 2,
    borderColor: c.textDark,
    backgroundColor: isDark ? '#1C1815' : '#F0E7D7',
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: isDark ? 'rgba(220,200,170,0.12)' : 'rgba(120,100,70,0.22)',
  },
  zone: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: isDark ? '#4A4038' : '#B9AE9C',
    backgroundColor: isDark ? '#26201C' : '#E6DCC9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneGreen: {
    backgroundColor: isDark ? '#1E261A' : '#E1E8D6',
    borderColor: isDark ? '#3E4A34' : '#B7C2A6',
  },
  zoneLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  table: {
    position: 'absolute',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyDot: {
    position: 'absolute',
    backgroundColor: '#1E8E4E',
    borderWidth: 2,
    borderColor: c.white,
  },
  readyLegend: {
    backgroundColor: '#1E8E4E',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  swatch: {
    borderRadius: 3,
    borderWidth: 1.5,
  },
  chip: {
    borderWidth: 1.5,
  },
}));
