import db from "@/db/sqlite";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

interface Tarjeta {
  id: string;
  nombre: string;
  cupo: number;
  disponible: number;
}

export default function TarjetasScreen() {
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const router = useRouter();

  const cargarTarjetas = async () => {
    const results = await db.getAllAsync<Tarjeta>("SELECT * FROM tarjetas");
    setTarjetas(results);
  };

  useFocusEffect(
    useCallback(() => {
      cargarTarjetas();

      // Si necesitas limpiar algo al salir de la pantalla:
      return () => {
        // cleanup opcional
      };
    }, [])
  );

  const irACrear = () => router.push("/tarjetas/crear");
  const irAEditar = (id: string) => {
    console.log(id);
    router.push({ pathname: "/tarjetas/editar", params: { id: id } });
  };
  const renderItem = ({ item }: { item: Tarjeta }) => (
    <TouchableOpacity
      className="bg-white dark:bg-neutral-800 p-4 mb-2 rounded shadow"
      onPress={() => irAEditar(item.id)}
    >
      <Text className="text-lg font-semibold text-black dark:text-white">
        {item.nombre}
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-300">
        Cupo: ${item.cupo.toLocaleString()}
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-300">
        Disponible: ${item.disponible.toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-2xl font-bold mb-4 text-black dark:text-white">
        Tus Tarjetas
      </Text>

      <FlatList
        data={tarjetas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className="text-gray-500 dark:text-gray-400">
            No hay tarjetas registradas.
          </Text>
        }
      />

      <TouchableOpacity
        onPress={irACrear}
        className="absolute bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg"
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
