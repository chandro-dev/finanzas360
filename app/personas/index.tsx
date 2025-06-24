import db from "@/db/sqlite";
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

interface PersonaConDeuda {
  id: string;
  nombre: string;
  deudaPendiente: number;
}

export default function PersonasScreen() {
  const [personas, setPersonas] = useState<PersonaConDeuda[]>([]);
  const router = useRouter();

  const cargarPersonas = async () => {
    const result = await db.getAllAsync<PersonaConDeuda>(
      `
      SELECT 
        personas.id, 
        personas.nombre, 
        IFNULL(SUM(CASE WHEN deudas.pagado = 0 THEN deudas.monto ELSE 0 END), 0) AS deudaPendiente
      FROM personas
      LEFT JOIN deudas ON personas.id = deudas.personaId
      GROUP BY personas.id, personas.nombre
      ORDER BY personas.nombre ASC
      `
    );
    setPersonas(result);
  };

  useFocusEffect(
    useCallback(() => {
      cargarPersonas();
    }, [])
  );

  const renderItem = ({ item }: { item: PersonaConDeuda }) => {
    const deuda = item.deudaPendiente;

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({ pathname: "/personas/editar", params: { id: item.id } })
        }
        className="p-4 mb-3 bg-white dark:bg-neutral-800 rounded-2xl shadow"
      >
        <Text className="text-lg font-semibold text-black dark:text-white mb-1">
          {item.nombre}
        </Text>

        <Text
          className={`text-sm font-medium ${
            deuda > 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {deuda > 0
            ? `Debe: ${deuda.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0
              })}`
            : "Sin deuda"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 px-4 pt-6">
      <Text className="text-2xl font-bold mb-4 text-black dark:text-white">
        Personas
      </Text>

      <FlatList
        data={personas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 dark:text-gray-400 mt-10">
            No hay personas registradas.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Pressable
        onPress={() => router.push("/personas/crear")}
        className="absolute bottom-6 right-6 bg-blue-600 rounded-full p-4 shadow-lg"
      >
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </View>
  );
}
