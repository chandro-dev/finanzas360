import db from "@/databases/db";

import { DataLine } from "@/models/pieData";

interface Mes {
  mes: string;
}
export interface CategoriaAgrupada {
  categoria: string;
  total: number;
}

export const useAgrupaciones = () => {
  const agruparPorMes = () => {
    return db.getAllSync<DataLine>(
      `SELECT strftime('%Y-%m', fecha) AS mes, 
                SUM(CASE WHEN cantidad > 0 THEN cantidad ELSE 0 END) AS ingresos,
                SUM(CASE WHEN cantidad < 0 THEN ABS(cantidad) ELSE 0 END) AS egresos
         FROM Transacciones
         GROUP BY mes
         ORDER BY mes ASC`
    );
  };

  const agruparPorCategoria = (mesSeleccionado: string) => {
    return db.getAllSync<CategoriaAgrupada>(
      `SELECT Categoria.nombre_cat AS categoria, SUM(cantidad) AS total
         FROM Transacciones
         JOIN Categoria ON Transacciones.categoria_id = Categoria.id
         WHERE strftime('%Y-%m', fecha) = ?
         GROUP BY categoria;`,
      [mesSeleccionado]
    );
  };

  const obtenerMesesHistoricos = (): Mes[] => {
    return db.getAllSync<Mes>(
      `SELECT strftime('%Y-%m', fecha) AS mes FROM Transacciones GROUP BY mes`
    );
  };

  return { agruparPorMes, agruparPorCategoria, obtenerMesesHistoricos };
};
