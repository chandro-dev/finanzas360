import db from "@/db/sqlite";
import { usePersonaForm } from "@/hooks/usePersonaForm";
import { Deuda } from "@/types/model";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function CrearEditarPersona() {
  const { id } = useLocalSearchParams();
  const { form, loading, onChange, guardar, actualizar } = usePersonaForm(
    id as string
  );
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [deudaTotal, setDeudaTotal] = useState(0);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (id) {
      db.getAllAsync<Deuda>(
        "SELECT * FROM deudas WHERE personaId = ? ORDER BY fecha DESC",
        [id]
      ).then((rows) => {
        setDeudas(rows);
        const total = rows
          .filter((d) => !d.pagado)
          .reduce((sum, d) => sum + parseFloat(d.monto.toString()), 0);
        setDeudaTotal(total);
      });
    }
  }, [id]);

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío.");
      return;
    }

    if (!id && parseFloat(form.deuda) < 0) {
      Alert.alert("Error", "La deuda no puede ser negativa.");
      return;
    }

    setGuardando(true);
    if (id) {
      await actualizar();
    } else {
      await guardar();
    }
    setGuardando(false);
  };

  if (loading) return <Text className="text-white p-4">Cargando...</Text>;

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-xl font-bold mb-4 text-black dark:text-white">
        {id ? "Editar Persona" : "Nueva Persona"}
      </Text>

      <View className="mb-4">
        <Text className="text-black dark:text-white mb-1">Nombre</Text>
        <TextInput
          value={form.nombre}
          onChangeText={(text) => onChange("nombre", text)}
          placeholder="Nombre de la persona"
          maxLength={50}
          className="border border-gray-300 dark:border-neutral-700 rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-neutral-800"
        />
      </View>

      {id && (
        <View className="mb-6">
          <Text className="text-black dark:text-white mb-1">
            Deuda pendiente
          </Text>
          <TextInput
            value={deudaTotal.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0
            })}
            editable={false}
            className="bg-gray-100 dark:bg-neutral-700 rounded-xl px-4 py-3 text-black dark:text-white"
          />
        </View>
      )}

      {!id && (
        <View className="mb-6">
          <Text className="text-black dark:text-white mb-1">Deuda inicial</Text>
          <TextInput
            value={form.deuda}
            onChangeText={(text) => onChange("deuda", text)}
            keyboardType="numeric"
            placeholder="$0"
            className="border border-gray-300 dark:border-neutral-700 rounded-xl px-4 py-3 text-black dark:text-white bg-white dark:bg-neutral-800"
          />
        </View>
      )}

      <TouchableOpacity
        onPress={handleGuardar}
        disabled={guardando}
        className="bg-blue-600 py-3 rounded-xl shadow-lg"
      >
        <Text className="text-white text-center font-bold text-base">
          💾 {id ? "Actualizar" : "Guardar"}
        </Text>
      </TouchableOpacity>

      {id && (
        <>
          <Text className="mt-6 text-lg font-bold text-black dark:text-white">
            Deudas registradas
          </Text>

          <FlatList
            data={deudas}
            keyExtractor={(item) => item.id}
            className="mt-2"
            renderItem={({ item }) => (
              <View className="bg-white dark:bg-neutral-800 rounded-xl p-4 mb-3 shadow">
                <Text className="text-black dark:text-white font-semibold text-base">
                  {parseFloat(item.monto.toString()).toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0
                  })}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-300">
                  {item.fecha}
                </Text>
                <Text
                  className={`text-sm mt-1 ${
                    item.pagado ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.pagado ? "✔ Pagado" : "Pendiente"}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text className="text-gray-500 dark:text-gray-400 mt-2">
                Esta persona no tiene deudas registradas.
              </Text>
            }
          />
        </>
      )}
    </View>
  );
}
