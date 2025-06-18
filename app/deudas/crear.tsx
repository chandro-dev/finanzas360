// pages/deudas/crear.tsx
import { useDeudaForm } from "@/hooks/useDeudaForm";
import { Button, Text, TextInput, View } from "react-native";

export default function CrearDeudaScreen() {
  const { form, onChange, guardar } = useDeudaForm();

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-xl font-bold text-black dark:text-white mb-4">Registrar Préstamo</Text>

      <Text className="text-black dark:text-white">Persona</Text>
      <TextInput
        placeholder="ID de Persona"
        value={form.personaId}
        onChangeText={(text) => onChange("personaId", text)}
        className="border p-2 rounded text-black bg-white mb-4"
      />

      <Text className="text-black dark:text-white">Monto</Text>
      <TextInput
        placeholder="Monto prestado"
        keyboardType="numeric"
        value={form.monto}
        onChangeText={(text) => onChange("monto", text)}
        className="border p-2 rounded text-black bg-white mb-4"
      />

      <Text className="text-black dark:text-white">Fecha</Text>
      <TextInput
        value={form.fecha}
        onChangeText={(text) => onChange("fecha", text)}
        className="border p-2 rounded text-black bg-white mb-4"
      />

      <Text className="text-black dark:text-white">Descripción</Text>
      <TextInput
        value={form.descripcion}
        onChangeText={(text) => onChange("descripcion", text)}
        className="border p-2 rounded text-black bg-white mb-4"
      />

      <Button title="Guardar" onPress={guardar} color="#2563eb" />
    </View>
  );
}
