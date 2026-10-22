import {
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  email: text("email").notNull(),
  domicilio: text("domicilio"),
  localidad: text("localidad"),
  telefono: text("telefono"),
});

export const actividades = sqliteTable("actividades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clienteId: integer("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  descripcion: text("descripcion").notNull(),
  fechaCompromiso: text("fecha_compromiso"),
  fechaFinalizacion: text("fecha_finalizacion"),
});