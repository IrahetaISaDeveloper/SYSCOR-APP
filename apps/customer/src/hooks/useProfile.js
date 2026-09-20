import { useState } from 'react';

const DEFAULT_USER = {
  name: 'Juan',
  lastname: 'Pérez',
  avatarUrl: null,
  email: 'juan.perez@example.com',
  phone: '',
  birthdate: '',
};

// Toda la lógica de la pantalla Profile: edición de datos personales,
// notificaciones (toast) y los "próximamente" de las opciones sin pantalla propia.
export const useProfile = ({
  user = DEFAULT_USER,
  onChangeAvatar,
  onSaveProfile,
  onNavigateToOrders,
  onNavigateToPaymentMethods,
  onNavigateToSupport,
  onLogout,
} = {}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const notify = (message, type = 'success') => setToast({ visible: true, message, type });
  const hideToast = () => setToast((t) => ({ ...t, visible: false }));

  const [form, setForm] = useState({
    name: user.name || '',
    lastname: user.lastname || '',
    email: user.email || '',
    phone: user.phone || '',
    birthdate: user.birthdate || '',
  });

  const updateField = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleEditPress = () => {
    if (isEditing) {
      if (!form.name.trim() || !form.lastname.trim()) {
        notify('El nombre y apellido no pueden quedar vacíos.', 'error');
        return;
      }
      onSaveProfile?.(form);
      notify('Perfil actualizado correctamente.');
    }
    setIsEditing((prev) => !prev);
  };

  const handleAvatarPress = () => {
    if (onChangeAvatar) {
      onChangeAvatar();
    } else {
      notify('La selección de foto estará disponible próximamente.');
    }
  };

  const goTo = (handler, label) => () => {
    if (handler) {
      handler();
    } else {
      notify(`${label} estará disponible próximamente.`);
    }
  };

  const handleLogout = () => {
    notify('Sesión cerrada.');
    onLogout?.();
  };

  return {
    isEditing,
    toast,
    hideToast,
    form,
    updateField,
    handleEditPress,
    handleAvatarPress,
    handleLogoutPress: handleLogout,
    goToOrders: goTo(onNavigateToOrders, 'Mis Pedidos'),
    goToPaymentMethods: goTo(onNavigateToPaymentMethods, 'Métodos de Pago'),
    goToSupport: goTo(onNavigateToSupport, 'Ayuda y Soporte'),
  };
};

export default useProfile;
