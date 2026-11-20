import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// tabla de clientes
export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  email: text("email"),
  telefono: text("telefono"),
  empresa: text("empresa"),
});

// tabla de actividad
export const actividades = sqliteTable("actividades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clienteId: integer("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  descripcion: text("descripcion").notNull(),
  fecha: text("fecha").notNull(), // formato ISO 8601
  completada: integer("completada", { mode: "boolean" })
    .notNull()
    .default(false),
});