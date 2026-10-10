import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Preferencias del cliente que viven en el teléfono: el tema y los avisos.
//
// El tema se aplica con Appearance.setColorScheme: a partir de ahí
// `useColorScheme()` devuelve lo elegido en toda la app, así que las
// pantallas no necesitan saber que existe esta preferencia.
const PreferencesContext = createContext(null);

const STORAGE_KEY = 'syscor:customer:preferences';

// 'system' sigue al teléfono; 'light' y 'dark' lo fijan.
export const THEME_OPTIONS = ['system', 'light', 'dark'];

const DEFAULTS = {
  theme: 'system',
  orderAlerts: true,
  promoEmails: false,
};

const applyTheme = (theme) => {
  // 'unspecified' devuelve el control al sistema.
  Appearance.setColorScheme(theme === 'system' ? 'unspecified' : theme);
};

export const PreferencesProvider = ({ children }) => {
  const [prefs, setPrefs] = useState(DEFAULTS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = { ...DEFAULTS, ...JSON.parse(raw) };
        if (!THEME_OPTIONS.includes(saved.theme)) saved.theme = 'system';
        setPrefs(saved);
        applyTheme(saved.theme);
      })
      .catch(() => {});
  }, []);

  const update = useCallback((patch) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    if (patch.theme) applyTheme(patch.theme);
  }, []);

  const value = useMemo(() => ({ ...prefs, update }), [prefs, update]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences debe usarse dentro de un PreferencesProvider');
  return ctx;
};

export default PreferencesContext;
