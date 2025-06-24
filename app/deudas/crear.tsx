import db from "@/db/sqlite";
import { useDeudaForm } from "@/hooks/useDeudaForm";
import { Persona } from "@/types/model";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CrearDeudaScreen() {
  const { form, onChange, guardar } = useDeudaForm();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    db.getAllAsync<Persona>("SELECT * FROM personas").then(setPersonas);
  }, []);

  const guardarValidado = () => {
    if (!form.personaId || !form.monto) {
      Alert.alert(
        "Campos requeridos",
        "Por favor seleccione una persona y escriba un monto."
      );
      return;
    }
    guardar();
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
      <View className="px-6 pb-6">
        <View className="flex-row items-center space-x-3 mb-6">
          <Ionicons name="cash-outline" size={28} color="#2563eb" />
          <Text className="text-2xl font-extrabold text-neutral-800 dark:text-white">
            Registrar Préstamo
          </Text>
        </View>

        <View className="bg-neutral-100 dark:bg-neutral-800 p-5 rounded-2xl shadow space-y-4">
          <View>
            <Text className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">
              Persona
            </Text>
            <View className="bg-white dark:bg-neutral-700 rounded-lg overflow-hidden">
              <Picker
                selectedValue={form.personaId}
                onValueChange={(val) => onChange("personaId", val)}
              >
                <Picker.Item label="Seleccione una persona" value="" />
                {personas.map((p) => (
                  <Picker.Item key={p.id} label={p.nombre} value={p.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View>
            <Text className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">
              Monto
            </Text>
            <TextInput
              placeholder="$0"
              keyboardType="numeric"
              value={formatearPesosColombianos(form.monto)}
              onChangeText={(text) => {
                const limpio = text.replace(/\D/g, "");
                onChange("monto", limpio);
              }}
              className="bg-white dark:bg-neutral-700 text-black dark:text-white px-4 py-3 rounded-lg"
            />
          </View>

          <View>
            <Text className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">
              Fecha
            </Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={form.fecha}
              onChangeText={(text) => onChange("fecha", text)}
              className="bg-white dark:bg-neutral-700 text-black dark:text-white px-4 py-3 rounded-lg"
            />
          </View>

          <View>
            <Text className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">
              Descripción
            </Text>
            <TextInput
              value={form.descripcion}
              onChangeText={(text) => onChange("descripcion", text)}
              placeholder="Ej: Préstamo para almuerzo"
              className="bg-white dark:bg-neutral-700 text-black dark:text-white px-4 py-3 rounded-lg"
            />
          </View>

          <TouchableOpacity
            onPress={guardarValidado}
            className="bg-blue-600 rounded-xl py-3 mt-4 shadow-lg"
          >
            <Text className="text-center text-white font-bold text-base">
              💾 Guardar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
