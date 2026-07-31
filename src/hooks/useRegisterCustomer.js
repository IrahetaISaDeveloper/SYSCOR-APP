import { useState } from 'react';

// URL de la API de producción del proyecto
const API_URL = 'https://syscor.onrender.com/api';

export const useRegisterCustomer = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Función para registrar al cliente y mandar el correo con el código
  const handleRegister = async (navigation) => {
    // Validar que no quede ningún campo vacío
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError({
        title: 'Campos incompletos',
        message: 'Por favor, rellena todos los campos para continuar.',
      });
      return false;
    }

    // Validar que el teléfono tenga exactamente los 8 dígitos
    if (phone.length < 8) {
      setError({
        title: 'Teléfono incompleto',
        message: 'El número de teléfono debe tener exactamente 8 dígitos.',
      });
      return false;
    }

    // Validar que la contraseña tenga un mínimo de 8 caracteres (letras, números o símbolos)
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
      // Ruta actualizada al estándar de autenticación del backend
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

      // Si todo sale bien, lo mandamos a la pantalla de verificación pasando el correo
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

  return {
    name,
    setName: handleNameChange,
    email,
    setEmail,
    phone,
    setPhone: handlePhoneChange,
    password,
    setPassword,
    loading,
    error,
    handleRegister,
  };
};