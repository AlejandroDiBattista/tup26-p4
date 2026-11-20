import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id:            integer("id").primaryKey({ autoIncrement: true }),
  nombre:        text("nombre").notNull(),
  apellido:      text("apellido").notNull(),
  telefono:      text("telefono"),
  email:         text("email").notNull().unique(),
  fechaCreacion: integer("fecha_creacion", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const actividades = sqliteTable("actividades", {
  id:              integer("id").primaryKey({ autoIncrement: true }),
  clienteId:       integer("cliente_id").notNull().references(() => clientes.id, { onDelete: "cascade" }),
  descripcion:     text("descripcion").notNull(),
  estado:          text("estado", { enum: ["pendiente", "completa"] }).notNull().default("pendiente"),
  fecha:           integer("fecha", { mode: "timestamp" }),
  fechaCreacion:   integer("fecha_creacion", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  fechaCompletada: integer("fecha_completada", { mode: "timestamp" }),
});

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;

export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;
