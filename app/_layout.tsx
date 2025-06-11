// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { PaperProvider, ActivityIndicator, Text, Button } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import * as LocalAuthentication from "expo-local-authentication";
import { AppThemeProvider, useAppTheme } from "@/hooks/useThemeConfig";
import { Slot } from "expo-router";

function InnerLayout() {
  const { theme, isDark } = useAppTheme();
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  const autenticar = async () => {
    setCargando(true);

    try {
      const disponible = await LocalAuthentication.hasHardwareAsync();
      const soportado = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (disponible && soportado.length > 0) {
        const resultado = await LocalAuthentication.authenticateAsync({
          promptMessage: "Autenticación requerida",
          fallbackLabel: "Usar contraseña",
        });

        setAutenticado(resultado.success);
      } else {
        setAutenticado(true); // sin hardware, se permite el acceso
      }
    } catch (error) {
      console.error("Error al autenticar:", error);
      setAutenticado(false);
    }

    setCargando(false);
  };

  useEffect(() => {
    autenticar();
  }, []);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!autenticado) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background, padding: 24 }}>
        <Text style={{ color: theme.colors.onBackground, fontSize: 18, fontWeight: "600", marginBottom: 8, textAlign: "center" }}>
          Acceso denegado
        </Text>
        <Text style={{ color: theme.colors.onBackground, fontSize: 15, textAlign: "center", marginBottom: 16 }}>
          No se pudo verificar tu identidad con datos biométricos. Intenta nuevamente o utiliza otro método.
        </Text>
        <Button mode="contained" onPress={autenticar}>
          Reintentar autenticación
        </Button>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Slot />
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <InnerLayout />
    </AppThemeProvider>
  );
}
