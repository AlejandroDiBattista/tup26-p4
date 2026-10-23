import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  email: text("email").notNull().unique(),
  domicilio: text("domicilio"),
  localidad: text("localidad"),
  telefono: text("telefono"),
});

export const actividades = sqliteTable("actividades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  descripcion: text("descripcion").notNull(),
  fechaCompromiso: text("fecha_compromiso"),
  fechaFinalizacion: text("fecha_finalizacion"),
  clienteId: integer("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
});

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;
