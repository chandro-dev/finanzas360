import { Ionicons } from '@expo/vector-icons';
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
  const esIngreso = cantidad >= 0;
  const color = esIngreso ? 'text-green-600' : 'text-red-500';
  const bgIcon = esIngreso ? 'bg-green-100' : 'bg-red-100';
  const iconName = esIngreso ? 'arrow-down-circle' : 'arrow-up-circle';

  return (
    <View className="bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 shadow-sm mb-3 flex-row items-center justify-between">
      {/* Icono */}
      <View className={`p-2 rounded-full ${bgIcon} mr-3`}>
        <Ionicons
          name={iconName}
          size={24}
          color={esIngreso ? '#16a34a' : '#dc2626'}
        />
      </View>

      {/* Texto */}
      <View className="flex-1">
        <Text className="font-semibold text-base text-black dark:text-white" numberOfLines={1}>
          {descripcion}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">{fecha}</Text>
      </View>

      {/* Monto */}
      <Text className={`font-bold text-base ml-2 ${color}`}>
        {esIngreso ? '+' : '-'}${Math.abs(cantidad).toLocaleString('es-CO')}
      </Text>
    </View>
  );
}
