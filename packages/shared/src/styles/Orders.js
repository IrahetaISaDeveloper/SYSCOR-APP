import { StyleSheet } from 'react-native';

// Paleta de colores globales utilizada en la pantalla de comandas de cocina.
// NOTA: se mantiene sin cambios porque otras pantallas (ej. Profile del cliente)
// importan `colors` desde este archivo.
const colors = {
  primary: '#C62828',       // Rojo corporativo El Corral
  primaryDark: '#9B1B1B',   // Rojo oscuro para estados presionados o bordes
  background: '#F5F5F5',    // Fondo gris claro de la pantalla
  white: '#FFFFFF',         // Blanco
  textDark: '#1A1A1A',      // Texto principal (casi negro)
  textGray: '#6B6B6B',      // Texto secundario o deshabilitado
  border: '#E5E5E5',        // Color gris claro para divisores y bordes de tarjetas
  danger: '#C62828',        // Rojo para alertas o comanda retrasada
  dangerBg: '#FCE9E9',      // Fondo rosado claro para notas de peligro
  warning: '#E38B29',       // Naranja para orden en proceso
  warningBg: '#FCEFDD',     // Fondo naranja claro para notas de advertencia
  success: '#2E8B57',       // Verde para orden lista
  successBg: '#E7F5EC',     // Fondo verde claro para tarjeta entregada/lista
  pendingBg: '#3A3A3A',     // Gris oscuro para comanda pendiente
  disabledBg: '#D9D9D9',    // Gris para botones deshabilitados
  disabledText: '#8A8A8A',  // Texto deshabilitado
};

// Paleta del diseño "Cocina · Comandas" (mockup) — usada por la pantalla de
// comandas de cocina y su tarjeta (OrderCard). Local a esta pantalla, no
// reemplaza `colors` para no afectar otras pantallas que ya lo consumen.
const kitchenPalette = {
  bg: '#F7F3E9',
  ink: '#1B1613',
  surface: '#FFFFFF',
  surface2: '#F1EAD9',
  line: '#E3DACA',
  muted: '#6E665C',
  accent: '#8E2222',
  price: '#A8261C',
  white: '#FFFFFF',
  late: '#C62828',
  pending: '#3A3A3A',
  preparing: '#E38B29',
  ready: '#2E8B57',
  comboDot: '#8E2222',
  extraDot: '#E38B29',
  drinkDot: '#2E8B57',
  warnInk: '#8A5A00',
  warnSurface: '#FBF0D3',
  warnLine: '#EDD9A3',
  warnText: '#6B4E00',
};

// Hoja de estilos de la pantalla de comandas de cocina
const ordersStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: kitchenPalette.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'column',
    gap: 2,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: kitchenPalette.ink,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: 'monospace',
    fontSize: 10.5,
    color: kitchenPalette.muted,
  },
  headerLogo: {
    width: 70,
    height: 70,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  activeBadge: {
    backgroundColor: kitchenPalette.accent,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeBadgeText: {
    fontFamily: 'monospace',
    color: kitchenPalette.white,
    fontSize: 11,
    fontWeight: '500',
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: kitchenPalette.surface,
    borderWidth: 1,
    borderColor: kitchenPalette.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 10,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: kitchenPalette.line,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: kitchenPalette.surface,
  },
  filterChipActive: {
    backgroundColor: kitchenPalette.accent,
    borderColor: kitchenPalette.accent,
  },
  filterChipText: {
    color: kitchenPalette.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: kitchenPalette.white,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 90,
    gap: 12,
  },
  card: {
    backgroundColor: kitchenPalette.surface,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: kitchenPalette.line,
    overflow: 'hidden',
  },
  cardLate: {
    borderColor: kitchenPalette.price,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 10,
  },
  cardHeaderLeft: {
    gap: 4,
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumber: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '500',
    color: kitchenPalette.ink,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontFamily: 'monospace',
    fontSize: 9.5,
    letterSpacing: 0.7,
    fontWeight: '500',
    color: kitchenPalette.white,
  },
  statusLate: { backgroundColor: kitchenPalette.late },
  statusInProgress: { backgroundColor: kitchenPalette.preparing },
  statusPending: { backgroundColor: kitchenPalette.pending },
  statusReady: { backgroundColor: kitchenPalette.ready },
  customerName: {
    fontSize: 11.5,
    color: kitchenPalette.muted,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '500',
  },
  timeAgoText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: kitchenPalette.muted,
  },
  divider: {
    height: 1,
    backgroundColor: kitchenPalette.line,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 14,
    paddingBottom: 13,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: kitchenPalette.accent,
  },
  secondaryButton: {
    backgroundColor: kitchenPalette.surface,
    borderWidth: 1,
    borderColor: kitchenPalette.line,
  },
  darkButton: {
    backgroundColor: kitchenPalette.ink,
  },
  disabledButton: {
    backgroundColor: kitchenPalette.surface2,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: kitchenPalette.white,
  },
  secondaryButtonText: {
    color: kitchenPalette.muted,
  },
  darkButtonText: {
    color: kitchenPalette.bg,
  },
  readyCard: {
    borderColor: kitchenPalette.line,
  },
});

export default ordersStyles;
export { colors, kitchenPalette };
