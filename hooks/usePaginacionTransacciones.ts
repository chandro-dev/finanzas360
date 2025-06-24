import db from "@/db/sqlite";
import { Transaccion } from "@/types/model";
import { useState } from "react";

export function usePaginacionTransacciones(
  sqlBase: string,
  params: any[] = [],
  soloUnaPagina: boolean = false,

  limite: number = 10
) {
  const [pagina, setPagina] = useState(0);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [fin, setFin] = useState(false);

  const cargarMas = async () => {
    if (cargando || fin) return;
    setCargando(true);

    const offset = pagina * limite;
    const sql = `${sqlBase} LIMIT ${limite} OFFSET ${offset}`;

    const nuevos = await db.getAllAsync<Transaccion>(sql, params);

    if (nuevos.length < limite || soloUnaPagina) {
      setFin(true);
    }

    setTransacciones((prev) => [...prev, ...nuevos]);
    setPagina((prev) => prev + 1);
    setCargando(false);
  };

  const reiniciar = () => {
    setTransacciones([]);
    setPagina(0);
    setFin(false);
  };

  return {
    transacciones,
    cargarMas,
    cargando,
    fin,
    reiniciar
  };
}
