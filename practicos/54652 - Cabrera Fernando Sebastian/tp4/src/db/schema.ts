
import {
  sqliteTable,
  integer,
  text,
} from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  empresa: text("empresa"),
  email: text("email"),
  telefono: text("telefono"),
  direccion: text("direccion"),
  notas: text("notas"),
});

export const actividades = sqliteTable("actividades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clienteId: integer("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  descripcion: text("descripcion").notNull(),
  fecha: text("fecha"),
  completada: integer("completada", {
    mode: "boolean",
  }).notNull().default(false),
});
