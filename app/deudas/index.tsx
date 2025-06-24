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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="p-4 mb-3 bg-white dark:bg-neutral-800 rounded-2xl shadow"
      onPress={() =>
        router.push({ pathname: "/deudas/editar", params: { id: item.id } })
      }
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-lg font-semibold text-black dark:text-white">
          {item.personaNombre}
        </Text>
        <Text
          className={`text-sm font-bold ${
            item.pagado ? "text-green-600" : "text-yellow-600"
          }`}
        >
          {item.pagado ? "Pagado" : "Pendiente"}
        </Text>
      </View>

      <Text className="text-base text-gray-800 dark:text-gray-200 font-medium">
        {parseFloat(item.monto).toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0
        })}
      </Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {item.fecha}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 px-4 pt-6">
      <Text className="text-2xl font-bold mb-4 text-black dark:text-white">
        Préstamos
      </Text>

      <FlatList
        data={deudas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 dark:text-gray-300 mt-10">
            No hay deudas registradas.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Pressable
        onPress={() => router.push("/deudas/crear")}
        className="absolute bottom-6 right-6 bg-blue-600 rounded-full p-4 shadow-lg"
      >
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </View>
  );
}
