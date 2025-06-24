import { useTarjetaForm } from "@/hooks/useTarjetaForm";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CrearTarjetaScreen() {
  const insets = useSafeAreaInsets();
  const { form, onChange, guardarTarjeta, loading } = useTarjetaForm();

  const [nombreError, setNombreError] = useState("");
  const [disponibleError, setDisponibleError] = useState("");

  useEffect(() => {
    // Validación del nombre
    if (form.nombre.length > 30) {
      setNombreError("El nombre no debe superar 30 caracteres.");
    } else {
      setNombreError("");
    }

    // Validación cupo/disponible
    const cupo = parseFloat(form.cupo || "0");
    const disponible = parseFloat(form.disponible || "0");
    if (disponible > cupo) {
      setDisponibleError("Disponible no puede ser mayor que el cupo.");
    } else {
      setDisponibleError("");
    }
  }, [form]);

  const formatearCOP = (valor: string) => {
    const limpio = valor.replace(/\D/g, "");
    const numero = parseInt(limpio || "0", 10);
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(numero);
  };

  const estaFormularioInvalido =
    !form.nombre ||
    !form.cupo ||
    !form.disponible ||
    !!nombreError ||
    !!disponibleError;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-neutral-900"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className="px-6 pb-10 space-y-6">
        <View className="flex-row items-center space-x-3 mb-4">
          <Ionicons name="card" size={28} color="#2563eb" />
          <Text className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Nueva Tarjeta
          </Text>
        </View>

        <View className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-6 shadow space-y-4">
          <View>
            <Text className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">
              Nombre
            </Text>
            <TextInput
              value={form.nombre}
              onChangeText={(text) => onChange("nombre", text)}
              placeholder="Nombre de la tarjeta"
              maxLength={30}
              className={`bg-white dark:bg-neutral-700 text-black dark:text-white rounded-xl px-4 py-3 ${
                nombreError ? "border border-red-500" : ""
              }`}
            />
            {nombreError ? (
              <Text className="text-red-500 text-xs mt-1">{nombreError}</Text>
            ) : null}
          </View>

          <View>
            <Text className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">
              Cupo
            </Text>
            <TextInput
              value={formatearCOP(form.cupo)}
              onChangeText={(text) => {
                const limpio = text.replace(/\D/g, "");
                onChange("cupo", limpio);
              }}
              keyboardType="numeric"
              placeholder="$0"
              className="bg-white dark:bg-neutral-700 text-black dark:text-white rounded-xl px-4 py-3"
            />
          </View>

          <View>
            <Text className="text-sm text-neutral-600 dark:text-neutral-300 mb-1">
              Disponible
            </Text>
            <TextInput
              value={formatearCOP(form.disponible)}
              onChangeText={(text) => {
                const limpio = text.replace(/\D/g, "");
                onChange("disponible", limpio);
              }}
              keyboardType="numeric"
              placeholder="$0"
              className={`bg-white dark:bg-neutral-700 text-black dark:text-white rounded-xl px-4 py-3 ${
                disponibleError ? "border border-red-500" : ""
              }`}
            />
            {disponibleError ? (
              <Text className="text-red-500 text-xs mt-1">
                {disponibleError}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={guardarTarjeta}
            disabled={loading || estaFormularioInvalido}
            className={`${
              estaFormularioInvalido || loading ? "bg-blue-300" : "bg-blue-600"
            } rounded-xl py-4 mt-2 shadow-lg`}
          >
            <Text className="text-white text-center font-bold text-base">
              💳 Guardar Tarjeta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
