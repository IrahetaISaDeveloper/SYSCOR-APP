import { createNavigationContainerRef } from '@react-navigation/native';

// Referencia a la navegación para lo que vive fuera de las pantallas (como el
// aviso flotante de Panchita, que se dibuja encima de todas).
export const navigationRef = createNavigationContainerRef();

export const navigate = (name, params) => {
  if (navigationRef.isReady()) navigationRef.navigate(name, params);
};
