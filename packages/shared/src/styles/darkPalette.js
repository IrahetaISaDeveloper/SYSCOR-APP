// Colores oscuros para los componentes comunes.
//
// Son los mismos del modo oscuro de la app de clientes (ver darkColors en
// apps/customer/src/styles/CustomerMenu.js), que a su vez copia la paleta
// oscura del sistema web: azul noche con el morado del sistema de acento.
// Viven aquí porque `shared` no puede importar de `apps/`. Los componentes los
// aplican como una capa encima de sus estilos claros, así que en claro no
// cambia nada.
export const darkPalette = {
  background: '#161826',
  surface: '#232532',
  surfaceMuted: '#292B31',
  border: '#3F424D',
  borderStrong: '#595D6C',
  textDark: '#E9E9ED',
  textGray: '#9397AB',
  textLight: '#75798C',
  primary: '#9184D9',
  primaryTint: 'rgba(145,132,217,0.13)',
};

export default darkPalette;
