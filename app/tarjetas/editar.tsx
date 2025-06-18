import { useTarjetaForm } from '@/hooks/useTarjetaForm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';

export default function EditarTarjetaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const {
    form,
    loading,
    onChange,
    actualizarTarjeta,
  } = useTarjetaForm(id as string);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'ID de tarjeta no válido');
      router.back();
    }
  }, [id]);

  const guardarCambios = async () => {
    if (!id || typeof id !== 'string') return;
    await actualizarTarjeta();
  };

  if (loading) {
    return <Text className="text-white p-4">Cargando tarjeta...</Text>;
  }

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-xl font-bold text-black dark:text-white mb-4">Editar Tarjeta</Text>

      <Text className="text-black dark:text-white">Nombre</Text>
      <TextInput
        value={form.nombre}
        onChangeText={(text) => onChange('nombre', text)}
        placeholder="Nombre de la tarjeta"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Text className="text-black dark:text-white">Cupo</Text>
      <TextInput
        value={form.cupo}
        onChangeText={(text) => onChange('cupo', text)}
        keyboardType="numeric"
        placeholder="Cupo total"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Text className="text-black dark:text-white">Disponible</Text>
      <TextInput
        value={form.disponible}
        onChangeText={(text) => onChange('disponible', text)}
        keyboardType="numeric"
        placeholder="Disponible actualmente"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Button title="Guardar Cambios" onPress={guardarCambios} color="#2563eb" />
    </View>
  );
}
