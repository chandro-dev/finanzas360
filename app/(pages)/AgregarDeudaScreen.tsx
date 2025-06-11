import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import {
  Button,
  Text,
  Switch,
  Surface,
  Appbar,
  MD3Theme,
  useTheme,
  Provider
} from "react-native-paper";
import { useDeudas } from "@/hooks/useDeudas";
import { useAppTheme } from "@/hooks/useThemeConfig";
import CampoTexto from "@/components/CampoTexto"; // ✅ Importa tu componente
import GestionCuentasModal from "@/components/GestionCuentasModal";
import { Cuenta } from "@/models/Cuenta";

export default function AgregarDeudaScreen() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const { agregarDeuda } = useDeudas();
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<Cuenta | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);

  const [persona, setPersona] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [esPrestamo, setEsPrestamo] = useState(true);

  const handleGuardar = async () => {
    const cantidad = parseFloat(monto);
    if (!cuentaSeleccionada) {
      Alert.alert("Error", "Selecciona una cuenta.");
      return;
    }

    if (!persona.trim() || isNaN(cantidad)) {
      Alert.alert("Error", "Completa todos los campos correctamente.");
      return;
    }

    const exito = await agregarDeuda({
      persona,
      descripcion,
      cantidad,
      esPrestamo,      
      categoria_id:cuentaSeleccionada.id,

    });

    if (exito) {
      Alert.alert("Éxito", "Deuda registrada correctamente.");
      setPersona("");
      setDescripcion("");
      setMonto("");
      setEsPrestamo(true);
    } else {
      Alert.alert("Error", "No se pudo guardar la deuda.");
    }
  };

  return (
    <Provider>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Appbar.Header elevated>
          <Appbar.Content title="Agregar Deuda" />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.container}>
          <Surface style={styles.card} elevation={3}>
            <Text style={styles.label}>Persona</Text>
            <CampoTexto
              label="Nombre de la persona"
              value={persona}
              onChangeText={setPersona}
              icon="account"
            />

            <Text style={styles.label}>Descripción (opcional)</Text>
            <CampoTexto
              label="Concepto"
              value={descripcion}
              onChangeText={setDescripcion}
              icon="text"
            />

            <Text style={styles.label}>Monto</Text>
            <CampoTexto
              label="Monto en COP"
              value={monto}
              onChangeText={setMonto}
              keyboardType="numeric"
              icon="currency-usd"
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {esPrestamo ? "Le presté" : "Me prestó"}
              </Text>
              <Switch
                value={esPrestamo}
                onValueChange={setEsPrestamo}
                color={theme.colors.primary}
              />
            </View>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(true)}
              style={{ marginBottom: 16 }}
            >
              {cuentaSeleccionada
                ? `Cuenta: ${cuentaSeleccionada.nombre_cuenta}`
                : "Seleccionar cuenta"}
            </Button>

            <Button
              mode="contained"
              onPress={handleGuardar}
              style={styles.boton}
            >
              Guardar Deuda
            </Button>
            <GestionCuentasModal
              visible={modalVisible}
              onDismiss={() => setModalVisible(false)}
              onSeleccionar={(cuenta) => setCuentaSeleccionada(cuenta)}
            />
          </Surface>
        </ScrollView>
      </View>
    </Provider>
  );
}

const getStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      padding: 20,
      justifyContent: "center"
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      elevation: 4,
      shadowColor: theme.dark ? "#00000066" : "#00000022",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 }
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 6,
      color: theme.colors.onSurface
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24
    },
    switchText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.onSurface
    },
    boton: {
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.colors.primary
    }
  });
