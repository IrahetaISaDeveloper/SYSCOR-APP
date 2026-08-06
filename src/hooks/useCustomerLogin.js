import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient'; // Importo nuestro cliente centralizado para manejar bien las cookies y no tener problemas de sesión

export const useCustomerLogin = () => {
  // Aquí defino mis estados para guardar lo que el cliente va escribiendo en el formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Me traigo la función login del contexto global que armamos
  const { login } = useAuth();

  const handleLogin = async () => {
    // 1. Primero limpio los espacios que la gente a veces deja al inicio o al final por accidente
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // 2. Seguridad básica: Valido que no me dejen los campos en blanco antes de hacer nada
    if (!cleanEmail || !cleanPassword) {
      setError({
        title: 'Campos incompletos',
        message: 'Debes ingresar tu correo y contraseña.',
      });
      return; // Corto la función aquí para no mandar peticiones basura al backend
    }

    // 3. Seguridad: Uso esta expresión regular para asegurarme de que el correo tenga un formato real y no lleve espacios internos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError({
        title: 'Correo inválido',
        message: 'Ingresa un formato de correo válido sin espacios.',
      });
      return;
    }

    // 4. Seguridad: Bloqueo explícitamente los espacios en la contraseña para que no nos rompan la lógica del sistema
    if (password.includes(' ')) {
      setError({
        title: 'Contraseña inválida',
        message: 'Por seguridad, la contraseña no puede contener espacios.',
      });
      return;
    }

    // Si pasamos todas las barreras de seguridad, enciendo la animación de carga
    setLoading(true);
    setError(null);

    try {
      // 5. Hago el POST a la ruta de clientes usando apiClient (esto me automatiza lo de guardar la cookie en el cel)
      await apiClient.post('/auth/customers/login', {
        email: cleanEmail,
        password: cleanPassword,
      });

      // 6. Si el login pasó bien, hago una petición para traerme los datos del cliente que acaba de entrar
      const { data: userData } = await apiClient.get('/auth/me');

      console.log("Éxito. Sesión de cliente iniciada correctamente en el sistema de El Corral.");

      // 7. Le paso los datos al AuthContext. Con esto mi compañero ya puede atrapar la sesión en el App.js y redirigir
      login(userData);

    } catch (err) {
      console.error('Error en mi parte del login de cliente:', err);
      // Atrapo los errores del backend para que la app no tire un pantallazo rojo
      if (err.response) {
        setError({
          title: err.response.data?.title || 'Error de inicio de sesión',
          message: err.response.data?.message || 'Credenciales inválidas',
        });
      } else {
        // Por si el servidor está apagado o el cliente no tiene internet
        setError({
          title: 'Error de conexión',
          message: 'No se pudo conectar con el servidor. Revisa tu internet.',
        });
      }
    } finally {
      // Pase lo que pase, apago el estado de carga al terminar
      setLoading(false);
    }
  };

  // Retorno todo lo que la vista (LoginCustomerScreen) va a necesitar usar
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