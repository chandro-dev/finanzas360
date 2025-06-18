import db from '@/db/sqlite';
import { Categoria, Cuenta } from '@/types/model';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

export interface TransaccionFormState {
  descripcion: string;
  cantidad: string;
  fecha: string;
  cuentaId: string;
  categoriaId: string;
  tarjetaId?: string;
}

interface Props {
  form: TransaccionFormState;
  onChange: (field: keyof TransaccionFormState, value: any) => void;
  onSubmit: () => void;
  loading?: boolean;
  submitText?: string;
}

export default function TransaccionForm({ form, onChange, onSubmit, loading, submitText = 'Guardar' }: Props) {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tarjetas, setTarjetas] = useState<{ id: string; nombre: string }[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    db.getAllAsync<Cuenta>('SELECT id, nombre FROM cuentas').then(setCuentas);
    db.getAllAsync<Categoria>('SELECT id, nombre FROM categorias').then(setCategorias);
    db.getAllAsync('SELECT id, nombre FROM tarjetas').then(setTarjetas);
  }, []);

  return (
    <View className="p-4">
      <Text className="text-black dark:text-white mb-2">Descripción</Text>
      <TextInput
        value={form.descripcion}
        onChangeText={(text) => onChange('descripcion', text)}
        placeholder="Descripción"
        className="border p-2 rounded text-black bg-white mb-4"
      />

      <Text className="text-black dark:text-white mb-2">Cantidad</Text>
      <TextInput
        value={form.cantidad}
        onChangeText={(text) => onChange('cantidad', text)}
        placeholder="0.00"
        keyboardType="numeric"
        className="border p-2 rounded text-black bg-white mb-4"
      />

      <Text className="text-black dark:text-white mb-2">Cuenta</Text>
      <View className="border rounded mb-4 bg-white">
        <Picker
          selectedValue={form.cuentaId}
          onValueChange={(itemValue) => onChange('cuentaId', itemValue)}>
          <Picker.Item label="Seleccione una cuenta" value="" />
          {cuentas.map((c) => (
            <Picker.Item key={c.id} label={c.nombre} value={c.id} />
          ))}
        </Picker>
      </View>

      <Text className="text-black dark:text-white mb-2">Tarjeta</Text>
      <View className="border rounded mb-4 bg-white">
        <Picker
          selectedValue={form.tarjetaId}
          onValueChange={(itemValue) => onChange('tarjetaId', itemValue)}>
          <Picker.Item label="Seleccione una tarjeta (opcional)" value="" />
          {tarjetas.map((t) => (
            <Picker.Item key={t.id} label={t.nombre} value={t.id} />
          ))}
        </Picker>
      </View>

      <Text className="text-black dark:text-white mb-2">Categoría</Text>
      <View className="border rounded mb-4 bg-white">
        <Picker
          selectedValue={form.categoriaId}
          onValueChange={(itemValue) => onChange('categoriaId', itemValue)}>
          <Picker.Item label="Seleccione una categoría" value="" />
          {categorias.map((c) => (
            <Picker.Item key={c.id} label={c.nombre} value={c.id} />
          ))}
        </Picker>
      </View>

      <Text className="text-black dark:text-white mb-2">Fecha</Text>
      <Button title={new Date(form.fecha).toLocaleDateString()} onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={new Date(form.fecha)}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) onChange('fecha', selectedDate.toISOString().slice(0, 10));
          }}
        />
      )}

      <View className="mt-6">
        <Button title={submitText} onPress={onSubmit} disabled={loading} color="#22c55e" />
      </View>
    </View>
  );
}
