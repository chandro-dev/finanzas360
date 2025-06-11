import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  Dimensions,
  Alert,
  StyleSheet,
  RefreshControl
} from "react-native";
import {
  Text,
  FAB,
  Portal,
  Provider,
  Appbar,
  ActivityIndicator,
  TextInput,
  MD3Theme
} from "react-native-paper";
import { useGestionTransacciones } from "@/hooks/useGestionTransacciones";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Transaccion } from "@/models/Transaccion";
import { TransactionItem } from "@/components/TransactionItem";
import { useAppTheme } from "@/hooks/useThemeConfig";

const { width } = Dimensions.get("window");

export default function TransaccionesScreen() {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { eliminarTransaccion, obtenerTransaccionesPaginadas } =
    useGestionTransacciones();

  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [pagina, setPagina] = useState(0);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const idsCargadosRef = useRef<Set<number>>(new Set());

  const cargarMas = useCallback(async () => {
    if (cargandoMas) return;

    setCargandoMas(true);

    try {
      const siguientePagina = pagina + 1;
      const nuevas = await obtenerTransaccionesPaginadas(siguientePagina, 10);
      const nuevasFiltradas = nuevas.filter(
        (tx: Transaccion) => !idsCargadosRef.current.has(tx.id)
      );

      if (nuevasFiltradas.length > 0) {
        setTransacciones((prev) => [...prev, ...nuevasFiltradas]);
        nuevasFiltradas.forEach((tx) => idsCargadosRef.current.add(tx.id));
        setPagina(siguientePagina);
      }
    } catch (error) {
      console.error("Error al cargar transacciones:", error);
    } finally {
      setCargandoMas(false);
    }
  }, [cargandoMas, pagina, obtenerTransaccionesPaginadas]);

  const refrescar = async () => {
    try {
      setRefreshing(true);
      setPagina(1);
      idsCargadosRef.current.clear();
      const nuevas = await obtenerTransaccionesPaginadas(1, 10);
      const nuevasFiltradas = nuevas.filter(
        (tx) => !idsCargadosRef.current.has(tx.id)
      );
      nuevasFiltradas.forEach((tx) => idsCargadosRef.current.add(tx.id));
      setTransacciones(nuevasFiltradas);
    } catch (error) {
      console.error("Error al refrescar transacciones:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const inicializar = async () => {
    setCargandoInicial(true);
    setPagina(0);
    setTransacciones([]);
    idsCargadosRef.current = new Set();
    await cargarMas();
    setCargandoInicial(false);
  };

  useEffect(() => {
    inicializar();
  }, []);

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

  const renderItem = ({ item }: { item: Transaccion }) => (
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
  );

  const transaccionesFiltradas = transacciones.filter((tx) =>
    tx.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="cash-remove"
        size={64}
        color={theme.colors.onSurfaceDisabled}
      />
      <Text style={styles.emptyTitle}>Sin transacciones</Text>
      <Text style={styles.emptyDescription}>
        Tus transacciones aparecerán aquí. Toca el botón + para agregar una
        nueva.
      </Text>
    </View>
  );

  return (
    <Provider>
      <View style={styles.container}>
        <Appbar.Header elevated>
          <Appbar.Content title="Transacciones" />
        </Appbar.Header>

        <TextInput
          mode="outlined"
          placeholder="Buscar transacción..."
          value={busqueda}
          onChangeText={setBusqueda}
          style={{ marginHorizontal: 12, marginTop: 12, marginBottom: 8 }}
          left={<TextInput.Icon icon="magnify" />}
        />

        {cargandoInicial ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={transaccionesFiltradas}
            keyExtractor={(item) => `tx-${item.id}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={EmptyState}
            showsVerticalScrollIndicator={false}
            onEndReached={cargarMas}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refrescar}
                colors={[theme.colors.primary]}
              />
            }
          />
        )}

        <Portal>
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => router.push("../(pages)/AgregarTransaccionScreen")}
            color="white"
          />
        </Portal>
      </View>
    </Provider>
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
    fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      bottom: 16,
      backgroundColor: theme.colors.primary
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
