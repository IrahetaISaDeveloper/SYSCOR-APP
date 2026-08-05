import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import apiClient from '../services/apiClient'; // debe tener withCredentials: true (ver nota abajo)

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};




export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Al montar la app, preguntamos al backend si la cookie (guardada por
  // el motor nativo de RN) sigue siendo válida. No manejamos el valor
  // de la cookie nosotros mismos, RN ya la reenvía automáticamente.
  useEffect(() => {
  const restoreSession = async () => {
    try {
      const { data } = await apiClient.get('/auth/me');
      console.log('✅ /auth/me respondió OK:', data); // <-- si esto se imprime, hay cookie válida
      setUser(data);
    } catch (error) {
      console.log('❌ /auth/me falló:', error.response?.status, error.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  restoreSession();
}, []);

  const login = useCallback((userData) => {
    // La cookie ya quedó guardada por el motor nativo al hacer el POST
    // de login (withCredentials: true). Aquí solo actualizamos el estado.
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Error en logout:', err);
    } finally {
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;