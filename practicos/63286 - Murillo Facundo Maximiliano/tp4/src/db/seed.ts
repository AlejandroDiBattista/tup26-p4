import { eq } from "drizzle-orm";

import { client, db } from "./index.js";
import { actividades, clientes } from "./schema.js";

const clientesIniciales = [
  { id: 1, nombre: "Ana", apellido: "García", email: "ana.garcia@example.com", domicilio: "San Martín 450", localidad: "Yerba Buena", telefono: "381 555 0123" },
  { id: 2, nombre: "Bruno", apellido: "López", email: "bruno.lopez@example.com", domicilio: "Belgrano 820", localidad: "San Miguel de Tucumán", telefono: "381 555 0142" },
  { id: 3, nombre: "Carla", apellido: "Pérez", email: "carla.perez@example.com", domicilio: "Las Heras 125", localidad: "Tafí Viejo", telefono: "381 555 0188" },
  { id: 4, nombre: "Diego", apellido: "Ruiz", email: "diego.ruiz@example.com", domicilio: "Italia 990", localidad: "Yerba Buena", telefono: "381 555 0111" },
  { id: 5, nombre: "Elena", apellido: "Torres", email: "elena.torres@example.com", domicilio: "Maipú 320", localidad: "San Miguel de Tucumán", telefono: "381 555 0164" },
  { id: 6, nombre: "Federico", apellido: "Díaz", email: "federico.diaz@example.com", domicilio: "Rivadavia 67", localidad: "Lules", telefono: "381 555 0190" },
  { id: 7, nombre: "Gabriela", apellido: "Sosa", email: "gabriela.sosa@example.com", domicilio: "Junín 1400", localidad: "Tafí Viejo", telefono: "381 555 0133" },
  { id: 8, nombre: "Hernán", apellido: "Acosta", email: "hernan.acosta@example.com", domicilio: "Catamarca 215", localidad: "San Miguel de Tucumán", telefono: "381 555 0177" },
  { id: 9, nombre: "Inés", apellido: "Morales", email: "ines.morales@example.com", domicilio: "Belgrano 540", localidad: "Yerba Buena", telefono: "381 555 0155" },
  { id: 10, nombre: "Julián", apellido: "Castro", email: "julian.castro@example.com", domicilio: "Sarmiento 301", localidad: "Lules", telefono: "381 555 0109" },
];

const actividadesIniciales = [
  { id: 1, clienteId: 1, descripcion: "Consultar nuevas necesidades", fechaCompromiso: null, fechaFinalizacion: null },
  { id: 2, clienteId: 1, descripcion: "Enviar presupuesto", fechaCompromiso: "2026-10-16", fechaFinalizacion: null },
  { id: 3, clienteId: 1, descripcion: "Llamar para seguimiento", fechaCompromiso: "2026-10-22", fechaFinalizacion: null },
  { id: 4, clienteId: 1, descripcion: "Enviar presentación", fechaCompromiso: null, fechaFinalizacion: "2026-10-15" },
  { id: 5, clienteId: 1, descripcion: "Primera reunión", fechaCompromiso: "2026-10-12", fechaFinalizacion: "2026-10-12" },
  { id: 6, clienteId: 2, descripcion: "Coordinar llamada inicial", fechaCompromiso: null, fechaFinalizacion: null },
  { id: 7, clienteId: 2, descripcion: "Presentar catálogo", fechaCompromiso: "2026-10-24", fechaFinalizacion: null },
  { id: 8, clienteId: 2, descripcion: "Enviar información general", fechaCompromiso: null, fechaFinalizacion: "2026-10-10" },
  { id: 9, clienteId: 3, descripcion: "Confirmar datos de contacto", fechaCompromiso: "2026-10-20", fechaFinalizacion: null },
  { id: 10, clienteId: 3, descripcion: "Reunión de presentación", fechaCompromiso: "2026-10-08", fechaFinalizacion: "2026-10-08" },
  { id: 11, clienteId: 4, descripcion: "Enviar propuesta comercial", fechaCompromiso: "2026-10-28", fechaFinalizacion: null },
  { id: 12, clienteId: 4, descripcion: "Revisar requerimientos", fechaCompromiso: null, fechaFinalizacion: "2026-10-14" },
  { id: 13, clienteId: 5, descripcion: "Agendar seguimiento", fechaCompromiso: "2026-10-21", fechaFinalizacion: null },
  { id: 14, clienteId: 5, descripcion: "Compartir documentación", fechaCompromiso: "2026-10-11", fechaFinalizacion: "2026-10-11" },
  { id: 15, clienteId: 6, descripcion: "Consultar disponibilidad", fechaCompromiso: null, fechaFinalizacion: null },
  { id: 16, clienteId: 6, descripcion: "Preparar presupuesto", fechaCompromiso: "2026-10-30", fechaFinalizacion: null },
  { id: 17, clienteId: 7, descripcion: "Revisar propuesta", fechaCompromiso: "2026-10-19", fechaFinalizacion: null },
  { id: 18, clienteId: 7, descripcion: "Realizar primera entrevista", fechaCompromiso: "2026-10-13", fechaFinalizacion: "2026-10-13" },
  { id: 19, clienteId: 8, descripcion: "Enviar detalles del servicio", fechaCompromiso: null, fechaFinalizacion: null },
  { id: 20, clienteId: 8, descripcion: "Confirmar recepción de propuesta", fechaCompromiso: "2026-10-26", fechaFinalizacion: null },
  { id: 21, clienteId: 9, descripcion: "Programar demostración", fechaCompromiso: "2026-10-23", fechaFinalizacion: null },
  { id: 22, clienteId: 9, descripcion: "Reunión de diagnóstico", fechaCompromiso: "2026-10-09", fechaFinalizacion: "2026-10-09" },
  { id: 23, clienteId: 10, descripcion: "Llamar para conocer necesidades", fechaCompromiso: null, fechaFinalizacion: null },
  { id: 24, clienteId: 10, descripcion: "Enviar resumen de reunión", fechaCompromiso: "2026-10-29", fechaFinalizacion: null },
];

async function seed(): Promise<void> {
  await db.insert(clientes).values(clientesIniciales).onConflictDoNothing();

  for (const actividad of actividadesIniciales) {
    const cliente = await db
      .select({ id: clientes.id })
      .from(clientes)
      .where(eq(clientes.id, actividad.clienteId))
      .limit(1);

    if (cliente.length === 0) continue;

    await db.insert(actividades).values(actividad).onConflictDoNothing();
  }

  console.info("Semilla aplicada: 10 clientes y sus actividades iniciales están disponibles.");
}

seed()
  .catch((error: unknown) => {
    console.error("No se pudo cargar la semilla:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.close();
  });
