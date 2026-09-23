// Colores oscuros para los componentes comunes.
//
// Son los mismos del modo oscuro de la app de clientes (ver darkColors en
// apps/customer/src/styles/CustomerMenu.js); viven aquí porque `shared` no
// puede importar de `apps/`. Los componentes los aplican como una capa
// encima de sus estilos claros, así que en claro no cambia nada.
export const darkPalette = {
  background: '#0A0A0A',
  surface: '#161617',
  surfaceMuted: '#1E1E20',
  border: '#232325',
  borderStrong: '#2E2E31',
  textDark: '#FFFFFF',
  textGray: '#9A9AA0',
  textLight: '#6E6E75',
  primary: '#E23D28',
  primaryTint: 'rgba(226,61,40,0.14)',
};

export default darkPalette;
