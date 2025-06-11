import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
  Appbar,
  Switch,
  Text,
  useTheme,
  Button,
  ActivityIndicator,
  Surface
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/useThemeConfig";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import db from "@/databases/db";
import type { MD3Theme } from "react-native-paper";


export default function ConfiguracionScreen() {
  const { isDark, toggleTheme } = useAppTheme();
  const theme = useTheme();
  const router = useRouter();
  const [exportando, setExportando] = useState(false);

  const styles = getStyles(theme);

  const exportarBaseDeDatos = async () => {
    setExportando(true);
    try {
      const origen = `${FileSystem.documentDirectory}SQLite/finanzas.db`;
      const destino = `${FileSystem.documentDirectory}finanzas_backup.db`;

      const existe = await FileSystem.getInfoAsync(origen);
      if (!existe.exists) {
        Alert.alert("Error", "No se encontró la base de datos.");
        return;
      }

      await FileSystem.copyAsync({ from: origen, to: destino });
      await Sharing.shareAsync(destino);
    } catch (error) {
      console.error("Error exportando base de datos:", error);
      Alert.alert("Error", "No se pudo exportar la base de datos.");
    } finally {
      setExportando(false);
    }
  };

  const exportarTransaccionesCSV = async () => {
    setExportando(true);
    try {
      const transacciones = await db.getAllAsync(
        `SELECT * FROM Transacciones ORDER BY fecha DESC`
      );
      if (transacciones.length === 0) {
        Alert.alert("Aviso", "No hay transacciones para exportar.");
        return;
      }

      const encabezados = Object.keys(transacciones[0]);
      const filas = transacciones.map((fila) =>
        encabezados.map((col) => `"${fila[col] ?? ""}"`).join(",")
      );
      const csv = [encabezados.join(","), ...filas].join("\n");

      const fileUri = `${FileSystem.documentDirectory}transacciones.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8
      });

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error exportando CSV:", error);
      Alert.alert("Error", "No se pudo exportar el archivo CSV.");
    } finally {
      setExportando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Configuración" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Surface style={styles.card} elevation={2}>
          <Text style={styles.cardTitle}>Apariencia</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tema oscuro</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          </View>
        </Surface>

        <Surface style={styles.card} elevation={2}>
          <Text style={styles.cardTitle}>Exportaciones</Text>

          <Button
            mode="outlined"
            onPress={exportarBaseDeDatos}
            disabled={exportando}
            style={styles.button}
          >
            Exportar base de datos (.db)
          </Button>

          <Button
            mode="outlined"
            onPress={exportarTransaccionesCSV}
            disabled={exportando}
            style={styles.button}
          >
            Exportar transacciones (.csv)
          </Button>

          {exportando && (
            <ActivityIndicator
              animating
              color={theme.colors.primary}
              style={{ marginTop: 16 }}
            />
          )}
        </Surface>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: {
      padding: 16,
      paddingBottom: 40
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
      color: theme.colors.onSurface
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    label: {
      fontSize: 16,
      color: theme.colors.onSurface
    },
    button: {
      marginTop: 12
    }
  });
