// app/(pages)/EditarTransaccionScreen.tsx

import React, { useEffect, useState } from "react";
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
  Surface,
  IconButton,
  Divider
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useGestionTransacciones } from "@/hooks/useGestionTransacciones";
import { Transaccion } from "@/models/Transaccion";
import GestionCategoriasModal from "@/components/GestionCategoriasModal";
import GestionCuentasModal from "@/components/GestionCuentasModal";
import CampoTexto from "@/components/CampoTexto";
import { Categoria } from "@/models/Categoria";
import { Cuenta } from "@/models/Cuenta";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ValidacionTransaccion } from "@/utils/validaciones";
import { useAppTheme } from "@/hooks/useThemeConfig";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function EditarTransaccionScreen() {
  const { theme } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { obtenerTransaccionPorId, actualizarTransaccion } = useGestionTransacciones();
  const [transaccion, setTransaccion] = useState<Transaccion | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [esIngreso, setEsIngreso] = useState(true);
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [modalCuentaVisible, setModalCuentaVisible] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [fecha, setFecha] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const router = useRouter();
  const colorIngreso = theme.colors.tertiary;
  const colorGasto = theme.colors.error;

  useEffect(() => {
    const fetchTransaccion = async (id) => {
      const resultado = await obtenerTransaccionPorId(parseInt(id));
      if (resultado) {
        setTransaccion(resultado);
        setDescripcion(resultado.nombre);
        setCantidad(Math.abs(resultado.cantidad).toString());
        setEsIngreso(resultado.cantidad >= 0);
        setCuenta(resultado.cuenta);
        setCategoria(resultado.categoria);
        setFecha(new Date(resultado.fecha));
      }
    };
    if (id) {
      fetchTransaccion(id);
    }
  }, [id]);

  useEffect(() => {
    if (guardado) {
      router.replace("../(tabs)/transacciones");
    }
  }, [guardado]);

  const handleGuardarCambios = () => {
    const validacion = ValidacionTransaccion.validarCampos(
      descripcion,
      cantidad,
      categoria?.id,
      cuenta?.id
    );

    if (validacion === null && transaccion) {
      const nuevaCantidad = parseFloat(cantidad);
      const transaccionActualizada: Transaccion = {
        ...transaccion,
        nombre: descripcion,
        cantidad: esIngreso ? nuevaCantidad : -nuevaCantidad,
        categoria_id: categoria.id,
        Cuenta_id: cuenta.id,
        fecha: fecha.toISOString(),
        categoria,
        cuenta
      };

      actualizarTransaccion(transaccionActualizada);
      setGuardado(true);
    } else {
      Alert.alert("Error de validación", validacion ?? "Transacción no válida");
    }
  };

  const handleBackPress = () => {
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
  };

  return (
    <Surface style={[styles.surface, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.titulo, { color: theme.colors.onSurface }]}>Editar Transacción</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={handleBackPress}
            style={styles.closeButton}
            iconColor={theme.colors.onSurface}
          />
        </View>

        <View style={styles.tipoTransaccionContainer}>
          <TouchableOpacity
            style={[styles.tipoTransaccionBtn, esIngreso && styles.tipoSeleccionado, { borderColor: colorIngreso, backgroundColor: esIngreso ? theme.colors.secondaryContainer : theme.colors.surface }]}
            onPress={() => setEsIngreso(true)}
          >
            <MaterialCommunityIcons
              name="arrow-down-bold-circle"
              size={24}
              color={colorIngreso}
            />
            <Text style={[styles.tipoTransaccionText, { color: colorIngreso }]}>Ingreso</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tipoTransaccionBtn, !esIngreso && styles.tipoSeleccionado, { borderColor: colorGasto, backgroundColor: !esIngreso ? theme.colors.errorContainer : theme.colors.surface }]}
            onPress={() => setEsIngreso(false)}
          >
            <MaterialCommunityIcons
              name="arrow-up-bold-circle"
              size={24}
              color={colorGasto}
            />
            <Text style={[styles.tipoTransaccionText, { color: colorGasto }]}>Gasto</Text>
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

          <Surface style={[styles.seleccionCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.seleccionLabel, { color: theme.colors.onSurfaceVariant }]}>Seleccionar cuenta y categoría</Text>

            <TouchableOpacity style={styles.seleccionItem} onPress={() => setModalCuentaVisible(true)}>
              <View style={[styles.seleccionIconContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
                <MaterialCommunityIcons name="bank" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.seleccionContent}>
                <Text style={[styles.seleccionTitle, { color: theme.colors.onSurfaceVariant }]}>Cuenta</Text>
                <Text style={[styles.seleccionValue, { color: theme.colors.onSurface }]}>{cuenta?.nombre_cuenta || "Seleccionar"}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

            <TouchableOpacity style={styles.seleccionItem} onPress={() => setModalCategoriaVisible(true)}>
              <View style={[styles.seleccionIconContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
                <MaterialCommunityIcons name={categoria?.icono || "folder"} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.seleccionContent}>
                <Text style={[styles.seleccionTitle, { color: theme.colors.onSurfaceVariant }]}>Categoría</Text>
                <Text style={[styles.seleccionValue, { color: theme.colors.onSurface }]}>{categoria?.nombre_cat || "Seleccionar"}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </Surface>

          <TouchableOpacity onPress={() => setMostrarPicker(true)} style={styles.fechaSelector}>
            <MaterialCommunityIcons name="calendar" size={24} color={theme.colors.primary} />
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
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_event, selectedDate) => {
                setMostrarPicker(false);
                if (selectedDate) setFecha(selectedDate);
              }}
            />
          )}

          <Button
            mode="contained"
            onPress={handleGuardarCambios}
            style={styles.boton}
            contentStyle={styles.botonContent}
            labelStyle={styles.botonLabel}
            icon="content-save"
          >
            Guardar cambios
          </Button>
        </View>
      </ScrollView>

      <GestionCategoriasModal
        visible={modalCategoriaVisible}
        onDismiss={() => setModalCategoriaVisible(false)}
        onSeleccionar={(cat) => setCategoria(cat)}
      />
      <GestionCuentasModal
        visible={modalCuentaVisible}
        onDismiss={() => setModalCuentaVisible(false)}
        onSeleccionar={(cuenta) => setCuenta(cuenta)}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: { flex: 1 },
  container: { padding: 16, flexGrow: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  titulo: { fontSize: 24, fontWeight: "bold", flex: 1 },
  closeButton: { margin: 0 },
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
    borderWidth: 2,
    marginHorizontal: 4,
    borderRadius: 12
  },
  tipoSeleccionado: {
    borderWidth: 2
  },
  tipoTransaccionText: {
    marginLeft: 8,
    fontWeight: "500",
    fontSize: 16
  },
  formContainer: { gap: 20 },
  seleccionCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2
  },
  seleccionLabel: {
    fontSize: 14,
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12
  },
  seleccionContent: { flex: 1 },
  seleccionTitle: { fontSize: 12 },
  seleccionValue: { fontSize: 16, fontWeight: "500" },
  divider: { height: 1 },
  boton: { marginTop: 24 },
  botonContent: { paddingVertical: 8 },
  botonLabel: { fontSize: 16 },
  fechaSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10
  },
  fechaTexto: {
    fontSize: 16,
    color: "#444"
  }
});
