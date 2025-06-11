import React, { useState, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
  ScrollView
} from "react-native";
import {
  Modal,
  Portal,
  Button,
  Text,
  IconButton,
  Surface,
  Divider,
  MD3Theme
} from "react-native-paper";
import { useCategorias } from "../hooks/useCategorias";
import { Categoria } from "@/models/Categoria";
import CampoTexto from "@/components/CampoTexto";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useThemeConfig";

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onSeleccionar: (categoria: Categoria) => void;
}

const ICONOS_POPULARES = [
  // Ingresos
  "cash", // Efectivo
  "currency-usd", // Moneda USD
  "wallet", // Billetera
  "credit-card", // Tarjeta de Crédito
  "bank", // Banco

  // Gastos
  "food", // Comida
  "shopping", // Compras
  "gift", // Regalos
  "home-floor-1", // Hogar
  "bell", // Recordatorios de pagos
  "alarm", // Recordatorios de pagos por vencimiento

  // Ahorros e Inversiones
  "bank-transfer", // Transferencia bancaria
  "currency-btc", // Bitcoin (criptomonedas)
  "cash-multiple", // Ahorros en efectivo
  "chart-line", // Crecimiento de ahorros
  "chart-pie", // Distribución de ahorro

  // Deudas
  "credit-card-multiple", // Deudas de múltiples tarjetas
  "lock", // Deudas bloqueadas
  "file-lock", // Deudas judiciales o bloqueadas

  // Presupuesto
  "calculator", // Calculadora
  "file-chart", // Reportes financieros
  "calendar-month", // Calendario mensual
  "calendar-check", // Control de fechas de pagos y presupuesto

  // Metas Financieras
  "star", // Metas financieras
  "target", // Objetivos financieros
  "trophy", // Logro de metas

  // Otros
  "purse", // Dinero en efectivo
  "phone", // Teléfono
  "wifi", // Internet
  "cart", // Compras
  "bed", // Gastos de salud o descanso
  "school", // Educación financiera o gastos educativos
  "baby-bottle", // Gastos para niños
  "home-circle", // Hogar (finanzas personales)
  "car" // Transporte
];

const GestionCategoriasModal: React.FC<Props> = ({
  visible,
  onDismiss,
  onSeleccionar
}) => {
  const { categorias, loading, agregarCategoria } = useCategorias();
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevoIcono, setNuevoIcono] = useState("cart");
  const [modo, setModo] = useState<"seleccionar" | "crear">("seleccionar");
  const [buscador, setBuscador] = useState("");
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  // Reset estado cuando el modal se abre
  const fueVisible = useRef(false);

  useEffect(() => {
    if (visible && !fueVisible.current) {
      setNuevaCategoria("");
      setNuevoIcono("cart");
      setBuscador("");
      setModo("seleccionar");
      fueVisible.current = true;
    }
    if (!visible) {
      fueVisible.current = false;
    }
  }, [visible]);

  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre_cat.toLowerCase().includes(buscador.toLowerCase())
  );

  const agregarNuevaCategoria = async () => {
    const nombre = nuevaCategoria.trim();
    const icono = nuevoIcono.trim();

    if (!nombre) {
      Alert.alert("Error", "El nombre de la categoría no puede estar vacío.");
      return;
    }

    try {
      const nueva = await agregarCategoria(nombre, icono);
      onSeleccionar(nueva);
      onDismiss();
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo crear la categoría. Inténtalo de nuevo."
      );
    }
  };

  const renderIconoItem = (icon: string) => (
    <TouchableOpacity
      key={icon}
      onPress={() => setNuevoIcono(icon)}
      style={[
        styles.iconoItem,
        nuevoIcono === icon && {
          backgroundColor: theme.colors.primaryContainer,
          borderColor: theme.colors.primary
        }
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={nuevoIcono === icon ? theme.colors.primary : "#757575"}
      />
    </TouchableOpacity>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text style={styles.titulo}>
            {modo === "seleccionar"
              ? "Seleccionar categoría"
              : "Nueva categoría"}
          </Text>
          <IconButton icon="close" size={24} onPress={onDismiss} />
        </View>

        {/* Tabs de navegación */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              modo === "seleccionar" && {
                borderBottomColor: theme.colors.primary,
                borderBottomWidth: 2
              }
            ]}
            onPress={() => setModo("seleccionar")}
          >
            <Text
              style={[
                styles.tabText,
                modo === "seleccionar" && {
                  color: theme.colors.primary,
                  fontWeight: "bold"
                }
              ]}
            >
              Seleccionar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              modo === "crear" && {
                borderBottomColor: theme.colors.primary,
                borderBottomWidth: 2
              }
            ]}
            onPress={() => setModo("crear")}
          >
            <Text
              style={[
                styles.tabText,
                modo === "crear" && {
                  color: theme.colors.primary,
                  fontWeight: "bold"
                }
              ]}
            >
              Crear nueva
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modo seleccionar */}
        {modo === "seleccionar" && (
          <>
            <CampoTexto
              label="Buscar categoría"
              value={buscador}
              onChangeText={setBuscador}
              icon="magnify"
            />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Cargando categorías...</Text>
              </View>
            ) : (
              <Surface style={styles.container_scroll}>
                {categoriasFiltradas.length === 0 ? (
                  <View style={styles.emptyState}>
                    <MaterialCommunityIcons
                      name="folder-alert"
                      size={48}
                      color="#BDBDBD"
                    />
                    <Text style={styles.emptyText}>
                      {buscador
                        ? "No se encontraron categorías"
                        : "No hay categorías disponibles"}
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={() => setModo("crear")}
                      style={styles.emptyButton}
                    >
                      Crear nueva
                    </Button>
                  </View>
                ) : (
                  <ScrollView style={styles.scrollView}>
                    {categoriasFiltradas.map((cat, index) => (
                      <React.Fragment key={cat.id}>
                        <TouchableOpacity
                          onPress={() => {
                            onSeleccionar(cat);
                            onDismiss();
                          }}
                        >
                          <View style={styles.categoriaItem}>
                            <View style={styles.categoriaIcono}>
                              <MaterialCommunityIcons
                                name={cat.icono || "folder"}
                                size={24}
                                color={theme.colors.primary}
                              />
                            </View>
                            <Text style={styles.categoriaNombre}>
                              {cat.nombre_cat}
                            </Text>
                            <MaterialCommunityIcons
                              name="chevron-right"
                              size={20}
                              color="#757575"
                            />
                          </View>
                        </TouchableOpacity>
                        {index < categoriasFiltradas.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </ScrollView>
                )}
              </Surface>
            )}
          </>
        )}

        {/* Modo crear */}
        {modo === "crear" && (
          <View style={styles.crearContainer}>
            <CampoTexto
              label="Nombre de categoría"
              value={nuevaCategoria}
              onChangeText={setNuevaCategoria}
              icon="tag-text"
              hint="Ej: Comida, Transporte, Educación"
            />

            <Text style={styles.subtitulo}>Selecciona un ícono</Text>

            <Surface style={styles.iconosContainer}>
              <ScrollView
                horizontal={false}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.iconosGrid}
              >
                {ICONOS_POPULARES.map(renderIconoItem)}
              </ScrollView>
            </Surface>

            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Vista previa:</Text>
              <Surface style={styles.previewCard}>
                <View style={styles.categoriaItem}>
                  <View
                    style={[
                      styles.categoriaIcono,
                      { backgroundColor: theme.colors.primaryContainer }
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={nuevoIcono}
                      size={24}
                      color={theme.colors.primary}
                    />
                  </View>
                  <Text style={styles.categoriaNombre}>
                    {nuevaCategoria || "Nueva categoría"}
                  </Text>
                </View>
              </Surface>
            </View>

            <Button
              mode="contained"
              onPress={agregarNuevaCategoria}
              loading={loading}
              style={styles.botonGuardar}
              contentStyle={styles.botonContent}
              disabled={!nuevaCategoria.trim()}
            >
              {loading ? "Guardando..." : "Guardar Categoría"}
            </Button>
          </View>
        )}
      </Modal>
    </Portal>
  );
};
const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    modal: {
      backgroundColor: theme.colors.background,
      marginHorizontal: 16,
      marginVertical: 40,
      borderRadius: 16,
      overflow: "hidden",
      elevation: 4,
      maxHeight: "90%",
      padding: 16
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant
    },
    titulo: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.onBackground,
      flex: 1
    },
    tabs: {
      flexDirection: "row",
      marginTop: 16,
      marginBottom: 12,
      borderBottomWidth: 1,
      borderColor: theme.colors.outlineVariant
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: "center"
    },
    tabText: {
      fontSize: 14,
      color: theme.colors.onSurface
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 20
    },
    loadingText: {
      marginTop: 8,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant
    },
    emptyState: {
      justifyContent: "center",
      alignItems: "center",
      padding: 20
    },
    emptyText: {
      fontSize: 16,
      marginTop: 8,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center"
    },
    emptyButton: {
      marginTop: 16
    },
    container_scroll: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      elevation: 2,
      marginVertical: 8,
      maxHeight: 320
    },
    scrollView: {
      maxHeight: 300
    },
    categoriaItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16
    },
    categoriaIcono: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      backgroundColor: theme.colors.secondaryContainer
    },
    categoriaNombre: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.onSurface
    },
    crearContainer: {
      paddingVertical: 8
    },
    subtitulo: {
      marginTop: 16,
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 8,
      color: theme.colors.onSurface
    },
    iconosContainer: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      padding: 8,
      maxHeight: 160
    },
    iconosGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start"
    },
    iconoItem: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      margin: 4,
      borderWidth: 1
    },
    previewContainer: {
      marginVertical: 16
    },
    previewLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 4
    },
    previewCard: {
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant
    },
    botonGuardar: {
      marginTop: 8,
      borderRadius: 8
    },
    botonContent: {
      paddingVertical: 10
    }
  });

export default GestionCategoriasModal;
