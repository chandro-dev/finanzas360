import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import db from "@/db/sqlite";

interface Cuenta {
  id: string;
  nombre: string;
  saldo: number;
}

export default function CuentasScreen() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const router = useRouter();

  const cargarCuentas = async () => {
    const rows = await db.getAllAsync<Cuenta>("SELECT * FROM cuentas", []);
    setCuentas(rows);
  };

  useFocusEffect(() => {
    cargarCuentas();
  });

  const eliminarCuenta = (id: string) => {
    Alert.alert("Eliminar Cuenta", "¿Estás seguro de eliminar esta cuenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await db.runAsync("DELETE FROM cuentas WHERE id = ?", [id]);
          cargarCuentas();
        }
      }
    ]);
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-2xl font-bold text-black dark:text-white mb-4">
        Cuentas
      </Text>

      <ScrollView>
        {cuentas.map((cuenta) => (
          <Pressable
            key={cuenta.id}
            onPress={() => {
              router.push({
                pathname: "/cuentas/editar",params: {id:cuenta.id} 
              });
            }}
            onLongPress={() => eliminarCuenta(cuenta.id)}
          >
            <View className="bg-white dark:bg-neutral-800 rounded-lg p-4 mb-3 shadow">
              <Text className="text-lg font-semibold text-black dark:text-white">
                {cuenta.nombre}
              </Text>
              <Text className="text-base text-gray-700 dark:text-gray-300">
                Saldo: ${cuenta.saldo.toLocaleString("es-CO")}
              </Text>
              <Text>{cuenta.id}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        onPress={() => router.push("/cuentas/crear")}
        className="absolute bottom-6 right-6 bg-blue-600 rounded-full p-4 shadow-lg"
      >
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
    </View>
  );
}
