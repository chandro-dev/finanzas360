// utils/formatters.ts

/**
 * Formatea un valor numérico como moneda COP (pesos colombianos).
 * @param valor Número a formatear.
 * @returns Cadena con formato $X.XXX
 */
export function formatearComoCOP(valor: number): string {
    return valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
  
  /**
   * Formatea una fecha ISO a formato legible.
   * @param iso Cadena de fecha en formato ISO.
   * @returns Objeto con fecha corta y hora en formato HH:mm.
   */
  export function formatearFechaHora(iso: string): { fecha: string; hora: string } {
    const fechaObj = new Date(iso);
  
    return {
      fecha: fechaObj.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }),
      hora: fechaObj.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })
    };
  }
  