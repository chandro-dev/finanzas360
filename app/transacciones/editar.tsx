import { useTransaccionForm } from "@/hooks/useTransaccionForm";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import TransaccionForm from "./TransaccionForm";

export default function CrearEditarTransaccionScreen() {
  const { id } = useLocalSearchParams();
  const { form, loading, onChange, guardar, actualizar } = useTransaccionForm(
    id as string
  );


  const handleSubmit = async () => {
    if (id && typeof id === "string") {
      await actualizar();
    } else {
      await guardar();
    }
  };

  if (loading)
    return <Text className="p-4 text-black dark:text-white">Cargando...</Text>;

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <Text className="text-xl font-bold text-black dark:text-white px-4 mt-4 mb-2">
        {id ? "Editar Transacción" : "Nueva Transacción"}
      </Text>

      <TransaccionForm
        form={form}
        onChange={onChange}
        onSubmit={handleSubmit}
        loading={loading}
        submitText={id ? "Actualizar" : "Guardar"}
      />
    </View>
    
  );
}
