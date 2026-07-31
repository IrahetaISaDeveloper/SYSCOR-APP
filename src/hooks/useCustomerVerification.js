import { useState, useEffect } from 'react';

const API_URL = 'https://syscor.onrender.com/api';

export const useCustomerVerification = (route) => {
  // Capturamos el correo enviado desde la pantalla anterior
  const email = route?.params?.email || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(120); // 2 minutos para reenviar código

  // Temporizador para el botón de reenviar
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Enviar el código de verificación al backend (Ruta actualizada con /auth)
  const handleVerifyCode = async (navigation) => {
    if (!code.trim() || code.length < 6) {
      setError({
        title: 'Código incompleto',
        message: 'Por favor, ingresa los 6 dígitos del código.',
      });
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/customers/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          title: data.title || 'Error de verificación',
          message: data.message || 'El código es inválido o ya expiró.',
        });
        return false;
      }

      // Si todo sale bien, redirigimos al login
      navigation.replace('Login');
      return true;
    } catch (err) {
      console.error(err);
      setError({
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor.',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código si no ha llegado (Ruta actualizada con /auth)
  const handleResendCode = async () => {
    if (timer > 0) return;
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/customers/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          title: 'Error al reenviar',
          message: data.message || 'No se pudo mandar otro código.',
        });
        return;
      }

      setTimer(120);
    } catch (err) {
      console.error(err);
      setError({
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor.',
      });
    }
  };

  return {
    email,
    code,
    setCode,
    loading,
    error,
    timer,
    handleVerifyCode,
    handleResendCode,
  };
};