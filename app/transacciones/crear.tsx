import { useTransaccionForm } from "@/hooks/useTransaccionForm";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import TransaccionForm from "./TransaccionForm";

export default function CrearTransaccionScreen() {
  const router = useRouter();
  const { deudaId } = useLocalSearchParams();
  const { form, loading, onChange, guardar,inicializarFormulario } = useTransaccionForm();
  useEffect(() => {
    if (deudaId && typeof deudaId === "string") {
      inicializarFormulario({
        descripcion: `Pago deuda ${deudaId}`,
        cantidad: "",
        fecha: new Date().toISOString().slice(0, 10),
        cuentaId: "",
        categoriaId: "",
        tarjetaId: ""
      });
    }
  }, [deudaId]);
  const handleSubmit = async () => {
    await guardar();
    router.push("/transacciones");
  };

  if (loading)
    return <Text className="p-4 text-black dark:text-white">Cargando...</Text>;

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <Text className="text-xl font-bold text-black dark:text-white px-4 mt-4 mb-2">
        Nueva Transacción
      </Text>

      <TransaccionForm
        form={form}
        onChange={onChange}
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Guardar"
      />
    </View>
  );
}
