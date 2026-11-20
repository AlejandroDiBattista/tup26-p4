import { sql } from "drizzle-orm";
import { db } from "./index.js";
import { clientes, actividades } from "./schema.js";
import { clientesDemo, actividadesDemo } from "./seed-data.js";
import { normalizarCliente } from "../services/validacion.js";

export async function sembrarDemo() {
  // Un lote transaccional evita cargas parciales y serializa cargas simultáneas.
  // Email identifica al cliente demo; cliente + descripción, a su actividad.
  // No modifica ni reinicia los registros que ya existen.
  const operaciones = clientesDemo.map(normalizarCliente).flatMap((cliente) => [
    db.run(sql`
      INSERT INTO ${clientes} (nombre, apellido, email, domicilio, localidad, telefono)
      SELECT ${cliente.nombre}, ${cliente.apellido}, ${cliente.email},
             ${cliente.domicilio}, ${cliente.localidad}, ${cliente.telefono}
      WHERE NOT EXISTS (SELECT 1 FROM ${clientes} WHERE email = ${cliente.email})
    `),
    ...actividadesDemo.map((actividad) =>
      db.run(sql`
      INSERT INTO ${actividades} (cliente_id, descripcion, fecha_compromiso, fecha_finalizacion)
      SELECT id, ${actividad.descripcion}, ${actividad.fechaCompromiso}, ${actividad.fechaFinalizacion}
      FROM ${clientes}
      WHERE id = (SELECT min(id) FROM ${clientes} WHERE email = ${cliente.email})
        AND NOT EXISTS (
          SELECT 1 FROM ${actividades}
          WHERE cliente_id = ${clientes.id} AND descripcion = ${actividad.descripcion}
        )
    `),
    ),
  ]);
  await db.batch([operaciones[0]!, ...operaciones.slice(1)]);
}
