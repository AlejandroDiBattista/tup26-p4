import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Clientes. `nombre`, `apellido` y `email` son obligatorios;
 * `domicilio`, `localidad` y `telefono` son opcionales (null).
 */
export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  email: text("email").notNull().unique(),
  domicilio: text("domicilio"),
  localidad: text("localidad"),
  telefono: text("telefono"),
});

/**
 * Actividades de un cliente: relación 1:n vía `clienteId`.
 *
 * - `fechaCompromiso` puede ser null: la actividad no tiene fecha acordada.
 * - `fechaFinalizacion` es null mientras está pendiente y se llena al completarla.
 */
export const actividades = sqliteTable(
  "actividades",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clienteId: integer("cliente_id")
      .notNull()
      .references(() => clientes.id, { onDelete: "cascade" }),
    descripcion: text("descripcion").notNull(),
    fechaCompromiso: integer("fecha_compromiso", { mode: "timestamp" }),
    fechaFinalizacion: integer("fecha_finalizacion", { mode: "timestamp" }),
  },
  (tabla) => [
    index("actividades_cliente_id_idx").on(tabla.clienteId),
    // Clave natural de la actividad: permite resembrar sin duplicar filas.
    uniqueIndex("actividades_cliente_descripcion_unique").on(tabla.clienteId, tabla.descripcion),
  ],
);

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;
