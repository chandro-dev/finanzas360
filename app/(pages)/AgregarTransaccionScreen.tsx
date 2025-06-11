import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform
} from "react-native";
import {
  Text,
  Button,
  IconButton,
  Surface,
  MD3Theme,
  Divider
} from "react-native-paper";
import { useGestionTransacciones } from "@/hooks/useGestionTransacciones";
import { useNavigation } from "@react-navigation/native";
import GestionCategoriasModal from "@/components/GestionCategoriasModal";
import GestionCuentasModal from "@/components/GestionCuentasModal";
import { Categoria } from "@/models/Categoria";
import { Cuenta } from "@/models/Cuenta";
import { Transaccion } from "@/models/Transaccion";
import { useRouter } from "expo-router";
import { ValidacionTransaccion } from "@/utils/validaciones";
import CampoTexto from "@/components/CampoTexto";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useThemeConfig";
import DateTimePicker from "@react-native-community/datetimepicker";

const AgregarTransaccionScreen = () => {
  const { agregarTransaccion } = useGestionTransacciones();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [fecha, setFecha] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [esIngreso, setEsIngreso] = useState(true);
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [modalCuentaVisible, setModalCuentaVisible] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const onChangeFecha = (_event: any, selectedDate?: Date) => {
    setMostrarPicker(false);
    if (selectedDate) setFecha(selectedDate);
  };

  const navigation = useNavigation();
  const router = useRouter();

  const colorIngreso = theme.colors.primary;
  const colorGasto = theme.colors.error;

  useEffect(() => {
    if (guardado) {
      router.replace("../(tabs)/transacciones");
    }
  }, [guardado]);

  const handleAgregar = useCallback(() => {
    const validacion = ValidacionTransaccion.validarCampos(
      descripcion,
      cantidad,
      categoria?.id,
      cuenta?.id
    );

    if (!validacion) {
      const valor = parseFloat(cantidad);
      const nuevaTransaccion: Omit<
        Transaccion,
        "id" | "categoria_nombre" | "categoria_icono" | "tags"
      > = {
        nombre: descripcion,
        cantidad: esIngreso ? valor : -valor,
        fecha: fecha.toISOString(),
        categoria_id: categoria!.id,
        Cuenta_id: cuenta!.id,
        categoria,
        cuenta
      };

      agregarTransaccion(nuevaTransaccion);
      setGuardado(true);
    } else {
      Alert.alert("Error de validación", validacion);
    }
  }, [descripcion, cantidad, categoria, cuenta, esIngreso, fecha]);

  const handleBackPress = useCallback(() => {
    if (descripcion || cantidad || categoria || cuenta) {
      Alert.alert(
        "¿Estás seguro?",
        "Tienes cambios no guardados, ¿deseas salir?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Salir",
            style: "destructive",
            onPress: () => setGuardado(true)
          }
        ]
      );
    } else {
      setGuardado(true);
    }
  }, [descripcion, cantidad, categoria, cuenta]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!guardado) {
        e.preventDefault();
        handleBackPress();
      }
    });
    return unsubscribe;
  }, [navigation, guardado, handleBackPress]);

  return (
    <Surface style={styles.surface}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.titulo}>Nueva Transacción</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={handleBackPress}
            style={styles.closeButton}
          />
        </View>

        <View style={styles.tipoTransaccionContainer}>
          <TouchableOpacity
            style={[
              styles.tipoTransaccionBtn,
              esIngreso && styles.tipoSeleccionado,
              { borderColor: colorIngreso }
            ]}
            onPress={() => setEsIngreso(true)}
          >
            <MaterialCommunityIcons
              name="arrow-down-bold-circle"
              size={24}
              color={esIngreso ? colorIngreso : theme.colors.onSurfaceDisabled}
            />
            <Text
              style={[
                styles.tipoTransaccionText,
                esIngreso && { color: colorIngreso, fontWeight: "bold" }
              ]}
            >
              Ingreso
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tipoTransaccionBtn,
              !esIngreso && styles.tipoSeleccionado,
              { borderColor: colorGasto }
            ]}
            onPress={() => setEsIngreso(false)}
          >
            <MaterialCommunityIcons
              name="arrow-up-bold-circle"
              size={24}
              color={!esIngreso ? colorGasto : theme.colors.onSurfaceDisabled}
            />
            <Text
              style={[
                styles.tipoTransaccionText,
                !esIngreso && { color: colorGasto, fontWeight: "bold" }
              ]}
            >
              Gasto
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <CampoTexto
            label="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            icon="text-short"
            hint="Nombre de la transacción"
          />

          <CampoTexto
            label="Cantidad"
            value={cantidad}
            onChangeText={setCantidad}
            keyboardType="decimal-pad"
            icon="cash"
            hint="Valor sin puntos ni comas"
          />

          <Surface style={styles.seleccionCard}>
            <Text style={styles.seleccionLabel}>
              Seleccionar cuenta y categoría
            </Text>

            <TouchableOpacity
              style={styles.seleccionItem}
              onPress={() => setModalCuentaVisible(true)}
            >
              <View style={styles.seleccionIconContainer}>
                <MaterialCommunityIcons
                  name="bank"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.seleccionContent}>
                <Text style={styles.seleccionTitle}>Cuenta</Text>
                <Text style={styles.seleccionValue}>
                  {cuenta?.nombre_cuenta || "Seleccionar"}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceDisabled}
              />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity
              style={styles.seleccionItem}
              onPress={() => setModalCategoriaVisible(true)}
            >
              <View
                style={[
                  styles.seleccionIconContainer,
                  {
                    backgroundColor: categoria
                      ? theme.colors.surfaceVariant
                      : theme.colors.surface
                  }
                ]}
              >
                <MaterialCommunityIcons
                  name={categoria?.icono || "folder"}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.seleccionContent}>
                <Text style={styles.seleccionTitle}>Categoría</Text>
                <Text style={styles.seleccionValue}>
                  {categoria?.nombre_cat || "Seleccionar"}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceDisabled}
              />
            </TouchableOpacity>
          </Surface>

          <TouchableOpacity
            onPress={() => setMostrarPicker(true)}
            style={styles.fechaSelector}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.fechaTexto}>
              {fecha.toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </Text>
          </TouchableOpacity>

          {mostrarPicker && (
            <DateTimePicker
              value={fecha}
              mode="date"
              display="calendar"
              onChange={onChangeFecha}
            />
          )}

          <Button
            mode="contained"
            onPress={handleAgregar}
            style={styles.boton}
            contentStyle={styles.botonContent}
            labelStyle={styles.botonLabel}
            icon="check-circle"
          >
            Guardar {esIngreso ? "Ingreso" : "Gasto"}
          </Button>
        </View>
      </ScrollView>

      <GestionCategoriasModal
        visible={modalCategoriaVisible}
        onDismiss={() => setModalCategoriaVisible(false)}
        onSeleccionar={setCategoria}
      />

      <GestionCuentasModal
        visible={modalCuentaVisible}
        onDismiss={() => setModalCuentaVisible(false)}
        onSeleccionar={setCuenta}
      />
    </Surface>
  );
};

const createStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    surface: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    container: {
      padding: 16,
      flexGrow: 1
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    },
    titulo: {
      fontSize: 26,
      fontWeight: "bold",
      flex: 1,
      color: theme.colors.primary
    },
    closeButton: {
      margin: 0
    },
    tipoTransaccionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
      borderRadius: 12,
      overflow: "hidden"
    },
    tipoTransaccionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      marginHorizontal: 4,
      borderRadius: 12
    },
    tipoSeleccionado: {
      backgroundColor: theme.colors.secondaryContainer,
      borderWidth: 2
    },
    tipoTransaccionText: {
      marginLeft: 8,
      fontWeight: "500",
      fontSize: 16,
      color: theme.colors.onSurface
    },
    formContainer: {
      gap: 20
    },
    seleccionCard: {
      padding: 16,
      borderRadius: 12,
      elevation: 2,
      backgroundColor: theme.colors.surface
    },
    seleccionLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 12,
      fontWeight: "500"
    },
    seleccionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12
    },
    seleccionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12
    },
    seleccionContent: {
      flex: 1
    },
    seleccionTitle: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant
    },
    seleccionValue: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.onSurface
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
      width: "100%",
      marginVertical: 4
    },
    boton: {
      marginTop: 32,
      borderRadius: 12,
      elevation: 2,
      backgroundColor: theme.colors.primary
    },
    botonContent: {
      height: 56
    },
    botonLabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.onPrimary
    },
    fechaSelector: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 10
    },
    fechaTexto: {
      fontSize: 16,
      color: theme.colors.onSurface
    }
  });
export default AgregarTransaccionScreen;
