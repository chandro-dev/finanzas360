import { useCuentaForm } from '@/hooks/useCuentaForm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

export default function EditarCuentaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    form,
    loading,
    onChange,
    actualizarCuenta,
  } = useCuentaForm(id as string);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
  }, [id]);

  const guardarCambios = async () => {
    if (!id || typeof id !== 'string') return;
    await actualizarCuenta();
    router.push("/cuentas")
  };

  if (loading) return <Text className="p-4 text-black dark:text-white">Cargando cuenta...</Text>;

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-xl font-bold text-black dark:text-white mb-4">Editar Cuenta</Text>

      <Text className="text-black dark:text-white">Nombre</Text>
      <TextInput
        value={form.nombre}
        onChangeText={(text) => onChange('nombre', text)}
        placeholder="Nombre de la cuenta"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Text className="text-black dark:text-white">Saldo</Text>
      <TextInput
        value={form.saldo}
        onChangeText={(text) => onChange('saldo', text)}
        keyboardType="numeric"
        placeholder="Saldo inicial"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Button title="Guardar Cambios" onPress={guardarCambios} color="#2563eb" />
    </View>
  );
}
