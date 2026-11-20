import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().default(""),
  telefono: text("telefono").notNull().default(""),
  direccion: text("direccion").notNull().default(""),
  ciudad: text("ciudad").notNull().default(""),
});

export const actividades = sqliteTable("actividades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clienteId: integer("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  descripcion: text("descripcion").notNull(),
  fecha: text("fecha"), // "YYYY-MM-DD" u opcional (null)
  completada: integer("completada", { mode: "boolean" }).notNull().default(false),
  completadaEn: text("completada_en"), // fecha en que se completó
});

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;
