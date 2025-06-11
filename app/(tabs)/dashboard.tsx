import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { es } from "date-fns/locale";
import { LineChart, PieChart } from "react-native-chart-kit";
import { subMonths, format, parse } from "date-fns";
import type { MD3Theme } from "react-native-paper";
import { useResumenFinanciero } from "@/hooks/useResumenFinanciero";
import { useAgrupaciones } from "@/hooks/useAgrupaciones";
import { useAppTheme } from "@/hooks/useThemeConfig";
import { LineData } from "@/models/pieData";
import { formatearComoCOP } from "@/utils/moneda";
import { Surface } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Button } from "react-native-paper";
import type { NotificationTriggerInput } from "expo-notifications";

const COLORES = ["#34d399", "#f87171", "#60a5fa", "#fbbf24", "#a78bfa"];
const SCREEN_WIDTH = Dimensions.get("window").width;
const SAFE_WIDTH = SCREEN_WIDTH - 32;

const chartConfig = {
  backgroundGradientFrom: "#f0f4f8",
  backgroundGradientFromOpacity: 1,
  backgroundGradientTo: "#e2e8f0",
  backgroundGradientToOpacity: 1,
  fillShadowGradientFrom: "#3b82f6",
  fillShadowGradientFromOpacity: 0.5,
  fillShadowGradientTo: "#3b82f6",
  fillShadowGradientToOpacity: 0.05,
  useShadowColorFromDataset: false,
  color: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
  strokeWidth: 0,
  barPercentage: 0.7,
  barRadius: 4,

  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#2563eb"
  },
  propsForBackgroundLines: {
    stroke: "#d1d5db",
    strokeDasharray: "4 4"
  },
  propsForLabels: {
    fontSize: 9,
    fontWeight: "500"
  },
  formatYLabel: (val: string) => formatearComoCOP(Number(val))
};

const obtenerFechaFiltro = (meses: number) =>
  format(subMonths(new Date(), meses), "yyyy-MM-dd");

const Dashboard: React.FC = () => {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const { resumen, obtenerResumenPorFecha } = useResumenFinanciero();
  const { agruparPorCategoria, agruparPorMes, obtenerMesesHistoricos } =
    useAgrupaciones();

  const [lineData, setLineData] = useState<LineData>({
    labels: [],
    datasets: [],
    legend: []
  });
  const [dataPieCategoria, setDataPieCategoria] = useState<any[]>([]);
  const [mesesDisponibles, setMesesDisponibles] = useState<{ mes: string }[]>(
    []
  );
  const [rangoMeses, setRangoMeses] = useState(1);
  const [mesSeleccionado, setMesSeleccionado] = useState("2025-04");

  const pieDataResumen = useMemo(
    () => [
      {
        name: `${formatearComoCOP(resumen.ingresos)} - Ingresos`,
        amount: resumen.ingresos,
        color: "#34d399",
        legendFontColor: "#374151",
        legendFontSize: 12
      },
      {
        name: `${formatearComoCOP(Math.abs(resumen.egresos))} - Egresos`,
        amount: Math.abs(resumen.egresos),
        color: "#f87171",
        legendFontColor: "#374151",
        legendFontSize: 12
      }
    ],
    [resumen]
  );
  const crearNotificacionCadaMinuto = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const trigger = {
      type: "timeInterval",
      seconds: 1,
      repeats: true
    } as const as Notifications.NotificationTriggerInput;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ Recordatorio financiero",
        body: "Revisa tus transacciones y mantén tu presupuesto al día.",
        sound: true
      },
      trigger
    });
  };
  useEffect(() => {
    // Se ejecuta solo una vez
    const meses = obtenerMesesHistoricos();
    setMesesDisponibles(meses);

    const resultado = agruparPorMes();
    if (!resultado.length) {
      setLineData({
        labels: ["Sin datos"],
        datasets: [{ data: [0], color: () => "#34d399", strokeWidth: 2 }],
        legend: ["Ingresos"]
      });
    } else {
      setLineData({
        labels: resultado.map((r) => r.mes.substring(5)),
        datasets: [
          {
            data: resultado.map((r) => r.ingresos || 0),
            color: () => "#34d399",
            strokeWidth: 2
          },
          {
            data: resultado.map((r) => r.egresos || 0),
            color: () => "#f87171",
            strokeWidth: 2
          }
        ],
        legend: ["Ingresos", "Egresos"]
      });
    }
  }, []);
  useEffect(() => {
    // Configura cómo se muestran las notificaciones en primer plano
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false
      })
    });

    const pedirPermisos = async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") {
          await Notifications.requestPermissionsAsync();
        }
      }
    };

    pedirPermisos();
  }, []);

  useEffect(() => {
    obtenerResumenPorFecha(obtenerFechaFiltro(rangoMeses));
  }, [rangoMeses]);

  useEffect(() => {
    const resultado = agruparPorCategoria(mesSeleccionado);
    if (!resultado.length) {
      setDataPieCategoria([
        {
          name: "Sin datos",
          amount: 1,
          color: "#d1d5db",
          legendFontColor: "#374151",
          legendFontSize: 14
        }
      ]);
    } else {
      const top = resultado
        .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
        .slice(0, 3);

      setDataPieCategoria(
        top.map((r, i) => ({
          name: `${formatearComoCOP(Math.abs(r.total))} - ${r.categoria}`,
          amount: Math.abs(r.total),
          color: COLORES[i % COLORES.length],
          legendFontColor: "#374151",
          legendFontSize: 14
        }))
      );
    }
  }, [mesSeleccionado]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <Button
        mode="contained"
        icon="bell"
        onPress={crearNotificacionCadaMinuto}
        style={{ marginTop: 16 }}
      >
        Activar notificación cada minuto
      </Button>

      <Text style={styles.titulo}>Dashboard Financiero</Text>
      <View style={styles.resumenCard}>
        <Text style={styles.resumenTexto}>
          Ingresos: {formatearComoCOP(resumen.ingresos)}
        </Text>
        <Text style={styles.resumenTexto}>
          Egresos: {formatearComoCOP(Math.abs(resumen.egresos))}
        </Text>
      </View>
      <Text style={styles.graficoTitulo}>Comparativa</Text>
      <Picker
        selectedValue={rangoMeses}
        onValueChange={setRangoMeses}
        style={styles.picker}
      >
        <Picker.Item label="Último mes" value={1} />
        <Picker.Item label="Últimos 3 meses" value={3} />
        <Picker.Item label="Últimos 6 meses" value={6} />
      </Picker>
      <View style={styles.pieChartRow}>
        <PieChart
          data={pieDataResumen}
          width={SAFE_WIDTH * 1}
          height={250}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="16"
          center={[0, 0]}
          hasLegend={false}
          absolute
          style={styles.grafico}
        />
        <View style={styles.listaCategorias}>
          {pieDataResumen.map((item, index) => (
            <View key={index} style={styles.categoriaItem}>
              <View
                style={[styles.colorBox, { backgroundColor: item.color }]}
              />
              <Text style={styles.categoriaTexto}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.graficoTitulo}>Tendencia Mensual</Text>
      <Surface style={styles.chartContainer} elevation={2}>
        {lineData?.datasets?.[0]?.data?.length > 0 ? (
          <LineChart
            data={lineData}
            width={SAFE_WIDTH * 1}
            height={220}
            chartConfig={{
              ...chartConfig,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              color: () => theme.colors.primary,
              labelColor: () => theme.colors.onSurface,
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: theme.colors.primary
              },
              propsForBackgroundLines: {
                stroke: theme.colors.outlineVariant,
                strokeDasharray: "4"
              }
            }}
            bezier
            withInnerLines={false}
            withOuterLines={false}
            style={styles.grafico}
            formatYLabel={(value) => formatearComoCOP(Number(value))}
            fromZero
          />
        ) : (
          <View style={styles.emptyChart}>
            <MaterialCommunityIcons
              name="chart-line-variant"
              size={42}
              color={theme.colors.onSurfaceDisabled}
            />
            <Text style={styles.emptyChartText}>
              Aún no hay datos suficientes para mostrar una tendencia.
            </Text>
          </View>
        )}
      </Surface>
      <Text style={styles.graficoTitulo}>Transacciones por Categoría</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mesScroll}
      >
        {mesesDisponibles
          .sort((a, b) => b.mes.localeCompare(a.mes))
          .map(({ mes }) => {
            const fechaFormateada = format(
              parse(mes, "yyyy-MM", new Date()),
              "MMM yyyy",
              { locale: es }
            );
            const activo = mes === mesSeleccionado;
            return (
              <Text
                key={mes}
                style={[styles.mesChip, activo && styles.mesChipActivo]}
                onPress={() => setMesSeleccionado(mes)}
              >
                {fechaFormateada}
              </Text>
            );
          })}
      </ScrollView>
      <View style={styles.pieChartRow}>
        <PieChart
          data={dataPieCategoria}
          width={SAFE_WIDTH * 0.95}
          height={220}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="16"
          center={[0, 0]}
          hasLegend={false}
          absolute
          style={styles.grafico}
        />
        <View style={styles.listaCategorias}>
          {dataPieCategoria.map((item, index) => (
            <View key={index} style={styles.categoriaItem}>
              <View
                style={[styles.colorBox, { backgroundColor: item.color }]}
              />
              <Text style={styles.categoriaTexto}>{item.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16
    },
    titulo: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 16,
      color: theme.colors.onBackground
    },
    resumenCard: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 12,
      elevation: 2,
      marginBottom: 20
    },
    resumenTexto: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 4
    },
    graficoTitulo: {
      fontSize: 18,
      fontWeight: "700",
      marginVertical: 12,
      color: theme.colors.onBackground
    },
    grafico: {
      borderRadius: 8,
      marginBottom: 0,
      alignSelf: "center",
      paddingLeft: 16
    },
    picker: {
      marginVertical: 8,
      backgroundColor: theme.colors.surfaceVariant ?? theme.colors.surface,
      borderRadius: 8
    },
    mesScroll: {
      flexDirection: "row",
      marginBottom: 12
    },
    mesChip: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginRight: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant ?? "#e5e7eb",
      color: theme.colors.onSurface,
      fontWeight: "500"
    },
    mesChipActivo: {
      backgroundColor: theme.colors.primary,
      color: theme.dark ? "#fff" : "#000"
    },
    pieChartRow: {
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "center",
      flexWrap: "nowrap",
      marginTop: 8,
      marginBottom: 24,
      gap: 16
    },
    listaCategorias: {
      flex: 1,
      justifyContent: "center",
      paddingLeft: 8,
      minWidth: SCREEN_WIDTH * 0.4,
      maxWidth: SCREEN_WIDTH * 0.5,
      flexShrink: 1
    },
    categoriaItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8
    },
    categoriaTexto: {
      fontSize: 15,
      color: theme.colors.onSurface,
      flexShrink: 1
    },
    colorBox: {
      width: 12,
      height: 12,
      borderRadius: 2,
      marginRight: 8
    },
    chartContainer: {
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 8,
      backgroundColor: theme.colors.surface,
      marginVertical: 16
    },
    emptyChart: {
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    },
    emptyChartText: {
      textAlign: "center",
      marginTop: 12,
      fontSize: 14,
      color: theme.colors.onSurfaceDisabled
    }
  });

export default Dashboard;
