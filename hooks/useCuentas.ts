import { useEffect, useState } from "react";
import db from "../databases/db";
import { Cuenta } from "@/models/Cuenta";
import { Transaccion } from "@/models/Transaccion";

export interface CuentaConBalance {
  id: number;
  nombre_cuenta: string;
  balance: number;
}

export const useCuentas = () => {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [cuentasConBalance, setcuentasConBalance] = useState<CuentaConBalance[]>([]);

  const obtenerCuentasConBalance = async () => {
    const rows = await db.getAllAsync<CuentaConBalance>(`
      SELECT 
        c.id,
        c.nombre_cuenta,
        IFNULL(SUM(t.cantidad), 0) as balance
      FROM Cuenta c
      LEFT JOIN Transacciones t ON t.cuenta_id = c.id
      GROUP BY c.id, c.nombre_cuenta
    `);
    setcuentasConBalance(rows);
    return rows;
  };

  const cargarCuentas = async () => {
    try {
      const rows = await db.getAllAsync<Cuenta>(`SELECT * FROM Cuenta;`);
      setCuentas(rows);
    } catch (error) {
      console.error("Error al cargar cuentas:", error);
    } finally {
      setLoading(false);
    }
  };

  const agregarCuenta = async (Nombre: string) => {
    try {
      const result = db.runSync(
        "INSERT INTO Cuenta (nombre_cuenta) VALUES (?)",
        [Nombre]
      );

      const nuevaCuenta: Cuenta = {
        id: result.lastInsertRowId,
        nombre_cuenta: Nombre
      };

      setCuentas((prev) => [nuevaCuenta, ...prev]);
      return nuevaCuenta;
    } catch (error) {
      console.error("Error al agregar cuenta:", error);
      return null;
    }
  };

  const eliminarCuenta = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM Cuenta WHERE id = ?", [id]);
      setCuentas((prev) => prev.filter((cuenta) => cuenta.id !== id));
    } catch (error) {
      console.error("Error al eliminar cuenta:", error);
    }
  };

  const eliminarTodo = async () => {
    for (const cuenta of cuentas) {
      await eliminarCuenta(cuenta.id);
    }
  };

  // ✅ Nueva función: Obtener transacciones por cuenta con paginación
  const obtenerTransaccionesPorCuenta = async (
    cuenta_id: number,
    pagina: number = 1,
    limite: number = 10
  ): Promise<Transaccion[]> => {
    try {
      const offset = (pagina - 1) * limite;
      const transacciones = await db.getAllAsync<Transaccion>(
        `
        SELECT * FROM Transacciones
        WHERE cuenta_id = ?
        ORDER BY fecha DESC
        LIMIT ? OFFSET ?
      `,
        [cuenta_id, limite, offset]
      );
      return transacciones;
    } catch (error) {
      console.error("Error obteniendo transacciones por cuenta:", error);
      return [];
    }
  };

  useEffect(() => {
    obtenerCuentasConBalance();
    cargarCuentas();
  }, []);

  return {
    cuentas,
    agregarCuenta,
    eliminarCuenta,
    eliminarTodo,
    loading,
    recargar: cargarCuentas,
    cuentasConBalance,
    obtenerTransaccionesPorCuenta // 👈 exportada
  };
};
