/* ==========================================================================
   ESQUEMA DE BASE DE DATOS RELACIONAL (DRIZZLE ORM)
   Define las 9 tablas oficiales del sistema comercial de la ferretería:
   1. usuarios: Empleados del comercio con sus roles ('admin' o 'vendedor') y contraseñas hasheadas.
   2. categorias: Rubros de artículos (Herramientas, Electricidad, Pinturas, etc.).
   3. productos: Catálogo de artículos con sus precios unitarios y existencias físicas.
   4. clientes: Compradores registrados con control de Cuenta Corriente y límite de crédito.
   5. facturas: Cabecera legal de comprobantes emitidos y anulados.
   6. facturaItems: Renglones individuales de cada venta con precios congelados inmutables.
   7. movimientosStock: Kardex histórico inalterable de auditoría de entradas y salidas de inventario.
   8. pagos: Recibos oficiales de cobranza para amortizar deudas de cuentas corrientes.
   9. movimientosCuenta: Libro diario contable de débitos (facturas) y créditos (recibos y notas de crédito).
   
   REGLAS MATEMÁTICAS FUNDAMENTALES:
   - TODOS los importes (precios, límites, débitos, créditos y totales) se guardan como NÚMEROS ENTEROS EN CENTAVOS
     para evitar imprecisiones de coma flotante IEEE 754 (ej: $ 1.500,50 se almacena como 150050).
   - Los números de factura y recibo son correlativos únicos por punto de venta con índice UNIQUE.
   ========================================================================== */

/* los import traen los tipos de columnas soportados por SQLite a través de Drizzle ORM:
   - sqliteTable: función para definir una tabla SQL
   - text: columna de tipo texto (VARCHAR / TEXT)
   - integer: columna de tipo entero (INTEGER / BIGINT)
   - uniqueIndex: crea un índice de unicidad para evitar duplicados a nivel de motor de BD */
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

/* importamos sql para ejecutar expresiones nativas como unixepoch() */
import { sql } from "drizzle-orm";

/* ==========================================================================
   FUNCIÓN AUXILIAR: fechaCreacion
   ¿Para qué sirve? Genera una columna común 'creado_en' que almacena la fecha y hora
   exacta en milisegundos (timestamp_ms) en que se insertó la fila.
   Usa 'unixepoch() * 1000' para que SQLite asigne la hora automáticamente por defecto.
   ========================================================================== */
const fechaCreacion = () =>
  integer("creado_en", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`);

/* ==========================================================================
   1. TABLA: usuarios
   Representa a los operarios del sistema (administradores y vendedores).
   ========================================================================== */
export const usuarios = sqliteTable("usuarios", {
  /* clave primaria entera autoincremental */
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  /* email único para login; no puede haber dos usuarios con el mismo correo */
  email: text("email").notNull().unique(),
  
  /* nombre completo del empleado */
  nombre: text("nombre").notNull(),
  
  /* hash criptográfico de la contraseña generado con bcryptjs (coste 10); NUNCA texto plano */
  hashContrasena: text("hash_contrasena").notNull(),
  
  /* rol del usuario: 'admin' (acceso total) o 'vendedor' (mostrador) */
  rol: text("rol", { enum: ["admin", "vendedor"] }).notNull(),
  
  /* bandera booleana de baja lógica: true = activo, false = deshabilitado */
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  
  /* fecha de alta en el sistema */
  creadoEn: fechaCreacion(),
});

/* ==========================================================================
   2. TABLA: categorias
   Rubros comerciales para agrupar y filtrar los productos en el catálogo.
   ========================================================================== */
export const categorias = sqliteTable("categorias", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  /* nombre del rubro (ej: 'Herramientas Manuales'); debe ser único */
  nombre: text("nombre").notNull().unique(),
  
  /* estado activo/inactivo para baja lógica */
  activa: integer("activa", { mode: "boolean" }).notNull().default(true),
  
  creadoEn: fechaCreacion(),
});

/* ==========================================================================
   3. TABLA: productos
   Catálogo de artículos comercializados en la ferretería.
   ========================================================================== */
export const productos = sqliteTable("productos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  /* código identificador de mostrador (ej: 'HE-001'); único y en mayúsculas */
  codigo: text("codigo").notNull().unique(),
  
  /* nombre y detalle comercial del artículo */
  descripcion: text("descripcion").notNull(),
  
  /* clave foránea vinculada a la tabla categorias (ON DELETE RESTRICT implícito) */
  categoriaId: integer("categoria_id")
    .notNull()
    .references(() => categorias.id),
  
  /* precio de venta unitario actual en CENTAVOS ENTEROS */
  precio: integer("precio").notNull(),
  
  /* stock físico actual en depósito; SOLO se actualiza a través de moverStock() */
  existencia: integer("existencia").notNull().default(0),
  
  /* umbral de reposición: si la existencia cae por debajo de este valor, salta la alerta */
  stockMinimo: integer("stock_minimo").notNull().default(0),
  
  /* baja lógica: false = dado de baja (no aparece en nueva venta pero no rompe facturas viejas) */
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  
  creadoEn: fechaCreacion(),
});

/* ==========================================================================
   4. TABLA: clientes
   Compradores habituales y clientes con cuenta corriente.
   ========================================================================== */
export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  /* tipo de documento oficial: DNI (personas físicas) o CUIT (empresas) */
  tipoDoc: text("tipo_doc", { enum: ["DNI", "CUIT"] }).notNull(),
  
  /* número de documento limpio sin puntos ni guiones; único en la base de datos */
  nroDoc: text("nro_doc").notNull().unique(),
  
  /* razón social o nombre y apellido del cliente */
  nombre: text("nombre").notNull(),
  
  /* dirección de entrega o domicilio fiscal */
  domicilio: text("domicilio"),
  
  /* número telefónico de contacto */
  telefono: text("telefono"),
  
  /* correo electrónico para envío de comprobantes */
  email: text("email"),
  
  /* habilita o deshabilita la compra a crédito (cuenta corriente) */
  cuentaCorriente: integer("cuenta_corriente", { mode: "boolean" }).notNull().default(false),
  
  /* tope máximo de deuda autorizada en centavos; null = sin límite de crédito */
  limiteCredito: integer("limite_credito"),
  
  /* baja lógica */
  activo: integer("activo", { mode: "boolean" }).notNull().default(true),
  
  creadoEn: fechaCreacion(),
});

/* ==========================================================================
   5. TABLA: facturas
   Cabecera de cada comprobante de venta emitido en el mostrador.
   ========================================================================== */
export const facturas = sqliteTable(
  "facturas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    
    /* número de punto de venta (por defecto 1 en ferretería) */
    puntoVenta: integer("punto_venta").notNull(),
    
    /* número correlativo sin huecos (ej: 42) */
    numero: integer("numero").notNull(),
    
    /* fecha y hora exacta en que se confirmó la venta */
    fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
    
    /* cliente vinculado; si es null representa una venta a Consumidor Final anónimo */
    clienteId: integer("cliente_id").references(() => clientes.id),
    
    /* vendedor que cobró la venta en mostrador */
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    
    /* importe final total facturado en centavos enteros */
    total: integer("total").notNull(),
    
    /* método de pago utilizado */
    formaPago: text("forma_pago", { enum: ["contado", "tarjeta", "cuenta_corriente"] }).notNull(),
    
    /* dinero en efectivo entregado por el comprador (para calcular el vuelto) */
    montoRecibido: integer("monto_recibido"),
    
    /* datos seguros de tarjeta (débito o crédito, marca y últimos 4 dígitos) */
    tarjetaTipo: text("tarjeta_tipo", { enum: ["debito", "credito"] }),
    tarjetaMarca: text("tarjeta_marca"),
    tarjetaUltimos4: text("tarjeta_ultimos4"),
    
    /* estado legal del comprobante: 'emitida' o 'anulada' */
    estado: text("estado", { enum: ["emitida", "anulada"] }).notNull().default("emitida"),
    
    /* motivo obligatorio en caso de anulación administrativa */
    motivoAnulacion: text("motivo_anulacion"),
    
    /* fecha exacta en que se anuló */
    fechaAnulacion: integer("fecha_anulacion", { mode: "timestamp_ms" }),
    
    /* usuario administrador que autorizó la anulación */
    usuarioAnulacionId: integer("usuario_anulacion_id").references(() => usuarios.id),
    
    creadoEn: fechaCreacion(),
  },
  (tabla) => [
    /* REGLA DE CORRELATIVIDAD:
       Garantiza a nivel de motor de base de datos que no puedan existir jamás
       dos facturas con el mismo número para el mismo punto de venta */
    uniqueIndex("facturas_numero_unico").on(tabla.puntoVenta, tabla.numero),
  ],
);

/* ==========================================================================
   6. TABLA: facturaItems
   Renglones de detalle de cada venta.
   REGLA DE CONGELAMIENTO HISTÓRICO DE PRECIOS:
   El precio unitario y la descripción se copian y fijan al momento de emitir la factura.
   Si mañana el producto sube de precio por inflación, esta factura no cambia su valor.
   ========================================================================== */
export const facturaItems = sqliteTable("factura_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  /* relación con la cabecera de la factura */
  facturaId: integer("factura_id")
    .notNull()
    .references(() => facturas.id),
  
  /* relación con el producto vendido */
  productoId: integer("producto_id")
    .notNull()
    .references(() => productos.id),
  
  /* código y descripción congelados al momento de la venta */
  codigo: text("codigo").notNull(),
  descripcion: text("descripcion").notNull(),
  
  /* unidades vendidas en este renglón */
  cantidad: integer("cantidad").notNull(),
  
  /* precio unitario histórico en centavos enteros */
  precioUnitario: integer("precio_unitario").notNull(),
  
  /* subtotal del renglón = cantidad * precioUnitario */
  subtotal: integer("subtotal").notNull(),
  
  creadoEn: fechaCreacion(),
});

/* ==========================================================================
   7. TABLA: movimientosStock (KARDEX DE INVENTARIO)
   Auditoría histórica de todos los movimientos de entrada y salida física de mercadería.
   ========================================================================== */
export const movimientosStock = sqliteTable("movimientos_stock", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  /* producto afectado */
  productoId: integer("producto_id")
    .notNull()
    .references(() => productos.id),
  
  /* usuario que ejecutó la operación */
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id),
  
  /* factura vinculada (solo presente en ventas y anulaciones; null en ingresos manuales) */
  facturaId: integer("factura_id").references(() => facturas.id),
  
  /* tipo de movimiento */
  tipo: text("tipo", { enum: ["venta", "anulacion", "ingreso", "egreso"] }).notNull(),
  
  /* cantidad con signo: positivo (+) entra stock, negativo (-) sale stock */
  cantidad: integer("cantidad").notNull(),
  
  /* saldo final exacto que quedó en depósito después de este movimiento */
  existenciaResultante: integer("existencia_resultante").notNull(),
  
  /* motivo explicativo obligatorio */
  motivo: text("motivo").notNull(),
  
  /* observaciones adicionales */
  observacion: text("observacion"),
  
  /* fecha y hora del movimiento */
  fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
  
  creadoEn: fechaCreacion(),
});

/* ==========================================================================
   8. TABLA: pagos (RECIBOS DE COBRANZA)
   Comprobantes de entrega de dinero para cancelar o amortizar cuentas corrientes.
   ========================================================================== */
export const pagos = sqliteTable(
  "pagos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    
    /* punto de venta oficial */
    puntoVenta: integer("punto_venta").notNull(),
    
    /* número correlativo del recibo (ej: 12) */
    numeroRecibo: integer("numero_recibo").notNull(),
    
    /* fecha del pago */
    fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
    
    /* cliente que realiza el pago */
    clienteId: integer("cliente_id")
      .notNull()
      .references(() => clientes.id),
    
    /* cajero o vendedor que recibió el dinero */
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    
    /* importe pagado en centavos enteros */
    importe: integer("importe").notNull(),
    
    /* medio utilizado: efectivo, transferencia bancaria o tarjeta de débito */
    medio: text("medio", { enum: ["efectivo", "transferencia", "tarjeta_debito"] }).notNull(),
    
    /* detalle u observación del pago */
    observacion: text("observacion"),
    
    creadoEn: fechaCreacion(),
  },
  (tabla) => [
    /* correlatividad única sin huecos para recibos */
    uniqueIndex("pagos_numero_unico").on(tabla.puntoVenta, tabla.numeroRecibo),
  ],
);

/* ==========================================================================
   9. TABLA: movimientosCuenta (EXTRACTO DE CUENTA CORRIENTE)
   Libro diario contable de los clientes.
   FÓRMULA INMUTABLE DE SALDO:
   Saldo = Σ (débitos por facturas) - Σ (créditos por recibos o anulaciones)
   ========================================================================== */
export const movimientosCuenta = sqliteTable("movimientos_cuenta", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  /* cliente titular de la cuenta corriente */
  clienteId: integer("cliente_id")
    .notNull()
    .references(() => clientes.id),
  
  /* factura que generó la deuda (solo en débitos) */
  facturaId: integer("factura_id").references(() => facturas.id),
  
  /* recibo que amortizó la deuda (solo en créditos de cobro) */
  pagoId: integer("pago_id").references(() => pagos.id),
  
  /* tipo contable: 'debito' (suma deuda) o 'credito' (resta deuda) */
  tipo: text("tipo", { enum: ["debito", "credito"] }).notNull(),
  
  /* importe de la transacción en centavos enteros (siempre positivo) */
  importe: integer("importe").notNull(),
  
  /* descripción que aparece en el extracto (ej: 'Factura 0001-00000045') */
  descripcion: text("descripcion").notNull(),
  
  /* fecha del movimiento */
  fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
  
  creadoEn: fechaCreacion(),
});

/* ==========================================================================
   TIPOS TYPESCRIPT INFERIDOS AUTOMÁTICAMENTE
   Permiten tipar fuertemente las respuestas en servicios y pantallas.
   ========================================================================== */
export type Usuario = typeof usuarios.$inferSelect;
export type Producto = typeof productos.$inferSelect;
export type Cliente = typeof clientes.$inferSelect;
export type Factura = typeof facturas.$inferSelect;
