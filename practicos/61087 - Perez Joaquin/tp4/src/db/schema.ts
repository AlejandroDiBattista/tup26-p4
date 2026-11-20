import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  email: text("email").notNull().unique(),
  telefono: text("telefono").notNull().default(""),
  direccion: text("direccion").notNull().default(""),
  ciudad: text("ciudad").notNull().default(""),
  creadoEn: text("creado_en").notNull().default(sql`(datetime('now'))`),
});

export const actividades = sqliteTable("actividades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clienteId: integer("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  descripcion: text("descripcion").notNull(),
  fecha: text("fecha"),
  completada: integer("completada", { mode: "boolean" }).notNull().default(false),
  completadaEn: text("completada_en"),
  creadoEn: text("creado_en").notNull().default(sql`(datetime('now'))`),
});
