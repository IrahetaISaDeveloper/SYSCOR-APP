import { useCallback, useEffect, useRef } from 'react';
import { Keyboard, Platform, TextInput } from 'react-native';

// Mantiene visible el campo enfocado cuando se abre el teclado.
//
// Con `edgeToEdgeEnabled` el sistema ya no redimensiona la ventana en
// Android, así que hay que medir el campo enfocado y desplazar el ScrollView
// a mano. En iOS se hace lo mismo con `keyboardWillShow`, que llega antes de
// la animación.
//
// `extraOffset` deja un respiro bajo el campo: además del propio teclado hay
// que librar el pie fijo (el botón de continuar), que va montado encima.
export default function useScrollToFocusedInput({ extraOffset = 140 } = {}) {
  const scrollRef = useRef(null);
  // Desplazamiento acumulado del ScrollView, necesario para calcular la posición real.
  const scrollY = useRef(0);

  const onScroll = useCallback((event) => {
    scrollY.current = event.nativeEvent.contentOffset.y;
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

    const subscription = Keyboard.addListener(showEvent, (event) => {
      const keyboardY = event.endCoordinates.screenY;
      const focused = TextInput.State.currentlyFocusedInput?.();
      if (!focused?.measureInWindow || !scrollRef.current) return;

      focused.measureInWindow((x, y, width, height) => {
        const fieldBottom = y + height;
        const overlap = fieldBottom + extraOffset - keyboardY;

        // Solo se mueve la vista si el teclado (o el pie que va sobre él)
        // realmente tapa el campo.
        if (overlap > 0) {
          scrollRef.current?.scrollTo({
            y: scrollY.current + overlap,
            animated: true,
          });
        }
      });
    });

    return () => subscription.remove();
  }, [extraOffset]);

  return { scrollRef, onScroll };
}
