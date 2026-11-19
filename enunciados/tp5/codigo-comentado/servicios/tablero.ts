// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: servicios/tablero.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Servicio del TABLERO DE INICIO (Dashboard). RF-T1, RF-T2, RF-T3.
// Devuelve en una sola respuesta los indicadores del día y del mes, las cuentas
// corrientes, los productos bajo stock mínimo, las ventas de los últimos 30 días,
// las ventas por forma de pago y los 5 productos más vendidos del mes.
// Acá importamos funciones y operadores de Drizzle ORM para interactuar con la base de datos
import { and, count, desc, eq, gte, lt, lte, sql } from "drizzle-orm";
// Acá importamos la conexión y definición de tablas de la base de datos
import { db } from "@/basedatos/conexion";
import {
  clientes,
  facturaItems,
  facturas,
  movimientosCuenta,
  productos,
} from "@/basedatos/esquema";
// Acá importamos formateadores de moneda (pesos argentinos $), fechas y números
import { diaArgentino, finDelDia, inicioDelDia } from "@/lib/formato";
import { type UsuarioSesion } from "./comunes";

export async function obtenerTablero(_usuario: UsuarioSesion) {
  const ahora = new Date();
  const hoyTexto = diaArgentino(ahora); // "AAAA-MM-DD" en hora de Argentina
  const primerDiaMesTexto = `${hoyTexto.slice(0, 7)}-01`;

  const desdeHoy = inicioDelDia(hoyTexto);
  const hastaHoy = finDelDia(hoyTexto);
  const desdeMes = inicioDelDia(primerDiaMesTexto);

  // 1. Ventas de HOY (solo facturas emitidas).
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

  // 2. Ventas del MES en curso (solo facturas emitidas).
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
  const ticketPromedio = cantidadMes > 0 ? Math.round(importeMes / cantidadMes) : 0;

  // 3. Cuentas corrientes: total adeudado y cantidad de clientes con saldo > 0.
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
  for (const fila of filasSaldos) {
    const saldo = Number(fila.saldo ?? 0);
    if (saldo > 0) {
      totalAdeudado += saldo;
      clientesConSaldo += 1;
    }
  }

  // 4. Cantidad de productos activos que están bajo el stock mínimo.
  const [{ cantidadBajoMinimo }] = await db
    .select({ cantidadBajoMinimo: count() })
    .from(productos)
    .where(and(eq(productos.activo, true), lt(productos.existencia, productos.stockMinimo)));

  // 5. Ventas diarias de los últimos 30 días (siempre 30 elementos, sin huecos).
  const listaUltimos30Dias: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const fechaDia = new Date(inicioDelDia(hoyTexto).getTime() - i * 86_400_000 + 12 * 3_600_000);
    listaUltimos30Dias.push(diaArgentino(fechaDia));
  }

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

  const importePorDia = new Map<string, number>();
  for (const dia of listaUltimos30Dias) importePorDia.set(dia, 0);
  for (const fac of facturasUltimos30Dias) {
    const diaFac = diaArgentino(fac.fecha);
    if (importePorDia.has(diaFac)) {
      importePorDia.set(diaFac, (importePorDia.get(diaFac) ?? 0) + fac.total);
    }
  }

  const ventasDiarias = listaUltimos30Dias.map((fecha) => ({
    fecha,
    importe: importePorDia.get(fecha) ?? 0,
  }));

  // 6. Ventas del mes por forma de pago (siempre las 3 formas).
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

  const mapaFormas = new Map<string, number>([
    ["contado", 0],
    ["tarjeta", 0],
    ["cuenta_corriente", 0],
  ]);
  for (const fila of filasPorForma) {
    mapaFormas.set(fila.forma, Number(fila.importe));
  }

  const porFormaDePago = (["contado", "tarjeta", "cuenta_corriente"] as const).map((forma) => ({
    forma,
    importe: mapaFormas.get(forma) ?? 0,
  }));

  // 7. Los 5 productos más vendidos del mes, ordenados por unidades vendidas (RF-T3).
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

export type DatosTablero = Awaited<ReturnType<typeof obtenerTablero>>;
