// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: basedatos/esquema.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================
//
// [DEFENSA PARCIAL] ¿Dónde se definen las tablas? En este archivo.
// [DEFENSA PARCIAL] ¿Cómo se guardan los importes? Se guardan en CENTAVOS (números enteros),
// nunca flotantes, para evitar errores de redondeo financiero (ej: $10,50 se guarda como 1050).
// [DEFENSA PARCIAL] ¿La existencia de stock se guarda o se calcula? Se guarda en 'existencia' en productos
// y cada cambio queda auditado en 'movimientos_stock'.
// [DEFENSA PARCIAL] ¿Y el saldo de un cliente? Se calcula sumando débitos y restando créditos.
//

// Esquema de la base de datos (Drizzle ORM).
// Acá se definen TODAS las tablas del sistema. Si se agrega un campo, se cambia acá
// y después se corre "pnpm run db:generate" para crear la migración.
// Acá importamos funciones y operadores de Drizzle ORM para interactuar con la base de datos
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
// Acá importamos funciones y operadores de Drizzle ORM para interactuar con la base de datos
import { sql } from "drizzle-orm";

// Fecha de creación que todas las tablas comparten (se completa sola al insertar).
const fechaCreacion = () =>
  integer("creado_en", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

// ---------- Usuarios ----------
export const usuarios = sqliteTable("usuarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  nombre: text("nombre").notNull(),
  hashContrasena: text("hash_contrasena").notNull(),
  rol: text("rol", { enum: ["admin", "vendedor"] }).notNull(),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  creadoEn: fechaCreacion(),
});

// ---------- Categorías ----------
export const categorias = sqliteTable("categorias", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull().unique(),
  activa: integer("activa", { mode: "boolean" }).notNull().default(true),
  creadoEn: fechaCreacion(),
});

// ---------- Productos ----------
// La existencia se guarda en el producto, pero SOLO la modifica moverStock()
// (servicios/stock.ts), que además graba el movimiento. Así siempre coinciden.
export const productos = sqliteTable("productos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  codigo: text("codigo").notNull().unique(),
  descripcion: text("descripcion").notNull(),
  categoriaId: integer("categoria_id")
    .notNull()
    .references(() => categorias.id),
  precio: integer("precio").notNull(), // en centavos
  existencia: integer("existencia").notNull().default(0),
  stockMinimo: integer("stock_minimo").notNull().default(0),
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  creadoEn: fechaCreacion(),
});

// ---------- Clientes ----------
// El saldo NO se guarda: se calcula sumando los movimientos de cuenta.
export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tipoDoc: text("tipo_doc", { enum: ["DNI", "CUIT"] }).notNull(),
  nroDoc: text("nro_doc").notNull().unique(), // se guarda solo con dígitos
  nombre: text("nombre").notNull(),
  domicilio: text("domicilio"),
  telefono: text("telefono"),
  email: text("email"),
  cuentaCorriente: integer("cuenta_corriente", { mode: "boolean" }).notNull().default(false),
  limiteCredito: integer("limite_credito"), // en centavos; null = sin límite
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  creadoEn: fechaCreacion(),
});

// ---------- Facturas ----------
export const facturas = sqliteTable(
  "facturas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    puntoVenta: integer("punto_venta").notNull(),
    numero: integer("numero").notNull(),
    fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
    clienteId: integer("cliente_id").references(() => clientes.id), // null = consumidor final
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    total: integer("total").notNull(), // en centavos
    formaPago: text("forma_pago", { enum: ["contado", "tarjeta", "cuenta_corriente"] }).notNull(),
    montoRecibido: integer("monto_recibido"), // solo contado
    tarjetaTipo: text("tarjeta_tipo", { enum: ["debito", "credito"] }), // solo tarjeta
    tarjetaMarca: text("tarjeta_marca"),
    tarjetaUltimos4: text("tarjeta_ultimos4"), // NUNCA el número completo
    estado: text("estado", { enum: ["emitida", "anulada"] }).notNull().default("emitida"),
    motivoAnulacion: text("motivo_anulacion"),
    fechaAnulacion: integer("fecha_anulacion", { mode: "timestamp_ms" }),
    usuarioAnulacionId: integer("usuario_anulacion_id").references(() => usuarios.id),
    creadoEn: fechaCreacion(),
  },
  (tabla) => [
    // No puede haber dos facturas con el mismo número en el mismo punto de venta.
    uniqueIndex("facturas_numero_unico").on(tabla.puntoVenta, tabla.numero),
  ],
);

// ---------- Renglones de factura ----------
// La descripción y el precio se COPIAN del catálogo: si el precio cambia después,
// la factura emitida no cambia (regla 3: el precio se congela).
export const facturaItems = sqliteTable("factura_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  facturaId: integer("factura_id")
    .notNull()
    .references(() => facturas.id),
  productoId: integer("producto_id")
    .notNull()
    .references(() => productos.id),
  codigo: text("codigo").notNull(),
  descripcion: text("descripcion").notNull(),
  cantidad: integer("cantidad").notNull(),
  precioUnitario: integer("precio_unitario").notNull(), // en centavos
  subtotal: integer("subtotal").notNull(), // en centavos
  creadoEn: fechaCreacion(),
});

// ---------- Movimientos de stock ----------
export const movimientosStock = sqliteTable("movimientos_stock", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productoId: integer("producto_id")
    .notNull()
    .references(() => productos.id),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id),
  facturaId: integer("factura_id").references(() => facturas.id), // solo venta / anulación
  tipo: text("tipo", { enum: ["venta", "anulacion", "ingreso", "egreso"] }).notNull(),
  cantidad: integer("cantidad").notNull(), // con signo: + entra, - sale
  existenciaResultante: integer("existencia_resultante").notNull(),
  motivo: text("motivo").notNull(),
  observacion: text("observacion"),
  fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
  creadoEn: fechaCreacion(),
});

// ---------- Pagos (recibos) ----------
export const pagos = sqliteTable(
  "pagos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    puntoVenta: integer("punto_venta").notNull(),
    numeroRecibo: integer("numero_recibo").notNull(),
    fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
    clienteId: integer("cliente_id")
      .notNull()
      .references(() => clientes.id),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    importe: integer("importe").notNull(), // en centavos
    medio: text("medio", { enum: ["efectivo", "transferencia", "tarjeta_debito"] }).notNull(),
    observacion: text("observacion"),
    creadoEn: fechaCreacion(),
  },
  (tabla) => [uniqueIndex("pagos_numero_unico").on(tabla.puntoVenta, tabla.numeroRecibo)],
);

// ---------- Movimientos de cuenta corriente ----------
// Saldo del cliente = suma de débitos - suma de créditos (regla 7).
export const movimientosCuenta = sqliteTable("movimientos_cuenta", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clienteId: integer("cliente_id")
    .notNull()
    .references(() => clientes.id),
  facturaId: integer("factura_id").references(() => facturas.id),
  pagoId: integer("pago_id").references(() => pagos.id),
  tipo: text("tipo", { enum: ["debito", "credito"] }).notNull(),
  importe: integer("importe").notNull(), // en centavos, siempre positivo
  descripcion: text("descripcion").notNull(),
  fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
  creadoEn: fechaCreacion(),
});

// Tipos útiles que se deducen de las tablas.
export type Usuario = typeof usuarios.$inferSelect;
export type Producto = typeof productos.$inferSelect;
export type Cliente = typeof clientes.$inferSelect;
export type Factura = typeof facturas.$inferSelect;
