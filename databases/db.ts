import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";

// Ruta del archivo de base de datos
const dbFilePath = `${FileSystem.documentDirectory}SQLite/finanzas.db`;
const db = SQLite.openDatabaseSync("finanzas.db");
const crearCategoriaDeuda = async () => {
  const existe = db.getFirstSync(
    "SELECT id FROM Categoria WHERE LOWER(nombre_cat) = 'deuda'"
  );
  if (!existe) {
    await db.runAsync(
      `INSERT INTO Categoria (nombre_cat, icono) VALUES (?, ?)`,
      ["Deuda", "account-cash"] // icono puede ser uno de MaterialCommunityIcons
    );
    console.log("✅ Categoría 'Deuda' creada.");
  } else {
    console.log("🔁 Categoría 'Deuda' ya existe.");
  }
};
// Crear las tablas
const createTables = () => {
  try {
    db.runSync("PRAGMA foreign_keys = ON;");

    db.runSync(`
      CREATE TABLE IF NOT EXISTS Categoria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_cat TEXT,
        icono TEXT
      );
    `);

    db.runSync(`
      CREATE TABLE IF NOT EXISTS Cuenta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_cuenta TEXT
      );
    `);

    db.runSync(`
      CREATE TABLE IF NOT EXISTS Tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tag TEXT
      );
    `);

    db.runSync(`
      CREATE TABLE IF NOT EXISTS Transacciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        fecha TEXT,
        categoria_id INTEGER,
        cantidad REAL,
        cuenta_id INTEGER,
        FOREIGN KEY (categoria_id) REFERENCES Categoria(id)
          ON UPDATE CASCADE ON DELETE SET NULL,
        FOREIGN KEY (cuenta_id) REFERENCES Cuenta(id)
          ON UPDATE CASCADE ON DELETE SET NULL
      );
    `);

    db.runSync(`
      CREATE TABLE IF NOT EXISTS Transaccion_Tag (
        transaccion_id INTEGER,
        tag_id INTEGER,
        PRIMARY KEY(transaccion_id, tag_id),
        FOREIGN KEY (transaccion_id) REFERENCES Transacciones(id)
          ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES Tags(id)
          ON DELETE CASCADE
      );
    `);

    db.runSync(`
      CREATE TABLE IF NOT EXISTS Deuda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        persona TEXT,
        total REAL
      );
    `);

    db.runSync(`
      CREATE TABLE IF NOT EXISTS Transacciones_Deuda (
        id_deuda INTEGER,
        id_transaccion INTEGER,
        PRIMARY KEY(id_deuda, id_transaccion),
        FOREIGN KEY (id_deuda) REFERENCES Deuda(id)
          ON DELETE CASCADE,
        FOREIGN KEY (id_transaccion) REFERENCES Transacciones(id)
          ON DELETE CASCADE
      );
    `);

    console.log("✅ Tablas creadas correctamente.");
  } catch (error) {
    console.error("❌ Error al crear las tablas:", error);
  }
};

// Verifica la estructura de una tabla
const checkTableInfo = (tableName: string) => {
  const tableInfo = db.getAllSync(`PRAGMA table_info(${tableName});`);
  console.log(`📋 Estructura de la tabla "${tableName}":`, tableInfo);
};

// Ejecutar creación y luego inspección
createTables();
checkTableInfo("Categoria");
checkTableInfo("Cuenta");
checkTableInfo("Transacciones");
checkTableInfo("Deuda");
checkTableInfo("Transacciones_Deuda");
crearCategoriaDeuda();

const insertarDatosDeudaDePrueba = async () => {
  try {
    const deudas = [
      { persona: "Carlos", descripcion: "Préstamo almuerzo", monto: 25000, esPrestamo: true },
      { persona: "Laura", descripcion: "Me prestó para transporte", monto: 15000, esPrestamo: false },
      { persona: "Ana", descripcion: "", monto: 50000, esPrestamo: true },
    ];

    for (const deuda of deudas) {
      const total = deuda.esPrestamo ? deuda.monto : -deuda.monto;

      // Insertar en Deuda
      const deudaResult = await db.runAsync(
        "INSERT INTO Deuda (persona, total) VALUES (?, ?)",
        [deuda.persona, total]
      );
      const idDeuda = deudaResult.lastInsertRowId;

      // Insertar Transacción relacionada
      const txResult = await db.runAsync(
        `INSERT INTO Transacciones (nombre, fecha, cantidad, categoria_id, cuenta_id)
         VALUES (?, ?, ?, NULL, NULL)`,
        [
          deuda.descripcion || `Deuda con ${deuda.persona}`,
          new Date().toISOString(),
          deuda.esPrestamo ? -deuda.monto : deuda.monto // misma lógica que app
        ]
      );
      const idTransaccion = txResult.lastInsertRowId;

      // Asociar en tabla puente
      await db.runAsync(
        `INSERT INTO Transacciones_Deuda (id_deuda, id_transaccion) VALUES (?, ?)`,
        [idDeuda, idTransaccion]
      );
    }


    console.log("✅ Datos de prueba de deudas insertados correctamente.");
  } catch (error) {
    console.error("❌ Error al insertar datos de deuda de prueba:", error);
  }
};


export default db;
