import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id: integer().primaryKey({ autoIncrement: true }),
  nombre: text().notNull(),
  apellido: text().notNull(),
  telefono: text(),
  email: text().notNull().unique(),
});

export const actividades = sqliteTable("actividades", {
  id: integer().primaryKey({ autoIncrement: true }),
  clienteId: integer().notNull().references(() => clientes.id),
  descripcion: text().notNull(),
  fechaCompromiso: integer({ mode: "timestamp" }),
  completada: integer({ mode: "boolean" }).notNull().default(false),
});
