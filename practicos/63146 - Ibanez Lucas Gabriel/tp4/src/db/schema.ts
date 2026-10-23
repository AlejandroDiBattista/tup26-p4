// Esquema de Drizzle. Después de modificarlo, ejecutar `npm run db:push` para sincronizar la base.
import { relations, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  email: text("email").notNull().unique(),
  domicilio: text("domicilio"),
  localidad: text("localidad"),
  telefono: text("telefono"),
});

export const actividades = sqliteTable(
  "actividades",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clienteId: integer("cliente_id")
      .notNull()
      .references(() => clientes.id, { onDelete: "cascade" }),
    descripcion: text("descripcion").notNull(),
    // Fechas como texto ISO 8601. `fechaFinalizacion` nula = actividad pendiente.
    fechaCompromiso: text("fecha_compromiso"),
    fechaFinalizacion: text("fecha_finalizacion"),
  },
  (t) => [index("actividades_cliente_idx").on(t.clienteId)],
);

export const clientesRelations = relations(clientes, ({ many }) => ({
  actividades: many(actividades),
}));

export const actividadesRelations = relations(actividades, ({ one }) => ({
  cliente: one(clientes, { fields: [actividades.clienteId], references: [clientes.id] }),
}));

export type Cliente = InferSelectModel<typeof clientes>;
export type NuevoCliente = InferInsertModel<typeof clientes>;
export type Actividad = InferSelectModel<typeof actividades>;
export type NuevaActividad = InferInsertModel<typeof actividades>;
