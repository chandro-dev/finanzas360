// src/hooks/useTransaccionForm.ts
import db from '@/db/sqlite';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import uuid from 'react-native-uuid';

interface TransaccionForm {
  descripcion: string;
  cantidad: string;
  fecha: string;
  cuentaId?: string;
  tarjetaId?: string;
  categoriaId?: string;
}

export function useTransaccionForm(transaccionId?: string) {
  const [form, setForm] = useState<TransaccionForm>({
    descripcion: '',
    cantidad: '',
    fecha: new Date().toISOString().slice(0, 10),
    cuentaId: '',
    tarjetaId: '',
    categoriaId: '',
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!transaccionId) return;
    setLoading(true);
    db.getFirstAsync<TransaccionForm>(
      'SELECT descripcion, cantidad, fecha, cuentaId, tarjetaId, categoriaId FROM transacciones WHERE id = ?',
      [transaccionId]
    )
      .then((data) => {
        if (data) {
          setForm({
            descripcion: data.descripcion,
            cantidad: data.cantidad.toString(),
            fecha: data.fecha,
            cuentaId: data.cuentaId ?? undefined,
            tarjetaId: data.tarjetaId ?? undefined,
            categoriaId: data.categoriaId ?? undefined,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [transaccionId]);

  const onChange = (field: keyof TransaccionForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const guardar = async () => {
    const { descripcion, cantidad, fecha, cuentaId, tarjetaId, categoriaId } = form;
    if (!descripcion || !cantidad || !fecha)
      return Alert.alert('Error', 'Por favor completa todos los campos requeridos');
    console.log(cuentaId + tarjetaId);
    try {
      await db.runAsync(
        `INSERT INTO transacciones (
          id, descripcion, cantidad, fecha, cuentaId, tarjetaId, categoriaId
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid.v4().toString(),
          descripcion,
          parseFloat(cantidad),
          fecha,
          cuentaId ?? null,
          tarjetaId ?? null,
          categoriaId ?? null,
        ]
      );
      router.replace('/transacciones');
    } catch (error) {
      Alert.alert('Error al guardar', String(error));
    }
  };

  const actualizar = async () => {
    if (!transaccionId) return;
    const { descripcion, cantidad, fecha, cuentaId, tarjetaId, categoriaId } = form;
    if (!descripcion || !cantidad || !fecha)
      return Alert.alert('Error', 'Por favor completa todos los campos requeridos');

    try {
      await db.runAsync(
        `UPDATE transacciones SET
          descripcion = ?, cantidad = ?, fecha = ?, cuentaId = ?, tarjetaId = ?, categoriaId = ?
         WHERE id = ?`,
        [
          descripcion,
          parseFloat(cantidad),
          fecha,
          cuentaId ?? null,
          tarjetaId ?? null,
          categoriaId ?? null,
          transaccionId,
        ]
      );
      router.replace('/transacciones');
    } catch (error) {
      Alert.alert('Error al actualizar', String(error));
    }
  };

  return {
    form,
    loading,
    onChange,
    guardar,
    actualizar,
  };
}
