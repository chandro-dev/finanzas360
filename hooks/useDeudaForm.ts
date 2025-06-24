// src/hooks/useDeudaForm.ts
import db from "@/db/sqlite";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import uuid from "react-native-uuid";

export function useDeudaForm(deudaId?: string) {
  const [form, setForm] = useState({
    personaId: '',
    monto: '',
    fecha: new Date().toISOString().slice(0, 10),
    descripcion: '',
    pagado: false,
  });

  const router = useRouter();

  useEffect(() => {
    if (!deudaId) return;
    db.getFirstAsync<any>(
      'SELECT * FROM deudas WHERE id = ?',
      [deudaId]
    ).then((data) => {
      if (data) {
        setForm({
          personaId: data.personaId,
          monto: data.monto.toString(),
          fecha: data.fecha,
          descripcion: data.descripcion,
          pagado: !!data.pagado,
        });
      }
    });
  }, [deudaId]);

  const actualizarDeudaTotalPersona = async (personaId: string) => {
    const result = await db.getFirstAsync<any>(
      'SELECT SUM(monto) as total FROM deudas WHERE personaId = ? AND pagado = 0',
      [personaId]
    );
    const nuevaDeuda = result?.total || 0;
    await db.runAsync(
      'UPDATE personas SET deuda = ? WHERE id = ?',
      [nuevaDeuda, personaId]
    );
  };

  const onChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const guardar = async () => {
    const { personaId, monto, fecha, descripcion, pagado } = form;
    if (!personaId || !monto || !fecha)
      return Alert.alert("Error", "Completa todos los campos requeridos");

    await db.runAsync(
      `INSERT INTO deudas (id, personaId, monto, fecha, descripcion, pagado) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        uuid.v4().toString(),
        personaId,
        parseFloat(monto),
        fecha,
        descripcion,
        pagado ? 1 : 0,
      ]
    );

    await actualizarDeudaTotalPersona(personaId);
    router.replace("/deudas");
  };

  const actualizar = async () => {
    if (!deudaId) return;
    const { personaId, monto, fecha, descripcion, pagado } = form;

    await db.runAsync(
      `UPDATE deudas SET personaId = ?, monto = ?, fecha = ?, descripcion = ?, pagado = ? WHERE id = ?`,
      [
        personaId,
        parseFloat(monto),
        fecha,
        descripcion,
        pagado ? 1 : 0,
        deudaId,
      ]
    );

    await actualizarDeudaTotalPersona(personaId);
    router.replace("/deudas");
  };

  const eliminar = async () => {
    if (!deudaId) return;
    const { personaId } = form;

    await db.runAsync('DELETE FROM deudas WHERE id = ?', [deudaId]);
    await actualizarDeudaTotalPersona(personaId);
    router.replace("/deudas");
  };

  return {
    form,
    onChange,
    guardar,
    actualizar,
    eliminar,
  };
}
