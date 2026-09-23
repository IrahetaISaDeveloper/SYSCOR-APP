import { StyleSheet } from 'react-native';
import { lightColors, darkColors } from './CustomerMenu';

// Los colores salen de la paleta del menú (CustomerMenu.js), en claro y
// oscuro. Se arman las dos hojas una sola vez y la pantalla elige con
// `getVerifiedSuccessStyles(isDark)`.

const build = (c) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    content: {
      width: '100%',
      alignItems: 'center',
    },
    title: {
      fontSize: 36,
      fontWeight: '900',
      color: c.textDark,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 42,
    },
    subtitle: {
      fontSize: 15,
      color: c.textGray,
      textAlign: 'center',
      marginBottom: 40,
      lineHeight: 22,
    },
    button: {
      backgroundColor: c.primary,
      width: '100%',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
  });

const light = build(lightColors);
const dark = build(darkColors);

export const getVerifiedSuccessStyles = (isDark) => (isDark ? dark : light);
