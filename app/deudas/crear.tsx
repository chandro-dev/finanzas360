// pages/deudas/crear.tsx
import db from "@/db/sqlite";
import { useDeudaForm } from "@/hooks/useDeudaForm";
import { Persona } from "@/types/model";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function CrearDeudaScreen() {
  const { form, onChange, guardar } = useDeudaForm();
  const [personas, setPersonas] = useState<Persona[]>([]);

  useEffect(() => {
    db.getAllAsync<Persona>("SELECT * FROM personas").then(setPersonas);
  }, []);

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-xl font-bold text-black dark:text-white mb-4">
        Registrar Préstamo
      </Text>

      <Text className="text-black dark:text-white mb-1">Persona</Text>
      <View className="border rounded mb-4 bg-white">
        <Picker
          selectedValue={form.personaId}
          onValueChange={(itemValue) => onChange("personaId", itemValue)}
        >
          <Picker.Item label="Seleccione una persona" value="" />
          {personas.map((p) => (
            <Picker.Item key={p.id} label={p.nombre} value={p.id} />
          ))}
        </Picker>
      </View>

      <Text className="text-black dark:text-white mb-1">Monto</Text>
      <TextInput
        placeholder="Monto prestado"
        keyboardType="numeric"
        value={form.monto}
        onChangeText={(text) => onChange("monto", text)}
        className="border p-2 rounded text-black bg-white mb-4"
      />

      <Text className="text-black dark:text-white mb-1">Fecha</Text>
      <TextInput
        value={form.fecha}
        onChangeText={(text) => onChange("fecha", text)}
        className="border p-2 rounded text-black bg-white mb-4"
      />

      <Text className="text-black dark:text-white mb-1">Descripción</Text>
      <TextInput
        value={form.descripcion}
        onChangeText={(text) => onChange("descripcion", text)}
        placeholder="Ej: préstamo para almuerzo"
        className="border p-2 rounded text-black bg-white mb-4"
      />

      <Button title="Guardar" onPress={guardar} color="#2563eb" />
    </View>
  );
}
