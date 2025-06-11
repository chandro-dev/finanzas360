import { useState, useEffect, useCallback } from "react";
import db from "@/databases/db";
import { Transaccion } from "@/models/Transaccion";
import { Tag } from "@/models/Tag";

export interface CategoriaAgrupada {
  categoria: string;
  total: number;
}

export const useTransacciones = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(0);
  const limite = 20;

  const cargarTransacciones = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const offset = reset ? 0 : pagina * limite;
        const rows = await db.getAllAsync<Transaccion>(
          `SELECT t.*, 
                c.id AS categoria_id, c.nombre_cat AS categoria_nombre, c.icono AS categoria_icono,
                cu.id AS cuenta_id, cu.nombre_cuenta AS cuenta_nombre
         FROM Transacciones t
         LEFT JOIN Categoria c ON t.categoria_id = c.id
         LEFT JOIN Cuenta cu ON t.cuenta_id = cu.id
         ORDER BY t.fecha DESC
         LIMIT ? OFFSET ?`,
          [limite, offset]
        );
        console.log("monda");
        console.log(rows);
        const transaccionesConRelaciones = await Promise.all(
          rows.map(async (t) => {
            const tags = await db.getAllAsync<Tag>(
              `SELECT t.id, t.tag FROM Tags t
           INNER JOIN Transaccion_Tag tt ON t.id = tt.tag_id
           WHERE tt.transaccion_id = ?`,
              [t.id]
            );

            return {
              ...t,
              categoria: {
                id: t.categoria_id!,
                nombre_cat: t.categoria_nombre!,
                icono: t.categoria_icono!
              },
              cuenta: { id: t.Cuenta_id!, nombre_cuenta: t.cuenta_nombre! },
              tags
            };
          })
        );
        console.log(transaccionesConRelaciones);
        if (reset) {
          setTransacciones(transaccionesConRelaciones);
        } else {
          setTransacciones((prev) => [...prev, ...transaccionesConRelaciones]);
        }
      } catch (error) {
        console.error("Error cargando transacciones:", error);
      } finally {
        setLoading(false);
      }
    },
    [pagina]
  );

  useEffect(() => {
    cargarTransacciones(true);
  }, []);

  const cargarMas = () => setPagina((prev) => prev + 1);

  return {
    transacciones,
    loading,
    cargarTransacciones,
    cargarMas,
    setTransacciones
  };
};
