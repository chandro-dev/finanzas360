import CuentaCard from "@/components/CuentaCard";
import FloatingMenu from "@/components/FloatingMenu";
import ListadoTransacciones from "@/components/ListadoTransacciones";
import TarjetaCard from "@/components/TarjetaCard";
import { crearTablas, default as db } from "@/db/sqlite";
import { sincronizarDatos } from "@/lib/firebase";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const [ingresos, setIngresos] = useState(0);
  const [egresos, setEgresos] = useState(0);
  const [cuentas, setCuentas] = useState<
    { id: string; nombre: string; saldo: number }[]
  >([]);
  const [tarjetas, setTarjetas] = useState<
    { id: string; nombre: string; cupo: number; disponible: number }[]
  >([]);
  const [cuentasSeleccionadas, setCuentasSeleccionadas] = useState<string[]>(
    []
  );
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width - 40;

  useEffect(() => {
    crearTablas();
    cargarResumen();
  }, []);

  const cargarResumen = () => {
    db.getAllAsync<{ cantidad: number }>(
      `SELECT cantidad FROM transacciones`
    ).then((rows) => {
      let ingresosTot = 0;
      let egresosTot = 0;
      rows.forEach((row) => {
        if (row.cantidad >= 0) ingresosTot += row.cantidad;
        else egresosTot += Math.abs(row.cantidad);
      });
      setIngresos(ingresosTot);
      setEgresos(egresosTot);
    });

    db.getAllAsync<{ id: string; nombre: string; saldo: number }>(
      `SELECT id, nombre, saldo FROM cuentas`
    ).then((data) => {
      setCuentas(data);
      setCuentasSeleccionadas(data.map((c) => c.id));
    });

    db.getAllAsync<{
      id: string;
      nombre: string;
      cupo: number;
      disponible: number;
    }>(`SELECT id, nombre, cupo, disponible FROM tarjetas`).then(setTarjetas);
  };

  const pieChartData = [
    {
      name: "Ingresos",
      population: ingresos,
      color: "#22c55e",
      legendFontColor: "#374151",
      legendFontSize: 16
    },
    {
      name: "Egresos",
      population: egresos,
      color: "#ef4444",
      legendFontColor: "#374151",
      legendFontSize: 16
    }
  ];

  const saldoTotalSeleccionado = cuentas
    .filter((c) => cuentasSeleccionadas.includes(c.id))
    .reduce((acc, curr) => acc + curr.saldo, 0);

  return (
    <View
      className="flex-1 bg-white dark:bg-neutral-900"
      style={{ paddingTop: insets.top + 16 }}
    >
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <View className="px-5 space-y-6">
            <Text className="text-3xl font-extrabold text-neutral-900 dark:text-white">
              ¡Hola, Luis! 👋
            </Text>
            <Text className="text-base text-neutral-500 dark:text-neutral-400">
              Este es el resumen de tus finanzas.
            </Text>

            <View className="bg-white dark:bg-neutral-800 rounded-3xl p-5 shadow-lg">
              <Text className="text-xl font-bold text-neutral-800 dark:text-white mb-4">
                Balance General
              </Text>

              <View className="flex-row justify-around mb-4">
                <View className="items-center">
                  <Text className="text-gray-500 text-sm">Ingresos</Text>
                  <Text className="text-2xl font-bold text-green-600">
                    ${ingresos.toLocaleString()}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-gray-500 text-sm">Egresos</Text>
                  <Text className="text-2xl font-bold text-red-600">
                    ${egresos.toLocaleString()}
                  </Text>
                </View>
              </View>

              <PieChart
                data={pieChartData
                  .filter((d) => d.population > 0)
                  .map((d) => ({
                    ...d,
                    name: " "                  }))}
                width={screenWidth}
                height={220}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                chartConfig={{
                  color: () => "#000",
                  labelColor: () => "#374151"
                }}
              />

              <View className="mt-6">
                <Text className="text-base font-semibold text-neutral-700 dark:text-white mb-3">
                  Cuentas en Balance
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
                  {cuentas.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      className="flex-row items-center space-x-2 mr-4"
                      onPress={() =>
                        setCuentasSeleccionadas((prev) =>
                          prev.includes(c.id)
                            ? prev.filter((id) => id !== c.id)
                            : [...prev, c.id]
                        )
                      }
                    >
                      <Checkbox
                        value={cuentasSeleccionadas.includes(c.id)}
                        onValueChange={() => {}}
                      />
                      <Text className="text-sm text-black dark:text-white">
                        {c.nombre}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <Text className="text-xl
                   text-neutral-600 dark:text-neutral-300 mt-3 font-semibold">
                  Total seleccionado: ${saldoTotalSeleccionado.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Cuentas */}
            {cuentas.length > 0 && (
              <View>
                <Text className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
                  Cuentas
                </Text>
                <FlatList
                  data={cuentas}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/cuentas/editar?id=${item.id}`)
                      }
                    >
                      <CuentaCard nombre={item.nombre} saldo={item.saldo} />
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Tarjetas */}
            {tarjetas.length > 0 && (
              <View>
                <Text className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-2 mt-4">
                  Tarjetas
                </Text>
                <FlatList
                  data={tarjetas}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/tarjetas/editar?id=${item.id}`)
                      }
                    >
                      <TarjetaCard
                        nombre={item.nombre}
                        cupo={item.cupo}
                        disponible={item.disponible}
                      />
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <View className="px-5 pt-8">
            <ListadoTransacciones
              sentenciaSQL="SELECT * FROM transacciones ORDER BY fecha DESC"
              parametrosIniciales={[]}
              titulo="Últimas Transacciones"
            />
            <View className="mt-6 mb-24">
              <TouchableOpacity
                onPress={() => {
                  sincronizarDatos();
                  cargarResumen();
                }}
                className="bg-green-600 rounded-2xl py-4 shadow-lg"
              >
                <Text className="text-white text-center font-bold text-base">
                  🔄 Sincronizar Datos
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
      <FloatingMenu />
    </View>
  );
}
