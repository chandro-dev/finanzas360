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
      return () => {};
    }, [])
  );

  const irACrear = () => router.push("/tarjetas/crear");
  const irAEditar = (id: string) =>
    router.push({ pathname: "/tarjetas/editar", params: { id } });

  const renderItem = ({ item }: { item: Tarjeta }) => {
    const porcentaje = (item.disponible / item.cupo) * 100;
    const colorBarra =
      porcentaje >= 70
        ? "bg-green-500"
        : porcentaje >= 30
        ? "bg-yellow-500"
        : "bg-red-500";

    return (
      <TouchableOpacity
        className="bg-white dark:bg-neutral-800 p-4 mb-3 rounded-2xl shadow space-y-2"
        onPress={() => irAEditar(item.id)}
      >
        <View className="flex-row items-center space-x-3">
          <Ionicons name="card-outline" size={28} color="#2563eb" />
          <Text className="text-lg font-bold text-black dark:text-white">
            {item.nombre}
          </Text>
        </View>

        <Text className="text-sm text-neutral-600 dark:text-neutral-300">
          Cupo:{" "}
          <Text className="font-semibold text-black dark:text-white">
            {item.cupo.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0
            })}
          </Text>
        </Text>

        <Text className="text-sm text-neutral-600 dark:text-neutral-300">
          Disponible:{" "}
          <Text className="font-semibold text-black dark:text-white">
            {item.disponible.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0
            })}
          </Text>
        </Text>

        <View className="w-full h-3 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden mt-2">
          <View
            className={`h-full ${colorBarra}`}
            style={{ width: `${porcentaje}%` }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4 relative">
      <Text className="text-2xl font-extrabold mb-4 text-black dark:text-white">
        Tus Tarjetas
      </Text>

      <FlatList
        data={tarjetas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className="text-center text-neutral-500 dark:text-neutral-400 mt-10">
            No hay tarjetas registradas.
          </Text>
        }
      />

      <TouchableOpacity
        onPress={irACrear}
        className="absolute bottom-6 right-6 bg-blue-600 p-5 rounded-full shadow-lg"
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
  