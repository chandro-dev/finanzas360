// src/db/sqlite.ts
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";

const DB_NAME = "finanzas.db";
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
const db = SQLite.openDatabaseSync(DB_NAME);

async function resetearBaseDeDatos() {
  try {
    const dbFolder = `${FileSystem.documentDirectory}SQLite`;
    const fileInfo = await FileSystem.getInfoAsync(DB_PATH);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(DB_PATH);
      console.log("Base de datos eliminada.");
    }

    // Reabrir la base de datos
    const nuevaDb = SQLite.openDatabaseSync(DB_NAME);
    nuevaDb.execSync(`PRAGMA foreign_keys = ON;`);

    // Crear tablas y categorías
    crearTablas();
    console.log("Base de datos recreada.");
  } catch (error) {
    console.error("Error al resetear la base de datos:", error);
  }
}

export function crearTablas() {
  //resetearBaseDeDatos()
  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS cuentas (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      saldo REAL DEFAULT 0,
      sincronizado INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tarjetas (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      cupo REAL,
      disponible REAL,
      sincronizado INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      tipo TEXT CHECK(tipo IN ('ingreso', 'egreso')),
      sincronizado INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transacciones (
      id TEXT PRIMARY KEY NOT NULL,
      descripcion TEXT,
      cantidad REAL NOT NULL,
      fecha TEXT NOT NULL,
      cuentaId TEXT,
      tarjetaId TEXT,
      categoriaId TEXT,
      sincronizado INTEGER DEFAULT 0,
      FOREIGN KEY (cuentaId) REFERENCES cuentas(id) ON DELETE SET NULL,
      FOREIGN KEY (tarjetaId) REFERENCES tarjetas(id) ON DELETE SET NULL,
      FOREIGN KEY (categoriaId) REFERENCES categorias(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS deudas (
      id TEXT PRIMARY KEY NOT NULL,
      persona TEXT NOT NULL,
      monto REAL NOT NULL,
      fecha TEXT NOT NULL,
      pagado INTEGER DEFAULT 0,
      sincronizado INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS recordatorios (
      id TEXT PRIMARY KEY NOT NULL,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      fecha TEXT NOT NULL,
      completado INTEGER DEFAULT 0,
      sincronizado INTEGER DEFAULT 0
    );
  `);
  db.execSync(`
  INSERT OR IGNORE INTO categorias (id, nombre, tipo, sincronizado)
  VALUES 
    ('cat-1', 'Salario', 'ingreso', 1),
    ('cat-2', 'Alimentación', 'egreso', 1),
    ('cat-3', 'Transporte', 'egreso', 1),
    ('cat-4', 'Entretenimiento', 'egreso', 1),
    ('cat-5', 'Servicios Públicos', 'egreso', 1),
    ('cat-6', 'Educación', 'egreso', 1),
    ('cat-7', 'Otros Ingresos', 'ingreso', 1),
    ('cat-8', 'Otros Gastos', 'egreso', 1);
`);
  db.execSync(`
  CREATE TRIGGER IF NOT EXISTS prevent_delete_default_categorias
  BEFORE DELETE ON categorias
  WHEN OLD.sincronizado = 1
  BEGIN
    SELECT RAISE(ABORT, 'No se puede eliminar una categoría predeterminada');
  END;
`);
}

export default db;
