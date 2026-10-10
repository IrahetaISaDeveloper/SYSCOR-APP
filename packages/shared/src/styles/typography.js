// Tipografía de la app, igual a la del sistema web (ver index.css del
// frontend):
//
//   --font-display → Archivo        títulos y botones
//   --font-sans    → Inter          texto corrido
//   --font-mono    → IBM Plex Mono  etiquetas en versalitas y números
//
// En React Native no hay familias con pesos: cada peso es una fuente
// distinta, así que aquí se nombran una por una y se agrupan en `fonts`
// para no escribir el nombre del archivo en cada pantalla.

export const FONT = {
  // Archivo: títulos ("Crea tu cuenta") y texto de los botones.
  display: 'Archivo_600SemiBold',
  displayMedium: 'Archivo_500Medium',
  displayRegular: 'Archivo_400Regular',

  // Inter: párrafos, campos y enlaces.
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',

  // IBM Plex Mono: las etiquetas espaciadas (NOMBRE COMPLETO, PASO 1 DE 3)
  // y los números que deben alinearse (+503, el contador del código).
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
  monoSemiBold: 'IBMPlexMono_600SemiBold',
};

// Mapa que espera `useFonts`. Vive aquí para que las dos apps carguen
// exactamente el mismo juego.
export const fontAssets = {
  Archivo_400Regular: require('@expo-google-fonts/archivo/400Regular/Archivo_400Regular.ttf'),
  Archivo_500Medium: require('@expo-google-fonts/archivo/500Medium/Archivo_500Medium.ttf'),
  Archivo_600SemiBold: require('@expo-google-fonts/archivo/600SemiBold/Archivo_600SemiBold.ttf'),
  Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
  Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
  Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
  IBMPlexMono_400Regular: require('@expo-google-fonts/ibm-plex-mono/400Regular/IBMPlexMono_400Regular.ttf'),
  IBMPlexMono_500Medium: require('@expo-google-fonts/ibm-plex-mono/500Medium/IBMPlexMono_500Medium.ttf'),
  IBMPlexMono_600SemiBold: require('@expo-google-fonts/ibm-plex-mono/600SemiBold/IBMPlexMono_600SemiBold.ttf'),
};

// Con fuentes propias, `fontWeight` sobra: el peso ya viene en el archivo.
// Dejarlo puesto hace que Android sintetice una negrita encima y la letra se
// vea deformada, así que las pantallas usan estos estilos en su lugar.
export const textStyles = {
  // "Crea tu cuenta", "Bienvenido de vuelta"
  title: {
    fontFamily: FONT.display,
    letterSpacing: -0.4,
  },
  // Subtítulos y párrafos
  body: {
    fontFamily: FONT.sans,
  },
  bodyMedium: {
    fontFamily: FONT.sansMedium,
  },
  // Enlaces y remates ("Iniciar sesión", "Reenviar")
  link: {
    fontFamily: FONT.sansSemiBold,
  },
  // Etiquetas de campo: versalitas espaciadas
  kicker: {
    fontFamily: FONT.monoMedium,
    letterSpacing: 1.2,
  },
  // Números que deben alinearse (+503, 05:00)
  num: {
    fontFamily: FONT.monoMedium,
  },
  // Texto de los botones
  button: {
    fontFamily: FONT.display,
  },
};

export default { FONT, fontAssets, textStyles };
