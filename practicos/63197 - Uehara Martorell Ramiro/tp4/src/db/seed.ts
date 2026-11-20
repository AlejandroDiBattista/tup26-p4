import { db } from "./index";
import { actividades, clientes } from "./schema";

const ejemplos = [
  { nombre: "Ana García", email: "ana.garcia@example.com", telefono: "381 555 0123", direccion: "San Martín 450", ciudad: "Yerba Buena" },
  { nombre: "Bruno López", email: "bruno.lopez@example.com", telefono: "381 555 0456", direccion: "Laprida 120", ciudad: "San Miguel de Tucumán" },
  { nombre: "Carla Pérez", email: "carla.perez@example.com", telefono: "381 555 0789", direccion: "Mate de Luna 2100", ciudad: "San Miguel de Tucumán" },
  { nombre: "Diego Ruiz", email: "diego.ruiz@example.com", telefono: "381 555 1011", direccion: "Aconquija 1500", ciudad: "Yerba Buena" },
  { nombre: "Elena Torres", email: "elena.torres@example.com", telefono: "381 555 1213", direccion: "Belgrano 300", ciudad: "Tafí Viejo" },
  { nombre: "Federico Díaz", email: "federico.diaz@example.com", telefono: "381 555 1415", direccion: "Sarmiento 800", ciudad: "Banda del Río Salí" },
  { nombre: "Gabriela Sosa", email: "gabriela.sosa@example.com", telefono: "381 555 1617", direccion: "Mendoza 950", ciudad: "San Miguel de Tucumán" },
];

// Carga datos de ejemplo solo si la base está vacía.
export function sembrarSiVacio() {
  if (db.select().from(clientes).limit(1).get()) return;

  const [ana, bruno] = db.insert(clientes).values(ejemplos).returning().all();
  db.insert(actividades)
    .values([
      { clienteId: ana.id, descripcion: "Consultar nuevas necesidades" },
      { clienteId: ana.id, descripcion: "Enviar presupuesto", fecha: "2026-10-16" },
      { clienteId: ana.id, descripcion: "Llamar para seguimiento", fecha: "2026-11-02" },
      { clienteId: ana.id, descripcion: "Enviar presentación", fecha: "2026-10-15", completada: true, completadaEn: "2026-10-15" },
      { clienteId: ana.id, descripcion: "Primera reunión", fecha: "2026-10-12", completada: true, completadaEn: "2026-10-12" },
      { clienteId: bruno.id, descripcion: "Coordinar demo del producto", fecha: "2026-10-30" },
    ])
    .run();
}
