/* ==========================================================================
   SERVICIO DE STOCK (CONTROL DE EXISTENCIAS Y KARDEX DE AUDITORÍA)
   Cumple con los requisitos funcionales RF-P4, RF-P5, RF-P6 y las Reglas 1 y 2 del TP5:
   
   REGLA DE ORO ARQUITECTÓNICA:
   La existencia de un producto en la base de datos SOLO puede cambiar a través de la función moverStock().
   Ni las ventas, ni las anulaciones, ni las compras, ni los ajustes manuales modifican "productos.existencia"
   por su propia cuenta. Todas delegan obligatoriamente en moverStock() para garantizar que jamás haya
   stock negativo y que todo movimiento quede asentado en el historial de auditoría (kardex).
   ========================================================================== */

/* los import son declaraciones que traen herramientas y funciones externas necesarias para operar:
   - and: operador lógico SQL para unir múltiples condiciones obligatorias (AND)
   - count: función agregada SQL para contar filas (COUNT(*))
   - desc: modificador de orden para ordenar de forma descendente (del más nuevo al más viejo)
   - eq: operador de igualdad SQL (=)
   - gte: operador de mayor o igual SQL (>=)
   - lte: operador de menor o igual SQL (<=)
   - sql: función especial de Drizzle para escribir fragmentos de código SQL nativo seguro */
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";

/* importamos la conexión estándar a la base de datos (db) y el tipo de dato Conexion (que sirve tanto para la db como para transacciones tx) */
import { db, type Conexion } from "@/basedatos/conexion";

/* importamos las tablas del esquema relacional que vamos a consultar o modificar */
import { facturas, movimientosStock, productos, usuarios } from "@/basedatos/esquema";

/* importamos el esquema de validación Zod que comprueba los datos al cargar un ajuste manual de stock */
import { esquemaMovimientoStock } from "@/esquemas/productos";

/* importamos utilidades de formateo de fechas y números de comprobante */
import { finDelDia, formatearNumeroFactura, inicioDelDia } from "@/lib/formato";

/* importamos la clase para arrojar errores HTTP personalizados y la función de ayuda para errores 404 */
import { ApiError, noEncontrado } from "./errores";

/* importamos utilidades comunes: exigirAdmin para restringir permisos, leerPaginacion para calcular páginas,
   respuestaPaginada para devolver la estructura con total y páginas, validar para aplicar Zod, y el tipo UsuarioSesion */
import { exigirAdmin, leerPaginacion, respuestaPaginada, validar, type UsuarioSesion } from "./comunes";

/* definimos el tipo de datos literal TipoMovimiento que restringe los únicos 4 tipos de movimientos válidos */
type TipoMovimiento = "venta" | "anulacion" | "ingreso" | "egreso";

/* definimos la estructura del objeto que debe recibir la función moverStock:
   - productoId: número entero con el identificador del producto
   - cantidad: número con signo (positivo si entra mercadería, negativo si sale por venta o rotura)
   - tipo: tipo de operación ('venta', 'anulacion', 'ingreso', 'egreso')
   - motivo: explicación breve de por qué se mueve el stock
   - observacion: detalle opcional adicional
   - usuarioId: id del empleado que ejecutó la acción
   - facturaId: id de la factura vinculada si el movimiento fue originado por una venta o anulación
   - fecha: fecha opcional del movimiento (si no se pasa, toma la fecha y hora actual) */
type DatosMovimiento = {
  productoId: number;
  cantidad: number;
  tipo: TipoMovimiento;
  motivo: string;
  observacion?: string;
  usuarioId: number;
  facturaId?: number;
  fecha?: Date;
};

/* ==========================================================================
   FUNCIÓN CRÍTICA: moverStock
   ¿Para qué sirve? Modifica la existencia física de un producto y registra el kardex de auditoría.
   ¿Cómo funciona? Se ejecuta SIEMPRE dentro de una conexión transaccional 'tx'.
   Aplica la condición atómica 'existencia >= -cantidad' para que si dos vendedores cobran la última
   unidad al mismo milisegundo, el motor SQL frene al segundo vendedor evitando el stock negativo.
   ========================================================================== */
export async function moverStock(tx: Conexion, datos: DatosMovimiento) {
  /* ejecutamos una sentencia SQL UPDATE sobre la tabla productos:
     - set: suma algebraicamente la cantidad enviada a la existencia actual usando sql nativo (si cantidad es -2, existencia baja 2)
     - where: busca el producto por su id y, si la cantidad es negativa (salida), exige que la existencia sea mayor o igual al valor absoluto pedido
     - returning: devuelve inmediatamente el valor de la nueva existencia resultante tras el cambio */
  const filasModificadas = await tx
    .update(productos)
    .set({ existencia: sql`${productos.existencia} + ${datos.cantidad}` })
    .where(and(eq(productos.id, datos.productoId), gte(productos.existencia, -datos.cantidad)))
    .returning({ existencia: productos.existencia });

  /* si filasModificadas tiene longitud 0, significa que el UPDATE no afectó ninguna fila.
     esto ocurre porque el producto no existe o porque no había suficiente stock disponible para cumplir la condición gte */
  if (filasModificadas.length === 0) {
    /* consultamos a la base de datos el producto para saber su stock real actual y su nombre para el mensaje de error */
    const producto = await tx
      .select({ existencia: productos.existencia, descripcion: productos.descripcion })
      .from(productos)
      .where(eq(productos.id, datos.productoId))
      .get();
    
    /* si no se encontró el producto en el catálogo arrojamos un error 404 */
    if (!producto) throw noEncontrado("El producto");
    
    /* si existía pero no alcanzaba el stock, arrojamos un error 409 (Conflicto de concurrencia) con el detalle exacto */
    throw new ApiError(409, "STOCK_INSUFICIENTE", `No hay existencia suficiente de "${producto.descripcion}".`, [
      { productoId: datos.productoId, solicitado: -datos.cantidad, disponible: producto.existencia },
    ]);
  }

  /* recuperamos la existencia final que quedó grabada en la base de datos luego de la actualización */
  const existenciaResultante = filasModificadas[0].existencia;

  /* insertamos la fila correspondiente en el libro diario de inventario (tabla movimientosStock) para que quede registrado el historial */
  const [movimientoCreado] = await tx
    .insert(movimientosStock)
    .values({
      productoId: datos.productoId,
      usuarioId: datos.usuarioId,
      facturaId: datos.facturaId ?? null,
      tipo: datos.tipo,
      cantidad: datos.cantidad,
      existenciaResultante,
      motivo: datos.motivo,
      observacion: datos.observacion ?? null,
      fecha: datos.fecha ?? new Date(),
    })
    .returning();

  /* devolvemos el registro del movimiento recién creado */
  return movimientoCreado;
}

/* ==========================================================================
   RF-P4 y RF-P5: REGISTRAR MOVIMIENTO MANUAL (INGRESO O EGRESO)
   ¿Para qué sirve? Permite al administrador cargar ingresos por compras a proveedores
   o egresos por mercadería dañada, vencida o ajustes de inventario físico.
   ¿Quién puede hacerlo? Exclusivo para administradores (exigirAdmin).
   ========================================================================== */
export async function registrarMovimientoManual(
  usuario: UsuarioSesion,
  idProducto: number,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
  /* verificamos que el usuario tenga rol de administrador. Si es un vendedor común, rechaza con error 403 */
  exigirAdmin(usuario);

  /* validamos con Zod que el formulario tenga tipo, motivo y cantidad positiva válida */
  const datos = validar(esquemaMovimientoStock, datosSinValidar);

  /* calculamos el signo de la cantidad en el servidor para evitar manipulaciones:
     si es un ingreso queda positivo (+), si es un egreso lo multiplicamos por -1 para que reste */
  const cantidadConSigno = datos.tipo === "ingreso" ? datos.cantidad : -datos.cantidad;

  /* abrimos una transacción atómica para ejecutar la operación */
  const movimientoCreado = await db.transaction(async (tx) => {
    return moverStock(tx, {
      productoId: idProducto,
      cantidad: cantidadConSigno,
      tipo: datos.tipo,
      motivo: datos.motivo,
      observacion: datos.observacion,
      usuarioId: usuario.id,
      fecha: opciones.fecha,
    });
  });

  /* consultamos el movimiento recién registrado con todos sus joins (producto, usuario) para devolverlo al frontend */
  return buscarMovimientoPublico(movimientoCreado.id);
}

/* ==========================================================================
   RF-P6: LISTAR HISTORIAL DE UN PRODUCTO ESPECÍFICO
   ¿Para qué sirve? Permite ver la ficha de movimientos de un producto particular.
   Reutiliza la función general pasándole el productoId en los filtros.
   ========================================================================== */
export async function listarMovimientosDeProducto(
  usuario: UsuarioSesion,
  idProducto: number,
  parametros: { page?: string; pageSize?: string },
) {
  return listarMovimientosStock(usuario, { ...parametros, productoId: String(idProducto) });
}

/* definimos el tipo de datos para los filtros aplicables al historial de stock */
type FiltrosMovimientos = {
  productoId?: string;
  tipo?: string;
  desde?: string;
  hasta?: string;
  page?: string;
  pageSize?: string;
};

/* ==========================================================================
   RF-P6: LISTADO GENERAL PAGINADO DE MOVIMIENTOS DE STOCK
   ¿Para qué sirve? Permite auditar todos los ingresos, egresos y ventas de la ferretería
   filtrando por fechas, producto y tipo de operación.
   ========================================================================== */
export async function listarMovimientosStock(_usuario: UsuarioSesion, parametros: FiltrosMovimientos) {
  /* calculamos la página actual, el tamaño de página y el salto (offset) para SQL */
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  /* creamos un arreglo para ir acumulando las condiciones SQL de forma dinámica */
  const condiciones = [];

  /* si el usuario filtró por un producto específico, agregamos la condición WHERE productoId = ? */
  if (parametros.productoId) condiciones.push(eq(movimientosStock.productoId, Number(parametros.productoId)));
  
  /* si filtró por tipo ('venta', 'ingreso', etc.), agregamos la condición WHERE tipo = ? */
  if (parametros.tipo) condiciones.push(eq(movimientosStock.tipo, parametros.tipo as TipoMovimiento));
  
  /* si filtró por fecha desde, agregamos WHERE fecha >= inicioDelDia(desde) */
  if (parametros.desde) condiciones.push(gte(movimientosStock.fecha, inicioDelDia(parametros.desde)));
  
  /* si filtró por fecha hasta, agregamos WHERE fecha <= finDelDia(hasta) */
  if (parametros.hasta) condiciones.push(lte(movimientosStock.fecha, finDelDia(parametros.hasta)));
  
  /* unimos todas las condiciones con el operador AND */
  const filtro = and(...condiciones);

  /* ejecutamos la consulta principal trayendo las filas unidas con productos, usuarios y facturas */
  const filas = await consultaMovimientos()
    .where(filtro)
    .orderBy(desc(movimientosStock.fecha), desc(movimientosStock.id))
    .limit(tamanoPagina)
    .offset(salto);

  /* contamos cuántos movimientos en total cumplen con los filtros para saber el número total de páginas */
  const [{ total }] = await db.select({ total: count() }).from(movimientosStock).where(filtro);

  /* usamos .map(aMovimientoPublico) para transformar cada fila cruda de la base de datos en un objeto limpio para la vista */
  return respuestaPaginada(filas.map(aMovimientoPublico), pagina, tamanoPagina, total);
}

/* ==========================================================================
   FUNCIONES INTERNAS AUXILIARES
   ========================================================================== */

/* consultaMovimientos: centraliza el SELECT con los JOIN necesarios para no repetir código:
   - innerJoin con productos para obtener el código y nombre del producto
   - innerJoin con usuarios para saber qué vendedor o admin hizo el movimiento
   - leftJoin con facturas porque solo las ventas y anulaciones tienen factura asociada */
function consultaMovimientos() {
  return db
    .select({
      movimiento: movimientosStock,
      productoCodigo: productos.codigo,
      productoDescripcion: productos.descripcion,
      usuarioNombre: usuarios.nombre,
      facturaPuntoVenta: facturas.puntoVenta,
      facturaNumero: facturas.numero,
    })
    .from(movimientosStock)
    .innerJoin(productos, eq(movimientosStock.productoId, productos.id))
    .innerJoin(usuarios, eq(movimientosStock.usuarioId, usuarios.id))
    .leftJoin(facturas, eq(movimientosStock.facturaId, facturas.id));
}

/* tipo TypeScript que infiere la forma de una fila devuelta por la consulta base */
type FilaMovimiento = Awaited<ReturnType<ReturnType<typeof consultaMovimientos>["get"]>>;

/* aMovimientoPublico: formatea una fila de la base de datos para entregar una respuesta JSON limpia:
   si el movimiento tiene facturaId, formatea el número de factura legal (ej: '0001-00000045') */
function aMovimientoPublico(fila: NonNullable<FilaMovimiento>) {
  const { movimiento } = fila;
  
  /* si hay una factura vinculada, preparamos la referencia con su id y número formateado */
  const referencia =
    movimiento.facturaId && fila.facturaNumero !== null && fila.facturaPuntoVenta !== null
      ? {
          facturaId: movimiento.facturaId,
          numero: formatearNumeroFactura(fila.facturaPuntoVenta, fila.facturaNumero),
        }
      : null;

  /* devolvemos el objeto formateado */
  return {
    id: movimiento.id,
    producto: { id: movimiento.productoId, codigo: fila.productoCodigo, descripcion: fila.productoDescripcion },
    tipo: movimiento.tipo,
    cantidad: movimiento.cantidad,
    existenciaResultante: movimiento.existenciaResultante,
    motivo: movimiento.motivo,
    observacion: movimiento.observacion,
    referencia,
    usuario: { id: movimiento.usuarioId, nombre: fila.usuarioNombre },
    fecha: movimiento.fecha.toISOString(),
  };
}

/* buscarMovimientoPublico: busca un movimiento por su id específico */
async function buscarMovimientoPublico(idMovimiento: number) {
  const fila = await consultaMovimientos().where(eq(movimientosStock.id, idMovimiento)).get();
  if (!fila) throw noEncontrado("El movimiento");
  return aMovimientoPublico(fila);
}

/* exportamos el tipo TypeScript de un movimiento público para usarlo en tipados del frontend */
export type MovimientoPublico = ReturnType<typeof aMovimientoPublico>;
