import { Text, View } from 'react-native';

export default function TransaccionCard({
  descripcion,
  cantidad,
  fecha,
}: {
  descripcion: string;
  cantidad: number;
  fecha: string;
}) {
  return (
    <View className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow mb-3 flex-row justify-between items-center">
      <View>
        <Text className="font-semibold">{descripcion}</Text>
        <Text className="text-xs text-gray-500">{fecha}</Text>
      </View>
      <Text className={`font-bold ${cantidad < 0 ? 'text-red-500' : 'text-green-600'}`}>
        {cantidad < 0 ? '-' : '+'}${Math.abs(cantidad).toLocaleString('es-CO')}
      </Text>
    </View>
  );
}
