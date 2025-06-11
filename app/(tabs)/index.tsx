import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable
} from "react-native";
import { useResumenFinanciero } from "@/hooks/useResumenFinanciero";
import { useCuentas } from "@/hooks/useCuentas";
import { useGestionTransacciones } from "@/hooks/useGestionTransacciones";
import { Transaccion } from "@/models/Transaccion";
import { FAB, MD3Theme, Portal, Provider } from "react-native-paper";
import { router } from "expo-router";

import { useAppTheme } from "@/hooks/useThemeConfig";

export default function Home() {
  const { theme, isDark, toggleTheme } = useAppTheme();

  const styles = getStyles(theme); // ✅ ahora tienes acceso al tema
  const { resumen } = useResumenFinanciero();
  const { cuentasConBalance } = useCuentas();
  const { obtenerLimiteTransacciones, cargarDatosDePrueba } =
    useGestionTransacciones();

  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [navegarAgregar, setNavegarAgregar] = useState(false);

  const totalIngresos = resumen.ingresos;
  const totalGastos = resumen.egresos;
  const balanceTotal = resumen.ingresos + resumen.egresos;

  const formatearFechaHora = useCallback((iso: string) => {
    const fechaObj = new Date(iso);
    return {
      fecha: fechaObj.toLocaleDateString(),
      hora: fechaObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  }, []);

  useEffect(() => {
    const fetchTransacciones = async () => {
      const data = await obtenerLimiteTransacciones(6);
      setTransacciones(data);
    };
    fetchTransacciones();
  }, [resumen]);

  useEffect(() => {
    if (navegarAgregar) {
      router.replace("../(pages)/AgregarTransaccionScreen");
    }
  }, [navegarAgregar]);

  return (
    <Provider>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
       

          <Text style={styles.titulo}>Resumen Financiero</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.resumenContainer}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor:
                    theme.colors.secondaryContainer || theme.colors.secondary
                }
              ]}
            >
              <Text style={styles.cardTitulo}>Balance total</Text>
              <Text style={styles.cardMonto}>
                ${balanceTotal.toLocaleString()}
              </Text>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: theme.colors.tertiaryContainer || "#d1fae5" }
              ]}
            >
              <Text style={styles.cardTitulo}>Ingresos</Text>
              <Text style={styles.cardMonto}>
                ${totalIngresos.toLocaleString()}
              </Text>
            </View>

            <View
              style={[
                styles.card,
                { backgroundColor: theme.colors.errorContainer || "#fee2e2" }
              ]}
            >
              <Text style={styles.cardTitulo}>Gastos</Text>
              <Text style={styles.cardMonto}>
                ${Math.abs(totalGastos).toLocaleString()}
              </Text>
            </View>
          </ScrollView>

          <Text style={styles.subtitulo}>Cuentas</Text>
          <FlatList
            data={cuentasConBalance}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(pages)/TransaccionesCuenta",
                    params: { id: item.id }
                  })
                }
                style={styles.cardCuenta}
              >
                <Text style={styles.cuentaNombre}>{item.nombre_cuenta}</Text>
                <Text
                  style={[
                    styles.cuentaBalance,
                    item.balance >= 0
                      ? styles.montoPositivo
                      : styles.montoNegativo
                  ]}
                >
                  ${item.balance.toLocaleString()}
                </Text>
              </Pressable>
            )}
          />

          <Text style={styles.subtitulo}>Últimas transacciones</Text>
          {transacciones.map((tx) => {
            const { fecha, hora } = formatearFechaHora(tx.fecha);
            return (
              <View key={tx.id} style={styles.item}>
                <Text style={styles.descripcion}>{tx.nombre}</Text>
                <Text
                  style={
                    tx.cantidad >= 0
                      ? styles.montoPositivo
                      : styles.montoNegativo
                  }
                >
                  {tx.cantidad >= 0 ? "+" : "-"}$
                  {Math.abs(tx.cantidad).toLocaleString()}
                </Text>
                <Text style={styles.fecha}>{`${fecha} - ${hora}`}</Text>
              </View>
            );
          })}
        </ScrollView>

        <Portal>
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => setNavegarAgregar(true)}
            color="white"
          />
        </Portal>
      </View>
    </Provider>
  );
}

export const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.colors.background
    },
    titulo: {
      marginTop:10,
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 20,
      color: theme.colors.onSurface
    },
    subtitulo: {
      fontSize: 18,
      fontWeight: "600",
      marginVertical: 16,
      color: theme.colors.onSurface
    },
    resumenContainer: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      gap: 12,
      flexDirection: "row"
    },
    scrollContent: {
      paddingBottom: 20
    },
    card: {
      padding: 16,
      borderRadius: 12,
      minWidth: 180,
      elevation: 3,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.dark ? "#00000066" : "#00000022",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 }
    },
    cardTitulo: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 4
    },
    cardMonto: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.onSurface
    },
    cardCuenta: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      elevation: 3,
      minWidth: 150
    },
    cuentaNombre: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.primary
    },
    cuentaBalance: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.onSurface,
      marginTop: 8
    },
    item: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      elevation: 2
    },
    descripcion: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface
    },
    montoPositivo: {
      color: "#16a34a",
      fontWeight: "600",
      fontSize: 16
    },
    montoNegativo: {
      color: "#dc2626",
      fontWeight: "600",
      fontSize: 16
    },
    fecha: {
      color: theme.colors.onSurface + "99",
      fontSize: 14,
      marginTop: 4
    },
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 16,
      backgroundColor: theme.colors.primary
    }
  });
