import { useState } from 'react';
import apiClient from '@syscor/shared/src/services/apiClient';
import { firstPasswordProblem } from '@syscor/shared/src/utils/passwordRules';

// Solo letras (con acentos) y espacios, con la inicial de cada palabra en mayúscula.
const formatPersonName = (text) =>
  text
    .replace(/[^a-zA-ZáéíóúüÁÉÍÓÚÜñÑ\s]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ');

// Los números de El Salvador son de 8 dígitos y se escriben 0000-0000.
export const formatPhone = (text) => {
  const digits = text.replace(/[^0-9]/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

export const phoneDigits = (text) => (text || '').replace(/[^0-9]/g, '');

// Fuerza de la contraseña, usada por el medidor de la pantalla de registro.
export const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { level: 1, label: 'DÉBIL' };
  if (score <= 4) return { level: 2, label: 'MEDIA' };
  return { level: 3, label: 'FUERTE' };
};

export const useCustomerAuth = () => {
  // Paso 1 — datos de la cuenta
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Paso 3 — verificación
  const [code, setCode] = useState('');

  // Estados generales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFirstNameChange = (text) => setFirstName(formatPersonName(text));
  const handleLastNameChange = (text) => setLastName(formatPersonName(text));
  const handlePhoneChange = (text) => setPhone(formatPhone(text));

  // Arma el payload de datos personales, incluida la dirección del paso 2.
  const buildPersonalInfoPayload = (data = {}) => {
    const rawFirst = (data.firstName !== undefined ? data.firstName : firstName) || '';
    const rawLast = (data.lastName !== undefined ? data.lastName : lastName) || '';
    const rawPhone = (data.phone !== undefined ? data.phone : phone) || '';
    const address = data.address || null;

    return {
      name: rawFirst.trim().replace(/\s+/g, ' '),
      lastname: rawLast.trim().replace(/\s+/g, ' '),
      image: null,
      birthdate: null,
      phones: phoneDigits(rawPhone) ? [phoneDigits(rawPhone)] : [],
      addresses: address ? [address] : [],
    };
  };

  // Valida el paso 1 sin llamar al backend todavía.
  const validateAccountStep = () => {
    const cleanFirst = firstName.trim().replace(/\s+/g, ' ');
    const cleanLast = lastName.trim().replace(/\s+/g, ' ');
    const cleanEmail = email.trim();
    const digits = phoneDigits(phone);

    if (!cleanFirst || !cleanLast || !cleanEmail || !digits || !password || !confirmPassword) {
      setError({
        title: 'Campos incompletos',
        message: 'Por favor, rellena todos los campos para continuar.',
      });
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError({
        title: 'Correo no válido',
        message: 'Ingresa un formato de correo válido.',
      });
      return false;
    }

    if (cleanEmail.includes('+')) {
      setError({
        title: 'Correo no válido',
        message:
          'El servicio de correo no admite direcciones con el signo "+" (alias). Utiliza tu dirección estándar.',
      });
      return false;
    }

    if (digits.length < 8) {
      setError({
        title: 'Teléfono incompleto',
        message: 'El número debe tener exactamente 8 dígitos.',
      });
      return false;
    }

    // Mismas reglas que aplica el backend (8 caracteres, mayúscula,
    // minúscula, número y símbolo): avisarlas aquí evita que el registro
    // falle al final, después de haber llenado todo el formulario.
    const passwordProblem = firstPasswordProblem(password);
    if (passwordProblem) {
      setError({
        title: 'Contraseña insegura',
        message: passwordProblem,
      });
      return false;
    }

    if (password.includes(' ')) {
      setError({
        title: 'Contraseña inválida',
        message: 'Por seguridad, la contraseña no puede contener espacios.',
      });
      return false;
    }

    if (password !== confirmPassword) {
      setError({
        title: 'Las contraseñas no coinciden',
        message: 'Verifica que ambas contraseñas sean iguales.',
      });
      return false;
    }

    if (!acceptedTerms) {
      setError({
        title: 'Términos pendientes',
        message: 'Debes aceptar los términos de servicio para crear tu cuenta.',
      });
      return false;
    }

    setError(null);
    return true;
  };

  // Valida la dirección del paso 2.
  const validateAddress = (address) => {
    if (
      !address?.departamento ||
      !address?.municipio ||
      !address?.tipo ||
      !address?.colonia?.trim() ||
      !address?.calle?.trim() ||
      !address?.numero?.trim()
    ) {
      setError({
        title: 'Dirección incompleta',
        message: 'Completa los campos obligatorios de tu dirección.',
      });
      return false;
    }
    setError(null);
    return true;
  };

  // Envía el código de verificación al correo (último paso antes de crear).
  const sendVerificationCode = async (explicitEmail) => {
    const cleanEmail = (explicitEmail || email || '').trim();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/customers/register/send-code', { email: cleanEmail });
      return true;
    } catch (err) {
      if (err.response) {
        setError({
          title: err.response.data?.title || 'Error en el registro',
          message: err.response.data?.message || 'No se pudo enviar el código.',
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

  // Verifica el código y crea la cuenta con los datos y la dirección recogidos.
  const handleVerifyCode = async (navigation, explicitData = {}) => {
    const activeCode = (explicitData.code || code || '').trim();
    const activeEmail = (explicitData.email || email || '').trim();
    const activePassword = (explicitData.password || password || '').trim();

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
      await apiClient.post('/auth/customers/register/verify-code', {
        code: activeCode,
        email: activeEmail,
      });

      const personalInfo = buildPersonalInfoPayload(explicitData);
      await apiClient.post('/auth/customers/register/personal-info', personalInfo);

      await apiClient.post('/auth/customers/register/set-password', {
        password: activePassword,
      });

      navigation.replace('VerifiedSuccess');
      return true;
    } catch (err) {
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

  const handleResendCode = async (explicitEmail) => {
    const targetEmail = (explicitEmail || email || '').trim();
    if (!targetEmail) return;
    setError(null);

    try {
      await apiClient.post('/auth/customers/register/send-code', { email: targetEmail });
    } catch (err) {
      setError({
        title: 'Error al reenviar',
        message: err.response?.data?.message || 'No se pudo enviar el código nuevamente.',
      });
    }
  };

  return {
    // Paso 1
    firstName,
    setFirstName: handleFirstNameChange,
    lastName,
    setLastName: handleLastNameChange,
    email,
    setEmail,
    phone,
    setPhone: handlePhoneChange,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    acceptedTerms,
    setAcceptedTerms,
    // Paso 3
    code,
    setCode,
    // Estados
    loading,
    error,
    setError,
    // Acciones
    validateAccountStep,
    validateAddress,
    sendVerificationCode,
    handleVerifyCode,
    handleResendCode,
  };
};
