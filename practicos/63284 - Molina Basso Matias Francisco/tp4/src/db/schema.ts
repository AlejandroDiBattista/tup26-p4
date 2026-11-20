import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const clientes = sqliteTable("clientes", {
  id: integer().primaryKey({ autoIncrement: true }),
  nombre: text().notNull(),
  apellido: text().notNull(),
  email: text().notNull(),
  domicilio: text(),
  localidad: text(),
  telefono: text(),
});

export const actividades = sqliteTable(
  "actividades",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    clienteId: integer("cliente_id")
      .notNull()
      .references(() => clientes.id, { onDelete: "cascade" }),
    descripcion: text().notNull(),
    fechaCompromiso: text("fecha_compromiso"),
    fechaFinalizacion: text("fecha_finalizacion"),
  },
  (table) => [index("actividades_cliente_idx").on(table.clienteId)],
);

export const clientesRelations = relations(clientes, ({ many }) => ({
  actividades: many(actividades),
}));

export const actividadesRelations = relations(actividades, ({ one }) => ({
  cliente: one(clientes, {
    fields: [actividades.clienteId],
    references: [clientes.id],
  }),
}));

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;
