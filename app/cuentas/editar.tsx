import ListadoTransacciones from "@/components/ListadoTransacciones";
import { useCuentaForm } from "@/hooks/useCuentaForm";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditarCuentaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { form, loading, onChange, actualizarCuenta } = useCuentaForm(id as string);
  const [esPositivo, setEsPositivo] = useState(true);

  const guardarCambios = async () => {
    await actualizarCuenta();
    router.push("/cuentas");
  };

  const formatearPesosColombianos = (valor: string) => {
    const limpio = valor.replace(/\D/g, "");
    const numero = parseInt(limpio || "0", 10);
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(numero);
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
            <View className="flex-row items-center space-x-3">
              <Ionicons name="wallet" size={28} color="#2563eb" />
              <Text className="text-2xl font-extrabold text-neutral-800 dark:text-white">
                Editar Cuenta
              </Text>
            </View>

            <View className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-5 shadow">
              <Text className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">Nombre</Text>
              <TextInput
                value={form.nombre}
                onChangeText={(text) => onChange("nombre", text)}
                placeholder="Nombre de la cuenta"
                className="bg-white dark:bg-neutral-700 text-black dark:text-white rounded-xl px-4 py-3 mb-4"
              />

              <Text className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">Saldo</Text>
              <View className="flex-row items-center space-x-2">
                <TouchableOpacity
                  onPress={() => setEsPositivo(!esPositivo)}
                  className={`px-3 py-2 rounded-lg ${esPositivo ? "bg-green-500" : "bg-red-500"}`}
                >
                  <Text className="text-white font-bold">
                    {esPositivo ? "+" : "-"}
                  </Text>
                </TouchableOpacity>
                <TextInput
                  value={formatearPesosColombianos(form.saldo)}
                  onChangeText={(text) => {
                    const limpio = text.replace(/\D/g, "");
                    onChange("saldo", (esPositivo ? "" : "-") + limpio);
                  }}
                  keyboardType="numeric"
                  placeholder="$0"
                  className="flex-1 bg-white dark:bg-neutral-700 text-black dark:text-white rounded-xl px-4 py-3"
                />
              </View>

              <TouchableOpacity
                onPress={guardarCambios}
                className="bg-blue-600 mt-6 rounded-xl py-3 shadow-lg"
              >
                <Text className="text-white text-center text-base font-bold">
                  💾 Guardar Cambios
                </Text>
              </TouchableOpacity>
            </View>

            <ListadoTransacciones
              sentenciaSQL="SELECT * FROM transacciones WHERE cuentaId = ? ORDER BY fecha DESC"
              parametrosIniciales={[id]}
              titulo="Transacciones asociadas"
            />
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}
