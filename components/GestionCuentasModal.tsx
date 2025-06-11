import React, { useState, useEffect } from "react";
import { FlatList } from "react-native";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from "react-native";
import {
  Modal,
  Portal,
  Button,
  Text,
  IconButton,
  Surface,
  Divider
} from "react-native-paper";
import { useAppTheme } from "@/hooks/useThemeConfig";
import { useCuentas } from "@/hooks/useCuentas";
import { Cuenta } from "@/models/Cuenta";
import CampoTexto from "@/components/CampoTexto";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onSeleccionar: (cuenta: Cuenta) => void;
}

const GestionCuentasModal: React.FC<Props> = ({ visible, onDismiss, onSeleccionar }) => {
  const { cuentas, loading, agregarCuenta } = useCuentas();
  const [nuevaCuenta, setNuevaCuenta] = useState("");
  const [modo, setModo] = useState<"seleccionar" | "crear">("seleccionar");
  const [buscador, setBuscador] = useState("");
  const { theme } = useAppTheme();

  useEffect(() => {
    if (visible) {
      setNuevaCuenta("");
      setBuscador("");
      setModo("seleccionar");
    }
  }, [visible]);

  const cuentasFiltradas = cuentas.filter((cuenta) =>
    cuenta.nombre_cuenta.toLowerCase().includes(buscador.toLowerCase())
  );

  const handleAgregarCuenta = async () => {
    const nombre = nuevaCuenta.trim();

    if (!nombre) {
      Alert.alert("Error", "El nombre de la cuenta no puede estar vacío.");
      return;
    }

    try {
      const nueva = await agregarCuenta(nombre);
      if (nueva) {
        onSeleccionar(nueva);
        onDismiss();
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la cuenta. Inténtalo de nuevo.");
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <Text style={[styles.titulo, { color: theme.colors.onBackground }]}> 
            {modo === "seleccionar" ? "Seleccionar cuenta" : "Nueva cuenta"}
          </Text>
          <IconButton icon="close" size={24} onPress={onDismiss} iconColor={theme.colors.onBackground} />
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, modo === "seleccionar" && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setModo("seleccionar")}
          >
            <Text style={[styles.tabText, modo === "seleccionar" && { color: theme.colors.primary, fontWeight: "bold" }]}>Seleccionar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, modo === "crear" && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setModo("crear")}
          >
            <Text style={[styles.tabText, modo === "crear" && { color: theme.colors.primary, fontWeight: "bold" }]}>Crear nueva</Text>
          </TouchableOpacity>
        </View>

        {modo === "seleccionar" && (
          <>
            <CampoTexto
              label="Buscar cuenta"
              value={buscador}
              onChangeText={setBuscador}
              icon="magnify"
            />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ color: theme.colors.onBackground, marginTop: 16 }}>Cargando cuentas...</Text>
              </View>
            ) : (
              <Surface style={{ backgroundColor: theme.colors.surface }}>
                {cuentasFiltradas.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="bank-off" size={48} color={theme.colors.onSurfaceVariant} />
                    <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}> 
                      {buscador ? "No se encontraron cuentas" : "No hay cuentas disponibles"}
                    </Text>
                    <Button mode="outlined" onPress={() => setModo("crear")} style={styles.emptyButton}>Crear nueva cuenta</Button>
                  </View>
                ) : (
                  <FlatList
                    data={cuentasFiltradas}
                    keyExtractor={(item) => item.id.toString()}
                    style={styles.scrollView}
                    ItemSeparatorComponent={() => <Divider />}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={() => { onSeleccionar(item); onDismiss(); }}>
                        <View style={styles.cuentaItem}>
                          <View style={[styles.cuentaIcono, { backgroundColor: theme.colors.primaryContainer }]}> 
                            <MaterialCommunityIcons name="bank" size={24} color={theme.colors.primary} />
                          </View>
                          <Text style={[styles.cuentaNombre, { color: theme.colors.onSurface }]}>{item.nombre_cuenta}</Text>
                          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </Surface>
            )}
          </>
        )}

        {modo === "crear" && (
          <View style={styles.crearContainer}>
            <CampoTexto
              label="Nombre de la cuenta"
              value={nuevaCuenta}
              onChangeText={setNuevaCuenta}
              icon="bank"
              hint="Ej: Efectivo, Tarjeta Crédito, Ahorros"
            />

            <View style={styles.previewContainer}>
              <Text style={[styles.previewLabel, { color: theme.colors.onSurfaceVariant }]}>Vista previa:</Text>
              <Surface style={[styles.previewCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.cuentaItem}>
                  <View style={[styles.cuentaIcono, { backgroundColor: theme.colors.primaryContainer }]}> 
                    <MaterialCommunityIcons name="bank" size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.cuentaNombre, { color: theme.colors.onSurface }]}>{nuevaCuenta || "Nueva cuenta"}</Text>
                </View>
              </Surface>
            </View>

            <Button
              mode="contained"
              onPress={handleAgregarCuenta}
              loading={loading}
              style={styles.botonGuardar}
              contentStyle={styles.botonContent}
              disabled={!nuevaCuenta.trim()}
            >
              {loading ? "Guardando..." : "Guardar Cuenta"}
            </Button>
          </View>
        )}
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    marginHorizontal: 16,
    marginVertical: 40,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    maxHeight: "90%",
    padding: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1
  },
  tabs: {
    flexDirection: "row"
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center"
  },
  tabText: {
    fontSize: 14
  },
  scrollView: {
    maxHeight: 320,
    height: 300
  },
  listContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 12,
    flex: 1
  },
  cuentaItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12
  },
  cuentaIcono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  cuentaNombre: {
    fontSize: 16,
    flex: 1
  },
  botonGuardar: {
    marginTop: 20,
    borderRadius: 8
  },
  botonContent: {
    height: 48
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  crearContainer: {
    padding: 16
  },
  previewContainer: {
    marginTop: 24
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8
  },
  previewCard: {
    borderRadius: 8,
    overflow: "hidden"
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyText: {
    marginVertical: 16,
    fontSize: 16,
    textAlign: "center"
  },
  emptyButton: {
    marginTop: 8
  }
});

export default GestionCuentasModal;
