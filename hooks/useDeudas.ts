import { useEffect, useState, useCallback } from "react";
import db from "@/databases/db";

export interface Deuda {
  id: number;
  persona: string;
  total: number;
}

interface NuevaDeuda {
  persona: string;
  descripcion?: string;
  cantidad: number;
  esPrestamo: boolean;
  categoria_id: number; // no se usará, pero se mantiene por compatibilidad
}

interface TransaccionAbono {
  nombre: string;
  cantidad: number;
  cuenta_id: number;
}

export const useDeudas = () => {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const cargarDeudas = useCallback(async () => {
    try {
      const rows = await db.getAllAsync<Deuda>(
        "SELECT * FROM Deuda ORDER BY id DESC"
      );
      setDeudas(rows);
    } catch (error) {
      console.error("Error cargando deudas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerCategoriaDeudaId = async (): Promise<number | null> => {
    const result = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM Categoria WHERE LOWER(nombre_cat) = 'deuda'`
    );
    return result?.id ?? null;
  };

  const eliminarDeuda = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM Deuda WHERE id = ?", [id]);
      await cargarDeudas();
    } catch (error) {
      console.error("Error eliminando deuda:", error);
    }
  };

  const agregarDeuda = async (deuda: NuevaDeuda): Promise<boolean> => {
    try {
      const categoriaId = await obtenerCategoriaDeudaId();
      if (!categoriaId) throw new Error("Categoría 'Deuda' no encontrada");

      const result = await db.runAsync(
        "INSERT INTO Deuda (persona, total) VALUES (?, ?)",
        [deuda.persona, deuda.esPrestamo ? deuda.cantidad : -deuda.cantidad]
      );
      const idDeuda = result.lastInsertRowId;

      const resultTx = await db.runAsync(
        `INSERT INTO Transacciones (nombre, fecha, cantidad, categoria_id, cuenta_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          deuda.descripcion || `Deuda con ${deuda.persona}`,
          new Date().toISOString(),
          deuda.esPrestamo ? -deuda.cantidad : deuda.cantidad,
          categoriaId,
          deuda.categoria_id // se usa como cuenta_id aquí
        ]
      );
      const idTransaccion = resultTx.lastInsertRowId;

      await db.runAsync(
        `INSERT INTO Transacciones_Deuda (id_deuda, id_transaccion) VALUES (?, ?)`,
        [idDeuda, idTransaccion]
      );

      await cargarDeudas();
      return true;
    } catch (error) {
      console.error("Error agregando deuda:", error);
      return false;
    }
  };

  const abonarDeuda = async (
    id: number,
    montoAbono: number,
    cuenta_id: number,
    transaccionInfo: { cantidad: number; cuenta_id: number; nombre: string }
  ) => {
    try {
      const deuda = await db.getFirstAsync<Deuda>(
        "SELECT * FROM Deuda WHERE id = ?",
        [id]
      );
      if (!deuda) throw new Error("Deuda no encontrada");

      const categoriaId = await obtenerCategoriaDeudaId();
      if (!categoriaId) throw new Error("Categoría 'Deuda' no encontrada");

      // Actualizar total
      await db.runAsync("UPDATE Deuda SET total = total - ? WHERE id = ?", [
        montoAbono,
        id
      ]);

      // Registrar transacción
      const resultTx = await db.runAsync(
        `INSERT INTO Transacciones (nombre, fecha, cantidad, categoria_id, cuenta_id)
         VALUES (?, ?, ?, ?, ?)`,
        [
          transaccionInfo.nombre,
          new Date().toISOString(),
          transaccionInfo.cantidad,
          categoriaId,
          transaccionInfo.cuenta_id
        ]
      );

      const idTransaccion = resultTx.lastInsertRowId;

      await db.runAsync(
        `INSERT INTO Transacciones_Deuda (id_deuda, id_transaccion) VALUES (?, ?)`,
        [id, idTransaccion]
      );

      await cargarDeudas();
    } catch (error) {
      console.error("Error abonar deuda:", error);
    }
  };

  const obtenerPagosPorDeuda = async (idDeuda: number) => {
    try {
      const pagos = await db.getAllAsync(
        `SELECT T.*
         FROM Transacciones T
         INNER JOIN Transacciones_Deuda TD ON T.id = TD.id_transaccion
         WHERE TD.id_deuda = ?
         ORDER BY T.fecha DESC`,
        [idDeuda]
      );

      return pagos;
    } catch (error) {
      console.error("Error obteniendo pagos de la deuda:", error);
      return [];
    }
  };

  useEffect(() => {
    cargarDeudas();
  }, [cargarDeudas]);

  return {
    deudas,
    loading,
    eliminarDeuda,
    agregarDeuda,
    abonarDeuda,
    recargar: cargarDeudas,
    obtenerPagosPorDeuda
  };
};
