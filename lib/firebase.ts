import db from "@/db/sqlite";
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "./firebase.config";

export async function sincronizarDatos() {
  try {
    // Sincronizar cuentas
    const cuentas = await db.getAllAsync<any>("SELECT * FROM cuentas WHERE sincronizado = 0");
    for (const cuenta of cuentas) {
      await setDoc(doc(firestore, "cuentas", cuenta.id), cuenta);
      await db.runAsync("UPDATE cuentas SET sincronizado = 1 WHERE id = ?", [cuenta.id]);
    }

    // Sincronizar tarjetas
    const tarjetas = await db.getAllAsync<any>("SELECT * FROM tarjetas WHERE sincronizado = 0");
    for (const tarjeta of tarjetas) {
      await setDoc(doc(firestore, "tarjetas", tarjeta.id), tarjeta);
      await db.runAsync("UPDATE tarjetas SET sincronizado = 1 WHERE id = ?", [tarjeta.id]);
    }

    // Sincronizar transacciones
    const transacciones = await db.getAllAsync<any>("SELECT * FROM transacciones WHERE sincronizado = 0");
    for (const transaccion of transacciones) {
      await setDoc(doc(firestore, "transacciones", transaccion.id), transaccion);
      await db.runAsync("UPDATE transacciones SET sincronizado = 1 WHERE id = ?", [transaccion.id]);
    }

    // Sincronizar personas
    const personas = await db.getAllAsync<any>("SELECT * FROM personas WHERE sincronizado = 0");
    for (const persona of personas) {
      await setDoc(doc(firestore, "personas", persona.id), persona);
      await db.runAsync("UPDATE personas SET sincronizado = 1 WHERE id = ?", [persona.id]);
    }

    // Sincronizar deudas
    const deudas = await db.getAllAsync<any>("SELECT * FROM deudas WHERE sincronizado = 0");
    for (const deuda of deudas) {
      await setDoc(doc(firestore, "deudas", deuda.id), deuda);
      await db.runAsync("UPDATE deudas SET sincronizado = 1 WHERE id = ?", [deuda.id]);
    }

    // Sincronizar recordatorios
    const recordatorios = await db.getAllAsync<any>("SELECT * FROM recordatorios WHERE sincronizado = 0");
    for (const rec of recordatorios) {
      await setDoc(doc(firestore, "recordatorios", rec.id), rec);
      await db.runAsync("UPDATE recordatorios SET sincronizado = 1 WHERE id = ?", [rec.id]);
    }

    console.log("Sincronización completa.");
  } catch (error) {
    console.error("Error en la sincronización:", error);
  }
}
