import { StyleSheet } from 'react-native';

// Paleta de colores globales utilizada en la pantalla de comandas de cocina
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

// Hoja de estilos de la pantalla de comandas de cocina
const ordersStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  headerLogo: {
    width: 70,
    height: 70,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  activeBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  filtersContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textDark,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: 12,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardLate: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  cardHeaderLeft: {},
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  statusLate: { backgroundColor: colors.danger },
  statusInProgress: { backgroundColor: colors.warning },
  statusPending: { backgroundColor: colors.pendingBg },
  statusReady: { backgroundColor: colors.success },
  customerName: {
    fontSize: 13,
    color: colors.textGray,
    marginTop: 4,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 4,
  },
  timeAgoText: {
    fontSize: 11,
    color: colors.textGray,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  itemsContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  itemNameDone: {
    textDecorationLine: 'line-through',
    color: colors.textGray,
  },
  itemCountBadge: {
    backgroundColor: colors.border,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textDark,
  },
  noteBox: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  noteBoxDanger: { backgroundColor: colors.dangerBg },
  noteBoxWarning: { backgroundColor: colors.warningBg },
  noteBoxNeutral: { backgroundColor: '#EFEFEF' },
  noteText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noteTextDanger: { color: colors.danger },
  noteTextWarning: { color: colors.warning },
  noteTextNeutral: { color: colors.textGray },
  noteTextItalic: {
    fontStyle: 'italic',
    color: colors.textGray,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonSpacing: {
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: '#DCE3F2',
  },
  darkButton: {
    backgroundColor: '#1A1A1A',
  },
  disabledButton: {
    backgroundColor: colors.disabledBg,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  secondaryButtonText: {
    color: '#3E5B9E',
  },
  disabledButtonText: {
    color: colors.disabledText,
  },
  readyCard: {
    backgroundColor: colors.successBg,
    borderColor: '#BFE3CC',
  },
  readyCheckIcon: {
    marginRight: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavItemActive: {
    backgroundColor: colors.primary,
    marginHorizontal: 12,
    borderRadius: 8,
    paddingVertical: 8,
  },
  bottomNavText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textGray,
    marginTop: 2,
  },
  bottomNavTextActive: {
    color: colors.white,
  },
});

export default ordersStyles;
export { colors };