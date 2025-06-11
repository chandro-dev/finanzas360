// src/theme.ts

import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

export const LightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#4CAF50",
    secondary: "#FFC107",
    background: "#FAFAFA",
    surface: "#FFFFFF",
    error: "#D32F2F",
    text: "#212121",
    onSurface: "#333333"
  }
};

export  const DarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#81C784",
    secondary: "#FFD54F",
    background: "#121212",
    surface: "#1E1E1E",
    error: "#EF9A9A",
    text: "#FFFFFF",
    onSurface: "#E0E0E0"
  }
};
