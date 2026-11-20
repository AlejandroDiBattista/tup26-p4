// ══════════════════════════════════════════════════════════════════
// schema.ts — Definición del esquema de la base de datos
// ══════════════════════════════════════════════════════════════════
// Aquí definimos la estructura de las tablas usando Drizzle ORM.
// Drizzle nos permite escribir el esquema en TypeScript en vez de SQL
// puro, y luego lo traduce automáticamente a instrucciones SQLite.
// ══════════════════════════════════════════════════════════════════

// Importamos los constructores de Drizzle para tablas SQLite:
// - sqliteTable: crea una tabla SQLite
// - text: define una columna de tipo TEXT (cadena de texto)
// - integer: define una columna de tipo INTEGER (número entero)
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ── Tabla de Clientes ──────────────────────────────────────────────
// Cada fila representa un cliente del CRM.
// Los campos tienen valores por defecto vacíos ("") para que
// no sea obligatorio completar todos al crear un cliente.
export const clientes = sqliteTable("clientes", {
    // id: clave primaria autoincremental (se genera solo)
    id:        integer("id").primaryKey({ autoIncrement: true }),

    // nombre: nombre completo del cliente (obligatorio)
    nombre:    text("nombre").notNull(),

    // email: correo electrónico del cliente
    email:     text("email").notNull().default(""),

    // telefono: número de teléfono del cliente
    telefono:  text("telefono").notNull().default(""),

    // direccion: dirección postal del cliente
    direccion: text("direccion").notNull().default(""),

    // ciudad: ciudad donde reside el cliente
    ciudad:    text("ciudad").notNull().default(""),
});

// ── Tabla de Actividades ───────────────────────────────────────────
// Cada actividad pertenece a un cliente (relación 1 a muchos).
// Una actividad puede ser un compromiso pendiente o una completada.
export const actividades = sqliteTable("actividades", {
    // id: clave primaria autoincremental
    id:           integer("id").primaryKey({ autoIncrement: true }),

    // clienteId: referencia al cliente dueño de esta actividad.
    // "onDelete: cascade" significa que si se borra el cliente,
    // se borran automáticamente todas sus actividades.
    clienteId:    integer("cliente_id")
                    .notNull()
                    .references(() => clientes.id, { onDelete: "cascade" }),

    // descripcion: texto que describe la actividad (obligatorio)
    descripcion:  text("descripcion").notNull(),

    // fecha: fecha límite o programada (formato ISO "YYYY-MM-DD")
    // Puede ser null si no tiene fecha
    fecha:        text("fecha"),

    // completadaEl: fecha en que se completó la actividad.
    // Si es null, la actividad está pendiente (es un "compromiso").
    // Si tiene valor, la actividad ya fue completada.
    completadaEl: text("completada_el"),
});
