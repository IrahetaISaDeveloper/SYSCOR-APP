import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPalettes } from "./palettes";

// Tema de la app de empleados: 'system' sigue al teléfono; 'light' y 'dark'
// lo fijan. Se aplica con Appearance.setColorScheme, así `useColorScheme()`
// devuelve lo elegido en toda la app (también en los componentes de shared y
// en las pantallas de login, que ya lo leen).
export const THEME_OPTIONS = ["system", "light", "dark"];

const STORAGE_KEY = "syscor:employee:theme";

const ThemeModeContext = createContext({ mode: "system", setMode: () => {} });

const applyMode = (mode) => {
  // 'unspecified' devuelve el control al sistema.
  Appearance.setColorScheme(mode === "system" ? "unspecified" : mode);
};

export function ThemeModeProvider({ children }) {
  const [mode, setModeState] = useState("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!THEME_OPTIONS.includes(saved)) return;
        setModeState(saved);
        applyMode(saved);
      })
      .catch(() => {});
  }, []);

  const setMode = useCallback((next) => {
    if (!THEME_OPTIONS.includes(next)) return;
    setModeState(next);
    applyMode(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export const useThemeMode = () => useContext(ThemeModeContext);

export const useIsDark = () => useColorScheme() === "dark";

// { isDark, c: waiterColors, p: employeePalette } según el tema activo.
export const useTheme = () => getPalettes(useIsDark());

// Convierte una fábrica de estilos en un hook. Cada tema se crea una sola vez
// y se reutiliza, así que llamar al hook en cada render no cuesta nada.
//   const useStyles = makeStyles(({ c, p, isDark }) => ({ ... }));
//   const styles = useStyles();
export const makeStyles = (factory) => {
  const cache = {};
  const build = (isDark) => {
    const key = isDark ? "dark" : "light";
    if (!cache[key]) cache[key] = StyleSheet.create(factory(getPalettes(isDark)));
    return cache[key];
  };
  const useStyles = () => build(useIsDark());
  useStyles.build = build;
  return useStyles;
};
