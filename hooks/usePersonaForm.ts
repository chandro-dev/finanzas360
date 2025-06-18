import db from '@/db/sqlite';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import uuid from 'react-native-uuid';

export interface PersonaForm {
  nombre: string;
  deuda: string;
}

export function usePersonaForm(personaId?: string) {
  const [form, setForm] = useState<PersonaForm>({ nombre: '', deuda: '0' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!personaId) return;
    setLoading(true);
    db.getFirstAsync<PersonaForm>('SELECT nombre, deuda FROM personas WHERE id = ?', [personaId])
      .then((data) => {
        if (data) {
          setForm({ nombre: data.nombre, deuda: data.deuda.toString() });
        }
      })
      .finally(() => setLoading(false));
  }, [personaId]);

  const onChange = (field: keyof PersonaForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const guardar = async () => {
    if (!form.nombre) return Alert.alert('Error', 'Nombre requerido');
    await db.runAsync(
      'INSERT INTO personas (id, nombre, deuda) VALUES (?, ?, ?)',
      [uuid.v4().toString(), form.nombre, parseFloat(form.deuda)]
    );
    router.replace('/personas');
  };

  const actualizar = async () => {
    if (!personaId) return;
    if (!form.nombre) return Alert.alert('Error', 'Nombre requerido');
    await db.runAsync(
      'UPDATE personas SET nombre = ?, deuda = ? WHERE id = ?',
      [form.nombre, parseFloat(form.deuda), personaId]
    );
    router.replace('/personas');
  };

  return { form, loading, onChange, guardar, actualizar };
}