import db from "@/db/sqlite";
import { Deuda } from "@/types/model";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import uuid from "react-native-uuid";

interface TransaccionForm {
  descripcion: string;
  cantidad: string;
  fecha: string;
  cuentaId?: string;
  categoriaId?: string;
}

export function useTransaccionForm(transaccionId?: string) {
  const [form, setForm] = useState<TransaccionForm>({
    descripcion: "",
    cantidad: "",
    fecha: new Date().toISOString().slice(0, 10),
    cuentaId: "",
    categoriaId: ""
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onChange = (field: keyof TransaccionForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const normalizarId = (valor?: string) =>
    valor && valor !== "" ? valor : null;

  useEffect(() => {
    if (!transaccionId) return;

    setLoading(true);
    db.getFirstAsync<TransaccionForm>(
      `SELECT descripcion, cantidad, fecha, cuentaId, categoriaId FROM transacciones WHERE id = ?`,
      [transaccionId]
    )
      .then((data) => {
        if (data) {
          setForm({
            descripcion: data.descripcion,
            cantidad: data.cantidad.toString(),
            fecha: data.fecha,
            cuentaId: data.cuentaId ?? "",
            categoriaId: data.categoriaId ?? ""
          });
        }
      })
      .finally(() => setLoading(false));
  }, [transaccionId]);

  const ajustarSaldoCuenta = async (
    cuentaId: string | null,
    cantidad: number,
    esIngreso: boolean
  ) => {
    if (!cuentaId) return;
    const signo = esIngreso ? "+" : "-";
    await db.runAsync(
      `UPDATE cuentas SET saldo = saldo ${signo} ? WHERE id = ?`,
      [Math.abs(cantidad), cuentaId]
    );
  };

  const recalcularDeudasPersona = async (personaId: string) => {
    const total = await db.getFirstAsync<{ total: number }>(
      `SELECT SUM(monto) as total FROM deudas WHERE personaId = ? AND pagado = 0`,
      [personaId]
    );

    const deudaActual = parseFloat(total?.total?.toString() ?? "0");

    console.log(personaId);
    await db.runAsync(`UPDATE personas SET deuda = ? WHERE id = ?`, [
      deudaActual,
      personaId
    ]);
  };

  const verificarPagoDeuda = async (descripcion: string) => {
    if (!descripcion.startsWith("Pago deuda ")) return;

    const deudaId = descripcion.split("Pago deuda ")[1];
    const deuda = await db.getFirstAsync<Deuda>(
      `SELECT * FROM deudas WHERE id = ?`,
      [deudaId]
    );
    if (deuda && deuda.pagado === 0) {
      const totalPagado = await db.getFirstAsync<{ total: number }>(
        `SELECT SUM(cantidad) as total FROM transacciones WHERE descripcion LIKE ?`,
        [`Pago deuda ${deudaId}%`]
      );
      const pagado = Math.abs(
        parseFloat(totalPagado?.total?.toString() ?? "0")
      );
      
      if (pagado >= deuda.monto) {
        console.log(pagado);
        await db.runAsync(`UPDATE deudas SET pagado = 1 WHERE id = ?`, [
          deudaId
        ]);
      }

      await recalcularDeudasPersona(deuda.personaId);
    }
  };

  const guardar = async () => {
    const { descripcion, cantidad, fecha, cuentaId, categoriaId } = form;

    if (!descripcion || !cantidad || !fecha) {
      return Alert.alert(
        "Error",
        "Por favor completa todos los campos requeridos"
      );
    }

    const id = uuid.v4().toString();
    const cantidadNum = parseFloat(cantidad);

    try {
      await db.runAsync(
        `INSERT INTO transacciones (
          id, descripcion, cantidad, fecha, cuentaId, categoriaId
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          descripcion,
          cantidadNum,
          fecha,
          normalizarId(cuentaId),
          normalizarId(categoriaId)
        ]
      );

      await verificarPagoDeuda(descripcion);
      await ajustarSaldoCuenta(
        normalizarId(cuentaId),
        cantidadNum,
        cantidadNum > 0
      );

      router.back(); // navega hacia atrás
    } catch (error) {
      Alert.alert("Error al guardar", String(error));
    }
  };

  const actualizar = async () => {
    if (!transaccionId) return;

    const { descripcion, cantidad, fecha, cuentaId, categoriaId } = form;
    const cantidadNum = parseFloat(cantidad);

    if (!descripcion || !cantidad || !fecha) {
      return Alert.alert(
        "Error",
        "Por favor completa todos los campos requeridos"
      );
    }

    try {
      const transaccionAnterior = await db.getFirstAsync<{
        cantidad: number;
        cuentaId: string | null;
      }>(`SELECT cantidad, cuentaId FROM transacciones WHERE id = ?`, [
        transaccionId
      ]);

      await db.runAsync(
        `UPDATE transacciones SET
         descripcion = ?, cantidad = ?, fecha = ?, cuentaId = ?, categoriaId = ?
         WHERE id = ?`,
        [
          descripcion,
          cantidadNum,
          fecha,
          normalizarId(cuentaId),
          normalizarId(categoriaId),
          transaccionId
        ]
      );

      if (transaccionAnterior) {
        // revertir el saldo anterior
        await ajustarSaldoCuenta(
          transaccionAnterior.cuentaId,
          -transaccionAnterior.cantidad,
          transaccionAnterior.cantidad > 0
        );
      }

      await ajustarSaldoCuenta(
        normalizarId(cuentaId),
        cantidadNum,
        cantidadNum > 0
      );

      await verificarPagoDeuda(descripcion);
      router.back(); // vuelve atrás
    } catch (error) {
      Alert.alert("Error al actualizar", String(error));
    }
  };

  const inicializarFormulario = (valores: Partial<TransaccionForm>) => {
    setForm((prev) => ({ ...prev, ...valores }));
  };

  return {
    form,
    loading,
    onChange,
    guardar,
    actualizar,
    inicializarFormulario
  };
}
