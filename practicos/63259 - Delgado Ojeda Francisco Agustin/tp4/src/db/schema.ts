import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  email: text("email").notNull(),
  telefono: text("telefono").notNull().default(""),
  domicilio: text("domicilio").notNull().default(""),
  creadoEn: text("creado_en").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

export const actividades = sqliteTable("actividades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clienteId: integer("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),
  descripcion: text("descripcion").notNull(),
  fecha: text("fecha"),
  completada: integer("completada", { mode: "boolean" }).notNull().default(false),
  fechaCompletada: text("fecha_completada"),
  creadoEn: text("creado_en").notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

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
