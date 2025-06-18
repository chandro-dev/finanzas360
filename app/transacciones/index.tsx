import TransaccionCard from "@/components/TransaccionCard";
import db from "@/db/sqlite";
import { Transaccion } from "@/types/model";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

export default function TransaccionesIndex() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const router = useRouter();

  const cargarTransacciones = async () => {
    const data = await db.getAllAsync<Transaccion>(
      `SELECT * FROM transacciones ORDER BY fecha DESC`
    );
    console.log(data);
    setTransacciones(data);
  };

  useFocusEffect(
    useCallback(() => {
      cargarTransacciones();
    }, [])
  );

  if (transacciones.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-900">
        <Text className="text-black dark:text-white mb-4">
          No hay transacciones aún.
        </Text>

        <Pressable
          onPress={() => router.push("/transacciones/crear")}
          className="bg-blue-600 rounded-full p-4 shadow-lg"
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-2xl font-bold mb-4 text-black dark:text-white">
        Tus Transacciones
      </Text>

      <FlatList
        className="bg-white dark:bg-neutral-900"
        data={transacciones}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/transacciones/editar",
                params: { id: item.id }
              })
            }
          >
            <TransaccionCard
              descripcion={item.descripcion}
              cantidad={item.cantidad}
              fecha={item.fecha}
            />
          </Pressable>
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      <Pressable
        onPress={() => router.push("/transacciones/crear")}
        className="absolute bottom-6 right-6 bg-blue-600 rounded-full p-4 shadow-lg"
      >
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </View>
  );
}
