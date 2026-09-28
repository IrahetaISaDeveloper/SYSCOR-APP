import { StyleSheet } from 'react-native';

// Paleta del menú del cliente, en claro y oscuro.
//
// Los valores salen del diseño: fondo hueso muy claro, tarjetas blancas de
// borde suave y el rojo de la marca como único acento. En oscuro el fondo es
// azul noche y el acento morado, igual que el modo oscuro del sistema web.
export const lightColors = {
  primary: '#E23D28',
  primaryDark: '#C62828',
  primaryTint: 'rgba(226,61,40,0.12)',
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
  error: '#D93636',
};

export const darkColors = {
  // Misma paleta que el modo oscuro del sistema web (tokens de
  // html[data-theme="dark"] en FrontEndWebTaqueria/src/index.css): azul
  // noche en fondos y el morado del sistema como acento.
  primary: '#9184D9',
  primaryDark: '#7A6CC8',
  primaryTint: 'rgba(145,132,217,0.13)',
  background: '#161826',
  surface: '#232532',
  surfaceMuted: '#292B31',
  border: '#3F424D',
  borderStrong: '#595D6C',
  textDark: '#E9E9ED',
  textGray: '#9397AB',
  textLight: '#75798C',
  white: '#FFFFFF',
  imagePlaceholder: '#292B31',
  pill: '#292B31',
  navBackground: '#101220',
  navBorder: '#232532',
  error: '#EF5350',
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
  categoryCard: {
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  categoryImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  // Una franja del degradado; la altura la pone la pantalla.
  categoryShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  categoryTitle: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  categoryContent: {
    width: '100%',
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryArrow: {
    alignItems: 'center',
    justifyContent: 'center',
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
  dishImageArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishImage: {
    width: '100%',
    height: '100%',
  },
  dishBadge: {
    position: 'absolute',
  },
  dishFavorite: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishBody: {},
  dishPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // ── AGRUPACIÓN POR PROTEÍNA ─────────────────────────
  chip: {
    borderWidth: 1,
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

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
