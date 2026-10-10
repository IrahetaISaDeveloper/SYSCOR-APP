import { StyleSheet } from 'react-native';
import { lightColors, darkColors } from './CustomerMenu';

// Los colores salen de la paleta del menú (CustomerMenu.js), en claro y
// oscuro. Se arman las dos hojas una sola vez y la pantalla elige con
// `getPaymentStyles(isDark)`.

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
    sectionSubtitle: {
      fontSize: 11,
      fontWeight: '800',
      color: c.textGray,
      letterSpacing: 0.8,
    },
    totalHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginTop: 4,
      marginBottom: 16,
    },
    totalTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: c.textDark,
    },
    totalPriceHeader: {
      fontSize: 24,
      fontWeight: '800',
      color: c.primary,
    },
    summaryCard: {
      backgroundColor: c.surfaceMuted,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 13,
      color: c.textGray,
    },
    summaryValue: {
      fontSize: 13,
      color: c.textDark,
      fontWeight: '600',
    },
    methodTitleSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    methodTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.textDark,
    },
    rowInputs: {
      flexDirection: 'row',
      gap: 12,
    },
    flex1: {
      flex: 1,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 6,
      marginBottom: 20,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: c.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    checkboxLabel: {
      fontSize: 13,
      color: c.textGray,
    },
    wompiBadgeContainer: {
      alignItems: 'center',
      marginVertical: 12,
    },
    wompiText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textGray,
    },
    badgesContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
      marginBottom: 16,
    },
    badgeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textLight,
      letterSpacing: 0.5,
    },
    bottomBar: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    payButton: {
      backgroundColor: c.primary,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 16,
    },
    payButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
  });

const light = build(lightColors);
const dark = build(darkColors);

export const getPaymentStyles = (isDark) => (isDark ? dark : light);
