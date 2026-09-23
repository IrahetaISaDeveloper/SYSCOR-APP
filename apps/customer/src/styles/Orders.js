import { StyleSheet } from 'react-native';

// Colores de estado de "Mis pedidos". Son iguales en claro y oscuro, como en
// el diseño: la insignia lleva el color lleno y el texto encima.
export const orderStatusColors = {
  success: '#1FC47A',
  warning: '#F2A33A',
  danger: '#D93636',
  muted: '#8E8E93',
};

// Franja de "tiempo" dentro de la tarjeta del pedido en curso.
export const getOrderBandColor = (isDark) => (isDark ? '#1E1C1A' : '#F3EEDF');

// Solo lo que no depende del tema. El color se aplica en la pantalla.
const ordersStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── ENCABEZADO ──────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  roundButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  // ── PESTAÑAS Y FILTROS ──────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },

  // ── TARJETA DEL PEDIDO EN CURSO ─────────────────────
  activeCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },

  // Progreso: tres puntos unidos por una línea.
  progressTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLine: {
    flex: 1,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  band: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outlineButton: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  // ── PEDIDOS ANTERIORES ──────────────────────────────
  pastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  pastIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ordersStyles;
