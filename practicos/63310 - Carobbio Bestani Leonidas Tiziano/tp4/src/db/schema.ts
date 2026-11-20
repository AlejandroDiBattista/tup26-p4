import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  email: text("email").notNull().default(""),
  telefono: text("telefono").notNull().default(""),
  empresa: text("empresa").notNull().default(""),
  notas: text("notas").notNull().default("")
});

export const actividades = sqliteTable("actividades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clienteId: integer("cliente_id").notNull().references(() => clientes.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion").notNull().default(""),
  fecha: text("fecha").notNull().default(""),
  completada: integer("completada", { mode: "boolean" }).notNull().default(false)
});
