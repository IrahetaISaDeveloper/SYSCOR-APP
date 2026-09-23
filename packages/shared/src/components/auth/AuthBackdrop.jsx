import React from 'react';
import { View, StyleSheet } from 'react-native';

// Fondo de las pantallas de acceso: dos halos difusos en esquinas opuestas.
//
// Viene del diseño de recuperar contraseña (los círculos del AuthCard), ahora
// compartido por el login, el registro y la recuperación.
//
// En claro son manchas muy tenues sobre el fondo hueso. En oscuro el mismo
// truco no funciona —un velo claro sobre negro se ve gris sucio—, así que se
// usa el rojo de la marca con poca opacidad, que sobre negro lee como un
// resplandor.
export default function AuthBackdrop({ isDark }) {
  const left = isDark ? 'rgba(198, 40, 40, 0.16)' : 'rgba(255, 0, 0, 0.05)';
  const right = isDark ? 'rgba(217, 131, 36, 0.10)' : 'rgba(0, 200, 0, 0.03)';

  return (
    <View style={styles.layer} pointerEvents="none">
      <View style={[styles.circle, styles.circleLeft, { backgroundColor: left }]} />
      <View style={[styles.circle, styles.circleRight, { backgroundColor: right }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Ocupa toda la pantalla por detrás del contenido, sin capturar toques.
  layer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  circleLeft: {
    left: -100,
    top: -100,
  },
  circleRight: {
    right: -100,
    bottom: -100,
  },
});
