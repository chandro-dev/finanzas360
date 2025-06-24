// app/cuentas/crear.tsx
import db from "@/db/sqlite";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import uuid from "react-native-uuid";

export default function CrearCuenta() {
  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState("");
  const [positivo, setPositivo] = useState(true);
  const insets = useSafeAreaInsets();

  const guardarCuenta = async () => {
    const id = uuid.v4().toString();
    const valor = parseFloat(saldo.replace(/\D/g, "")) * (positivo ? 1 : -1);

    if (!nombre.trim()) return alert("El nombre es obligatorio.");
    await db.runAsync(
      "INSERT INTO cuentas (id, nombre, saldo) VALUES (?, ?, ?)",
      [id, nombre, valor]
    );
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white dark:bg-neutral-900 px-6"
      style={{ paddingTop: insets.top + 24 }}
    >
      <View className="space-y-6">
        <Text className="text-3xl font-extrabold text-neutral-800 dark:text-white text-center">
          Crear Cuenta
        </Text>

        <View className="bg-neutral-100 dark:bg-neutral-800 p-5 rounded-2xl shadow space-y-4">
          <Text className="text-sm text-neutral-600 dark:text-neutral-300">
            Nombre de la cuenta
          </Text>
          <TextInput
            placeholder="Ej: Ahorros Banco"
            value={nombre}
            onChangeText={setNombre}
            className="bg-white dark:bg-neutral-700 text-black dark:text-white rounded-xl px-4 py-3"
          />

          <Text className="text-sm text-neutral-600 dark:text-neutral-300">
            Saldo inicial
          </Text>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              onPress={() => setPositivo(!positivo)}
              className={`rounded-xl px-3 py-2 ${
                positivo ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <Ionicons
                name={positivo ? "add-circle" : "remove-circle"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
            <TextInput
              value={formatearPesosColombianos(saldo)}
              onChangeText={(text) => setSaldo(text.replace(/\D/g, ""))}
              keyboardType="numeric"
              placeholder="$0"
              className="flex-1 bg-white dark:bg-neutral-700 text-black dark:text-white rounded-xl px-4 py-3"
            />
          </View>

          <TouchableOpacity
            onPress={guardarCuenta}
            className="bg-blue-600 rounded-xl py-3 mt-4 shadow"
          >
            <Text className="text-white text-center text-base font-bold">
              💾 Guardar Cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
