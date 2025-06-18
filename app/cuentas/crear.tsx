// app/cuentas/crear.tsx
import db from '@/db/sqlite';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import uuid from 'react-native-uuid';

export default function CrearCuenta() {
  const [nombre, setNombre] = useState('');
  const [saldo, setSaldo] = useState('');

  const guardarCuenta = () => {
    const id = uuid.v4().toString();
    db.runAsync(
      'INSERT INTO cuentas (id, nombre, saldo) VALUES (?, ?, ?)',
      [id, nombre, parseFloat(saldo)]
    ).then(() => {
    console.log("hola?");
    router.push('/cuentas');  
    });
  };

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 p-4">
      <Text className="text-2xl font-bold text-black dark:text-white mb-4">Crear Cuenta</Text>
      <TextInput
        placeholder="Nombre de la cuenta"
        value={nombre}
        onChangeText={setNombre}
        className="border p-2 rounded mb-4 text-black dark:text-white"
      />
      <TextInput
        placeholder="Saldo inicial"
        value={saldo}
        onChangeText={setSaldo}
        keyboardType="numeric"
        className="border p-2 rounded mb-4 text-black dark:text-white"
      />
      <Button title="Guardar" onPress={guardarCuenta} />
    </View>
  );
}
