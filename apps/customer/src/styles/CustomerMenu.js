import { StyleSheet } from 'react-native';

// Paleta del menú del cliente, en claro y oscuro.
//
// Los valores salen del diseño: fondo hueso muy claro, tarjetas blancas de
// borde suave y el rojo de la marca como único acento. En oscuro el fondo es
// negro plano y las tarjetas gris muy oscuro, tal como en la maqueta.
export const lightColors = {
  primary: '#E23D28',
  primaryDark: '#C62828',
  background: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceMuted: '#F2EEE7',
  border: '#EAE5DC',
  borderStrong: '#D8D2C7',
  textDark: '#1A1A1A',
  textGray: '#6F7076',
  textLight: '#A8A49E',
  white: '#FFFFFF',
  imagePlaceholder: '#F4F1EB',
  // La píldora de la bolsa y el botón central son oscuros en ambos temas.
  pill: '#1C1C1E',
  navBackground: '#FFFFFF',
  navBorder: '#EFEBE4',
};

export const darkColors = {
  primary: '#E23D28',
  primaryDark: '#C62828',
  background: '#0A0A0A',
  surface: '#161617',
  surfaceMuted: '#1E1E20',
  border: '#232325',
  borderStrong: '#2E2E31',
  textDark: '#FFFFFF',
  textGray: '#9A9AA0',
  textLight: '#6E6E75',
  white: '#FFFFFF',
  imagePlaceholder: '#1E1E20',
  pill: '#1C1C1E',
  navBackground: '#0F0F10',
  navBorder: '#1E1E20',
};

export const getMenuColors = (isDark) => (isDark ? darkColors : lightColors);

// Compatibilidad: alguna pantalla podría seguir importando `colors`.
export const colors = lightColors;

// Solo lo que no depende del tema. El color se aplica en la pantalla, porque
// cambia entre claro y oscuro.
const menuStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── ENCABEZADO ──────────────────────────────────────
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── BUSCADOR ────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },

  // ── ENCABEZADO DE SECCIÓN ───────────────────────────
  // El título y su insignia van juntos a la izquierda, no separados.
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionBadge: {
    borderWidth: 1,
  },

  // ── PROMOCIONES ─────────────────────────────────────
  promoCard: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  promoImage: {
    width: '100%',
  },
  promoBadge: {
    position: 'absolute',
  },
  promoFooter: {
    borderTopWidth: 1,
  },
  promoPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 3,
    borderRadius: 2,
  },

  // ── TARJETAS DE CATEGORÍA ───────────────────────────
  categoryCardImage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },

  // ── REJILLA DEL MENÚ ────────────────────────────────
  dishGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dishCard: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  // La imagen lleva el nombre del platillo encima, centrado.
  dishImageArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishFooter: {},

  // ── PÍLDORA "VER MI BOLSA" ──────────────────────────
  // Flotante, centrada y compacta: se ajusta a su contenido.
  bagPill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  bagIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagCountBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── PANEL DE ORDEN ──────────────────────────────────
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    overflow: 'hidden',
  },
  sheetHandle: {
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },

  // ── ESTADOS ─────────────────────────────────────────
  errorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default menuStyles;
