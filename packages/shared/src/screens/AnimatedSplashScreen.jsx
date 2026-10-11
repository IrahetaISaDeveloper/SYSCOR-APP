import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Animated,
  Easing,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Duración total que el splash permanece visible antes de comenzar a retirarse.
const HOLD_MS = 3000;
// Duración del desvanecimiento con el que el splash descubre la pantalla siguiente.
const FADE_OUT_MS = 450;

// Splash de arranque: muestra el logo de la marca durante HOLD_MS y luego se
// desvanece para descubrir la app que ya está montada debajo.
//
// Va dentro de un Modal a pantalla completa para cubrir también las áreas del
// sistema (barra de estado y de navegación); un View normal queda recortado por
// el contenedor que lo monta. El Modal es transparente para que, al
// desvanecerse la capa, se vea la app y no el fondo del Modal.
export default function AnimatedSplashScreen({ onFinish }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [visible, setVisible] = useState(true);

  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const layerOpacity = useRef(new Animated.Value(1)).current;

  const backgroundColor = isDark ? '#161826' : '#F7F5F1';

  useEffect(() => {
    const animation = Animated.sequence([
      // Entrada del logo
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Permanece visible hasta completar los 3 segundos de splash
      Animated.delay(HOLD_MS - 500),
      // La capa completa se desvanece y deja ver la pantalla que hay debajo.
      Animated.timing(layerOpacity, {
        toValue: 0,
        duration: FADE_OUT_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (!finished) return;
      // Se desmonta el modal antes de avisar, para no dejar una capa invisible
      // por encima de la app.
      setVisible(false);
      onFinish?.();
    });

    return () => animation.stop();
  }, [opacity, scale, layerOpacity, onFinish]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={() => {}}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Animated.View style={[styles.container, { backgroundColor, opacity: layerOpacity }]}>
        <Animated.Image
          source={
            isDark
              ? require('../../assets/logo-horizontal-blanco.png')
              : require('../../assets/logo-horizontal-negro.png')
          }
          style={[styles.logo, { opacity, transform: [{ scale }] }]}
          resizeMode="contain"
        />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 240,
    height: 240,
  },
});
