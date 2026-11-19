// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Servicio de STOCK. RF-P4, RF-P5, RF-P6. Reglas 1 y 2.
//
// REGLA DE ORO: la existencia de un producto SOLO cambia en moverStock().
// Ventas, anulaciones, ingresos y egresos llaman a esta función; ninguna otra
// parte del sistema modifica "productos.existencia" por su cuenta.
// [Línea 6] Importa elementos desde 'drizzle-orm'.
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
// [Línea 7] Importa elementos desde '@/basedatos/conexion'.
import { db, type Conexion } from "@/basedatos/conexion";
// [Línea 8] Importa elementos desde '@/basedatos/esquema'.
import { facturas, movimientosStock, productos, usuarios } from "@/basedatos/esquema";
// [Línea 9] Importa elementos desde '@/esquemas/productos'.
import { esquemaMovimientoStock } from "@/esquemas/productos";
// [Línea 10] Importa elementos desde '@/lib/formato'.
import { finDelDia, formatearNumeroFactura, inicioDelDia } from "@/lib/formato";
// [Línea 11] Importa elementos desde './errores'.
import { ApiError, noEncontrado } from "./errores";
// [Línea 12] Importa elementos desde './comunes'.
import { exigirAdmin, leerPaginacion, respuestaPaginada, validar, type UsuarioSesion } from "./comunes";

// [Línea 14] Define el tipo de datos 'TipoMovimiento' en TypeScript.
type TipoMovimiento = "venta" | "anulacion" | "ingreso" | "egreso";

// [Línea 16] Define el tipo de datos 'DatosMovimiento' en TypeScript.
type DatosMovimiento = {
  // [Línea 17] Define o asigna el campo/parámetro 'productoId'.
  productoId: number;
  // [Línea 18] Define o asigna el campo/parámetro 'cantidad'.
  cantidad: number; // con signo: positivo entra, negativo sale
  // [Línea 19] Define o asigna el campo/parámetro 'tipo'.
  tipo: TipoMovimiento;
  // [Línea 20] Define o asigna el campo/parámetro 'motivo'.
  motivo: string;
  // [Línea 21] Ejecuta o evalúa: observacion?: string;
  observacion?: string;
  // [Línea 22] Define o asigna el campo/parámetro 'usuarioId'.
  usuarioId: number;
  // [Línea 23] Ejecuta o evalúa: facturaId?: number;
  facturaId?: number;
  // [Línea 24] Ejecuta o evalúa: fecha?: Date;
  fecha?: Date;
// [Línea 25] Cierra el bloque o estructura (};).
};

// Regla 1 y 2: cambia la existencia y graba el movimiento, dentro de la transacción "tx".
// El UPDATE tiene la condición "existencia + cantidad >= 0": si otra venta se llevó
// la última unidad un instante antes, no se modifica ninguna fila y se aborta.
// [Línea 30] Declara la función asíncrona 'moverStock'.
export async function moverStock(tx: Conexion, datos: DatosMovimiento) {
  // [Línea 31] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filasModificadas'.
  const filasModificadas = await tx
    // [Línea 32] Actualiza las columnas de la tabla que cumplan la condición WHERE.
    .update(productos)
    // [Línea 33] Define las columnas y valores nuevos para el UPDATE.
    .set({ existencia: sql`${productos.existencia} + ${datos.cantidad}` })
    // [Línea 34] Aplica el filtro WHERE a la consulta SQL: .where(and(eq(productos.id, datos.productoId), gte(productos.existencia, -datos.cantidad)))
    .where(and(eq(productos.id, datos.productoId), gte(productos.existencia, -datos.cantidad)))
    // [Línea 35] Solicita que SQLite devuelva los datos de la fila recién insertada o actualizada.
    .returning({ existencia: productos.existencia });

  // [Línea 37] Verifica la condición: if (filasModificadas.length === 0) {
  if (filasModificadas.length === 0) {
    // [Línea 38] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'producto'.
    const producto = await tx
      // [Línea 39] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
      .select({ existencia: productos.existencia, descripcion: productos.descripcion })
      // [Línea 40] Define la tabla origen de la consulta SQL: .from(productos)
      .from(productos)
      // [Línea 41] Aplica el filtro WHERE a la consulta SQL: .where(eq(productos.id, datos.productoId))
      .where(eq(productos.id, datos.productoId))
      // [Línea 42] Ejecuta la consulta y obtiene una sola fila (o undefined si no hay coincidencias).
      .get();
    // [Línea 43] Verifica la condición: if (!producto) throw noEncontrado("El producto");
    if (!producto) throw noEncontrado("El producto");
    // [Línea 44] Corta la ejecución y lanza el error: throw new ApiError(409, "STOCK_INSUFICIENTE", `No hay existencia suficiente de "${producto.descripcion}".`, [
    throw new ApiError(409, "STOCK_INSUFICIENTE", `No hay existencia suficiente de "${producto.descripcion}".`, [
      // [Línea 45] Ejecuta o evalúa: { productoId: datos.productoId, solicitado: -datos.cantidad, disponible: product
      { productoId: datos.productoId, solicitado: -datos.cantidad, disponible: producto.existencia },
    // [Línea 46] Cierra el bloque o estructura (]);).
    ]);
  // [Línea 47] Cierra el bloque o estructura (}).
  }

  // [Línea 49] Declara 'existenciaResultante' y le asigna el valor resultante.
  const existenciaResultante = filasModificadas[0].existencia;

  // [Línea 51] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[movimientoCreado]'.
  const [movimientoCreado] = await tx
    // [Línea 52] Inserta una nueva fila en la tabla indicada de la base de datos.
    .insert(movimientosStock)
    // [Línea 53] Define los valores de las columnas a insertar.
    .values({
      // [Línea 54] Define o asigna el campo/parámetro 'productoId'.
      productoId: datos.productoId,
      // [Línea 55] Define o asigna el campo/parámetro 'usuarioId'.
      usuarioId: datos.usuarioId,
      // [Línea 56] Define o asigna el campo/parámetro 'facturaId'.
      facturaId: datos.facturaId ?? null,
      // [Línea 57] Define o asigna el campo/parámetro 'tipo'.
      tipo: datos.tipo,
      // [Línea 58] Define o asigna el campo/parámetro 'cantidad'.
      cantidad: datos.cantidad,
      // [Línea 59] Ejecuta o evalúa: existenciaResultante,
      existenciaResultante,
      // [Línea 60] Define o asigna el campo/parámetro 'motivo'.
      motivo: datos.motivo,
      // [Línea 61] Define o asigna el campo/parámetro 'observacion'.
      observacion: datos.observacion ?? null,
      // [Línea 62] Define o asigna el campo/parámetro 'fecha'.
      fecha: datos.fecha ?? new Date(),
    // [Línea 63] Cierra el bloque o estructura (})).
    })
    // [Línea 64] Solicita que SQLite devuelva los datos de la fila recién insertada o actualizada.
    .returning();

  // [Línea 66] Devuelve el valor: movimientoCreado;
  return movimientoCreado;
// [Línea 67] Cierra el bloque o estructura (}).
}

// RF-P4 y RF-P5: ingreso o egreso manual (solo administrador).
// "opciones.fecha" solo la usa el script de datos de prueba.
// [Línea 71] Declara la función asíncrona 'registrarMovimientoManual'.
export async function registrarMovimientoManual(
  // [Línea 72] Define o asigna el campo/parámetro 'usuario'.
  usuario: UsuarioSesion,
  // [Línea 73] Define o asigna el campo/parámetro 'idProducto'.
  idProducto: number,
  // [Línea 74] Define o asigna el campo/parámetro 'datosSinValidar'.
  datosSinValidar: unknown,
  // [Línea 75] Define o asigna el campo/parámetro 'opciones'.
  opciones: { fecha?: Date } = {},
// [Línea 76] Ejecuta o evalúa: ) {
) {
  // [Línea 77] Verifica en el servidor que el usuario sea 'admin'; si es 'vendedor' lanza 403 SIN_PERMISO.
  exigirAdmin(usuario);
  // [Línea 78] Declara 'datos' y le asigna el valor resultante.
  const datos = validar(esquemaMovimientoStock, datosSinValidar);

  // El signo lo pone el servidor: el ingreso suma y el egreso resta.
  // [Línea 81] Declara 'cantidadConSigno' y le asigna el valor resultante.
  const cantidadConSigno = datos.tipo === "ingreso" ? datos.cantidad : -datos.cantidad;

  // [Línea 83] Ejecuta una transacción atómica en la base de datos (todo o nada) y guarda el resultado en 'movimientoCreado'.
  const movimientoCreado = await db.transaction(async (tx) => {
    // [Línea 84] Devuelve el valor: moverStock(tx, {
    return moverStock(tx, {
      // [Línea 85] Define o asigna el campo/parámetro 'productoId'.
      productoId: idProducto,
      // [Línea 86] Define o asigna el campo/parámetro 'cantidad'.
      cantidad: cantidadConSigno,
      // [Línea 87] Define o asigna el campo/parámetro 'tipo'.
      tipo: datos.tipo,
      // [Línea 88] Define o asigna el campo/parámetro 'motivo'.
      motivo: datos.motivo,
      // [Línea 89] Define o asigna el campo/parámetro 'observacion'.
      observacion: datos.observacion,
      // [Línea 90] Define o asigna el campo/parámetro 'usuarioId'.
      usuarioId: usuario.id,
      // [Línea 91] Define o asigna el campo/parámetro 'fecha'.
      fecha: opciones.fecha,
    // [Línea 92] Cierra el bloque o estructura (});).
    });
  // [Línea 93] Cierra el bloque o estructura (});).
  });

  // [Línea 95] Devuelve el valor: buscarMovimientoPublico(movimientoCreado.id);
  return buscarMovimientoPublico(movimientoCreado.id);
// [Línea 96] Cierra el bloque o estructura (}).
}

// RF-P6: historial de un producto, del más nuevo al más viejo.
// [Línea 99] Declara la función asíncrona 'listarMovimientosDeProducto'.
export async function listarMovimientosDeProducto(
  // [Línea 100] Define o asigna el campo/parámetro 'usuario'.
  usuario: UsuarioSesion,
  // [Línea 101] Define o asigna el campo/parámetro 'idProducto'.
  idProducto: number,
  // [Línea 102] Define o asigna el campo/parámetro 'parametros'.
  parametros: { page?: string; pageSize?: string },
// [Línea 103] Ejecuta o evalúa: ) {
) {
  // [Línea 104] Devuelve el valor: listarMovimientosStock(usuario, { ...parametros, productoId: String(idProducto) });
  return listarMovimientosStock(usuario, { ...parametros, productoId: String(idProducto) });
// [Línea 105] Cierra el bloque o estructura (}).
}

// [Línea 107] Define el tipo de datos 'FiltrosMovimientos' en TypeScript.
type FiltrosMovimientos = {
  // [Línea 108] Ejecuta o evalúa: productoId?: string;
  productoId?: string;
  // [Línea 109] Ejecuta o evalúa: tipo?: string;
  tipo?: string;
  // [Línea 110] Ejecuta o evalúa: desde?: string;
  desde?: string;
  // [Línea 111] Ejecuta o evalúa: hasta?: string;
  hasta?: string;
  // [Línea 112] Ejecuta o evalúa: page?: string;
  page?: string;
  // [Línea 113] Ejecuta o evalúa: pageSize?: string;
  pageSize?: string;
// [Línea 114] Cierra el bloque o estructura (};).
};

// RF-P6: historial de todos los productos, con filtros.
// [Línea 117] Declara la función asíncrona 'listarMovimientosStock'.
export async function listarMovimientosStock(_usuario: UsuarioSesion, parametros: FiltrosMovimientos) {
  // [Línea 118] Declara '{ pagina, tamanoPagina, salto }' y le asigna el valor resultante.
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  // [Línea 120] Declara 'condiciones' y le asigna el valor resultante.
  const condiciones = [];
  // [Línea 121] Verifica la condición: if (parametros.productoId) condiciones.push(eq(movimientosStock.productoId, Number(parametros.productoId)));
  if (parametros.productoId) condiciones.push(eq(movimientosStock.productoId, Number(parametros.productoId)));
  // [Línea 122] Verifica la condición: if (parametros.tipo) condiciones.push(eq(movimientosStock.tipo, parametros.tipo as TipoMovimiento));
  if (parametros.tipo) condiciones.push(eq(movimientosStock.tipo, parametros.tipo as TipoMovimiento));
  // [Línea 123] Verifica la condición: if (parametros.desde) condiciones.push(gte(movimientosStock.fecha, inicioDelDia(parametros.desde)));
  if (parametros.desde) condiciones.push(gte(movimientosStock.fecha, inicioDelDia(parametros.desde)));
  // [Línea 124] Verifica la condición: if (parametros.hasta) condiciones.push(lte(movimientosStock.fecha, finDelDia(parametros.hasta)));
  if (parametros.hasta) condiciones.push(lte(movimientosStock.fecha, finDelDia(parametros.hasta)));
  // [Línea 125] Declara 'filtro' y le asigna el valor resultante.
  const filtro = and(...condiciones);

  // [Línea 127] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filas'.
  const filas = await consultaMovimientos()
    // [Línea 128] Aplica el filtro WHERE a la consulta SQL: .where(filtro)
    .where(filtro)
    // [Línea 129] Ordena las filas del resultado SQL: .orderBy(desc(movimientosStock.fecha), desc(movimientosStock.id))
    .orderBy(desc(movimientosStock.fecha), desc(movimientosStock.id))
    // [Línea 130] Limita la cantidad de filas por página: .limit(tamanoPagina)
    .limit(tamanoPagina)
    // [Línea 131] Desplaza el inicio de lectura según el número de página: .offset(salto);
    .offset(salto);
  // [Línea 132] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[{ total }]'.
  const [{ total }] = await db.select({ total: count() }).from(movimientosStock).where(filtro);

  // [Línea 134] Devuelve el valor: respuestaPaginada(filas.map(aMovimientoPublico), pagina, tamanoPagina, total);
  return respuestaPaginada(filas.map(aMovimientoPublico), pagina, tamanoPagina, total);
// [Línea 135] Cierra el bloque o estructura (}).
}

// ---------- Funciones internas ----------

// Consulta base: el movimiento con su producto, su usuario y la factura (si la hay).
// [Línea 140] Declara la función o componente 'consultaMovimientos'.
function consultaMovimientos() {
  // [Línea 141] Devuelve el valor: db
  return db
    // [Línea 142] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({
      // [Línea 143] Define o asigna el campo/parámetro 'movimiento'.
      movimiento: movimientosStock,
      // [Línea 144] Define o asigna el campo/parámetro 'productoCodigo'.
      productoCodigo: productos.codigo,
      // [Línea 145] Define o asigna el campo/parámetro 'productoDescripcion'.
      productoDescripcion: productos.descripcion,
      // [Línea 146] Define o asigna el campo/parámetro 'usuarioNombre'.
      usuarioNombre: usuarios.nombre,
      // [Línea 147] Define o asigna el campo/parámetro 'facturaPuntoVenta'.
      facturaPuntoVenta: facturas.puntoVenta,
      // [Línea 148] Define o asigna el campo/parámetro 'facturaNumero'.
      facturaNumero: facturas.numero,
    // [Línea 149] Cierra el bloque o estructura (})).
    })
    // [Línea 150] Define la tabla origen de la consulta SQL: .from(movimientosStock)
    .from(movimientosStock)
    // [Línea 151] Hace un INNER JOIN con otra tabla relacionada: .innerJoin(productos, eq(movimientosStock.productoId, productos.id))
    .innerJoin(productos, eq(movimientosStock.productoId, productos.id))
    // [Línea 152] Hace un INNER JOIN con otra tabla relacionada: .innerJoin(usuarios, eq(movimientosStock.usuarioId, usuarios.id))
    .innerJoin(usuarios, eq(movimientosStock.usuarioId, usuarios.id))
    // [Línea 153] Hace un LEFT JOIN opcional con otra tabla: .leftJoin(facturas, eq(movimientosStock.facturaId, facturas.id));
    .leftJoin(facturas, eq(movimientosStock.facturaId, facturas.id));
// [Línea 154] Cierra el bloque o estructura (}).
}

// [Línea 156] Define el tipo de datos 'FilaMovimiento' en TypeScript.
type FilaMovimiento = Awaited<ReturnType<ReturnType<typeof consultaMovimientos>["get"]>>;

// Arma el movimiento con la forma pública de la API (sección 11.4).
// [Línea 159] Declara la función o componente 'aMovimientoPublico'.
function aMovimientoPublico(fila: NonNullable<FilaMovimiento>) {
  // [Línea 160] Declara '{ movimiento }' y le asigna el valor resultante.
  const { movimiento } = fila;
  // [Línea 161] Declara 'referencia' y le asigna el valor resultante.
  const referencia =
    // [Línea 162] Ejecuta o evalúa: movimiento.facturaId && fila.facturaNumero !== null && fila.facturaPuntoVenta !=
    movimiento.facturaId && fila.facturaNumero !== null && fila.facturaPuntoVenta !== null
      // [Línea 163] Ejecuta o evalúa: ? {
      ? {
          // [Línea 164] Define o asigna el campo/parámetro 'facturaId'.
          facturaId: movimiento.facturaId,
          // [Línea 165] Define o asigna el campo/parámetro 'numero'.
          numero: formatearNumeroFactura(fila.facturaPuntoVenta, fila.facturaNumero),
        // [Línea 166] Cierra el bloque o estructura (}).
        }
      // [Línea 167] Ejecuta o evalúa: : null;
      : null;
  // [Línea 168] Devuelve el valor: {
  return {
    // [Línea 169] Define o asigna el campo/parámetro 'id'.
    id: movimiento.id,
    // [Línea 170] Define o asigna el campo/parámetro 'producto'.
    producto: { id: movimiento.productoId, codigo: fila.productoCodigo, descripcion: fila.productoDescripcion },
    // [Línea 171] Define o asigna el campo/parámetro 'tipo'.
    tipo: movimiento.tipo,
    // [Línea 172] Define o asigna el campo/parámetro 'cantidad'.
    cantidad: movimiento.cantidad,
    // [Línea 173] Define o asigna el campo/parámetro 'existenciaResultante'.
    existenciaResultante: movimiento.existenciaResultante,
    // [Línea 174] Define o asigna el campo/parámetro 'motivo'.
    motivo: movimiento.motivo,
    // [Línea 175] Define o asigna el campo/parámetro 'observacion'.
    observacion: movimiento.observacion,
    // [Línea 176] Ejecuta o evalúa: referencia,
    referencia,
    // [Línea 177] Define o asigna el campo/parámetro 'usuario'.
    usuario: { id: movimiento.usuarioId, nombre: fila.usuarioNombre },
    // [Línea 178] Define o asigna el campo/parámetro 'fecha'.
    fecha: movimiento.fecha.toISOString(),
  // [Línea 179] Cierra el bloque o estructura (};).
  };
// [Línea 180] Cierra el bloque o estructura (}).
}

// [Línea 182] Declara la función asíncrona 'buscarMovimientoPublico'.
async function buscarMovimientoPublico(idMovimiento: number) {
  // [Línea 183] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'fila'.
  const fila = await consultaMovimientos().where(eq(movimientosStock.id, idMovimiento)).get();
  // [Línea 184] Verifica la condición: if (!fila) throw noEncontrado("El movimiento");
  if (!fila) throw noEncontrado("El movimiento");
  // [Línea 185] Devuelve el valor: aMovimientoPublico(fila);
  return aMovimientoPublico(fila);
// [Línea 186] Cierra el bloque o estructura (}).
}

// [Línea 188] Define el tipo de datos 'MovimientoPublico' en TypeScript.
export type MovimientoPublico = ReturnType<typeof aMovimientoPublico>;
