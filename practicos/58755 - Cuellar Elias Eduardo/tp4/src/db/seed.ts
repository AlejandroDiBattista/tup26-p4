import { inArray } from "drizzle-orm";
import { config } from "../config.js";
import { db } from "./client.js";
import { actividades, clientes, type NuevaActividad } from "./schema.js";
import { clientesSeed } from "./seed-data.js";

// Siembra idempotente: los clientes se identifican por email (único) y las actividades
// por (clienteId, descripcion) (único). Repetir el seed no duplica datos.
const resultado = await db.transaction(async (tx) => {
  const clientesInsertados = await tx
    .insert(clientes)
    .values(clientesSeed.map(({ actividades: _, ...cliente }) => cliente))
    .onConflictDoNothing({ target: clientes.email })
    .returning({ id: clientes.id });

  const emails = clientesSeed.map((c) => c.email);
  const existentes = await tx
    .select({ id: clientes.id, email: clientes.email })
    .from(clientes)
    .where(inArray(clientes.email, emails));
  const idPorEmail = new Map(existentes.map((c) => [c.email, c.id]));

  const nuevasActividades: NuevaActividad[] = clientesSeed.flatMap((cliente) => {
    const clienteId = idPorEmail.get(cliente.email);
    if (clienteId === undefined) throw new Error(`No se encontró el cliente ${cliente.email}`);
    return cliente.actividades.map((actividad) => ({ ...actividad, clienteId }));
  });

  const actividadesInsertadas = nuevasActividades.length
    ? await tx
        .insert(actividades)
        .values(nuevasActividades)
        .onConflictDoNothing({ target: [actividades.clienteId, actividades.descripcion] })
        .returning({ id: actividades.id })
    : [];

  return { clientes: clientesInsertados.length, actividades: actividadesInsertadas.length };
});

console.log(
  `Seed en ${config.databaseUrl}: ${resultado.clientes} clientes y ${resultado.actividades} actividades nuevas`,
);
