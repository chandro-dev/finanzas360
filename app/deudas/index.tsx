import db from "@/db/sqlite";
import { Deuda } from "@/types/model";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function DeudasScreen() {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const router = useRouter();

  const cargarDeudas = async () => {
    const results = await db.getAllAsync<any>(
      `SELECT deudas.*, personas.nombre AS personaNombre 
     FROM deudas 
     JOIN personas ON personas.id = deudas.personaId 
     ORDER BY fecha DESC`
    );
    setDeudas(results);
  };

  useFocusEffect(
    useCallback(() => {
      cargarDeudas();
    }, [])
  );

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-2xl font-bold mb-4 text-black dark:text-white">
        Préstamos
      </Text>

      <FlatList
        data={deudas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="p-4 mb-2 bg-white dark:bg-neutral-800 rounded shadow"
            onPress={() => {
              router.push({
                pathname: "/deudas/editar",
                params: { id: item.id }
              });
            }}
          >
            <Text className="text-black dark:text-white font-semibold">
              {item.personaNombre}
            </Text>
            <Text className="text-gray-500 dark:text-gray-300">
              ${item.monto.toLocaleString()}
            </Text> 
            <Text className="text-xs text-gray-400">{item.fecha}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-gray-500 dark:text-gray-300">
            No hay deudas registradas.
          </Text>
        }
      />

      {/* Botón flotante para añadir */}
      <Pressable
        onPress={() => router.push("/deudas/crear")}
        className="absolute bottom-6 right-6 bg-blue-600 rounded-full p-4 shadow-lg"
      >
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </View>
  );
}
