import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Surface, Button, MD3Theme } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/useThemeConfig";
import { useDeudas } from "@/hooks/useDeudas";
import CampoTexto from "@/components/CampoTexto";
import GestionCuentasModal from "@/components/GestionCuentasModal";
import { Cuenta } from "@/models/Cuenta";

export default function AbonarDeudaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const { deudas, abonarDeuda } = useDeudas();
  const router = useRouter();

  const [monto, setMonto] = useState("");
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<Cuenta | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deuda, setDeuda] = useState<any>(null);

  useEffect(() => {
    const deudaEncontrada = deudas.find((d) => d.id === parseInt(id));
    setDeuda(deudaEncontrada);
    console.log(deudaEncontrada);
  }, [id, deudas]);

  const handleAbonar = async () => {
    const valor = parseFloat(monto);
  
    if (!cuentaSeleccionada) {
      Alert.alert("Error", "Debe seleccionar una cuenta.");
      return;
    }
  
    if (isNaN(valor) || valor <= 0) {
      Alert.alert("Error", "Ingrese un monto válido.");
      return;
    }
  
    if (!deuda) {
      Alert.alert("Error", "No se encontró la deuda.");
      return;
    }
    console.log(deuda.total);
    const esIngreso = deuda.total > 0; // 👈 corregido
    const cantidad = esIngreso ? valor : -valor;
  
    try {
      await abonarDeuda(deuda.id, cantidad, cuentaSeleccionada.id, {
        cantidad,
        cuenta_id: cuentaSeleccionada.id,
        nombre: `Abono ${esIngreso ? "recibido" : "pagado"} - ${deuda.persona}`
      });
      Alert.alert("Éxito", "Abono registrado correctamente.", [
        { text: "Aceptar", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar el abono.");
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Abonar Deuda</Text>
      <CampoTexto
        label="Monto a abonar"
        value={monto}
        onChangeText={setMonto}
        keyboardType="decimal-pad"
        icon="cash"
      />

      <Button
        mode="outlined"
        onPress={() => setModalVisible(true)}
        style={styles.botonSeleccionCuenta}
      >
        {cuentaSeleccionada
          ? `Cuenta: ${cuentaSeleccionada.nombre_cuenta}`
          : "Seleccionar cuenta"}
      </Button>

      <Button
        mode="contained"
        onPress={handleAbonar}
        disabled={!monto || !cuentaSeleccionada}
        style={styles.botonAbonar}
      >
        Registrar abono
      </Button>

      <GestionCuentasModal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onSeleccionar={setCuentaSeleccionada}
      />
    </View>
  );
}

const getStyles = (theme: MD3Theme)  =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 16
    },
    titulo: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 20,
      color: theme.colors.onBackground
    },
    botonSeleccionCuenta: {
      marginTop: 16,
      marginBottom: 24
    },
    botonAbonar: {
      marginTop: 12,
      borderRadius: 8
    }
  });
