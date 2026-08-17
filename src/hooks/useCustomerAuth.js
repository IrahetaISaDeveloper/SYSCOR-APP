import { useState } from 'react';
import apiClient from '../services/apiClient';

export const useCustomerAuth = () => {
  // Estados del Paso 1 (Registro)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Estados del Paso 2 (Verificación)
  const [code, setCode] = useState('');
  
  // Estados generales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Formateo de nombre (solo letras y mayúsculas iniciales)
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

  // 2. Formateo de teléfono (solo números, max 8 dígitos)
  const handlePhoneChange = (text) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    if (numericOnly.length <= 8) {
      setPhone(numericOnly);
    }
  };

  const buildPersonalInfoPayload = () => {
    const normalizedName = name.trim().replace(/\s+/g, ' ');
    const nameParts = normalizedName.split(' ');
    const firstName = nameParts.shift() || '';
    const lastname = nameParts.join(' ').trim();

    return {
      name: firstName,
      lastname,
      image: null,
      birthdate: null,
      phones: phone.trim() ? [phone.trim()] : [],
      addresses: [],
    };
  };

  // 3. PASO 1: Registrar y enviar código de verificación al correo
  const handleRegister = async (navigation) => {
    const normalizedName = name.trim().replace(/\s+/g, ' ');
    if (!normalizedName || !email.trim() || !phone.trim() || !password.trim()) {
      setError({
        title: 'Campos incompletos',
        message: 'Por favor, rellena todos los campos para continuar.',
      });
      return false;
    }

    if (normalizedName.split(' ').length < 2) {
      setError({
        title: 'Nombre incompleto',
        message: 'Debes ingresar nombre y apellido para completar el registro.',
      });
      return false;
    }

    if (phone.length < 8) {
      setError({
        title: 'Teléfono incompleto',
        message: 'El número debe tener exactamente 8 dígitos.',
      });
      return false;
    }

    if (password.length < 8) {
      setError({
        title: 'Contraseña muy corta',
        message: 'Debe tener un mínimo de 8 caracteres.',
      });
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // ¡ACTUALIZADO CON GUIONES PARA COINCIDIR CON EL BACKEND!
      await apiClient.post('/auth/customers/register/send-code', {
        email: email.trim(),
      });

      // Reemplazamos la pantalla de registro por la de verificación (sin dejarla
      // en el stack) para ir directo al input del código, pasando el correo.
      navigation.replace('CustomerCodeVerification', {
        name: normalizedName,
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      return true;

    } catch (err) {
      console.error(err);
      // Manejamos el error estandarizado del backend
      if (err.response) {
        setError({
          title: err.response.data?.title || 'Error en el registro',
          message: err.response.data?.message || 'No se pudo completar el registro.',
        });
      } else {
        setError({
          title: 'Error de conexión',
          message: 'No se pudo conectar con el servidor.',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 4. PASO 2: Verificar el código de 6 dígitos
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
      // ¡ACTUALIZADO CON GUIONES PARA COINCIDIR CON EL BACKEND!
      await apiClient.post('/auth/customers/register/verify-code', {
        code: code.trim(),
        email: email.trim(),
      });

      const personalInfo = buildPersonalInfoPayload();

      await apiClient.post('/auth/customers/register/personal-info', personalInfo);
      await apiClient.post('/auth/customers/register/set-password', {
        password: password.trim(),
      });

      // Cuando el backend confirma código, datos personales y contraseña,
      // la cuenta ya quedó creada.
      navigation.replace('VerifiedSuccess');
      return true;

    } catch (err) {
      console.error(err);
      if (err.response) {
        setError({
          title: err.response.data?.title || 'Error de verificación',
          message: err.response.data?.message || 'El código es inválido o ya expiró.',
        });
      } else {
        setError({
          title: 'Error de conexión',
          message: 'No se pudo conectar con el servidor.',
        });
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 5. Reenviar código (opcional, para el botón de reenviar)
  const handleResendCode = async () => {
    if (!email.trim()) return;
    setError(null);

    try {
      // ¡ACTUALIZADO CON GUIONES PARA COINCIDIR CON EL BACKEND!
      await apiClient.post('/auth/customers/register/send-code', {
        email: email.trim(),
      });
    } catch (err) {
      console.error(err);
      setError({
        title: 'Error al reenviar',
        message: err.response?.data?.message || 'No se pudo enviar el código nuevamente.',
      });
    }
  };

  return {
    // Datos y setters de Registro
    name,
    setName: handleNameChange,
    email,
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
    // Funciones de acción
    handleRegister,
    handleVerifyCode,
    handleResendCode,
  };
};