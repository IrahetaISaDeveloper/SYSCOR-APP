// Paleta de las pantallas del mesero que siguen el diseño de la app de
// clientes (fondo hueso, tarjetas blancas, rojo de la marca como acento).
// Son los mismos valores que `lightColors` de apps/customer/src/styles/CustomerMenu.js;
// se copian porque una app no puede importar de la otra.
export const waiterColors = {
  primary: '#E23D28',
  primaryDark: '#C62828',
  primaryTint: 'rgba(226,61,40,0.12)',
  background: '#F6F1E7',
  surface: '#FFFFFF',
  surfaceMuted: '#F2EEE7',
  border: '#EAE5DC',
  borderStrong: '#D8D2C7',
  textDark: '#1A1A1A',
  textGray: '#6F7076',
  textLight: '#A8A49E',
  white: '#FFFFFF',
  navBackground: '#FFFFFF',
  navBorder: '#EFEBE4',
  error: '#D93636',
  success: '#1E8E4E',
  warning: '#B7791F',
};

// Estados reales de una mesa (tablesModel del backend), con los mismos
// colores que el panel web: libre en verde, ocupada en rojo, reservada en
// ámbar y limpieza en gris. `fill`, `border` y `ink` pintan la mesa en el
// croquis; `short` es la etiqueta de las tarjetas de conteo.
export const TABLE_STATE = {
  libre: {
    label: 'Libre',
    plural: 'Libres',
    short: 'LIBRE',
    icon: 'checkmark-circle-outline',
    color: '#2E9D5B',
    tint: 'rgba(46,157,91,0.12)',
    fill: '#DDEFE1',
    border: '#3FA066',
    ink: '#2C6E45',
  },
  ocupada: {
    label: 'Ocupada',
    plural: 'Ocupadas',
    short: 'OCUP.',
    icon: 'restaurant-outline',
    color: '#C9402F',
    tint: 'rgba(201,64,47,0.12)',
    fill: '#C9402F',
    border: '#C9402F',
    ink: '#FFFFFF',
  },
  reservada: {
    label: 'Reservada',
    plural: 'Reservadas',
    short: 'RESERV.',
    icon: 'bookmark-outline',
    color: '#D98F2B',
    tint: 'rgba(217,143,43,0.14)',
    fill: '#FBE9CC',
    border: '#D98F2B',
    ink: '#8A5A14',
  },
  limpieza: {
    label: 'Limpieza',
    plural: 'En limpieza',
    short: 'LIMPIEZA',
    icon: 'sparkles-outline',
    color: '#8E8578',
    tint: 'rgba(142,133,120,0.14)',
    fill: '#E8E0D3',
    border: '#8E8578',
    ink: '#3A3530',
  },
};

export const TABLE_STATE_ORDER = ['libre', 'ocupada', 'reservada', 'limpieza'];

export const getTableState = (status) => TABLE_STATE[status] || TABLE_STATE.libre;

// Plantas del local (tablesModel.TABLE_FLOORS) y zonas (TABLE_ZONES).
export const FLOORS = [
  { floor: 1, label: 'Planta baja' },
  { floor: 2, label: 'Planta alta' },
];

export const ZONE_LABELS = {
  ventanal: 'Junto al ventanal',
  salon_central: 'Salón central',
  terraza: 'Terraza',
};
