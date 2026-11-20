import { and, eq } from 'drizzle-orm';
import type { Database } from './connection.js';
import { actividades, clientes } from './schema.js';
import { actividadesFicticias, clientesFicticios } from './seed-data.js';
import { normalizarActividad, normalizarCliente } from '../normalizar.js';

export async function sembrar(db: Database) {
  await db.transaction(async (tx) => {
    for (const cliente of clientesFicticios) {
      const normalizado = { ...cliente, ...normalizarCliente(cliente) };
      await tx.insert(clientes).values(normalizado).onConflictDoNothing({ target: clientes.email });
      const [guardado] = await tx.select().from(clientes).where(eq(clientes.email, normalizado.email));

      for (const actividad of actividadesFicticias) {
        const [existente] = await tx.select({ id: actividades.id }).from(actividades).where(and(
          eq(actividades.clienteId, guardado.id),
          eq(actividades.descripcion, actividad.descripcion),
        ));

        if (!existente) {
          await tx.insert(actividades).values({ ...actividad, ...normalizarActividad(actividad), clienteId: guardado.id });
        }
      }
    }
  });
}
