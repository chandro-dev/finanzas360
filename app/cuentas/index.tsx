import db from "@/db/sqlite";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface Cuenta {
  id: string;
  nombre: string;
  saldo: number;
}

export default function CuentasScreen() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const router = useRouter();

  const cargarCuentas = async () => {
    const rows = await db.getAllAsync<Cuenta>("SELECT * FROM cuentas");
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

  const renderCuenta = ({ item }: { item: Cuenta }) => {
    const colorSaldo = item.saldo >= 0 ? "text-green-600" : "text-red-500";
    const icono = item.saldo >= 0 ? "arrow-up-circle" : "arrow-down-circle";
    const saldoFormateado = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(item.saldo);

    return (
      <Pressable
        onPress={() =>
          router.push({ pathname: "/cuentas/editar", params: { id: item.id } })
        }
        onLongPress={() => eliminarCuenta(item.id)}
        className="mb-4"
      >
        <View className="flex-row items-center bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow space-x-4">
          <Ionicons
            name={icono}
            size={32}
            color={item.saldo >= 0 ? "#16a34a" : "#dc2626"}
          />
          <View className="flex-1">
            <Text className="text-lg font-bold text-neutral-900 dark:text-white">
              {item.nombre}
            </Text>
            <Text className={`text-base ${colorSaldo}`}>{saldoFormateado}</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#9ca3af"
            style={{ opacity: 0.6 }}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 px-5 pt-6 pb-20">
      <Text className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-4">
        Mis Cuentas
      </Text>

      <FlatList
        data={cuentas}
        keyExtractor={(item) => item.id}
        renderItem={renderCuenta}
        ListEmptyComponent={
          <Text className="text-center text-neutral-400 mt-10">
            No hay cuentas registradas.
          </Text>
        }
      />

      <TouchableOpacity
        onPress={() => router.push("/cuentas/crear")}
        className="absolute bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg"
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
