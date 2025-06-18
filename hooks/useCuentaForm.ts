import db from '@/db/sqlite';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import uuid from 'react-native-uuid';

interface CuentaForm {
  nombre: string;
  saldo: string;
}

export function useCuentaForm(cuentaId?: string) {
  const [form, setForm] = useState<CuentaForm>({ nombre: '', saldo: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (cuentaId) {
      setLoading(true);
      db.getFirstAsync<CuentaForm>('SELECT nombre, saldo FROM cuentas WHERE id = ?', [cuentaId])
        .then((data) => {
          if (data) setForm({ nombre: data.nombre, saldo: data.saldo.toString() });
        })
        .finally(() => setLoading(false));
    }
  }, [cuentaId]);

  const onChange = (field: keyof CuentaForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const guardarCuenta = async () => {
    const { nombre, saldo } = form;
    if (!nombre || !saldo) return Alert.alert('Error', 'Todos los campos son obligatorios');
    try {
      await db.runAsync(
        'INSERT INTO cuentas (id, nombre, saldo) VALUES (?, ?, ?)',
        [uuid.v4().toString(), nombre, parseFloat(saldo)]
      );
      router.replace('/cuentas');
    } catch (error) {
      Alert.alert('Error al guardar la cuenta', String(error));
    }
  };

  const actualizarCuenta = async () => {
    if (!cuentaId) return;
    const { nombre, saldo } = form;
    if (!nombre || !saldo) return Alert.alert('Error', 'Todos los campos son obligatorios');
    try {
      await db.runAsync(
        'UPDATE cuentas SET nombre = ?, saldo = ? WHERE id = ?',
        [nombre, parseFloat(saldo), cuentaId]
      );
      router.replace('/cuentas');
    } catch (error) {
      Alert.alert('Error al actualizar la cuenta', String(error));
    }
  };

  return {
    form,
    loading,
    onChange,
    guardarCuenta,
    actualizarCuenta,
  };
}
  