// hooks/useThemeConfig.ts

import React, { createContext, useContext, useState, useMemo } from "react";
import { useColorScheme } from "react-native";
import { DarkTheme, LightTheme } from "@/utils/theme";
import type { MD3Theme } from "react-native-paper";

// Define el tipo del contexto
interface ThemeContextType {
  theme: MD3Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

// ⚠️ Esto es una constante, NO un "namespace"
const ThemeToggleContext = createContext<ThemeContextType>({
  theme: LightTheme,
  isDark: false,
  toggleTheme: () => {},
});

// ✅ Proveedor del contexto
export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");

  const theme = useMemo(() => (isDark ? DarkTheme : LightTheme), [isDark]);
  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeToggleContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeToggleContext.Provider>
  );
};

// ✅ Hook para consumir el contexto
export const useAppTheme = () => useContext(ThemeToggleContext);
