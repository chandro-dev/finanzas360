import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';

export default function Layout() {
  const [autenticado, setAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);
  console.log("Ejecutandome")
  useEffect(() => {
    const autenticar = async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) {
        Alert.alert("Autenticación", "Biometría no disponible en este dispositivo.");
        setAutenticado(true); // permitir continuar si no tiene huella
        setCargando(false);
        return;
      }

      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirma tu identidad",
        fallbackLabel: "Usar PIN",
        cancelLabel: "Cancelar",
      });

      if (resultado.success) {
        setAutenticado(true);
      } else {
        Alert.alert("Acceso denegado", "No se pudo autenticar.");
      }

      setCargando(false);
    };

    autenticar();
  }, []);

  if (cargando) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!autenticado) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack />
    </SafeAreaView>
  );
}
