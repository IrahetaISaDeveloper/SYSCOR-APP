import { StyleSheet } from 'react-native';
import { lightColors, darkColors } from './CustomerMenu';

// Los colores salen de la paleta del menú (CustomerMenu.js), en claro y
// oscuro. Se arman las dos hojas una sola vez y la pantalla elige con
// `getCartStyles(isDark)`.

const build = (c) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: c.textDark,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    emptyFace: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      color: c.textGray,
    },
    itemsContainer: {
      gap: 16,
      marginBottom: 24,
    },
    itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 18,
      padding: 12,
      borderWidth: 1,
      borderColor: c.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    itemImage: {
      width: 84,
      height: 84,
      borderRadius: 14,
      backgroundColor: c.imagePlaceholder,
    },
    itemDetails: {
      flex: 1,
      marginLeft: 12,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    itemTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textDark,
      flex: 1,
    },
    itemPrice: {
      fontSize: 15,
      fontWeight: '700',
      color: c.primary,
      marginLeft: 8,
    },
    itemDescription: {
      fontSize: 12,
      color: c.textGray,
      marginVertical: 4,
    },
    summaryCard: {
      backgroundColor: c.surfaceMuted,
      borderRadius: 20,
      padding: 18,
      marginBottom: 16,
    },
    summaryTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: c.textGray,
      letterSpacing: 0.6,
      marginBottom: 14,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    summaryLabel: {
      fontSize: 14,
      color: c.textGray,
    },
    summaryValue: {
      fontSize: 14,
      color: c.textDark,
      fontWeight: '500',
    },
    tipValue: {
      fontSize: 14,
      color: '#16A34A',
      fontWeight: '600',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      paddingTop: 12,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: c.textDark,
    },
    totalPrice: {
      fontSize: 22,
      fontWeight: '800',
      color: c.primary,
    },
    bottomBar: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    checkoutButton: {
      backgroundColor: c.primary,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    checkoutText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    checkoutRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    checkoutDivider: {
      width: 1,
      height: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    checkoutPrice: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
    },
  });

const light = build(lightColors);
const dark = build(darkColors);

export const getCartStyles = (isDark) => (isDark ? dark : light);
