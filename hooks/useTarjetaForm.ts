import db from '@/db/sqlite';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import uuid from 'react-native-uuid';

interface TarjetaForm {
  nombre: string;
  cupo: string;
  disponible: string;
}

export function useTarjetaForm(tarjetaId?: string) {
  const [form, setForm] = useState<TarjetaForm>({ nombre: '', cupo: '', disponible: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (tarjetaId) {
      setLoading(true);
      db.getFirstAsync<TarjetaForm>('SELECT nombre, cupo, disponible FROM tarjetas WHERE id = ?', [tarjetaId])
        .then((data) => {
          if (data) setForm({ nombre: data.nombre, cupo: data.cupo.toString(), disponible: data.disponible.toString() });
        })
        .finally(() => setLoading(false));
    }
  }, [tarjetaId]);

  const onChange = (field: keyof TarjetaForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const guardarTarjeta = async () => {
    const { nombre, cupo, disponible } = form;
    if (!nombre || !cupo || !disponible) return Alert.alert('Error', 'Todos los campos son obligatorios');
    try {
      await db.runAsync(
        'INSERT INTO tarjetas (id, nombre, cupo, disponible) VALUES (?, ?, ?, ?)',
        [uuid.v4().toString(), nombre, parseFloat(cupo), parseFloat(disponible)]
      );
      router.replace('/tarjetas');
    } catch (error) {
      Alert.alert('Error al guardar la tarjeta', String(error));
    }
  };

  const actualizarTarjeta = async () => {
    if (!tarjetaId) return;
    const { nombre, cupo, disponible } = form;
    if (!nombre || !cupo || !disponible) return Alert.alert('Error', 'Todos los campos son obligatorios');
    try {
      await db.runAsync(
        'UPDATE tarjetas SET nombre = ?, cupo = ?, disponible = ? WHERE id = ?',
        [nombre, parseFloat(cupo), parseFloat(disponible), tarjetaId]
      );
      router.replace('/tarjetas');
    } catch (error) {
      Alert.alert('Error al actualizar la tarjeta', String(error));
    }
  };

  return {
    form,
    loading,
    onChange,
    guardarTarjeta,
    actualizarTarjeta,
  };
}
