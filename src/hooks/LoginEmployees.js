import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://syscor.onrender.com/api';

export const LoginEmployees = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError({
        title: 'Incomplete fields',
        message: 'You must fill in both email and password.',
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Login
      const loginResponse = await fetch(`${API_URL}/auth/employees/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        setError({
          title: loginData.title || 'Login error',
          message: loginData.message || 'Invalid credentials',
        });
        return;
      }

      // 2. Extraer cookie
      const setCookieHeader = loginResponse.headers.get('set-cookie');
      if (!setCookieHeader) {
        setError({
          title: 'Cookie error',
          message: 'No session cookie received.',
        });
        return;
      }

      // 3. Obtener datos del usuario autenticado
      const meResponse = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: setCookieHeader,
        },
      });

      const userData = await meResponse.json();

      if (!meResponse.ok) {
        setError({
          title: 'Verification error',
          message: 'Could not retrieve user data.',
        });
        return;
      }

      // 4. Guardar en contexto (token = cookie para futuras peticiones)
      login({ token: setCookieHeader, user: userData });

    } catch (err) {
      console.error(err);
      setError({
        title: 'Connection error',
        message: 'Could not connect to the server.',
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