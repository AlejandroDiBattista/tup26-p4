import { relations } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text
} from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id:        integer("id").primaryKey({ autoIncrement: true }),
  nombre:    text("nombre").notNull(),
  apellido:  text("apellido").notNull(),
  email:     text("email").notNull().unique(),
  telefono:  text("telefono")
});

export const actividades = sqliteTable("actividades", {
  id:                 integer("id").primaryKey({ autoIncrement: true }),
  clienteId:          integer("cliente_id").notNull().references(() => clientes.id, { onDelete: "cascade" }),
  descripcion:        text("descripcion").notNull(),
  fecha:              text("fecha", { mode: "text" }),
  fechaCompromiso:    text("fecha_compromiso", { mode: "text" }),
  fechaFinalizacion:  text("fecha_finalizacion", { mode: "text" })
});

export const clientesRelations = relations(clientes, ({ many }) => ({
  actividades: many(actividades)
}));

export const actividadesRelations = relations(actividades, ({ one }) => ({
  cliente: one(clientes, {
    fields: [actividades.clienteId],
    references: [clientes.id]
  })
}));

export type Cliente        = typeof clientes.$inferSelect;
export type ClienteNuevo   = typeof clientes.$inferInsert;
export type Actividad      = typeof actividades.$inferSelect;
export type ActividadNueva = typeof actividades.$inferInsert;
