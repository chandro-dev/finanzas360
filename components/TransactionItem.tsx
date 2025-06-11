import React from "react";
import { View } from "react-native";
import {
  Surface,
  Text,
  Divider,
  IconButton,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Transaccion } from "@/models/Transaccion";
import {
  formatearComoCOP,
  formatearFechaHora
} from "@/utils/formatters";
import { useAppTheme } from "@/hooks/useThemeConfig";


interface Props {
  item: Transaccion;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TransactionItem: React.FC<Props> = ({ item, onEdit, onDelete }) => {
  const { theme, isDark, toggleTheme } = useAppTheme();

    const { fecha, hora } = formatearFechaHora(item.fecha);
  const isPositive = item.cantidad >= 0;

  return (
    <Surface
      style={{
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: theme.colors.surface,
        elevation: 1
      }}
    >
      <View style={{ flexDirection: "row", padding: 16, alignItems: "center" }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.primary,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12
          }}
        >
          <MaterialCommunityIcons
            name={item.categoria_icono || "folder-outline"}
            size={20}
            color="#fff"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: theme.colors.onSurface
            }}
          >
            {item.nombre}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.onSurfaceDisabled
            }}
          >
            {item.categoria_nombre ?? "Sin categoría"}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: isPositive ? "#4caf50" : "#f44336"
            }}
          >
            {isPositive ? "+" : "-"}
            {formatearComoCOP(Math.abs(item.cantidad || 0))}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.onSurfaceDisabled
            }}
          >
            {item.cuenta_nombre ?? "Sin cuenta"}
          </Text>
        </View>
      </View>

      <Divider style={{ backgroundColor: theme.colors.outlineVariant }} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 8,
          paddingHorizontal: 12
        }}
      >
        <Text style={{ fontSize: 12, color: theme.colors.onSurfaceDisabled }}>
          {fecha} · {hora}
        </Text>
        <View style={{ flexDirection: "row" }}>
          {onEdit && (
            <IconButton icon="pencil-outline" size={20} onPress={onEdit} />
          )}
          {onDelete && (
            <IconButton
              icon="trash-can-outline"
              size={20}
              onPress={onDelete}
              iconColor={theme.colors.error}
            />
          )}
        </View>
      </View>
    </Surface>
  );
};
