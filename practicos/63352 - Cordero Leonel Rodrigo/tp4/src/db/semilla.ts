import { count } from "drizzle-orm";

import { client, db } from "./conexion.js";
import { actividades, clientes } from "./esquema.js";

const clientesIniciales = [
  { nombre: "Ana", apellido: "García", email: "ana.garcia@example.com", domicilio: "San Martín 450", localidad: "Yerba Buena", telefono: "381 555 0123" },
  { nombre: "Bruno", apellido: "López", email: "bruno.lopez@example.com", domicilio: "Belgrano 820", localidad: "San Miguel de Tucumán", telefono: "381 555 0142" },
  { nombre: "Carla", apellido: "Pérez", email: "carla.perez@example.com", domicilio: "Las Heras 125", localidad: "Tafí Viejo", telefono: "381 555 0188" },
  { nombre: "Diego", apellido: "Ruiz", email: "diego.ruiz@example.com", domicilio: "Italia 990", localidad: "Yerba Buena", telefono: "381 555 0111" },
  { nombre: "Elena", apellido: "Torres", email: "elena.torres@example.com", domicilio: "Maipú 320", localidad: "San Miguel de Tucumán", telefono: "381 555 0164" },
  { nombre: "Federico", apellido: "Díaz", email: "federico.diaz@example.com", domicilio: "Rivadavia 67", localidad: "Lules", telefono: "381 555 0190" },
  { nombre: "Gabriela", apellido: "Sosa", email: "gabriela.sosa@example.com", domicilio: "Junín 1400", localidad: "Tafí Viejo", telefono: "381 555 0133" },
];

const actividadesIniciales: { email: string; descripcion: string; fechaCompromiso?: string; fechaFinalizacion?: string }[] = [
  { email: "ana.garcia@example.com", descripcion: "Consultar nuevas necesidades" },
  { email: "ana.garcia@example.com", descripcion: "Enviar presupuesto", fechaCompromiso: "2026-10-16" },
  { email: "ana.garcia@example.com", descripcion: "Llamar para seguimiento", fechaCompromiso: "2026-10-22" },
  { email: "ana.garcia@example.com", descripcion: "Enviar presentación", fechaFinalizacion: "2026-10-15" },
  { email: "ana.garcia@example.com", descripcion: "Primera reunión", fechaCompromiso: "2026-10-12", fechaFinalizacion: "2026-10-12" },
  { email: "bruno.lopez@example.com", descripcion: "Coordinar llamada inicial" },
  { email: "bruno.lopez@example.com", descripcion: "Presentar catálogo", fechaCompromiso: "2026-10-30" },
  { email: "bruno.lopez@example.com", descripcion: "Enviar información general", fechaFinalizacion: "2026-10-10" },
  { email: "carla.perez@example.com", descripcion: "Confirmar datos de contacto", fechaCompromiso: "2026-10-20" },
  { email: "carla.perez@example.com", descripcion: "Reunión de presentación", fechaFinalizacion: "2026-10-08" },
  { email: "diego.ruiz@example.com", descripcion: "Enviar propuesta comercial", fechaCompromiso: "2026-11-04" },
  { email: "elena.torres@example.com", descripcion: "Agendar seguimiento", fechaCompromiso: "2026-10-21" },
  { email: "federico.diaz@example.com", descripcion: "Consultar disponibilidad" },
  { email: "gabriela.sosa@example.com", descripcion: "Revisar propuesta", fechaCompromiso: "2026-10-19" },
];

export async function sembrar() {
  const [total] = await db.select({ n: count() }).from(clientes);
  if ((total?.n ?? 0) > 0) return;

  await db.insert(clientes).values(clientesIniciales);
  const filas = await db.select({ id: clientes.id, email: clientes.email }).from(clientes);
  const porEmail = new Map(filas.map((c) => [c.email, c.id]));

  await db.insert(actividades).values(
    actividadesIniciales.map((a) => ({
      clienteId: porEmail.get(a.email)!,
      descripcion: a.descripcion,
      fechaCompromiso: a.fechaCompromiso ?? null,
      fechaFinalizacion: a.fechaFinalizacion ?? null,
    })),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await sembrar();
  console.log("Datos de ejemplo cargados");
  await client.close();
}
