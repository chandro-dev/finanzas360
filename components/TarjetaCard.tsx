import { Text, View } from 'react-native';

export default function TarjetaCard({
  nombre,
  cupo,
  disponible,
}: {
  nombre: string;
  cupo: number;
  disponible: number;
}) {
  return (
    <View className="bg-indigo-600 rounded-xl p-4 shadow mb-3">
      <Text className="text-white font-semibold">{nombre}</Text>
      <Text className="text-white text-sm">Cupo: ${cupo.toLocaleString('es-CO')}</Text>
      <Text className="text-white text-lg font-bold">
        Disponible: ${disponible.toLocaleString('es-CO')}
      </Text>
    </View>
  );
}
