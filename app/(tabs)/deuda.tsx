import React from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import {
  Text,
  IconButton,
  Surface,
  ActivityIndicator,
  FAB,
  Appbar,
  MD3Theme,
  Provider,
  Divider,
  Button
} from "react-native-paper";
import { useDeudas } from "@/hooks/useDeudas";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/useThemeConfig";

export default function ListaDeudasScreen() {
  const { deudas, loading, eliminarDeuda } = useDeudas();
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const confirmarEliminar = (id: number) => {
    Alert.alert(
      "¿Eliminar deuda?",
      "Esto eliminará la deuda y su transacción asociada.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => eliminarDeuda(id)
        }
      ]
    );
  };

  const renderItem = ({ item }: any) => {
    const esFavor = item.total >= 0;
    const label = esFavor ? "Te deben" : "Debes";
    const color = esFavor ? theme.colors.tertiary : theme.colors.error;

    return (
      <Surface style={styles.card} elevation={3}>
        <View style={styles.cardRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.persona}>{item.persona}</Text>
            <Text style={[styles.total, { color }]}>
              {" "}
              {label}: ${Math.abs(item.total).toLocaleString("es-CO")}
            </Text>
            <Button
              mode="outlined"
              style={styles.botonGestionar}
              onPress={() =>
                router.push({
                  pathname: "/(pages)/GestionarDeudaScreen",
                  params: { id: item.id }
                })
              }
            >
              Gestionar
            </Button>
            <IconButton
              icon="eye"
              onPress={() =>
                router.push({
                  pathname: "/(pages)/PagosDeudaScreen",
                  params: { id: item.id }
                })
              }
              accessibilityLabel="Ver pagos"
            />
          </View>
          <IconButton
            icon="delete-outline"
            iconColor={theme.colors.error}
            onPress={() => confirmarEliminar(item.id)}
          />
        </View>
      </Surface>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Sin deudas registradas</Text>
      <Text style={styles.emptySubtitle}>
        Toca el botón "+" para agregar una nueva deuda.
      </Text>
      <Button
        mode="outlined"
        icon="plus"
        onPress={() => router.push("/(pages)/AgregarDeudaScreen")}
      >
        Agregar deuda
      </Button>
    </View>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <Appbar.Header elevated>
          <Appbar.Content title="Mis Deudas" />
        </Appbar.Header>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              animating
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <FlatList
            data={deudas}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            renderItem={renderItem}
            ItemSeparatorComponent={() => (
              <Divider style={{ marginVertical: 4 }} />
            )}
            ListEmptyComponent={EmptyState}
          />
        )}

        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push("/(pages)/AgregarDeudaScreen")}
          color="#fff"
        />
      </View>
    </Provider>
  );
}

const getStyles = (theme: MD3Theme) =>
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
      padding: 16,
      paddingBottom: 100
    },
    card: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      marginBottom: 8,
      shadowColor: theme.dark ? "#00000055" : "#00000022",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 }
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center"
    },
    persona: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.onSurface
    },
    total: {
      fontSize: 16,
      marginTop: 4,
      fontWeight: "600"
    },
    fab: {
      position: "absolute",
      right: 16,
      bottom: 16,
      backgroundColor: theme.colors.primary
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.onSurface,
      marginBottom: 8
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 16,
      textAlign: "center"
    },
    botonGestionar: {
      marginTop: 8,
      alignSelf: "flex-start",
      borderColor: theme.colors.primary
    }
  });
