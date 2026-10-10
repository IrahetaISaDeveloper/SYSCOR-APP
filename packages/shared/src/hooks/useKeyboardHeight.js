import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// Alto real del teclado, en píxeles, o 0 si está cerrado.
//
// Hace falta porque con `edgeToEdgeEnabled` Android ya no redimensiona la
// ventana al abrirse el teclado (aunque `softwareKeyboardLayoutMode` diga
// "resize"), así que nada se aparta solo: hay que medirlo y mover el
// contenido a mano.
//
// En iOS se usan los eventos `WillShow`/`WillHide`, que llegan antes de la
// animación y permiten que el contenido suba a la vez que el teclado.
export default function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, (event) => {
      setHeight(event.endCoordinates?.height || 0);
    });
    const onHide = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  return height;
}
