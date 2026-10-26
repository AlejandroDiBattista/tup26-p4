// Importamos las funciones necesarias de Drizzle ORM para definir tablas y tipos en SQLite
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ==========================================
// TABLA DE CLIENTES
// ==========================================
// Define la estructura de la tabla 'clientes' en la base de datos SQLite
export const clientes = sqliteTable("clientes", {
  // Clave primaria numérica que se autoincrementa automáticamente con cada nuevo cliente
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Nombre del cliente (campo de texto obligatorio)
  nombre: text("nombre").notNull(),

  // Apellido del cliente (campo de texto obligatorio)
  apellido: text("apellido").notNull(),

  // Correo electrónico único del cliente (obligatorio, no permite repetidos en la base)
  email: text("email").notNull().unique(),

  // Domicilio o dirección del cliente (campo opcional, puede ser nulo)
  domicilio: text("domicilio"),

  // Ciudad o localidad del cliente (campo opcional, puede ser nulo)
  localidad: text("localidad"),

  // Teléfono de contacto (campo opcional, puede ser nulo)
  telefono: text("telefono"),
});

// ==========================================
// TABLA DE ACTIVIDADES
// ==========================================
// Define la estructura de la tabla 'actividades' vinculada a cada cliente
export const actividades = sqliteTable("actividades", {
  // Clave primaria de la actividad autoincremental
  id: integer("id").primaryKey({ autoIncrement: true }),

  // Clave foránea que referencia al cliente al que pertenece la actividad
  // onDelete: "cascade" asegura que si se borra el cliente, se borren sus actividades automáticamente
  clienteId: integer("cliente_id")
    .notNull()
    .references(() => clientes.id, { onDelete: "cascade" }),

  // Descripción de la tarea o compromiso a realizar (obligatorio)
  descripcion: text("descripcion").notNull(),

  // Fecha límite o compromiso en formato texto ISO (YYYY-MM-DD), opcional
  fechaCompromiso: text("fecha_compromiso"),

  // Fecha en que la actividad fue completada (YYYY-MM-DD). Si es null, está pendiente
  fechaFinalizacion: text("fecha_finalizacion"),
});

// ==========================================
// TIPOS TYPESCRIPT INFERIDOS AUTOMÁTICAMENTE
// ==========================================
// Tipo para representar un cliente ya guardado (con su 'id' asignado)
export type Cliente = typeof clientes.$inferSelect;

// Tipo para insertar un cliente nuevo (el 'id' es opcional porque se autogenera)
export type NuevoCliente = typeof clientes.$inferInsert;

// Tipo para representar una actividad existente
export type Actividad = typeof actividades.$inferSelect;

// Tipo para insertar una nueva actividad
export type NuevaActividad = typeof actividades.$inferInsert;
