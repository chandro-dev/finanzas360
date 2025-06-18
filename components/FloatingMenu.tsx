import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const opciones = [
  { label: 'Agregar transacción', action: () =>  router.push('/transacciones') },
  { label: 'Agregar cuenta', action: () => router.push('/cuentas') },
  { label: 'Agregar tarjeta', action: () => router.push('/tarjetas') },
  { label: 'Agregar deuda', action: () =>  router.push('/deudas') },
    { label: 'Agregar Persona', action: () =>  router.push('/personas') },

];

export default function FloatingMenu() {
  const [abierto, setAbierto] = useState(false);

  return (
    <View className="absolute bottom-6 right-6">
      {abierto &&
        opciones.map((item, index) => (
          <Animated.View
            key={item.label}
            entering={FadeIn.delay(index * 60)}
            exiting={FadeOut}
            className="mb-2"
          >
            <TouchableOpacity
              onPress={() => {
                item.action();
                setAbierto(false);
              }}
              className="bg-white dark:bg-neutral-800 px-4 py-2 rounded-xl shadow-lg"
            >
              <Text className="text-black dark:text-white">{item.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

      <TouchableOpacity
        onPress={() => setAbierto(!abierto)}
        className="bg-indigo-600 p-4 rounded-full shadow-lg"
      >
        <Feather name={abierto ? 'x' : 'plus'} size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
