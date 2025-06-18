import CuentaCard from "@/components/CuentaCard";
import FloatingMenu from "@/components/FloatingMenu";
import TarjetaCard from "@/components/TarjetaCard";
import TransaccionCard from "@/components/TransaccionCard";
import { crearTablas } from "@/db/sqlite";
import { useEffect } from "react";
import { ScrollView, Text, View } from "react-native";


export default function HomeScreen() {
  useEffect(() => {
    crearTablas();
  }, []);
  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-black dark:text-white mb-4">
          Bienvenido 👋
        </Text>

        <Text className="text-lg font-semibold mb-2 text-neutral-700 dark:text-neutral-200">
          Tus Cuentas
        </Text>
        <CuentaCard nombre="Ahorros" saldo={450000} />
        <CuentaCard nombre="Nequi" saldo={120000} />

        <Text className="text-lg font-semibold mt-6 mb-2 text-neutral-700 dark:text-neutral-200">
          Tus Tarjetas
        </Text>
        <TarjetaCard
          nombre="Visa Bancolombia"
          cupo={3000000}
          disponible={800000}
        />

        <Text className="text-lg font-semibold mt-6 mb-2 text-neutral-700 dark:text-neutral-200">
          Últimas Transacciones
        </Text>
        <TransaccionCard
          descripcion="Almuerzo"
          cantidad={-18000}
          fecha="2025-06-14"
        />
        <TransaccionCard
          descripcion="Pago cliente"
          cantidad={50000}  
          fecha="2025-06-13"
        />
      </ScrollView>

      <FloatingMenu />
    </View>
  );
}
