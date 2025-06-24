import ListadoTransacciones from "@/components/ListadoTransacciones";
import { useCuentaForm } from "@/hooks/useCuentaForm";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function EditarCuentaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { form, loading, onChange, actualizarCuenta } = useCuentaForm(
    id as string
  );

  const guardarCambios = async () => {
    await actualizarCuenta();
    router.push("/cuentas");
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-xl font-bold mb-4 text-black dark:text-white">
        Editar Cuenta
      </Text>

      <Text className="text-black dark:text-white">Nombre</Text>
      <TextInput
        value={form.nombre}
        onChangeText={(text) => onChange("nombre", text)}
        placeholder="Nombre de la cuenta"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Text className="text-black dark:text-white">Saldo</Text>
      <TextInput
        value={form.saldo}
        onChangeText={(text) => onChange("saldo", text)}
        keyboardType="numeric"
        placeholder="Saldo inicial"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Button
        title="Guardar Cambios"
        onPress={guardarCambios}
        color="#2563eb"
      />
      <ListadoTransacciones
        sentenciaSQL="SELECT * FROM transacciones WHERE cuentaId = ? ORDER BY fecha DESC"
        parametrosIniciales={[id]}
        titulo="Transacciones asociadas"
      />
    </View>
  );
}
