import { eq } from "drizzle-orm";
import { config } from "../config.js";
import { createDb, type Db } from "./client.js";
import { actividades, clientes } from "./schema.js";
import * as n from "../clientes/normalizar.js";
import { seedData } from "./seed-data.js";

// Idempotente: clientes únicos por email y actividades únicas por (cliente, descripción).
export async function seed(db: Db) {
  for (const { actividades: acts, ...cliente } of seedData) {
    const valores = {
      nombre: n.nombre(cliente.nombre),
      apellido: n.nombre(cliente.apellido),
      email: n.email(cliente.email),
      domicilio: n.opcional(cliente.domicilio),
      localidad: n.opcional(cliente.localidad),
      telefono: n.opcional(cliente.telefono, n.telefono),
    };
    await db.insert(clientes).values(valores).onConflictDoNothing();
    const found = await db.select({ id: clientes.id }).from(clientes).where(eq(clientes.email, valores.email));
    const clienteId = found[0]!.id;
    if (acts.length) {
      await db.insert(actividades).values(acts.map((a) => ({ ...a, descripcion: n.texto(a.descripcion), clienteId }))).onConflictDoNothing();
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await seed(createDb(config.databaseUrl, config.authToken));
  console.log("Datos de ejemplo cargados");
}
