import React from 'react';
import { Image } from 'react-native';

// Imagen de Chef Panchita.
//
// Se sirve desde Cloudinary, igual que en el sistema web, para poder
// cambiarla sin volver a publicar la app. Hay una versión por tema porque el
// trazo está dibujado en un color fijo y no se puede recolorear.
//
// - "icon"     → retrato cuadrado, para la burbuja flotante.
// - "avatar"   → figura de línea, mientras está escribiendo.
// - "answered" → retrato realista, cuando ya respondió (igual en ambos temas).
const CLOUD = 'https://res.cloudinary.com/ddisnfuwo/image/upload';

const SOURCES = {
  icon: {
    light: `${CLOUD}/v1789535451/panchita-icono-medio-claro-256.png`,
    dark: `${CLOUD}/v1789535305/panchita-icono-medio-solo-linea-blanca.png`,
  },
  avatar: {
    light: `${CLOUD}/v1789535462/panchita-claro-rojo.png`,
    dark: `${CLOUD}/v1789535423/panchita-11a-linea-acento.png`,
  },
  answered: {
    light: `${CLOUD}/v1789536804/PanchitaRealistaClaro.png`,
    dark: `${CLOUD}/v1789536804/PanchitaRealistaClaro.png`,
  },
};

export default function PanchitaImage({ variant = 'icon', isDark = false, style }) {
  const set = SOURCES[variant] || SOURCES.icon;

  return (
    <Image
      source={{ uri: set[isDark ? 'dark' : 'light'] }}
      style={style}
      resizeMode="contain"
      accessible={false}
    />
  );
}
