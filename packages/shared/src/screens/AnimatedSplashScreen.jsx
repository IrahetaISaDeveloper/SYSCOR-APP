import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Image,
  Animated,
  Easing,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Duración total que el splash permanece visible antes de comenzar a retirarse.
const HOLD_MS = 3000;
// Duración de la animación en la que el splash sube y descubre la pantalla siguiente.
const SLIDE_UP_MS = 520;

// Splash de arranque: muestra el logo de la marca durante HOLD_MS y luego se
// desliza hacia arriba, como una capa que se retira para descubrir la app.
//
// Va dentro de un Modal a pantalla completa para cubrir también las áreas del
// sistema (barra de estado y de navegación); un View normal queda recortado por
// el contenedor que lo monta.
export default function AnimatedSplashScreen({ onFinish }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { height } = useWindowDimensions();

  const [visible, setVisible] = useState(true);

  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const backgroundColor = isDark ? '#0E0E0E' : '#F7F5F1';

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
      // La capa completa sube y deja ver la pantalla que hay debajo.
      // Se desplaza más que el alto de la pantalla para que no quede ni un borde.
      Animated.timing(translateY, {
        toValue: -(height + 120),
        duration: SLIDE_UP_MS,
        easing: Easing.in(Easing.cubic),
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
  }, [opacity, scale, translateY, height, onFinish]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={() => {}}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Animated.View
        style={[
          styles.container,
          { backgroundColor },
          { transform: [{ translateY }] },
        ]}
      >
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
