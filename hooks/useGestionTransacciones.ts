import db from "@/databases/db";
import { Transaccion } from "@/models/Transaccion";
import { useResumenFinanciero } from "@/hooks/useResumenFinanciero";
import { Tag } from "@/models/Tag";
import { useTransacciones } from "./useTransacciones";

export interface CategoriaAgrupada {
  categoria: string;
  total: number;
}

export const useGestionTransacciones = () => {
  const { refrescarResumen } = useResumenFinanciero();

  const agregarTransaccion = async (
    nueva: Omit<
      Transaccion,
      "id" | "categoria_nombre" | "categoria_icono" | "tags"
    >
  ) => {
    try {
      const result = await db.runAsync(
        "INSERT INTO Transacciones (nombre, cantidad, fecha, categoria_id, cuenta_id) VALUES (?, ?, ?, ?, ?)",
        [
          nueva.nombre,
          nueva.cantidad,
          nueva.fecha, // 👈 Usa la fecha que viene desde el formulario
          nueva.categoria?.id ?? null,
          nueva.cuenta?.id ?? null
        ]
      );
      refrescarResumen();
      return result.lastInsertRowId;
    } catch (error) {
      console.error("Error al agregar transacción:", error);
      return null;
    }
  };
  const obtenerTransaccionesPaginadas = async (offset = 0, limit = 20) => {
    try {
      return await db.getAllAsync<Transaccion>(
        `SELECT t.*, 
                  c.id AS categoria_id, c.nombre_cat AS categoria_nombre, c.icono AS categoria_icono,
                  cu.id AS cuenta_id, cu.nombre_cuenta AS cuenta_nombre
           FROM Transacciones t
           LEFT JOIN Categoria c ON t.categoria_id = c.id
           LEFT JOIN Cuenta cu ON t.cuenta_id = cu.id
           ORDER BY t.fecha DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );
    } catch (error) {
      console.error("Error en paginación de transacciones:", error);
      return [];
    }
  };
  const eliminarTransaccion = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM Transacciones WHERE id = ?", [id]);
      console.log("Eliminado" + id);
      refrescarResumen();
    } catch (error) {
      console.error("Error al eliminar transacción:", error);
    }
  };

  const actualizarTransaccion = async (transaccion: Transaccion) => {
    try {
      await db.runAsync(
        `UPDATE Transacciones 
           SET nombre = ?, cantidad = ?, fecha = ?, categoria_id = ?, cuenta_id = ? 
           WHERE id = ?`,
        [
          transaccion.nombre,
          transaccion.cantidad,
          transaccion.fecha,
          transaccion.categoria?.id ?? null,
          transaccion.cuenta?.id ?? null,
          transaccion.id
        ]
      );
      refrescarResumen();
    } catch (error) {
      console.error("Error actualizando transacción:", error);
    }
  };
  const cargarDatosDePrueba = async () => {
    try {
      await db.runAsync(`
          INSERT INTO Transacciones (nombre, fecha, categoria_id, cantidad, cuenta_id) VALUES
          ('Compra Supermercado', '2025-03-10T14:00:00.000Z', 2, -150000, 1),
          ('Pago Nómina', '2025-03-15T09:00:00.000Z', 1, 2000000, 2),
          ('Cine y Snacks', '2025-03-18T20:30:00.000Z', 3, -60000, 1),
          ('Transferencia recibida', '2025-03-21T12:45:00.000Z', 1, 500000, 3)
        `);
      refrescarResumen();
    } catch (error) {
      console.error("Error cargando datos de prueba:", error);
    }
  };
  const obtenerLimiteTransacciones = async (
    limite: number
  ): Promise<Transaccion[]> => {
    try {
      const rows = await db.getAllAsync<Transaccion>(
        `SELECT t.*, 
                  c.id AS categoria_id, 
                  c.nombre_cat AS categoria_nombre, 
                  c.icono AS categoria_icono, 
                  cu.id AS cuenta_id, 
                  cu.nombre_cuenta AS cuenta_nombre
           FROM Transacciones t
           LEFT JOIN Categoria c ON t.categoria_id = c.id
           LEFT JOIN Cuenta cu ON t.cuenta_id = cu.id
           ORDER BY t.fecha DESC
           LIMIT ?`,
        [limite]
      );
      return rows;
    } catch (error) {
      console.error("Error obteniendo transacciones:", error);
      return [];
    }
  };
  const obtenerTransaccionPorId = async (
    id: number
  ): Promise<Transaccion | null> => {
    try {
      const [t] = await db.getAllAsync<Transaccion>(
        `SELECT t.*, 
                    c.id AS categoria_id, c.nombre_cat AS categoria_nombre, c.icono AS categoria_icono,
                    cu.id AS cuenta_id, cu.nombre_cuenta AS cuenta_nombre
             FROM Transacciones t
             LEFT JOIN Categoria c ON t.categoria_id = c.id
             LEFT JOIN Cuenta cu ON t.cuenta_id = cu.id
             WHERE t.id = ?`,
        [id]
      );

      if (!t) return null;

      const tags = await db.getAllAsync<Tag>(
        `SELECT t.id, t.tag FROM Tags t
             INNER JOIN Transaccion_Tag tt ON t.id = tt.tag_id
             WHERE tt.transaccion_id = ?`,
        [id]
      );

      return {
        ...t,
        categoria: t.categoria_id
          ? {
              id: t.categoria_id,
              nombre_cat: t.categoria_nombre!,
              icono: t.categoria_icono!
            }
          : undefined,
        cuenta: t.Cuenta_id
          ? {
              id: t.Cuenta_id,
              nombre_cuenta: t.cuenta_nombre!
            }
          : undefined,
        tags
      };
    } catch (error) {
      console.error("Error al obtener transacción por ID:", error);
      return null;
    }
  };
  const obtenerTransaccionesPorCuentaPaginadas = async (
    cuenta_id: number,
    pagina: number = 1,
    limite: number = 10
  ): Promise<Transaccion[]> => {
    try {
      const offset = (pagina - 1) * limite;
      const transacciones = await db.getAllAsync<Transaccion>(
        `
            SELECT t.*, 
                  c.id AS categoria_id, c.nombre_cat AS categoria_nombre, c.icono AS categoria_icono,
                  cu.id AS cuenta_id, cu.nombre_cuenta AS cuenta_nombre
           FROM Transacciones t
           LEFT JOIN Categoria c ON t.categoria_id = c.id
           LEFT JOIN Cuenta cu ON t.cuenta_id = cu.id
                       WHERE cuenta_id = ?
           ORDER BY t.fecha DESC LIMIT ? OFFSET ?
          `,
        [cuenta_id, limite, offset]
      );
      return transacciones;
    } catch (error) {
      console.error("Error obteniendo transacciones por cuenta:", error);
      return [];
    }
  };

  return {
    agregarTransaccion,
    eliminarTransaccion,
    actualizarTransaccion,
    cargarDatosDePrueba,
    obtenerLimiteTransacciones,
    obtenerTransaccionesPaginadas,
    obtenerTransaccionPorId,
    obtenerTransaccionesPorCuentaPaginadas
  };
};
