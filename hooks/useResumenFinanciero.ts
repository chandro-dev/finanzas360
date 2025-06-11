import { useState, useEffect, useCallback } from "react";
import db from "@/databases/db";

export interface CategoriaAgrupada {
  categoria: string;
  total: number;
}

export const useResumenFinanciero = () => {
    const [resumen, setResumen] = useState({ ingresos: 0, egresos: 0 });
  
    const obtenerResumen = useCallback(async () => {
      try {
        const [row] = await db.getAllAsync<{ ingresos: number; egresos: number }>(
          `SELECT
            SUM(CASE WHEN cantidad >= 0 THEN cantidad ELSE 0 END) AS ingresos,
            SUM(CASE WHEN cantidad < 0 THEN cantidad ELSE 0 END) AS egresos
          FROM Transacciones`
        );
        setResumen({ ingresos: row?.ingresos || 0, egresos: row?.egresos || 0 });
      } catch (error) {
        console.error("Error al obtener resumen:", error);
      }
    }, []);
    const obtenerResumenPorFecha = useCallback(async (fecha: string) => {
      try {
        const [row] = await db.getAllAsync<{ ingresos: number; egresos: number }>(
          `SELECT
            SUM(CASE WHEN cantidad >= 0 THEN cantidad ELSE 0 END) AS ingresos,
            SUM(CASE WHEN cantidad < 0 THEN cantidad ELSE 0 END) AS egresos
          FROM Transacciones
          WHERE fecha >= ?`,
          [fecha]
        );
        setResumen({ ingresos: row?.ingresos || 0, egresos: row?.egresos || 0 });
      } catch (error) {
        console.error("Error al obtener resumen filtrado:", error);
      }
    }, []);
    useEffect(() => {
      obtenerResumen();
    }, [obtenerResumen]);
  
    return { resumen, refrescarResumen: obtenerResumen, obtenerResumenPorFecha };
  };
  