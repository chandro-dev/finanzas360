import TransaccionItem from "@/components/TransaccionCard"; // o TransaccionCard
import db from "@/db/sqlite";
import { useTarjetaForm } from "@/hooks/useTarjetaForm";
import { Transaccion } from "@/types/model";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";

export default function EditarTarjetaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { form, loading, onChange, actualizarTarjeta } = useTarjetaForm(
    id as string
  );

  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);

  useEffect(() => {
    if (!id || typeof id !== "string") {
      Alert.alert("Error", "ID de tarjeta no válido");
      router.back();
      return;
    }

    const fetchTransacciones = async () => {
      const data = await db.getAllAsync<Transaccion>(
        "SELECT * FROM transacciones WHERE tarjetaId = ? ORDER BY fecha DESC",
        [id]
      );
      setTransacciones(data);
    };

    fetchTransacciones();
  }, [id]);

  const guardarCambios = async () => {
    if (!id || typeof id !== "string") return;
    await actualizarTarjeta();
  };

  if (loading) {
    return <Text className="text-white p-4">Cargando tarjeta...</Text>;
  }

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-xl font-bold text-black dark:text-white mb-4">
        Editar Tarjeta
      </Text>

      <Text className="text-black dark:text-white">Nombre</Text>
      <TextInput
        value={form.nombre}
        onChangeText={(text) => onChange("nombre", text)}
        placeholder="Nombre de la tarjeta"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Text className="text-black dark:text-white">Cupo</Text>
      <TextInput
        value={form.cupo}
        onChangeText={(text) => onChange("cupo", text)}
        keyboardType="numeric"
        placeholder="Cupo total"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Text className="text-black dark:text-white">Disponible</Text>
      <TextInput
        value={form.disponible}
        onChangeText={(text) => onChange("disponible", text)}
        keyboardType="numeric"
        placeholder="Disponible actualmente"
        className="border rounded p-2 mb-4 text-black bg-white"
      />

      <Button
        title="Guardar Cambios"
        onPress={guardarCambios}
        color="#2563eb"
      />

      {transacciones.length > 0 && (
        <View className="mt-6">
          <Text className="text-lg font-bold text-black dark:text-white mb-2">
            Transacciones asociadas
          </Text>

          <FlatList
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
                <TransaccionItem
                  descripcion={item.descripcion}
                  cantidad={item.cantidad}
                  fecha={item.fecha}
                />
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}
