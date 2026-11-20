const { sql } = require("drizzle-orm");
const {
  index,
  integer,
  sqliteTable,
  text,
} = require("drizzle-orm/sqlite-core");

const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  email: text("email"),
  telefono: text("telefono"),
  direccion: text("direccion"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

const actividades = sqliteTable(
  "actividades",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clienteId: integer("cliente_id")
      .notNull()
      .references(() => clientes.id, { onDelete: "cascade" }),
    descripcion: text("descripcion").notNull(),
    fecha: text("fecha"),
    completada: integer("completada", { mode: "boolean" })
      .notNull()
      .default(false),
    fechaCompletada: text("fecha_completada"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("actividades_cliente_id_idx").on(table.clienteId)],
);

module.exports = { actividades, clientes };
