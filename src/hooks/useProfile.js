import { useState } from 'react';

// Datos iniciales de demostración del empleado activo en el perfil
const initialEmployee = {
  fullName: 'Ricardo Gómez',
  employeeId: '#CO-8842',
  position: 'Cocinero Senior',
  email: 'r.gomez@elcorral.com',
  avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
};

/**
 * Hook personalizado 'useProfile'
 * Administra la información del perfil del empleado logueado y la lógica de cierre de sesión.
 */
const useProfile = () => {
  // Estado que contiene la información del empleado
  const [employee] = useState(initialEmployee);

  // Función para cerrar la sesión del usuario actual
  const handleLogout = (onLoggedOut) => {
    if (onLoggedOut) onLoggedOut();
  };

  return {
    employee,
    handleLogout,
  };
};

export default useProfile;