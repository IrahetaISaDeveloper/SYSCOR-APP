import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

// Visibilidad de la barra inferior.
//
// La barra la dibuja el navegador (CustomerTabBar) y el scroll ocurre dentro
// de cada pantalla, así que hace falta un punto común para que una le avise a
// la otra. Las pantallas llaman a `onScroll` y la barra lee `hidden`.
const TabBarVisibilityContext = createContext(null);

// Cuánto hay que arrastrar para que la barra reaccione. Evita que se esconda
// y reaparezca con cualquier temblor del dedo.
const THRESHOLD = 12;

export const TabBarVisibilityProvider = ({ children }) => {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  const handleScroll = useCallback((event) => {
    const y = event.nativeEvent.contentOffset.y;
    const delta = y - lastY.current;

    // Cerca del inicio la barra siempre se ve: si no, al rebotar arriba
    // podría quedarse escondida.
    if (y <= 0) {
      lastY.current = y;
      setHidden(false);
      return;
    }

    if (Math.abs(delta) < THRESHOLD) return;

    // Bajando (delta positivo) se esconde; subiendo, vuelve.
    setHidden(delta > 0);
    lastY.current = y;
  }, []);

  // Al salir de una pantalla la barra debe quedar visible para la siguiente.
  const reset = useCallback(() => {
    lastY.current = 0;
    setHidden(false);
  }, []);

  return (
    <TabBarVisibilityContext.Provider value={{ hidden, handleScroll, reset }}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
};

// Devuelve un objeto vacío si no hay proveedor (por ejemplo en el menú de
// invitado, que no va dentro del navegador de pestañas).
export const useTabBarVisibility = () => useContext(TabBarVisibilityContext) || {};

export default TabBarVisibilityContext;
