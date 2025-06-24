import ListadoTransacciones from "@/components/ListadoTransacciones";
import db from "@/db/sqlite";
import { useDeudaForm } from "@/hooks/useDeudaForm";
import { Persona } from "@/types/model";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditarDeudaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { form, onChange, actualizar } = useDeudaForm(id as string);
  const [personaNombre, setPersonaNombre] = useState("");

  useEffect(() => {
    if (!id || typeof id !== "string") {
      Alert.alert("Error", "ID de deuda no válido");
      router.back();
    } else {
      db.getFirstAsync<Persona>("SELECT * FROM personas WHERE id = ?", [
        form.personaId
      ]).then((p) => {
        if (p) setPersonaNombre(p.nombre);
      });
    }
  }, [id, form.personaId]);

  const guardarCambios = async () => {
    if (!id || typeof id !== "string") return;
    await actualizar();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-neutral-900"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ paddingTop: insets.top + 16 }}
    >
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <View className="px-6 pb-6 space-y-6">
            <Text className="text-2xl font-bold text-black dark:text-white mb-2">
              Editar Deuda
            </Text>

            <View className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-5 shadow space-y-4">
              <View>
                <Text className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">
                  Persona
                </Text>
                <TextInput
                  value={personaNombre}
                  editable={false}
                  className="bg-white dark:bg-neutral-700 text-black dark:text-white rounded-xl px-4 py-3"
                />
              </View>

              <View>
                <Text className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">
                  Monto
                </Text>
                <TextInput
                  value={form.monto}
                  onChangeText={(text) => onChange("monto", text)}
                  keyboardType="numeric"
                  placeholder="Monto"
                  className="bg-white dark:bg-neutral-700 text-black dark:text-white rounded-xl px-4 py-3"
                />
              </View>

              <View>
                <Text className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">
                  Fecha
                </Text>
                <TextInput
                  value={form.fecha}
                  onChangeText={(text) => onChange("fecha", text)}
                  placeholder="AAAA-MM-DD"
                  className="bg-white dark:bg-neutral-700 text-black dark:text-white rounded-xl px-4 py-3"
                />
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-neutral-600 dark:text-neutral-300">
                  ¿Pagado?
                </Text>
                <Switch
                  value={form.pagado}
                  onValueChange={(value) => onChange("pagado", value)}
                />
              </View>

              <TouchableOpacity
                onPress={guardarCambios}
                className="bg-blue-600 mt-4 rounded-xl py-3 shadow"
              >
                <Text className="text-white text-center font-bold">
                  💾 Guardar Cambios
                </Text>
              </TouchableOpacity>
            </View>

            <ListadoTransacciones
              sentenciaSQL="SELECT * FROM transacciones WHERE descripcion LIKE ? ORDER BY fecha DESC"
              parametrosIniciales={[`Pago deuda ${id}%`]}
              titulo="Pagos realizados"
            />

            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/transacciones/crear",
                  params: { deudaId: id }
                })
              }
              className="bg-green-600 mt-4 rounded-xl py-3 shadow"
            >
              <Text className="text-white text-center font-bold">
                ➕ Agregar Pago Parcial
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}
