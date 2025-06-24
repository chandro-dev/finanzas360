import db from "@/db/sqlite";
import { Categoria, Cuenta } from "@/types/model";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";

import {
  Button,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface TransaccionFormState {
  descripcion: string;
  cantidad: string;
  fecha: string;
  cuentaId: string;
  categoriaId: string;
  tarjetaId?: string;
}

interface Props {
  form: TransaccionFormState;
  onChange: (field: keyof TransaccionFormState, value: any) => void;
  onSubmit: () => void;
  loading?: boolean;
  submitText?: string;
}

export default function TransaccionForm({
  form,
  onChange,
  onSubmit,
  loading,
  submitText = "Guardar"
}: Props) {
  const [step, setStep] = useState(0);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    db.getAllAsync<Cuenta>("SELECT id, nombre FROM cuentas").then(setCuentas);
    db.getAllAsync<Categoria>("SELECT id, nombre, tipo FROM categorias").then(
      setCategorias
    );
  }, []);

  const avanzar = () => setStep((s) => s + 1);
  const retroceder = () => setStep((s) => Math.max(0, s - 1));
  const formatearPesosColombianos = (valor: string) => {
    const limpio = valor.replace(/\D/g, ""); // solo números
    const numero = parseInt(limpio || "0", 10);

    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(numero);
  };

  const tipo = categorias.find((c) => c.id === form.categoriaId)?.tipo ?? null;
  const fondo =
    tipo === "ingreso"
      ? "bg-green-200"
      : tipo === "egreso"
        ? "bg-red-200"
        : "bg-neutral-100";

  return (
    <KeyboardAvoidingView
      className={`flex-1 items-center py-200 px-4  dark:bg-neutral-900`}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ paddingTop: insets.top + 24 }}
    >
      <View
        className={`w-full max-w-lg bg-white ${fondo} rounded-3xl shadow-xl p-8 flex flex-col space-y-6 mt-4`}
      >
        {step === 0 && (
          <View className="flex flex-col items-center space-y-6">
            <Text className="text-3xl font-extrabold text-center text-neutral-800">
              ¿Qué tipo de transacción es?
            </Text>

            <View className="grid grid-cols-2 gap-4 w-full max-w-xs">
              {[
                {
                  tipo: "ingreso",
                  color: "bg-green-500",
                  icon: (
                    <Ionicons
                      name="arrow-down-circle"
                      size={32}
                      color="white"
                    />
                  )
                },
                {
                  tipo: "egreso",
                  color: "bg-red-500",
                  icon: (
                    <Ionicons name="arrow-up-circle" size={32} color="white" />
                  )
                }
              ].map(({ tipo, color, icon }) => (
                <TouchableOpacity
                  key={tipo}
                  onPress={() => {
                    const cat = categorias.find((c) => c.tipo === tipo);
                    if (cat) onChange("categoriaId", cat.id);
                    avanzar();
                  }}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl shadow-md ${color}`}
                >
                  {icon}
                  <Text className="text-white font-bold text-lg capitalize">
                    {tipo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {step === 1 && (
          <View className="space-y-6">
            <Text className="text-3xl font-extrabold text-center text-neutral-800">
              ¿Cuál es el monto?
            </Text>
            <TextInput
              value={formatearPesosColombianos(form.cantidad)}
              onChangeText={(text) => {
                const limpio = text.replace(/\D/g, "");
                onChange("cantidad", limpio);
              }}
              keyboardType="numeric"
              placeholder="$0"
              className="bg-neutral-100 p-4 rounded-xl text-center text-lg text-black"
            />
            <Button title="Siguiente" onPress={avanzar} />
          </View>
        )}

        {step === 2 && (
          <View className="space-y-6">
            <Text className="text-3xl font-extrabold text-center text-neutral-800">
              ¿Cómo lo describirías?
            </Text>
            <TextInput
              value={form.descripcion}
              onChangeText={(text) => onChange("descripcion", text)}
              placeholder="Ej: Compra mercado"
              className="bg-neutral-100 p-4 rounded-xl text-center text-lg text-black"
            />
            <Button title="Siguiente" onPress={avanzar} />
          </View>
        )}

        {step === 3 && (
          <View className="space-y-6">
            <Text className="text-3xl font-extrabold text-center text-neutral-800">
              ¿Desde qué cuenta?
            </Text>
            <View className="bg-neutral-100 rounded-xl overflow-hidden">
              <Picker
                selectedValue={form.cuentaId}
                onValueChange={(val) => onChange("cuentaId", val)}
              >
                <Picker.Item label="Selecciona una cuenta" value="" />
                {cuentas.map((c) => (
                  <Picker.Item key={c.id} label={c.nombre} value={c.id} />
                ))}
              </Picker>
            </View>
            <Button
              title="Siguiente"
              onPress={avanzar}
              disabled={!form.cuentaId}
            />
          </View>
        )}

        {step === 4 && (
          <View className="space-y-6">
            <Text className="text-3xl font-extrabold text-center text-neutral-800">
              ¿Cuándo fue?
            </Text>
            <Button
              title={new Date(form.fecha).toLocaleDateString()}
              onPress={() => setShowDatePicker(true)}
            />
            {showDatePicker && (
              <DateTimePicker
                value={new Date(form.fecha)}
                mode="date"
                display="default"
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) onChange("fecha", date.toISOString().slice(0, 10));
                }}
              />
            )}
            <View className="pt-2">
              <Button
                title={submitText}
                onPress={onSubmit}
                disabled={loading}
                color="#22c55e"
              />
            </View>
          </View>
        )}

        {step > 0 && (
          <TouchableOpacity onPress={retroceder}>
            <Text className="text-center text-blue-500 text-base mt-4">
              ← Volver al paso anterior
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
