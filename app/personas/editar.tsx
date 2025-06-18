import { usePersonaForm } from '@/hooks/usePersonaForm';
import { useLocalSearchParams } from 'expo-router';
import { Button, Text, TextInput, View } from 'react-native';

export default function CrearEditarPersona() {
  const { id } = useLocalSearchParams();
  const { form, loading, onChange, guardar, actualizar } = usePersonaForm(id as string);

  if (loading) return <Text className="text-white p-4">Cargando...</Text>;

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-xl font-bold mb-4 text-black dark:text-white">
        {id ? 'Editar Persona' : 'Nueva Persona'}
      </Text>

      <Text className="text-black dark:text-white">Nombre</Text>
      <TextInput
        value={form.nombre}
        onChangeText={(text) => onChange('nombre', text)}
        placeholder="Nombre de la persona"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Text className="text-black dark:text-white">Deuda</Text>
      <TextInput
        value={form.deuda}
        onChangeText={(text) => onChange('deuda', text)}
        keyboardType="numeric"
        placeholder="0"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Button
        title={id ? 'Actualizar' : 'Guardar'}
        onPress={id ? actualizar : guardar}
        color="#2563eb"
      />
    </View>
  );
}