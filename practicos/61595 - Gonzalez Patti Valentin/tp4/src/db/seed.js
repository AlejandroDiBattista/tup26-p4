import { mkdirSync } from "node:fs";
import Database from "better-sqlite3";

mkdirSync("./data", { recursive: true });
const sqlite = new Database("./data/local.db");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    domicilio TEXT,
    localidad TEXT,
    telefono TEXT
  );
  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha_compromiso TEXT,
    fecha_finalizacion TEXT
  );
`);

const clientes = [
  [1, "Lucía", "Acosta", "lucia.acosta@example.com", null, "Córdoba", "351-410-1201"],
  [2, "Mateo", "Benítez", "mateo.benitez@example.com", "Belgrano 245", "Rosario", null],
  [3, "Sofía", "Cabrera", "sofia.cabrera@example.com", null, "Mendoza", "261-430-2203"],
  [4, "Tomás", "Díaz", "tomas.diaz@example.com", "San Martín 803", "La Plata", "221-450-3204"],
  [5, "Valentina", "Escobar", "valentina.escobar@example.com", null, "Salta", null],
  [6, "Joaquín", "Fernández", "joaquin.fernandez@example.com", "Rivadavia 1220", "Santa Fe", "342-470-5206"],
  [7, "Martina", "Gómez", "martina.gomez@example.com", null, "Neuquén", "299-480-6207"],
  [8, "Benjamín", "Herrera", "benjamin.herrera@example.com", "Mitre 91", "San Juan", null],
  [9, "Camila", "Ibarra", "camila.ibarra@example.com", null, "Tucumán", "381-490-8209"],
  [10, "Franco", "Juárez", "franco.juarez@example.com", "Las Heras 610", "Paraná", "343-510-9210"],
];

const actividades = [
  [1, 1, "Enviar propuesta comercial", "2026-10-10", "2026-10-09"],
  [2, 1, "Coordinar reunión inicial", "2026-11-02", null],
  [3, 2, "Presentar catálogo de servicios", "2026-10-15", "2026-10-15"],
  [4, 2, "Consultar preferencias de contacto", null, null],
  [5, 3, "Actualizar datos de facturación", "2026-10-20", "2026-10-19"],
  [6, 3, "Enviar presupuesto revisado", "2026-11-05", null],
  [7, 4, "Revisar requerimientos", "2026-10-12", "2026-10-12"],
  [8, 4, "Agendar seguimiento", null, null],
  [9, 5, "Compartir documentación", "2026-10-22", "2026-10-21"],
  [10, 5, "Confirmar recepción de documentos", "2026-11-08", null],
  [11, 6, "Realizar llamada de presentación", "2026-10-18", "2026-10-18"],
  [12, 6, "Definir próxima reunión", null, null],
  [13, 7, "Enviar resumen de la consulta", "2026-10-23", "2026-10-24"],
  [14, 7, "Preparar opciones de servicio", "2026-11-10", null],
  [15, 8, "Verificar datos de contacto", "2026-10-16", "2026-10-16"],
  [16, 8, "Enviar información solicitada", null, null],
  [17, 9, "Compartir propuesta de renovación", "2026-10-25", "2026-10-25"],
  [18, 9, "Consultar disponibilidad para reunión", "2026-11-12", null],
  [19, 10, "Registrar solicitud de información", "2026-10-19", "2026-10-20"],
  [20, 10, "Enviar respuesta a la consulta", null, null],
];

const seed = sqlite.transaction(() => {
  const insertarCliente = sqlite.prepare(`
    INSERT OR IGNORE INTO clientes
      (id, nombre, apellido, email, domicilio, localidad, telefono)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertarActividad = sqlite.prepare(`
    INSERT OR IGNORE INTO actividades
      (id, cliente_id, descripcion, fecha_compromiso, fecha_finalizacion)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const cliente of clientes) insertarCliente.run(...cliente);
  for (const actividad of actividades) insertarActividad.run(...actividad);
});

seed();
sqlite.close();
console.log("Base creada y carga inicial completada: 10 clientes, 20 actividades.");
