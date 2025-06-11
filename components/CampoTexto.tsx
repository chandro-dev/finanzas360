import { useAppTheme } from "@/hooks/useThemeConfig";
import React, { useState, useEffect} from "react";
import { TextInput} from "react-native-paper";

interface CampoTextoProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "decimal-pad" | "numeric";
  hint?: string;
  icon?: string;
  [key: string]: any;
}

export default function CampoTexto({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  hint,
  icon,
  ...props
}: CampoTextoProps) {
  const { theme } = useAppTheme();
  const esNumerico = keyboardType === "numeric" || keyboardType === "decimal-pad";

  const formatearComoCOP = (valor: string): string => {
    const num = parseInt(valor || "0", 10);
    return num.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const [valorVisible, setValorVisible] = useState(
    esNumerico ? formatearComoCOP(value) : value
  );

  // Sincroniza estado interno si el value externo cambia
  useEffect(() => {
    const formateado = esNumerico ? formatearComoCOP(value) : value;
    if (formateado !== valorVisible) {
      setValorVisible(formateado);
    }
  }, [value]);

  const manejarCambio = (texto: string) => {
    if (esNumerico) {
      let limpio = texto.replace(/[^\d]/g, "");
      if (!limpio) limpio = "0";

      const formateado = formatearComoCOP(limpio);
      setValorVisible(formateado);
      onChangeText(limpio);
    } else {
      setValorVisible(texto);
      onChangeText(texto);
    }
  };

  return (
    <TextInput
      label={label}
      value={valorVisible}
      onChangeText={manejarCambio}
      keyboardType={keyboardType}
      mode="outlined"
      placeholder={hint}
      left={icon ? <TextInput.Icon icon={icon} /> : undefined}
      style={{
        marginBottom: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 10
      }}
      contentStyle={{
        paddingHorizontal: 12,
        paddingVertical: 10
      }}
      outlineStyle={{
        borderWidth: 1,
        borderColor: theme.colors.outline
      }}
      theme={{
        colors: {
          primary: theme.colors.primary,
          onSurfaceVariant: theme.colors.onSurfaceVariant
        }
      }}
      {...props}
    />
  );
}
