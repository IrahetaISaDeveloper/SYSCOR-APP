import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

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
      await apiClient.post('/auth/employees/login', {
        email: email.trim(),
        password,
      });

      const { data: userData } = await apiClient.get('/auth/me');
      login(userData);

    } catch (err) {
      console.error(err);
      if (err.response) {
        setError({
          title: err.response.data?.title || 'Login error',
          message: err.response.data?.message || 'Invalid credentials',
        });
      } else {
        setError({
          title: 'Connection error',
          message: 'Could not connect to the server.',
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