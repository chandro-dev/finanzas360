import { useAuth } from "@/context/AuthContext";
import { autenticarBiometria } from "@/hooks/useBiometria";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [autenticado, setAutenticado] = useState(false); // Para evitar doble navegación

  const autenticar = async () => {
    if (autenticado) return; // evita bucles

    setCargando(true);
    const ok = await autenticarBiometria();
    setCargando(false);

    if (ok) {
      setIsLoggedIn(true);
      setAutenticado(true);
      router.replace("/(tabs)");
    } else {
      Alert.alert("Error", "No se pudo autenticar");
    }
  };

  useEffect(() => {
    autenticar();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {cargando && <ActivityIndicator size="large" />}
      <Button title="Intentar de nuevo" onPress={autenticar} />
    </View>
  );
}
