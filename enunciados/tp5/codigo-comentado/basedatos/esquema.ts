// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Esquema de la base de datos (Drizzle ORM).
// Acá se definen TODAS las tablas del sistema. Si se agrega un campo, se cambia acá
// y después se corre "pnpm run db:generate" para crear la migración.
// [Línea 4] Importa elementos desde 'drizzle-orm/sqlite-core'.
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
// [Línea 5] Importa elementos desde 'drizzle-orm'.
import { sql } from "drizzle-orm";

// Fecha de creación que todas las tablas comparten (se completa sola al insertar).
// [Línea 8] Declara 'fechaCreacion' y le asigna el valor resultante.
const fechaCreacion = () =>
  // [Línea 9] Ejecuta o evalúa: integer("creado_en", { mode: "timestamp_ms" })
  integer("creado_en", { mode: "timestamp_ms" })
    // [Línea 10] Ejecuta o evalúa: .notNull()
    .notNull()
    // [Línea 11] Ejecuta o evalúa: .default(sql`(unixepoch() * 1000)`);
    .default(sql`(unixepoch() * 1000)`);

// ---------- Usuarios ----------
// [Línea 14] Define y exporta la tabla 'usuarios' del esquema SQLite/Turso con Drizzle ORM.
export const usuarios = sqliteTable("usuarios", {
  // [Línea 15] Define o asigna el campo/parámetro 'id'.
  id: integer("id").primaryKey({ autoIncrement: true }),
  // [Línea 16] Define o asigna el campo/parámetro 'email'.
  email: text("email").notNull().unique(),
  // [Línea 17] Define o asigna el campo/parámetro 'nombre'.
  nombre: text("nombre").notNull(),
  // [Línea 18] Define o asigna el campo/parámetro 'hashContrasena'.
  hashContrasena: text("hash_contrasena").notNull(),
  // [Línea 19] Define o asigna el campo/parámetro 'rol'.
  rol: text("rol", { enum: ["admin", "vendedor"] }).notNull(),
  // [Línea 20] Define o asigna el campo/parámetro 'activo'.
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  // [Línea 21] Define o asigna el campo/parámetro 'creadoEn'.
  creadoEn: fechaCreacion(),
// [Línea 22] Cierra el bloque o estructura (});).
});

// ---------- Categorías ----------
// [Línea 25] Define y exporta la tabla 'categorias' del esquema SQLite/Turso con Drizzle ORM.
export const categorias = sqliteTable("categorias", {
  // [Línea 26] Define o asigna el campo/parámetro 'id'.
  id: integer("id").primaryKey({ autoIncrement: true }),
  // [Línea 27] Define o asigna el campo/parámetro 'nombre'.
  nombre: text("nombre").notNull().unique(),
  // [Línea 28] Define o asigna el campo/parámetro 'activa'.
  activa: integer("activa", { mode: "boolean" }).notNull().default(true),
  // [Línea 29] Define o asigna el campo/parámetro 'creadoEn'.
  creadoEn: fechaCreacion(),
// [Línea 30] Cierra el bloque o estructura (});).
});

// ---------- Productos ----------
// La existencia se guarda en el producto, pero SOLO la modifica moverStock()
// (servicios/stock.ts), que además graba el movimiento. Así siempre coinciden.
// [Línea 35] Define y exporta la tabla 'productos' del esquema SQLite/Turso con Drizzle ORM.
export const productos = sqliteTable("productos", {
  // [Línea 36] Define o asigna el campo/parámetro 'id'.
  id: integer("id").primaryKey({ autoIncrement: true }),
  // [Línea 37] Define o asigna el campo/parámetro 'codigo'.
  codigo: text("codigo").notNull().unique(),
  // [Línea 38] Define o asigna el campo/parámetro 'descripcion'.
  descripcion: text("descripcion").notNull(),
  // [Línea 39] Define o asigna el campo/parámetro 'categoriaId'.
  categoriaId: integer("categoria_id")
    // [Línea 40] Ejecuta o evalúa: .notNull()
    .notNull()
    // [Línea 41] Ejecuta o evalúa: .references(() => categorias.id),
    .references(() => categorias.id),
  // [Línea 42] Define o asigna el campo/parámetro 'precio'.
  precio: integer("precio").notNull(), // en centavos
  // [Línea 43] Define o asigna el campo/parámetro 'existencia'.
  existencia: integer("existencia").notNull().default(0),
  // [Línea 44] Define o asigna el campo/parámetro 'stockMinimo'.
  stockMinimo: integer("stock_minimo").notNull().default(0),
  // [Línea 45] Define o asigna el campo/parámetro 'activo'.
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  // [Línea 46] Define o asigna el campo/parámetro 'creadoEn'.
  creadoEn: fechaCreacion(),
// [Línea 47] Cierra el bloque o estructura (});).
});

// ---------- Clientes ----------
// El saldo NO se guarda: se calcula sumando los movimientos de cuenta.
// [Línea 51] Define y exporta la tabla 'clientes' del esquema SQLite/Turso con Drizzle ORM.
export const clientes = sqliteTable("clientes", {
  // [Línea 52] Define o asigna el campo/parámetro 'id'.
  id: integer("id").primaryKey({ autoIncrement: true }),
  // [Línea 53] Define o asigna el campo/parámetro 'tipoDoc'.
  tipoDoc: text("tipo_doc", { enum: ["DNI", "CUIT"] }).notNull(),
  // [Línea 54] Define o asigna el campo/parámetro 'nroDoc'.
  nroDoc: text("nro_doc").notNull().unique(), // se guarda solo con dígitos
  // [Línea 55] Define o asigna el campo/parámetro 'nombre'.
  nombre: text("nombre").notNull(),
  // [Línea 56] Define o asigna el campo/parámetro 'domicilio'.
  domicilio: text("domicilio"),
  // [Línea 57] Define o asigna el campo/parámetro 'telefono'.
  telefono: text("telefono"),
  // [Línea 58] Define o asigna el campo/parámetro 'email'.
  email: text("email"),
  // [Línea 59] Define o asigna el campo/parámetro 'cuentaCorriente'.
  cuentaCorriente: integer("cuenta_corriente", { mode: "boolean" }).notNull().default(false),
  // [Línea 60] Define o asigna el campo/parámetro 'limiteCredito'.
  limiteCredito: integer("limite_credito"), // en centavos; null = sin límite
  // [Línea 61] Define o asigna el campo/parámetro 'activo'.
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  // [Línea 62] Define o asigna el campo/parámetro 'creadoEn'.
  creadoEn: fechaCreacion(),
// [Línea 63] Cierra el bloque o estructura (});).
});

// ---------- Facturas ----------
// [Línea 66] Define y exporta la tabla 'facturas' del esquema SQLite/Turso con Drizzle ORM.
export const facturas = sqliteTable(
  // [Línea 67] Ejecuta o evalúa: "facturas",
  "facturas",
  // [Línea 68] Ejecuta o evalúa: {
  {
    // [Línea 69] Define o asigna el campo/parámetro 'id'.
    id: integer("id").primaryKey({ autoIncrement: true }),
    // [Línea 70] Define o asigna el campo/parámetro 'puntoVenta'.
    puntoVenta: integer("punto_venta").notNull(),
    // [Línea 71] Define o asigna el campo/parámetro 'numero'.
    numero: integer("numero").notNull(),
    // [Línea 72] Define o asigna el campo/parámetro 'fecha'.
    fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
    // [Línea 73] Define o asigna el campo/parámetro 'clienteId'.
    clienteId: integer("cliente_id").references(() => clientes.id), // null = consumidor final
    // [Línea 74] Define o asigna el campo/parámetro 'usuarioId'.
    usuarioId: integer("usuario_id")
      // [Línea 75] Ejecuta o evalúa: .notNull()
      .notNull()
      // [Línea 76] Ejecuta o evalúa: .references(() => usuarios.id),
      .references(() => usuarios.id),
    // [Línea 77] Define o asigna el campo/parámetro 'total'.
    total: integer("total").notNull(), // en centavos
    // [Línea 78] Define o asigna el campo/parámetro 'formaPago'.
    formaPago: text("forma_pago", { enum: ["contado", "tarjeta", "cuenta_corriente"] }).notNull(),
    // [Línea 79] Define o asigna el campo/parámetro 'montoRecibido'.
    montoRecibido: integer("monto_recibido"), // solo contado
    // [Línea 80] Define o asigna el campo/parámetro 'tarjetaTipo'.
    tarjetaTipo: text("tarjeta_tipo", { enum: ["debito", "credito"] }), // solo tarjeta
    // [Línea 81] Define o asigna el campo/parámetro 'tarjetaMarca'.
    tarjetaMarca: text("tarjeta_marca"),
    // [Línea 82] Define o asigna el campo/parámetro 'tarjetaUltimos4'.
    tarjetaUltimos4: text("tarjeta_ultimos4"), // NUNCA el número completo
    // [Línea 83] Define o asigna el campo/parámetro 'estado'.
    estado: text("estado", { enum: ["emitida", "anulada"] }).notNull().default("emitida"),
    // [Línea 84] Define o asigna el campo/parámetro 'motivoAnulacion'.
    motivoAnulacion: text("motivo_anulacion"),
    // [Línea 85] Define o asigna el campo/parámetro 'fechaAnulacion'.
    fechaAnulacion: integer("fecha_anulacion", { mode: "timestamp_ms" }),
    // [Línea 86] Define o asigna el campo/parámetro 'usuarioAnulacionId'.
    usuarioAnulacionId: integer("usuario_anulacion_id").references(() => usuarios.id),
    // [Línea 87] Define o asigna el campo/parámetro 'creadoEn'.
    creadoEn: fechaCreacion(),
  // [Línea 88] Cierra el bloque o estructura (},).
  },
  // [Línea 89] Ejecuta o evalúa: (tabla) => [
  (tabla) => [
    // No puede haber dos facturas con el mismo número en el mismo punto de venta.
    // [Línea 91] Ejecuta o evalúa: uniqueIndex("facturas_numero_unico").on(tabla.puntoVenta, tabla.numero),
    uniqueIndex("facturas_numero_unico").on(tabla.puntoVenta, tabla.numero),
  // [Línea 92] Ejecuta o evalúa: ],
  ],
// [Línea 93] Cierra el bloque o estructura ();).
);

// ---------- Renglones de factura ----------
// La descripción y el precio se COPIAN del catálogo: si el precio cambia después,
// la factura emitida no cambia (regla 3: el precio se congela).
// [Línea 98] Define y exporta la tabla 'facturaItems' del esquema SQLite/Turso con Drizzle ORM.
export const facturaItems = sqliteTable("factura_items", {
  // [Línea 99] Define o asigna el campo/parámetro 'id'.
  id: integer("id").primaryKey({ autoIncrement: true }),
  // [Línea 100] Define o asigna el campo/parámetro 'facturaId'.
  facturaId: integer("factura_id")
    // [Línea 101] Ejecuta o evalúa: .notNull()
    .notNull()
    // [Línea 102] Ejecuta o evalúa: .references(() => facturas.id),
    .references(() => facturas.id),
  // [Línea 103] Define o asigna el campo/parámetro 'productoId'.
  productoId: integer("producto_id")
    // [Línea 104] Ejecuta o evalúa: .notNull()
    .notNull()
    // [Línea 105] Ejecuta o evalúa: .references(() => productos.id),
    .references(() => productos.id),
  // [Línea 106] Define o asigna el campo/parámetro 'codigo'.
  codigo: text("codigo").notNull(),
  // [Línea 107] Define o asigna el campo/parámetro 'descripcion'.
  descripcion: text("descripcion").notNull(),
  // [Línea 108] Define o asigna el campo/parámetro 'cantidad'.
  cantidad: integer("cantidad").notNull(),
  // [Línea 109] Define o asigna el campo/parámetro 'precioUnitario'.
  precioUnitario: integer("precio_unitario").notNull(), // en centavos
  // [Línea 110] Define o asigna el campo/parámetro 'subtotal'.
  subtotal: integer("subtotal").notNull(), // en centavos
  // [Línea 111] Define o asigna el campo/parámetro 'creadoEn'.
  creadoEn: fechaCreacion(),
// [Línea 112] Cierra el bloque o estructura (});).
});

// ---------- Movimientos de stock ----------
// [Línea 115] Define y exporta la tabla 'movimientosStock' del esquema SQLite/Turso con Drizzle ORM.
export const movimientosStock = sqliteTable("movimientos_stock", {
  // [Línea 116] Define o asigna el campo/parámetro 'id'.
  id: integer("id").primaryKey({ autoIncrement: true }),
  // [Línea 117] Define o asigna el campo/parámetro 'productoId'.
  productoId: integer("producto_id")
    // [Línea 118] Ejecuta o evalúa: .notNull()
    .notNull()
    // [Línea 119] Ejecuta o evalúa: .references(() => productos.id),
    .references(() => productos.id),
  // [Línea 120] Define o asigna el campo/parámetro 'usuarioId'.
  usuarioId: integer("usuario_id")
    // [Línea 121] Ejecuta o evalúa: .notNull()
    .notNull()
    // [Línea 122] Ejecuta o evalúa: .references(() => usuarios.id),
    .references(() => usuarios.id),
  // [Línea 123] Define o asigna el campo/parámetro 'facturaId'.
  facturaId: integer("factura_id").references(() => facturas.id), // solo venta / anulación
  // [Línea 124] Define o asigna el campo/parámetro 'tipo'.
  tipo: text("tipo", { enum: ["venta", "anulacion", "ingreso", "egreso"] }).notNull(),
  // [Línea 125] Define o asigna el campo/parámetro 'cantidad'.
  cantidad: integer("cantidad").notNull(), // con signo: + entra, - sale
  // [Línea 126] Define o asigna el campo/parámetro 'existenciaResultante'.
  existenciaResultante: integer("existencia_resultante").notNull(),
  // [Línea 127] Define o asigna el campo/parámetro 'motivo'.
  motivo: text("motivo").notNull(),
  // [Línea 128] Define o asigna el campo/parámetro 'observacion'.
  observacion: text("observacion"),
  // [Línea 129] Define o asigna el campo/parámetro 'fecha'.
  fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
  // [Línea 130] Define o asigna el campo/parámetro 'creadoEn'.
  creadoEn: fechaCreacion(),
// [Línea 131] Cierra el bloque o estructura (});).
});

// ---------- Pagos (recibos) ----------
// [Línea 134] Define y exporta la tabla 'pagos' del esquema SQLite/Turso con Drizzle ORM.
export const pagos = sqliteTable(
  // [Línea 135] Ejecuta o evalúa: "pagos",
  "pagos",
  // [Línea 136] Ejecuta o evalúa: {
  {
    // [Línea 137] Define o asigna el campo/parámetro 'id'.
    id: integer("id").primaryKey({ autoIncrement: true }),
    // [Línea 138] Define o asigna el campo/parámetro 'puntoVenta'.
    puntoVenta: integer("punto_venta").notNull(),
    // [Línea 139] Define o asigna el campo/parámetro 'numeroRecibo'.
    numeroRecibo: integer("numero_recibo").notNull(),
    // [Línea 140] Define o asigna el campo/parámetro 'fecha'.
    fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
    // [Línea 141] Define o asigna el campo/parámetro 'clienteId'.
    clienteId: integer("cliente_id")
      // [Línea 142] Ejecuta o evalúa: .notNull()
      .notNull()
      // [Línea 143] Ejecuta o evalúa: .references(() => clientes.id),
      .references(() => clientes.id),
    // [Línea 144] Define o asigna el campo/parámetro 'usuarioId'.
    usuarioId: integer("usuario_id")
      // [Línea 145] Ejecuta o evalúa: .notNull()
      .notNull()
      // [Línea 146] Ejecuta o evalúa: .references(() => usuarios.id),
      .references(() => usuarios.id),
    // [Línea 147] Define o asigna el campo/parámetro 'importe'.
    importe: integer("importe").notNull(), // en centavos
    // [Línea 148] Define o asigna el campo/parámetro 'medio'.
    medio: text("medio", { enum: ["efectivo", "transferencia", "tarjeta_debito"] }).notNull(),
    // [Línea 149] Define o asigna el campo/parámetro 'observacion'.
    observacion: text("observacion"),
    // [Línea 150] Define o asigna el campo/parámetro 'creadoEn'.
    creadoEn: fechaCreacion(),
  // [Línea 151] Cierra el bloque o estructura (},).
  },
  // [Línea 152] Ejecuta o evalúa: (tabla) => [uniqueIndex("pagos_numero_unico").on(tabla.puntoVenta, tabla.numeroR
  (tabla) => [uniqueIndex("pagos_numero_unico").on(tabla.puntoVenta, tabla.numeroRecibo)],
// [Línea 153] Cierra el bloque o estructura ();).
);

// ---------- Movimientos de cuenta corriente ----------
// Saldo del cliente = suma de débitos - suma de créditos (regla 7).
// [Línea 157] Define y exporta la tabla 'movimientosCuenta' del esquema SQLite/Turso con Drizzle ORM.
export const movimientosCuenta = sqliteTable("movimientos_cuenta", {
  // [Línea 158] Define o asigna el campo/parámetro 'id'.
  id: integer("id").primaryKey({ autoIncrement: true }),
  // [Línea 159] Define o asigna el campo/parámetro 'clienteId'.
  clienteId: integer("cliente_id")
    // [Línea 160] Ejecuta o evalúa: .notNull()
    .notNull()
    // [Línea 161] Ejecuta o evalúa: .references(() => clientes.id),
    .references(() => clientes.id),
  // [Línea 162] Define o asigna el campo/parámetro 'facturaId'.
  facturaId: integer("factura_id").references(() => facturas.id),
  // [Línea 163] Define o asigna el campo/parámetro 'pagoId'.
  pagoId: integer("pago_id").references(() => pagos.id),
  // [Línea 164] Define o asigna el campo/parámetro 'tipo'.
  tipo: text("tipo", { enum: ["debito", "credito"] }).notNull(),
  // [Línea 165] Define o asigna el campo/parámetro 'importe'.
  importe: integer("importe").notNull(), // en centavos, siempre positivo
  // [Línea 166] Define o asigna el campo/parámetro 'descripcion'.
  descripcion: text("descripcion").notNull(),
  // [Línea 167] Define o asigna el campo/parámetro 'fecha'.
  fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
  // [Línea 168] Define o asigna el campo/parámetro 'creadoEn'.
  creadoEn: fechaCreacion(),
// [Línea 169] Cierra el bloque o estructura (});).
});

// Tipos útiles que se deducen de las tablas.
// [Línea 172] Define el tipo de datos 'Usuario' en TypeScript.
export type Usuario = typeof usuarios.$inferSelect;
// [Línea 173] Define el tipo de datos 'Producto' en TypeScript.
export type Producto = typeof productos.$inferSelect;
// [Línea 174] Define el tipo de datos 'Cliente' en TypeScript.
export type Cliente = typeof clientes.$inferSelect;
// [Línea 175] Define el tipo de datos 'Factura' en TypeScript.
export type Factura = typeof facturas.$inferSelect;
