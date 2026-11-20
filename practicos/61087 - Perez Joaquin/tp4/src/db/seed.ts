import { count } from "drizzle-orm";
import { db } from "./client.js";
import { actividades, clientes } from "./schema.js";

const datosDeEjemplo = [
  {
    nombre: "Ana García", email: "ana.garcia@example.com", telefono: "381 555 0123",
    direccion: "San Martín 450", ciudad: "Yerba Buena",
    actividades: [
      { descripcion: "Consultar nuevas necesidades", fecha: null, completada: false },
      { descripcion: "Enviar presupuesto", fecha: "2026-10-16", completada: false },
      { descripcion: "Llamar para seguimiento", fecha: "2026-10-22", completada: false },
      { descripcion: "Enviar presentación", fecha: "2026-10-15", completada: true },
      { descripcion: "Primera reunión", fecha: "2026-10-12", completada: true },
    ],
  },
  { nombre: "Bruno López", email: "bruno.lopez@example.com", telefono: "381 555 0184", direccion: "Av. Aconquija 1200", ciudad: "Yerba Buena", actividades: [{ descripcion: "Coordinar una reunión", fecha: "2026-10-28", completada: false }] },
  { nombre: "Carla Pérez", email: "carla.perez@example.com", telefono: "381 555 0225", direccion: "25 de Mayo 320", ciudad: "San Miguel de Tucumán", actividades: [] },
  { nombre: "Diego Ruiz", email: "diego.ruiz@example.com", telefono: "381 555 0356", direccion: "Maipú 845", ciudad: "San Miguel de Tucumán", actividades: [] },
  { nombre: "Elena Torres", email: "elena.torres@example.com", telefono: "381 555 0441", direccion: "Belgrano 700", ciudad: "Tafí Viejo", actividades: [] },
  { nombre: "Federico Díaz", email: "federico.diaz@example.com", telefono: "381 555 0582", direccion: "Córdoba 190", ciudad: "San Miguel de Tucumán", actividades: [] },
  { nombre: "Gabriela Sosa", email: "gabriela.sosa@example.com", telefono: "381 555 0619", direccion: "Las Heras 94", ciudad: "Yerba Buena", actividades: [] },
];

export async function sembrarDatosDeEjemplo() {
  const [{ total }] = await db.select({ total: count() }).from(clientes);
  if (total > 0) return false;

  for (const ejemplo of datosDeEjemplo) {
    const [cliente] = await db.insert(clientes).values({
      nombre: ejemplo.nombre, email: ejemplo.email, telefono: ejemplo.telefono,
      direccion: ejemplo.direccion, ciudad: ejemplo.ciudad,
    }).returning();

    if (ejemplo.actividades.length > 0) {
      await db.insert(actividades).values(ejemplo.actividades.map((actividad) => ({
        clienteId: cliente.id,
        descripcion: actividad.descripcion,
        fecha: actividad.fecha,
        completada: actividad.completada,
        completadaEn: actividad.completada ? "2026-10-15T12:00:00.000Z" : null,
      })));
    }
  }
  return true;
}
