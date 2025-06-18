import { useTarjetaForm } from '@/hooks/useTarjetaForm';
import { Button, Text, TextInput, View } from 'react-native';

export default function CrearTarjetaScreen() {
  const {
    form,
    onChange,
    guardarTarjeta,
    loading
  } = useTarjetaForm();

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-xl font-bold text-black dark:text-white mb-4">Agregar Tarjeta</Text>

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
        placeholder="Disponible actual"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Button title="Guardar Tarjeta" onPress={guardarTarjeta} disabled={loading} color="#2563eb" />
    </View>
  );
}
