import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  email: text("email").notNull().unique(),
  domicilio: text("domicilio"),
  localidad: text("localidad"),
  telefono: text("telefono"),
});

// Las fechas se guardan como texto ISO (YYYY-MM-DD) para que ordenen bien y sean legibles.
// fechaCompromiso null  => actividad sin fecha comprometida.
// fechaFinalizacion null => actividad pendiente; con valor => completada.
export const actividades = sqliteTable(
  "actividades",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clienteId: integer("cliente_id")
      .notNull()
      .references(() => clientes.id, { onDelete: "cascade" }),
    descripcion: text("descripcion").notNull(),
    fechaCompromiso: text("fecha_compromiso"),
    fechaFinalizacion: text("fecha_finalizacion"),
  },
  // El índice único también acelera las búsquedas por clienteId (es su primera columna).
  (t) => [unique("actividades_cliente_descripcion_uq").on(t.clienteId, t.descripcion)],
);

export const clientesRelations = relations(clientes, ({ many }) => ({
  actividades: many(actividades),
}));

export const actividadesRelations = relations(actividades, ({ one }) => ({
  cliente: one(clientes, { fields: [actividades.clienteId], references: [clientes.id] }),
}));

export type Cliente = typeof clientes.$inferSelect;
export type NuevoCliente = typeof clientes.$inferInsert;
export type Actividad = typeof actividades.$inferSelect;
export type NuevaActividad = typeof actividades.$inferInsert;
