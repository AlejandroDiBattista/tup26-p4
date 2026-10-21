import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  email: text("email").notNull(),
  telefono: text("telefono").notNull().default(""),
  empresa: text("empresa").notNull().default(""),
  notas: text("notas").notNull().default(""),
  creadoEn: text("creado_en").notNull().default(""),
});

export const actividades = sqliteTable("actividades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clienteId: integer("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  descripcion: text("descripcion").notNull(),
  vencimiento: text("vencimiento").notNull().default(""),
  completada: integer("completada", { mode: "boolean" }).notNull().default(false),
  creadoEn: text("creado_en").notNull().default(""),
});

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;
