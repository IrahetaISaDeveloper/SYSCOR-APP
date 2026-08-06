import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://syscor.onrender.com/api';

export const useCustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError({
        title: 'Campos incompletos',
        message: 'Debes ingresar tu correo y contraseña.',
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loginResponse = await fetch(`${API_URL}/auth/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        setError({
          title: loginData.title || 'Error de inicio de sesión',
          message: loginData.message || 'Credenciales inválidas',
        });
        return;
      }

      const setCookieHeader = loginResponse.headers.get('set-cookie');
      if (!setCookieHeader) {
        setError({
          title: 'Error de sesión',
          message: 'No se recibió la cookie de sesión.',
        });
        return;
      }

      console.log("Éxito. Sesión iniciada correctamente.");

      // Activamos el contexto global de sesión
      login({ token: setCookieHeader, user: loginData });

    } catch (err) {
      console.error('Error en useCustomerLogin:', err);
      setError({
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor.',
      });
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
