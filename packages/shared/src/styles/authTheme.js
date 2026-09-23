// Paleta y métricas de las pantallas de acceso (bienvenida, login y registro).
// Es el único bloque de la app que responde hoy al tema del sistema; el resto
// sigue en claro, así que estos tokens viven aparte de `theme.js`.

import { useWindowDimensions, useColorScheme, PixelRatio } from 'react-native';

export const lightTokens = {
  background: '#F7F5F1',
  surface: '#FFFFFF',
  surfaceMuted: '#EFECE6',
  border: '#E3DFD8',
  borderStrong: '#D6D1C8',
  textPrimary: '#14213D',
  textSecondary: '#5B6472',
  textMuted: '#8A919C',
  accent: '#8E1B1B',
  accentSoft: '#F6E7E6',
  danger: '#C0392B',
  success: '#1E8E4E',
};

export const darkTokens = {
  background: '#0B0B0B',
  surface: '#1C1C1E',
  surfaceMuted: '#161618',
  border: '#2E2E32',
  borderStrong: '#3A3A3F',
  textPrimary: '#FFFFFF',
  textSecondary: '#A8AEB8',
  textMuted: '#7C828C',
  accent: '#C62828',
  accentSoft: '#2A1616',
  danger: '#E05B4B',
  success: '#3DBE74',
};

export const getAuthTokens = (isDark) => (isDark ? darkTokens : lightTokens);

// Alto de referencia: un teléfono "normal" (iPhone 12 / Pixel 5). Las pantallas
// de acceso se diseñaron contra esta medida, así que en equipos más bajos hay
// que encoger tipografías y espacios para que el formulario siga entrando.
const BASE_HEIGHT = 844;
const BASE_WIDTH = 390;

// Métricas responsivas derivadas del tamaño real de la ventana.
//
// `scale` comprime en pantallas cortas (donde el formulario no cabe) y se
// permite crecer muy poco en las grandes, para no deformar el diseño. El
// tamaño de fuente del sistema ya escala el texto por su cuenta, así que en
// equipos con fuente grande se encoge un poco más para compensar.
export function useAuthMetrics() {
  const { width, height } = useWindowDimensions();

  const shortest = Math.min(width, height);
  const longest = Math.max(width, height);

  // Un equipo con fuente del sistema muy grande necesita más espacio por línea.
  const fontScale = PixelRatio.getFontScale();
  const fontRelief = fontScale > 1.15 ? 0.92 : 1;

  const heightRatio = longest / BASE_HEIGHT;
  const widthRatio = shortest / BASE_WIDTH;

  const scale = clamp(Math.min(heightRatio, widthRatio) * fontRelief, 0.8, 1.1);

  const isCompact = longest < 750 || shortest < 360;
  const isTablet = shortest >= 600;

  // Gutter lateral: más aire en pantallas anchas, pero el contenido no se
  // estira a lo ancho de una tablet (se centra con `maxContentWidth`).
  const gutter = isTablet ? 32 : Math.round(clamp(shortest * 0.062, 18, 26));

  return {
    width,
    height,
    isCompact,
    isTablet,
    isLandscape: width > height,
    gutter,
    maxContentWidth: isTablet ? 520 : null,
    scale,
    // Redondea a medio punto: evita bordes borrosos por subpíxeles.
    ms: (size) => Math.round(size * scale * 2) / 2,
  };
}

// Atajo para las pantallas que solo necesitan "tokens + métricas".
export function useAuthTheme() {
  const isDark = useColorScheme() === 'dark';
  return { isDark, t: getAuthTokens(isDark), m: useAuthMetrics() };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default { lightTokens, darkTokens, getAuthTokens, useAuthMetrics, useAuthTheme };
