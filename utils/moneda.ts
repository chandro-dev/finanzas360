/**
 * Formatea un número como moneda en pesos colombianos.
 * @param valor Número a formatear.
 * @param opciones Opcional: opciones adicionales para formateo.
 * @returns string formateado como moneda.
 */
export const formatearComoCOP = (
    valor: number,
    opciones: Intl.NumberFormatOptions = {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
  ): string => {
    return valor.toLocaleString("es-CO", opciones);
  };
  
  /**
   * Formatea un número con separador de miles sin el símbolo de pesos.
   */
  export const formatearNumero = (
    valor: number,
    opciones: Intl.NumberFormatOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
  ): string => {
    return valor.toLocaleString("es-CO", opciones);
  };
      