import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre", { length: 120 }).notNull(),
  email: text("email", { length: 160 }).notNull(),
  telefono: text("telefono", { length: 40 }).notNull().default(""),
  direccion: text("direccion", { length: 200 }).notNull().default(""),
  creadoEn: text("creado_en").notNull()
});

export const actividades = sqliteTable("actividades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clienteId: integer("cliente_id").notNull().references(() => clientes.id, { onDelete: "cascade" }),
  descripcion: text("descripcion", { length: 240 }).notNull(),
  fecha: text("fecha"),
  completada: integer("completada", { mode: "boolean" }).notNull().default(false),
  creadaEn: text("creada_en").notNull(),
  completadaEn: text("completada_en")
});
