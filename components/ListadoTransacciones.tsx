import TransaccionCard from "@/components/TransaccionCard";
import { usePaginacionTransacciones } from "@/hooks/usePaginacionTransacciones";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";

interface Filtro {
  label: string;
  clave: string;
  placeholder?: string;
}

interface Props {
  sentenciaSQL: string;
  parametrosIniciales?: any[];
  titulo?: string;
  filtros?: Filtro[];
  soloUnaPagina?: boolean;
}

export default function ListadoTransacciones({
  sentenciaSQL,
  parametrosIniciales = [],
  titulo = "Transacciones",
  filtros = [],
  soloUnaPagina
}: Props) {
  const router = useRouter();
  const [filtrosValores, setFiltrosValores] = useState<Record<string, string>>(
    {}
  );
  const [parametros, setParametros] = useState<any[]>(parametrosIniciales);
  const { transacciones, cargarMas, cargando, fin, reiniciar } =
    usePaginacionTransacciones(sentenciaSQL, parametros, soloUnaPagina);

  useEffect(() => {
    cargarMas(); // carga inicial
  }, []);

  const aplicarFiltros = () => {
    const valores = Object.values(filtrosValores).filter(Boolean);
    setParametros(valores);
    reiniciar(); // reinicia la paginación
    cargarMas(); // carga con filtros
  };

  return (
    <FlatList
      data={transacciones}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/transacciones/editar",
              params: { id: item.id }
            })
          }
        >
          <TransaccionCard
            descripcion={item.descripcion}
            cantidad={item.cantidad}
            fecha={item.fecha}
          />
        </Pressable>
      )}
      ListHeaderComponent={
        <View className="space-y-4 mb-4">
          <Text className="text-lg font-bold text-black dark:text-white px-2">
            {titulo}
          </Text>
          {filtros.length > 0 && (
            <View className="space-y-2 px-2">
              {filtros.map((filtro) => (
                <TextInput
                  key={filtro.clave}
                  placeholder={filtro.placeholder || filtro.label}
                  value={filtrosValores[filtro.clave] || ""}
                  onChangeText={(val) =>
                    setFiltrosValores((prev) => ({
                      ...prev,
                      [filtro.clave]: val
                    }))
                  }
                  className="border rounded p-2 text-black bg-white"
                />
              ))}
              <Button title="Aplicar Filtros" onPress={aplicarFiltros} />
            </View>
          )}
        </View>
      }
      ListFooterComponent={
        cargando ? (
          <Text className="text-center p-4 text-gray-500">Cargando más...</Text>
        ) : null
      }
      onEndReached={() => {
        if (!fin && !cargando) cargarMas();
      }}
      onEndReachedThreshold={0.2}
    />
  );
}
