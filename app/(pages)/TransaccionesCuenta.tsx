import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions
} from "react-native";
import {
  Appbar,
  ActivityIndicator,
  Text,
  MD3Theme
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/useThemeConfig";
import { Transaccion } from "@/models/Transaccion";
import { TransactionItem } from "@/components/TransactionItem";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGestionTransacciones } from "@/hooks/useGestionTransacciones";

const { width } = Dimensions.get("window");

export default function TransaccionesCuentaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cuentaId = Number(id);
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  const {
    obtenerTransaccionesPorCuentaPaginadas,
    eliminarTransaccion
  } = useGestionTransacciones();

  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarTransacciones = async () => {
    try {
      const rows = await obtenerTransaccionesPorCuentaPaginadas(cuentaId, 1, 100); // puedes ajustar el límite
      setTransacciones(rows);
    } catch (error) {
      console.error("Error al cargar transacciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const refrescar = async () => {
    setRefreshing(true);
    await cargarTransacciones();
    setRefreshing(false);
  };

  const confirmarEliminar = (id: number) => {
    Alert.alert(
      "Eliminar transacción",
      "¿Estás seguro que deseas eliminar esta transacción?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            await eliminarTransaccion(id);
            refrescar();
          },
          style: "destructive"
        }
      ]
    );
  };

  useEffect(() => {
    if (cuentaId) {
      cargarTransacciones();
    }
  }, [cuentaId]);

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="file-document-outline"
        size={64}
        color={theme.colors.onSurfaceDisabled}
      />
      <Text style={styles.emptyTitle}>Sin transacciones</Text>
      <Text style={styles.emptyDescription}>
        No se encontraron transacciones para esta cuenta.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Transacciones por cuenta" />
      </Appbar.Header>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={transacciones}
          keyExtractor={(item) => `tx-${item.id}`}
          renderItem={({ item }) => (
            <TransactionItem
              item={item}
              onEdit={() =>
                router.push({
                  pathname: "../(pages)/EditarTransaccionScreen",
                  params: { id: item.id }
                })
              }
              onDelete={() => confirmarEliminar(item.id)}
            />
          )}
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refrescar}
              colors={[theme.colors.primary]}
            />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    },
    listContainer: {
      padding: 12,
      paddingBottom: 100
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      paddingHorizontal: 20
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.onSurface
    },
    emptyDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceDisabled,
      textAlign: "center",
      marginTop: 8,
      maxWidth: width * 0.7
    }
  });
