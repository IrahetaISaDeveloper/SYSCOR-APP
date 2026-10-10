import React, { useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PanchitaImage from './PanchitaImage';

const SIZE = 60;
const MARGIN = 14;
// Movimiento en píxeles a partir del cual se considera arrastre y no toque.
const DRAG_THRESHOLD = 6;

// Burbuja flotante de Chef Panchita: se puede arrastrar por toda la pantalla
// y al soltarla se pega al borde más cercano, como las burbujas de chat.
//
// Se usa `PanResponder` con `Animated` (ambos vienen en React Native) en vez
// de reanimated/gesture-handler: para un solo elemento arrastrable no
// compensa añadir dos dependencias nativas.
export default function PanchitaBubble({ tokens, isDark, onPress, hidden = false }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Límites por los que puede moverse el centro de la burbuja.
  const bounds = useMemo(
    () => ({
      left: MARGIN,
      right: width - SIZE - MARGIN,
      top: insets.top + MARGIN,
      bottom: height - insets.bottom - SIZE - MARGIN,
    }),
    [width, height, insets.top, insets.bottom],
  );

  // Posición inicial: abajo a la derecha, por encima del pie de la pantalla.
  const start = useRef({
    x: width - SIZE - MARGIN,
    y: height - SIZE - MARGIN - 150,
  }).current;

  const pan = useRef(new Animated.ValueXY(start)).current;

  // `Animated.ValueXY` no expone su valor de forma síncrona dentro del
  // gesto, así que lo seguimos aparte para poder calcular el borde al
  // soltar. Arranca en la posición inicial, no en cero, o el primer
  // arrastre daría un salto.
  const position = useRef({ ...start });
  const dragged = useRef(false);

  // El gesto se crea una sola vez, así que no puede cerrar sobre `bounds` ni
  // sobre `width`: leería valores viejos. Se guardan en refs que sí se
  // actualizan.
  const boundsRef = useRef(bounds);
  const widthRef = useRef(width);
  boundsRef.current = bounds;
  widthRef.current = width;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // No capturamos el gesto de entrada: así un toque simple sigue
        // llegando al Pressable y abre el chat.
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_evt, gesture) =>
          Math.abs(gesture.dx) > DRAG_THRESHOLD || Math.abs(gesture.dy) > DRAG_THRESHOLD,

        onPanResponderGrant: () => {
          dragged.current = true;
          // El desplazamiento del gesto se acumula sobre la posición actual.
          pan.setOffset({ x: position.current.x, y: position.current.y });
          pan.setValue({ x: 0, y: 0 });
        },

        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),

        onPanResponderRelease: () => {
          pan.flattenOffset();

          const b = boundsRef.current;
          const x = clamp(position.current.x, b.left, b.right);
          const y = clamp(position.current.y, b.top, b.bottom);

          // Se pega al borde vertical más cercano.
          const snapX = x + SIZE / 2 < widthRef.current / 2 ? b.left : b.right;

          Animated.spring(pan, {
            toValue: { x: snapX, y },
            useNativeDriver: false,
            friction: 7,
            tension: 60,
          }).start();

          // El toque que cierra el gesto no debe abrir el chat.
          setTimeout(() => {
            dragged.current = false;
          }, 50);
        },
      }),
    [pan],
  );

  // Mantiene `position` al día con lo que dibuja la animación.
  React.useEffect(() => {
    const id = pan.addListener((value) => {
      position.current = value;
    });
    return () => pan.removeListener(id);
  }, [pan]);

  return (
    <Animated.View
      // No se desmonta al abrir el chat: solo se oculta. Si se desmontara,
      // al volver se recrearían el gesto y la posición, y la burbuja dejaría
      // de poder arrastrarse.
      pointerEvents={hidden ? 'none' : 'auto'}
      style={[
        styles.bubble,
        {
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          backgroundColor: tokens.accent,
          transform: pan.getTranslateTransform(),
          opacity: hidden ? 0 : 1,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Pressable
        style={styles.press}
        onPress={() => {
          // Si venimos de arrastrar, el "toque" final no cuenta.
          if (!dragged.current) onPress?.();
        }}
        accessibilityRole="button"
        accessibilityLabel="Abrir ayuda de Chef Panchita"
      >
        <PanchitaImage variant="icon" isDark={isDark} style={styles.image} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    top: 0,
    left: 0,
    // Por encima del formulario, pero debajo del panel de chat.
    zIndex: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  press: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '78%',
    height: '78%',
  },
});
