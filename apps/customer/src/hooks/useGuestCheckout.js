import { useState } from 'react';
import apiClient from '@syscor/shared/src/services/apiClient';
import { useAuth } from '@syscor/shared/src/context/AuthContext';

const NAME_PATTERN = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{2,40}$/;
const clean = (value) => value.replace(/\s+/g, ' ').trim();

// Comprar sin registrarse: con nombre y apellidos el backend crea una cuenta
// de invitado y deja la cookie de sesión (POST /auth/customers/guest). Desde
// ahí la app funciona igual que con una cuenta.
export default function useGuestCheckout() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!NAME_PATTERN.test(clean(name))) next.name = 'Escribe tu nombre (solo letras).';
    if (!NAME_PATTERN.test(clean(lastname))) next.lastname = 'Escribe tus apellidos (solo letras).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const start = async () => {
    if (isLoading || !validate()) return false;
    setIsLoading(true);
    setApiError(null);
    try {
      await apiClient.post('/auth/customers/guest', { name: clean(name), lastname: clean(lastname) });
      const { data: userData } = await apiClient.get('/auth/me');
      login(userData);
      return true;
    } catch (error) {
      const data = error?.response?.data;
      setApiError({
        title: data?.title || 'No pudimos continuar',
        message: data?.message || (error?.response ? 'Intenta de nuevo.' : 'Sin conexión. Revisa tu internet.'),
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { name, setName, lastname, setLastname, errors, apiError, isLoading, start };
}
