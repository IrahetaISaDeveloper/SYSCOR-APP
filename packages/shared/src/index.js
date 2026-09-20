// Punto de entrada único del código compartido entre la app de clientes y la de empleados.
export { AuthProvider, useAuth, default as AuthContext } from './context/AuthContext';
export { ROLES, EMPLOYEE_TYPES } from './constants/roles';
export { default as apiClient } from './services/apiClient';
export { API_BASE_URL, API_TIMEOUT } from './config/env';
export { useForm } from './hooks/useForm';
export { getDisplayName, getFirstName } from './utils/userDisplay';

export { default as AppTabBar } from './navigation/AppTabBar';
export { default as BootGate } from './navigation/BootGate';
export { default as UnsupportedRoleScreen } from './screens/UnsupportedRoleScreen';
