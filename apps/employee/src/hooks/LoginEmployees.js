import { useState } from 'react';
import { useAuth } from '@syscor/shared/src/context/AuthContext';
import apiClient from '@syscor/shared/src/services/apiClient';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mismas validaciones que el login de clientes; solo cambia la ruta del backend.
export const LoginEmployees = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail || !password.trim()) {
      setError({
        title: 'Campos incompletos',
        message: 'Debes ingresar tu correo y contraseña.',
      });
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError({
        title: 'Correo inválido',
        message: 'Ingresa un formato de correo válido sin espacios.',
      });
      return;
    }

    if (password.includes(' ')) {
      setError({
        title: 'Contraseña inválida',
        message: 'Por seguridad, la contraseña no puede contener espacios.',
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/employees/login', {
        email: cleanEmail,
        password,
      });

      const { data: userData } = await apiClient.get('/auth/me');
      login(userData);
    } catch (err) {
      console.error('Error en el login de empleado:', err);
      if (err.response) {
        setError({
          title: err.response.data?.title || 'Error de inicio de sesión',
          message: err.response.data?.message || 'Credenciales inválidas',
        });
      } else {
        setError({
          title: 'Error de conexión',
          message: 'No se pudo conectar con el servidor. Revisa tu internet.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleLogin,
  };
};
