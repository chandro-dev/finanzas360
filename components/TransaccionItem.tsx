import { Transaccion } from '@/types/model';
import { Pressable, Text, View } from 'react-native';

interface Props {
  transaccion: Transaccion;
  onPress?: () => void;
}

export default function TransaccionItem({ transaccion, onPress }: Props) {
  const colorCantidad = transaccion.cantidad < 0 ? 'text-red-500' : 'text-green-600';

  return (
    <Pressable onPress={onPress}>
      <View className="mb-4 p-4 bg-white dark:bg-neutral-800 rounded shadow">
        <Text className="text-black dark:text-white font-semibold">
          {transaccion.descripcion}
        </Text>
        <Text className={`text-lg font-bold ${colorCantidad}`}>
          {transaccion.cantidad.toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
          })}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">
          {new Date(transaccion.fecha).toLocaleDateString()}
        </Text>
      </View>
    </Pressable>
  );
}
