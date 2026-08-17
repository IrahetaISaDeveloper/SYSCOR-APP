// Paleta única de la app — blanco y rojo como colores de marca (taquería El Corral).
// Todos los estilos deben tomar sus colores de aquí para mantener la app visualmente consistente.
export const colors = {
  // Marca
  primary: '#C62828',
  primaryDark: '#9B1B1B',
  primaryLight: '#FDEDEA',

  // Base
  white: '#FFFFFF',
  background: '#F7F7F7',
  surface: '#FFFFFF',

  // Texto
  textDark: '#1A1A1A',
  textGray: '#6B7280',
  textLight: '#9CA3AF',

  // Bordes / divisores
  border: '#E5E7EB',
  borderLight: '#F0F0F0',

  // Estado (semántico, no de marca)
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEF2F2',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export default { colors, radius, spacing };
