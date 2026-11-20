import { sql } from "drizzle-orm";
import { db } from "./index.ts";
import { actividades, clientes } from "./schema.ts";

const datos = [
  { nombre: "Ana García", email: "ana.garcia@example.com", telefono: "381 555 0123", direccion: "San Martín 450", ciudad: "Yerba Buena" },
  { nombre: "Bruno López", email: "bruno.lopez@example.com", telefono: "381 555 0456", direccion: "Mate de Luna 1200", ciudad: "San Miguel de Tucumán" },
  { nombre: "Carla Pérez", email: "carla.perez@example.com", telefono: "381 555 0789", direccion: "Belgrano 980", ciudad: "Tafí Viejo" },
  { nombre: "Diego Ruiz", email: "diego.ruiz@example.com", telefono: "381 555 1011", direccion: "Aconquija 2100", ciudad: "Yerba Buena" },
  { nombre: "Elena Torres", email: "elena.torres@example.com", telefono: "381 555 1213", direccion: "24 de Septiembre 300", ciudad: "San Miguel de Tucumán" },
  { nombre: "Federico Díaz", email: "federico.diaz@example.com", telefono: "381 555 1415", direccion: "Roca 75", ciudad: "Banda del Río Salí" },
  { nombre: "Gabriela Sosa", email: "gabriela.sosa@example.com", telefono: "381 555 1617", direccion: "Laprida 640", ciudad: "Lules" },
  { nombre: "Hernán Castro", email: "hernan.castro@example.com", telefono: "381 555 1819", direccion: "Junín 410", ciudad: "Famaillá" },
  { nombre: "Inés Medina", email: "ines.medina@example.com", telefono: "381 555 2021", direccion: "Perón 1500", ciudad: "Yerba Buena" },
  { nombre: "Julián Romero", email: "julian.romero@example.com", telefono: "381 555 2223", direccion: "Córdoba 820", ciudad: "Concepción" },
];

// Vacía las tablas (las actividades se borran en cascada), reinicia los ids y carga los datos.
db.delete(clientes).run();
db.run(sql`DELETE FROM sqlite_sequence`);
const creados = db.insert(clientes).values(datos).returning().all();
const ana = creados[0];
const bruno = creados[1];

db.insert(actividades)
  .values([
    { clienteId: ana.id, descripcion: "Consultar nuevas necesidades" },
    { clienteId: ana.id, descripcion: "Enviar presupuesto", fecha: "2026-10-16" },
    { clienteId: ana.id, descripcion: "Llamar para seguimiento", fecha: "2026-10-28" },
    { clienteId: ana.id, descripcion: "Enviar presentación", fecha: "2026-10-15", completada: true, completadaEn: "2026-10-15" },
    { clienteId: ana.id, descripcion: "Primera reunión", fecha: "2026-10-12", completada: true, completadaEn: "2026-10-12" },
    { clienteId: bruno.id, descripcion: "Coordinar visita", fecha: "2026-11-03" },
  ])
  .run();

console.log(`Cargados ${creados.length} clientes de ejemplo.`);
