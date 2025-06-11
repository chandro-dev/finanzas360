import { useEffect, useState } from "react";
import db from "../databases/db"; // ajusta el path si es necesario
import { Categoria } from "@/models/Categoria";

export const useCategorias = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarCategorias = async () => {
    try {
      // Traemos todas las categorías
      const rows = await db.getAllSync<Categoria>(`
      SELECT * FROM Categoria;
      `);

      setCategorias(rows);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    } finally {
      setLoading(false);
    }
  };

  const agregarCategoria = async (Nombre: string, Icono: string) => {
    try {
      const result = db.runSync(
        "INSERT INTO Categoria (nombre_cat, icono) VALUES (?, ?)",
        [Nombre, Icono]
      );
      const categorias = await db.getAllAsync<Categoria>(
        "SELECT * FROM Categoria ORDER BY nombre_cat ASC"
      );

      const nuevaCategoria: Categoria = {
        id: result.lastInsertRowId,
        nombre_cat: Nombre,
        icono: Icono
      };
      setCategorias((prev) => [nuevaCategoria, ...prev]);
      return nuevaCategoria;
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      return null;
    }
  };

  const eliminarCategoria = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM Categoria WHERE id = ?", [id]);
      setCategorias((prev) => prev.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };
  const eliminarTodo = async () => {
    categorias.forEach((categoria) => {
      eliminarCategoria(categoria.id);
    });
  };
  useEffect(() => {
    cargarCategorias();
  }, []);

  return {
    categorias,
    agregarCategoria,
    eliminarCategoria,
    loading,
    eliminarTodo,
    recargar: cargarCategorias
  };
};
