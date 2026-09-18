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

  const buildPersonalInfoPayload = (customName, customPhone) => {
    const rawName = (customName !== undefined ? customName : name) || '';
    const rawPhone = (customPhone !== undefined ? customPhone : phone) || '';
    const normalizedName = rawName.trim().replace(/\s+/g, ' ');
    const nameParts = normalizedName.split(' ');
    const firstName = nameParts.shift() || '';
    const lastname = nameParts.join(' ').trim();

    return {
      name: firstName,
      lastname,
      image: null,
      birthdate: null,
      phones: rawPhone.trim() ? [rawPhone.trim()] : [],
      addresses: [],
    };
  };

  // 3. PASO 1: Registrar y enviar código de verificación al correo
  const handleRegister = async (navigation) => {
    const normalizedName = name.trim().replace(/\s+/g, ' ');
    const cleanEmail = email.trim();
    if (!normalizedName || !cleanEmail || !phone.trim() || !password.trim()) {
      setError({
        title: 'Campos incompletos',
        message: 'Por favor, rellena todos los campos para continuar.',
      });
      return false;
    }

    if (cleanEmail.includes('+')) {
      setError({
        title: 'Correo no válido',
        message: 'El servicio de correo no admite direcciones con el signo "+" (alias). Por favor, utiliza tu dirección de correo estándar.',
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
      console.log('[Register] send-code →', { email: cleanEmail });
      await apiClient.post('/auth/customers/register/send-code', {
        email: cleanEmail,
      });
      console.log('[Register] send-code ✓');

      // Reemplazamos la pantalla de registro por la de verificación (sin dejarla
      // en el stack) para ir directo al input del código, pasando el correo.
      navigation.replace('CustomerCodeVerification', {
        name: normalizedName,
        email: cleanEmail,
        phone: phone.trim(),
        password,
      });
      return true;

    } catch (err) {
      console.error('[Register] send-code ERROR:', err.response?.status, JSON.stringify(err.response?.data));
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
  const handleVerifyCode = async (navigation, explicitData = {}) => {
    const activeCode = (explicitData.code || code || '').trim();
    const activeEmail = (explicitData.email || email || '').trim();
    const activePassword = (explicitData.password || password || '').trim();
    const activeName = explicitData.name !== undefined ? explicitData.name : name;
    const activePhone = explicitData.phone !== undefined ? explicitData.phone : phone;

    if (!activeCode || activeCode.length < 6) {
      setError({
        title: 'Código incompleto',
        message: 'Por favor, ingresa los 6 dígitos del código.',
      });
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Paso 2a: verificar código
      console.log('[Register] verify-code →', { code: activeCode, email: activeEmail });
      const verifyRes = await apiClient.post('/auth/customers/register/verify-code', {
        code: activeCode,
        email: activeEmail,
      });
      console.log('[Register] verify-code ✓', verifyRes.data);

      // Paso 2b: datos personales
      const personalInfo = buildPersonalInfoPayload(activeName, activePhone);
      console.log('[Register] personal-info →', personalInfo);
      const infoRes = await apiClient.post('/auth/customers/register/personal-info', personalInfo);
      console.log('[Register] personal-info ✓', infoRes.data);

      // Paso 2c: contraseña
      console.log('[Register] set-password →', { password: activePassword });
      const pwRes = await apiClient.post('/auth/customers/register/set-password', {
        password: activePassword,
      });
      console.log('[Register] set-password ✓', pwRes.data);

      // Cuando el backend confirma código, datos personales y contraseña,
      // la cuenta ya quedó creada.
      navigation.replace('VerifiedSuccess');
      return true;

    } catch (err) {
      console.error('[Register] ERROR:', err.response?.status, JSON.stringify(err.response?.data) || err.message);
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
  const handleResendCode = async (explicitEmail) => {
    const targetEmail = (explicitEmail || email || '').trim();
    if (!targetEmail) return;
    setError(null);

    try {
      await apiClient.post('/auth/customers/register/send-code', {
        email: targetEmail,
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