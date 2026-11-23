/* ==========================================================================
   SERVICIO DEL TABLERO DE CONTROL (DASHBOARD COMERCIAL)
   Cumple con los requisitos funcionales RF-T1, RF-T2 y RF-T3 del sistema:
   
   - RF-T1: Métricas clave en tiempo real (ventas del día, ventas del mes y ticket promedio).
   - RF-T2: Estado de cuentas corrientes (total adeudado y cantidad de deudores) y alerta de stock bajo mínimo.
   - RF-T3: Gráficos comerciales: evolución diaria de ventas de los últimos 30 días sin huecos,
     desglose porcentual por forma de pago (contado, tarjeta, cuenta corriente) y el ranking
     de los 5 productos más vendidos del mes ordenados por unidades vendidas.
   ========================================================================== */

/* los import traen operadores y funciones SQL de Drizzle ORM:
   - and: une condiciones lógicas con AND
   - count: cuenta la cantidad de registros (COUNT(*))
   - desc: ordena de mayor a menor (DESC)
   - eq: igualdad (=)
   - gte: mayor o igual (>=)
   - lt: menor estricto (<)
   - lte: menor o igual (<=)
   - sql: permite escribir agregaciones y expresiones nativas como COALESCE, SUM y CASE */
import { and, count, desc, eq, gte, lt, lte, sql } from "drizzle-orm";

/* importamos la conexión estándar 'db' a la base de datos */
import { db } from "@/basedatos/conexion";

/* importamos las tablas relacionales del esquema necesarias para consolidar el tablero */
import {
  clientes,
  facturaItems,
  facturas,
  movimientosCuenta,
  productos,
} from "@/basedatos/esquema";

/* importamos utilidades de formato de fechas en zona horaria argentina */
import { diaArgentino, finDelDia, inicioDelDia } from "@/lib/formato";

/* importamos el tipo UsuarioSesion */
import { type UsuarioSesion } from "./comunes";

/* ==========================================================================
   FUNCIÓN PRINCIPAL: obtenerTablero
   ¿Para qué sirve? Consolida en una única respuesta JSON todas las estadísticas,
   indicadores y datos para los gráficos del Dashboard de la pantalla principal.
   ========================================================================== */
export async function obtenerTablero(_usuario: UsuarioSesion) {
  /* capturamos la fecha actual del sistema */
  const ahora = new Date();

  /* convertimos la fecha al formato de texto "AAAA-MM-DD" en el huso horario oficial de Argentina */
  const hoyTexto = diaArgentino(ahora);

  /* calculamos el primer día del mes actual (ej: "2026-11-01") */
  const primerDiaMesTexto = `${hoyTexto.slice(0, 7)}-01`;

  /* definimos las marcas de tiempo exactas para los filtros:
     - desdeHoy: 00:00:00 del día de hoy
     - hastaHoy: 23:59:59 del día de hoy
     - desdeMes: 00:00:00 del primer día del mes */
  const desdeHoy = inicioDelDia(hoyTexto);
  const hastaHoy = finDelDia(hoyTexto);
  const desdeMes = inicioDelDia(primerDiaMesTexto);

  /* ----------------------------------------------------------------------
     1. MÉTRICAS DE VENTAS DE HOY
     Contamos la cantidad de facturas emitidas hoy y sumamos su importe total.
     Solo consideramos comprobantes con estado 'emitida' (las anuladas se excluyen).
     ---------------------------------------------------------------------- */
  const [resumenHoy] = await db
    .select({
      cantidad: count(),
      importe: sql<number>`coalesce(sum(${facturas.total}), 0)`,
    })
    .from(facturas)
    .where(
      and(
        eq(facturas.estado, "emitida"),
        gte(facturas.fecha, desdeHoy),
        lte(facturas.fecha, hastaHoy),
      ),
    );

  /* ----------------------------------------------------------------------
     2. MÉTRICAS DE VENTAS DEL MES EN CURSO
     Contamos las facturas emitidas desde el día 1 del mes y calculamos el ticket promedio.
     ---------------------------------------------------------------------- */
  const [resumenMes] = await db
    .select({
      cantidad: count(),
      importe: sql<number>`coalesce(sum(${facturas.total}), 0)`,
    })
    .from(facturas)
    .where(
      and(
        eq(facturas.estado, "emitida"),
        gte(facturas.fecha, desdeMes),
        lte(facturas.fecha, hastaHoy),
      ),
    );

  const cantidadMes = Number(resumenMes.cantidad);
  const importeMes = Number(resumenMes.importe);

  /* calculamos el ticket promedio: si hubo ventas en el mes, dividimos el importe total
     por la cantidad de facturas; si no hubo ventas, devolvemos 0 */
  const ticketPromedio = cantidadMes > 0 ? Math.round(importeMes / cantidadMes) : 0;

  /* ----------------------------------------------------------------------
     3. CUENTAS CORRIENTES: TOTAL ADEUDADO Y CANTIDAD DE CLIENTES DEUDORES
     Armamos una subconsulta SQL que agrupa por clienteId y calcula (débitos - créditos).
     Luego recorremos los saldos positivos para sumar la deuda global de la ferretería.
     ---------------------------------------------------------------------- */
  const subconsultaSaldos = db
    .select({
      clienteId: movimientosCuenta.clienteId,
      saldo: sql<number>`sum(case when ${movimientosCuenta.tipo} = 'debito' then ${movimientosCuenta.importe} else -${movimientosCuenta.importe} end)`.as(
        "saldo",
      ),
    })
    .from(movimientosCuenta)
    .innerJoin(clientes, eq(movimientosCuenta.clienteId, clientes.id))
    .where(eq(clientes.activo, true))
    .groupBy(movimientosCuenta.clienteId)
    .as("saldos_clientes");

  const filasSaldos = await db
    .select({ saldo: subconsultaSaldos.saldo })
    .from(subconsultaSaldos);

  let totalAdeudado = 0;
  let clientesConSaldo = 0;

  /* sumamos únicamente los saldos mayores a 0 (deuda real de clientes hacia la ferretería) */
  for (const fila of filasSaldos) {
    const saldo = Number(fila.saldo ?? 0);
    if (saldo > 0) {
      totalAdeudado += saldo;
      clientesConSaldo += 1;
    }
  }

  /* ----------------------------------------------------------------------
     4. PRODUCTOS BAJO STOCK MÍNIMO (ALERTA DE REPOSICIÓN)
     Contamos cuántos productos activos tienen una existencia menor a su stockMinimo.
     ---------------------------------------------------------------------- */
  const [{ cantidadBajoMinimo }] = await db
    .select({ cantidadBajoMinimo: count() })
    .from(productos)
    .where(and(eq(productos.activo, true), lt(productos.existencia, productos.stockMinimo)));

  /* ----------------------------------------------------------------------
     5. VENTAS DIARIAS DE LOS ÚLTIMOS 30 DÍAS (PARA EL GRÁFICO TEMPORAL)
     Para que el gráfico de líneas de Chart.js sea continuo y no tenga huecos los días
     que la ferretería no vendió o cerró, generamos primero un arreglo con las 30 fechas
     consecutivas y las inicializamos en $0 usando un Map en memoria.
     ---------------------------------------------------------------------- */
  const listaUltimos30Dias: string[] = [];
  for (let i = 29; i >= 0; i--) {
    /* restamos i días (86.400.000 ms) para obtener la fecha de cada uno de los últimos 30 días */
    const fechaDia = new Date(inicioDelDia(hoyTexto).getTime() - i * 86_400_000 + 12 * 3_600_000);
    listaUltimos30Dias.push(diaArgentino(fechaDia));
  }

  /* consultamos todas las facturas emitidas en los últimos 30 días */
  const desde30Dias = inicioDelDia(listaUltimos30Dias[0]);
  const facturasUltimos30Dias = await db
    .select({ fecha: facturas.fecha, total: facturas.total })
    .from(facturas)
    .where(
      and(
        eq(facturas.estado, "emitida"),
        gte(facturas.fecha, desde30Dias),
        lte(facturas.fecha, hastaHoy),
      ),
    );

  /* cargamos el mapa en memoria con valor inicial 0 para cada uno de los 30 días */
  const importePorDia = new Map<string, number>();
  for (const dia of listaUltimos30Dias) importePorDia.set(dia, 0);

  /* acumulamos el importe vendido en el día correspondiente */
  for (const fac of facturasUltimos30Dias) {
    const diaFac = diaArgentino(fac.fecha);
    if (importePorDia.has(diaFac)) {
      importePorDia.set(diaFac, (importePorDia.get(diaFac) ?? 0) + fac.total);
    }
  }

  /* convertimos el mapa en un arreglo de objetos { fecha, importe } listo para el gráfico */
  const ventasDiarias = listaUltimos30Dias.map((fecha) => ({
    fecha,
    importe: importePorDia.get(fecha) ?? 0,
  }));

  /* ----------------------------------------------------------------------
     6. VENTAS DEL MES POR FORMA DE PAGO (GRÁFICO DE TORTA / DOUGHNUT)
     Agrupamos las ventas del mes según la forma de pago (contado, tarjeta o cuenta corriente).
     Aseguramos que siempre estén presentes las 3 formas aunque alguna tenga $0.
     ---------------------------------------------------------------------- */
  const filasPorForma = await db
    .select({
      forma: facturas.formaPago,
      importe: sql<number>`coalesce(sum(${facturas.total}), 0)`,
    })
    .from(facturas)
    .where(
      and(
        eq(facturas.estado, "emitida"),
        gte(facturas.fecha, desdeMes),
        lte(facturas.fecha, hastaHoy),
      ),
    )
    .groupBy(facturas.formaPago);

  /* inicializamos las 3 formas en 0 */
  const mapaFormas = new Map<string, number>([
    ["contado", 0],
    ["tarjeta", 0],
    ["cuenta_corriente", 0],
  ]);

  for (const fila of filasPorForma) {
    mapaFormas.set(fila.forma, Number(fila.importe));
  }

  /* mapeamos a la estructura final */
  const porFormaDePago = (["contado", "tarjeta", "cuenta_corriente"] as const).map((forma) => ({
    forma,
    importe: mapaFormas.get(forma) ?? 0,
  }));

  /* ----------------------------------------------------------------------
     7. LOS 5 PRODUCTOS MÁS VENDIDOS DEL MES (RANKING RF-T3)
     Consultamos la tabla facturaItems haciendo un innerJoin con facturas (para filtrar por fecha y estado).
     Agrupamos por producto, sumamos las cantidades vendidas (unidades) y el importe acumulado,
     ordenamos de mayor a menor y limitamos a los 5 primeros (LIMIT 5).
     ---------------------------------------------------------------------- */
  const filasMasVendidos = await db
    .select({
      productoId: facturaItems.productoId,
      codigo: facturaItems.codigo,
      descripcion: facturaItems.descripcion,
      unidades: sql<number>`coalesce(sum(${facturaItems.cantidad}), 0)`.as("unidades"),
      importe: sql<number>`coalesce(sum(${facturaItems.subtotal}), 0)`.as("importe"),
    })
    .from(facturaItems)
    .innerJoin(facturas, eq(facturaItems.facturaId, facturas.id))
    .where(
      and(
        eq(facturas.estado, "emitida"),
        gte(facturas.fecha, desdeMes),
        lte(facturas.fecha, hastaHoy),
      ),
    )
    .groupBy(facturaItems.productoId, facturaItems.codigo, facturaItems.descripcion)
    .orderBy(desc(sql`unidades`), desc(sql`importe`))
    .limit(5);

  const masVendidos = filasMasVendidos.map((fila) => ({
    productoId: fila.productoId,
    codigo: fila.codigo,
    descripcion: fila.descripcion,
    unidades: Number(fila.unidades),
    importe: Number(fila.importe),
  }));

  /* consolidamos y devolvemos la estructura completa del tablero comercial */
  return {
    hoy: {
      cantidad: Number(resumenHoy.cantidad),
      importe: Number(resumenHoy.importe),
    },
    mes: {
      cantidad: cantidadMes,
      importe: importeMes,
      ticketPromedio,
    },
    cuentasCorrientes: {
      totalAdeudado,
      clientesConSaldo,
    },
    bajoMinimo: {
      cantidad: Number(cantidadBajoMinimo),
    },
    ventasDiarias,
    porFormaDePago,
    masVendidos,
  };
}

/* tipo TypeScript inferido para los datos devueltos por el tablero */
export type DatosTablero = Awaited<ReturnType<typeof obtenerTablero>>;
