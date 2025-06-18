import db from '@/db/sqlite';
import { Persona } from '@/types/model';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, TouchableOpacity, View } from 'react-native';

export default function PersonasScreen() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const router = useRouter();

  const cargarPersonas = async () => {
    const result = await db.getAllAsync<Persona>('SELECT * FROM personas');
    setPersonas(result);
  };

  useFocusEffect(
    useCallback(() => {
      cargarPersonas();
    }, [])
  );

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-2xl font-bold mb-4 text-black dark:text-white">Personas</Text>

      <FlatList
        data={personas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/personas/editar', params: { id: item.id } })}
            className="p-4 mb-2 bg-white dark:bg-neutral-800 rounded shadow"
          >
            <Text className="text-lg font-semibold text-black dark:text-white">{item.nombre}</Text>
            <Text className="text-sm text-gray-500">Deuda: ${item.deuda.toLocaleString()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text className="text-gray-500 dark:text-gray-400">No hay personas registradas.</Text>}
      />

      <Pressable
        onPress={() => router.push('/personas/crear')}
        className="absolute bottom-6 right-6 bg-blue-600 rounded-full p-4 shadow-lg"
      >
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </View>
  );
}