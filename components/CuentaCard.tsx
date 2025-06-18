import { Text, View } from 'react-native';

export default function CuentaCard({ nombre, saldo }: { nombre: string; saldo: number }) {
  return (
    <View className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow mb-3">
      <Text className="text-base font-semibold">{nombre}</Text>
      <Text className="text-xl font-bold text-green-600 dark:text-green-400">
        ${saldo.toLocaleString('es-CO')}
      </Text>
    </View>
  );
}
