// app/(pages)/_layout.tsx
import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "agregar" // Puedes cambiarlo si tu estructura cambia
};

export default function AgregarTransaccionLayout() {

  return (
    <Stack
      screenOptions={{
        headerTitle: "", // Sin título
        headerShown: false // Sin encabezado
      }}
    />
  );
}
