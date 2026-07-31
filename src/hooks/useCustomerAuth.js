import { useState, useEffect } from 'react';

// URL de la API de producción del proyecto
const API_URL = 'https://syscor.onrender.com/api';

export const useCustomerAuth = (route) => {
  // Capturamos el correo enviado desde la pantalla anterior (si aplica)
  const emailParam = route?.params?.email || '';

  // Estados de Registro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Estados de Verificación
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(120); // 2 minutos para reenviar código

  // Estados generales de control
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Temporizador para el botón de reenviar código
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Función para formatear el nombre automáticamente: 
  // - Solo permite letras y espacios.
  // - Primera letra de cada palabra en mayúscula y las demás en minúsculas.
  const handleNameChange = (text) => {
    let formatted = text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    formatted = formatted.replace(/\s+/g, ' ');
    formatted = formatted
      .toLowerCase()
      .split(' ')
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
      .join(' ');

    setName(formatted);
  };

  // Función para controlar el teléfono: 
  // - Solo permite números.
  // - Corta el texto automáticamente para que NUNCA pase de 8 dígitos.
  const handlePhoneChange = (text) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    if (numericOnly.length <= 8) {
      setPhone(numericOnly);
    }
  };

  // 1. Función para registrar al cliente y mandar el correo con el código
  const handleRegister = async (navigation) => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError({
        title: 'Campos incompletos',
        message: 'Por favor, rellena todos los campos para continuar.',
      });
      return false;
    }

    if (phone.length < 8) {
      setError({
        title: 'Teléfono incompleto',
        message: 'El número de teléfono debe tener exactamente 8 dígitos.',
      });
      return false;
    }

    if (password.length < 8) {
      setError({
        title: 'Contraseña muy corta',
        message: 'La contraseña debe tener un mínimo de 8 caracteres entre letras, números o símbolos.',
      });
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/customers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          title: data.title || 'Error en el registro',
          message: data.message || 'No se pudo completar el registro.',
        });
        return false;
      }

      // Nos vamos a la pantalla de verificación pasando el correo
      navigation.navigate('CustomerCodeVerification', { email: email.trim() });
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

  // 2. Enviar el código de verificación al backend y avanzar a la pantalla de éxito
  const handleVerifyCode = async (navigation) => {
    const targetEmail = emailParam || email;

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
        body: JSON.stringify({ email: targetEmail, code: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          title: data.title || 'Error de verificación',
          message: data.message || 'El código es inválido o ya expiró.',
        });
        return false;
      }

      // Si todo sale bien con el código, lo mandamos a la pantalla de éxito que creamos
      navigation.replace('VerifiedSuccess');
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

  // 3. Reenviar código si no ha llegado
  const handleResendCode = async () => {
    if (timer > 0) return;
    const targetEmail = emailParam || email;
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/customers/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
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
    // Datos y setters de Registro
    name,
    setName: handleNameChange,
    email: emailParam || email,
    setEmail,
    phone,
    setPhone: handlePhoneChange,
    password,
    setPassword,
    // Datos y setters de Verificación
    code,
    setCode,
    // Estados generales
    loading,
    error,
    timer,
    // Funciones de acción
    handleRegister,
    handleVerifyCode,
    handleResendCode,
  };
};