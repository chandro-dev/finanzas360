// app/deudas/editar.tsx
import { useDeudaForm } from "@/hooks/useDeudaForm";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";

export default function EditarDeudaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { form, onChange, actualizarDeuda, loading } = useDeudaForm(id as string);

  useEffect(() => {
    if (!id || typeof id !== "string") {
      Alert.alert("Error", "ID de deuda no válido");
      router.back();
    }
  }, [id]);

  const guardarCambios = async () => {
    if (!id || typeof id !== "string") return;
    await actualizarDeuda();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-black dark:text-white">Cargando deuda...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-xl font-bold text-black dark:text-white mb-4">
        Editar Deuda
      </Text>

      <Text className="text-black dark:text-white mb-1">Persona</Text>
      <TextInput
        value={form.persona}
        onChangeText={(text) => onChange("persona", text)}
        placeholder="Nombre de la persona"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Text className="text-black dark:text-white mb-1">Monto</Text>
      <TextInput
        value={form.monto}
        onChangeText={(text) => onChange("monto", text)}
        placeholder="Monto"
        keyboardType="numeric"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Text className="text-black dark:text-white mb-1">Fecha</Text>
      <TextInput
        value={form.fecha}
        onChangeText={(text) => onChange("fecha", text)}
        placeholder="AAAA-MM-DD"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-black dark:text-white">¿Pagado?</Text>
        <Switch
          value={form.pagado}
          onValueChange={(value) => onChange("pagado", value)}
        />
      </View>

      <Button title="Guardar Cambios" onPress={guardarCambios} color="#2563eb" />
    </View>
  );
}
