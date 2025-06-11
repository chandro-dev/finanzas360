import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import {
  Appbar,
  List,
  ActivityIndicator,
  Text,
  Divider,
  MD3Theme
} from "react-native-paper";
import { useAppTheme } from "@/hooks/useThemeConfig";
import { useLocalSearchParams } from "expo-router";
import db from "@/databases/db";
import { Transaccion } from "@/models/Transaccion";

export default function PagosDeudaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const [pagos, setPagos] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarPagos = async () => {
    try {
      const rows = await db.getAllAsync<Transaccion>(
        `SELECT t.id, t.nombre, t.fecha, t.cantidad, t.categoria_id, t.cuenta_id
         FROM Transacciones t
         JOIN Transacciones_Deuda td ON t.id = td.id_transaccion
         WHERE td.id_deuda = ? ORDER BY t.fecha DESC`,
        [id]
      );
      setPagos(rows);
    } catch (error) {
      console.error("Error cargando pagos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      cargarPagos();
    }
  }, [id]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header elevated>
        <Appbar.Content title="Pagos realizados" />
      </Appbar.Header>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator animating size="large" color={theme.colors.primary} />
        </View>
      ) : pagos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay pagos registrados para esta deuda.</Text>
        </View>
      ) : (
        <FlatList
          data={pagos}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <List.Item
              title={item.nombre}
              description={new Date(item.fecha).toLocaleDateString("es-CO")}
              right={() => (
                <Text style={{ alignSelf: "center", fontWeight: "bold" }}>
                  {item.cantidad.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP"
                  })}
                </Text>
              )}
            />
          )}
        />
      )}
    </View>
  );
}

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    loading: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    empty: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center"
    },
    listContainer: {
      padding: 8
    }
  });
