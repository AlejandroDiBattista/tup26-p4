// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Servicio del TABLERO DE INICIO (Dashboard). RF-T1, RF-T2, RF-T3.
// Devuelve en una sola respuesta los indicadores del día y del mes, las cuentas
// corrientes, los productos bajo stock mínimo, las ventas de los últimos 30 días,
// las ventas por forma de pago y los 5 productos más vendidos del mes.
// [Línea 5] Importa elementos desde 'drizzle-orm'.
import { and, count, desc, eq, gte, lt, lte, sql } from "drizzle-orm";
// [Línea 6] Importa elementos desde '@/basedatos/conexion'.
import { db } from "@/basedatos/conexion";
// [Línea 7] Inicia un bloque de importación de dependencias.
import {
  // [Línea 8] Importa 'clientes' desde el módulo.
  clientes,
  // [Línea 9] Importa 'facturaItems' desde el módulo.
  facturaItems,
  // [Línea 10] Importa 'facturas' desde el módulo.
  facturas,
  // [Línea 11] Importa 'movimientosCuenta' desde el módulo.
  movimientosCuenta,
  // [Línea 12] Importa 'productos' desde el módulo.
  productos,
// [Línea 13] Cierra la lista de importaciones provenientes del módulo '@/basedatos/esquema'.
} from "@/basedatos/esquema";
// [Línea 14] Importa elementos desde '@/lib/formato'.
import { diaArgentino, finDelDia, inicioDelDia } from "@/lib/formato";
// [Línea 15] Importa elementos desde './comunes'.
import { type UsuarioSesion } from "./comunes";

// [Línea 17] Declara la función asíncrona 'obtenerTablero'.
export async function obtenerTablero(_usuario: UsuarioSesion) {
  // [Línea 18] Declara 'ahora' y le asigna el valor resultante.
  const ahora = new Date();
  // [Línea 19] Declara 'hoyTexto' y le asigna el valor resultante.
  const hoyTexto = diaArgentino(ahora); // "AAAA-MM-DD" en hora de Argentina
  // [Línea 20] Declara 'primerDiaMesTexto' y le asigna el valor resultante.
  const primerDiaMesTexto = `${hoyTexto.slice(0, 7)}-01`;

  // [Línea 22] Declara 'desdeHoy' y le asigna el valor resultante.
  const desdeHoy = inicioDelDia(hoyTexto);
  // [Línea 23] Declara 'hastaHoy' y le asigna el valor resultante.
  const hastaHoy = finDelDia(hoyTexto);
  // [Línea 24] Declara 'desdeMes' y le asigna el valor resultante.
  const desdeMes = inicioDelDia(primerDiaMesTexto);

  // 1. Ventas de HOY (solo facturas emitidas).
  // [Línea 27] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[resumenHoy]'.
  const [resumenHoy] = await db
    // [Línea 28] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({
      // [Línea 29] Define o asigna el campo/parámetro 'cantidad'.
      cantidad: count(),
      // [Línea 30] Define o asigna el campo/parámetro 'importe'.
      importe: sql<number>`coalesce(sum(${facturas.total}), 0)`,
    // [Línea 31] Cierra el bloque o estructura (})).
    })
    // [Línea 32] Define la tabla origen de la consulta SQL: .from(facturas)
    .from(facturas)
    // [Línea 33] Aplica el filtro WHERE a la consulta SQL: .where(
    .where(
      // [Línea 34] Ejecuta o evalúa: and(
      and(
        // [Línea 35] Ejecuta o evalúa: eq(facturas.estado, "emitida"),
        eq(facturas.estado, "emitida"),
        // [Línea 36] Ejecuta o evalúa: gte(facturas.fecha, desdeHoy),
        gte(facturas.fecha, desdeHoy),
        // [Línea 37] Ejecuta o evalúa: lte(facturas.fecha, hastaHoy),
        lte(facturas.fecha, hastaHoy),
      // [Línea 38] Cierra el bloque o estructura (),).
      ),
    // [Línea 39] Cierra el bloque o estructura ();).
    );

  // 2. Ventas del MES en curso (solo facturas emitidas).
  // [Línea 42] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[resumenMes]'.
  const [resumenMes] = await db
    // [Línea 43] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({
      // [Línea 44] Define o asigna el campo/parámetro 'cantidad'.
      cantidad: count(),
      // [Línea 45] Define o asigna el campo/parámetro 'importe'.
      importe: sql<number>`coalesce(sum(${facturas.total}), 0)`,
    // [Línea 46] Cierra el bloque o estructura (})).
    })
    // [Línea 47] Define la tabla origen de la consulta SQL: .from(facturas)
    .from(facturas)
    // [Línea 48] Aplica el filtro WHERE a la consulta SQL: .where(
    .where(
      // [Línea 49] Ejecuta o evalúa: and(
      and(
        // [Línea 50] Ejecuta o evalúa: eq(facturas.estado, "emitida"),
        eq(facturas.estado, "emitida"),
        // [Línea 51] Ejecuta o evalúa: gte(facturas.fecha, desdeMes),
        gte(facturas.fecha, desdeMes),
        // [Línea 52] Ejecuta o evalúa: lte(facturas.fecha, hastaHoy),
        lte(facturas.fecha, hastaHoy),
      // [Línea 53] Cierra el bloque o estructura (),).
      ),
    // [Línea 54] Cierra el bloque o estructura ();).
    );

  // [Línea 56] Declara 'cantidadMes' y le asigna el valor resultante.
  const cantidadMes = Number(resumenMes.cantidad);
  // [Línea 57] Declara 'importeMes' y le asigna el valor resultante.
  const importeMes = Number(resumenMes.importe);
  // [Línea 58] Declara 'ticketPromedio' y le asigna el valor resultante.
  const ticketPromedio = cantidadMes > 0 ? Math.round(importeMes / cantidadMes) : 0;

  // 3. Cuentas corrientes: total adeudado y cantidad de clientes con saldo > 0.
  // [Línea 61] Declara 'subconsultaSaldos' y le asigna el valor resultante.
  const subconsultaSaldos = db
    // [Línea 62] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({
      // [Línea 63] Define o asigna el campo/parámetro 'clienteId'.
      clienteId: movimientosCuenta.clienteId,
      // [Línea 64] Define o asigna el campo/parámetro 'saldo'.
      saldo: sql<number>`sum(case when ${movimientosCuenta.tipo} = 'debito' then ${movimientosCuenta.importe} else -${movimientosCuenta.importe} end)`.as(
        // [Línea 65] Ejecuta o evalúa: "saldo",
        "saldo",
      // [Línea 66] Cierra el bloque o estructura (),).
      ),
    // [Línea 67] Cierra el bloque o estructura (})).
    })
    // [Línea 68] Define la tabla origen de la consulta SQL: .from(movimientosCuenta)
    .from(movimientosCuenta)
    // [Línea 69] Hace un INNER JOIN con otra tabla relacionada: .innerJoin(clientes, eq(movimientosCuenta.clienteId, clientes.id))
    .innerJoin(clientes, eq(movimientosCuenta.clienteId, clientes.id))
    // [Línea 70] Aplica el filtro WHERE a la consulta SQL: .where(eq(clientes.activo, true))
    .where(eq(clientes.activo, true))
    // [Línea 71] Agrupa filas en SQL para calcular sumas o conteos: .groupBy(movimientosCuenta.clienteId)
    .groupBy(movimientosCuenta.clienteId)
    // [Línea 72] Ejecuta o evalúa: .as("saldos_clientes");
    .as("saldos_clientes");

  // [Línea 74] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filasSaldos'.
  const filasSaldos = await db
    // [Línea 75] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({ saldo: subconsultaSaldos.saldo })
    // [Línea 76] Define la tabla origen de la consulta SQL: .from(subconsultaSaldos);
    .from(subconsultaSaldos);

  // [Línea 78] Declara 'totalAdeudado' y le asigna el valor resultante.
  let totalAdeudado = 0;
  // [Línea 79] Declara 'clientesConSaldo' y le asigna el valor resultante.
  let clientesConSaldo = 0;
  // [Línea 80] Recorre cada elemento en un bucle: for (const fila of filasSaldos) {
  for (const fila of filasSaldos) {
    // [Línea 81] Declara 'saldo' y le asigna el valor resultante.
    const saldo = Number(fila.saldo ?? 0);
    // [Línea 82] Verifica la condición: if (saldo > 0) {
    if (saldo > 0) {
      // [Línea 83] Ejecuta o evalúa: totalAdeudado += saldo;
      totalAdeudado += saldo;
      // [Línea 84] Ejecuta o evalúa: clientesConSaldo += 1;
      clientesConSaldo += 1;
    // [Línea 85] Cierra el bloque o estructura (}).
    }
  // [Línea 86] Cierra el bloque o estructura (}).
  }

  // 4. Cantidad de productos activos que están bajo el stock mínimo.
  // [Línea 89] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[{ cantidadBajoMinimo }]'.
  const [{ cantidadBajoMinimo }] = await db
    // [Línea 90] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({ cantidadBajoMinimo: count() })
    // [Línea 91] Define la tabla origen de la consulta SQL: .from(productos)
    .from(productos)
    // [Línea 92] Aplica el filtro WHERE a la consulta SQL: .where(and(eq(productos.activo, true), lt(productos.existencia, productos.stockMinimo)));
    .where(and(eq(productos.activo, true), lt(productos.existencia, productos.stockMinimo)));

  // 5. Ventas diarias de los últimos 30 días (siempre 30 elementos, sin huecos).
  // [Línea 95] Declara 'listaUltimos30Dias: string[]' y le asigna el valor resultante.
  const listaUltimos30Dias: string[] = [];
  // [Línea 96] Recorre cada elemento en un bucle: for (let i = 29; i >= 0; i--) {
  for (let i = 29; i >= 0; i--) {
    // [Línea 97] Declara 'fechaDia' y le asigna el valor resultante.
    const fechaDia = new Date(inicioDelDia(hoyTexto).getTime() - i * 86_400_000 + 12 * 3_600_000);
    // [Línea 98] Ejecuta o evalúa: listaUltimos30Dias.push(diaArgentino(fechaDia));
    listaUltimos30Dias.push(diaArgentino(fechaDia));
  // [Línea 99] Cierra el bloque o estructura (}).
  }

  // [Línea 101] Declara 'desde30Dias' y le asigna el valor resultante.
  const desde30Dias = inicioDelDia(listaUltimos30Dias[0]);
  // [Línea 102] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'facturasUltimos30Dias'.
  const facturasUltimos30Dias = await db
    // [Línea 103] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({ fecha: facturas.fecha, total: facturas.total })
    // [Línea 104] Define la tabla origen de la consulta SQL: .from(facturas)
    .from(facturas)
    // [Línea 105] Aplica el filtro WHERE a la consulta SQL: .where(
    .where(
      // [Línea 106] Ejecuta o evalúa: and(
      and(
        // [Línea 107] Ejecuta o evalúa: eq(facturas.estado, "emitida"),
        eq(facturas.estado, "emitida"),
        // [Línea 108] Ejecuta o evalúa: gte(facturas.fecha, desde30Dias),
        gte(facturas.fecha, desde30Dias),
        // [Línea 109] Ejecuta o evalúa: lte(facturas.fecha, hastaHoy),
        lte(facturas.fecha, hastaHoy),
      // [Línea 110] Cierra el bloque o estructura (),).
      ),
    // [Línea 111] Cierra el bloque o estructura ();).
    );

  // [Línea 113] Declara 'importePorDia' y le asigna el valor resultante.
  const importePorDia = new Map<string, number>();
  // [Línea 114] Recorre cada elemento en un bucle: for (const dia of listaUltimos30Dias) importePorDia.set(dia, 0);
  for (const dia of listaUltimos30Dias) importePorDia.set(dia, 0);
  // [Línea 115] Recorre cada elemento en un bucle: for (const fac of facturasUltimos30Dias) {
  for (const fac of facturasUltimos30Dias) {
    // [Línea 116] Declara 'diaFac' y le asigna el valor resultante.
    const diaFac = diaArgentino(fac.fecha);
    // [Línea 117] Verifica la condición: if (importePorDia.has(diaFac)) {
    if (importePorDia.has(diaFac)) {
      // [Línea 118] Ejecuta o evalúa: importePorDia.set(diaFac, (importePorDia.get(diaFac) ?? 0) + fac.total);
      importePorDia.set(diaFac, (importePorDia.get(diaFac) ?? 0) + fac.total);
    // [Línea 119] Cierra el bloque o estructura (}).
    }
  // [Línea 120] Cierra el bloque o estructura (}).
  }

  // [Línea 122] Declara 'ventasDiarias' y le asigna el valor resultante.
  const ventasDiarias = listaUltimos30Dias.map((fecha) => ({
    // [Línea 123] Ejecuta o evalúa: fecha,
    fecha,
    // [Línea 124] Define o asigna el campo/parámetro 'importe'.
    importe: importePorDia.get(fecha) ?? 0,
  // [Línea 125] Ejecuta o evalúa: }));
  }));

  // 6. Ventas del mes por forma de pago (siempre las 3 formas).
  // [Línea 128] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filasPorForma'.
  const filasPorForma = await db
    // [Línea 129] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({
      // [Línea 130] Define o asigna el campo/parámetro 'forma'.
      forma: facturas.formaPago,
      // [Línea 131] Define o asigna el campo/parámetro 'importe'.
      importe: sql<number>`coalesce(sum(${facturas.total}), 0)`,
    // [Línea 132] Cierra el bloque o estructura (})).
    })
    // [Línea 133] Define la tabla origen de la consulta SQL: .from(facturas)
    .from(facturas)
    // [Línea 134] Aplica el filtro WHERE a la consulta SQL: .where(
    .where(
      // [Línea 135] Ejecuta o evalúa: and(
      and(
        // [Línea 136] Ejecuta o evalúa: eq(facturas.estado, "emitida"),
        eq(facturas.estado, "emitida"),
        // [Línea 137] Ejecuta o evalúa: gte(facturas.fecha, desdeMes),
        gte(facturas.fecha, desdeMes),
        // [Línea 138] Ejecuta o evalúa: lte(facturas.fecha, hastaHoy),
        lte(facturas.fecha, hastaHoy),
      // [Línea 139] Cierra el bloque o estructura (),).
      ),
    // [Línea 140] Ejecuta o evalúa: )
    )
    // [Línea 141] Agrupa filas en SQL para calcular sumas o conteos: .groupBy(facturas.formaPago);
    .groupBy(facturas.formaPago);

  // [Línea 143] Declara 'mapaFormas' y le asigna el valor resultante.
  const mapaFormas = new Map<string, number>([
    // [Línea 144] Ejecuta o evalúa: ["contado", 0],
    ["contado", 0],
    // [Línea 145] Ejecuta o evalúa: ["tarjeta", 0],
    ["tarjeta", 0],
    // [Línea 146] Ejecuta o evalúa: ["cuenta_corriente", 0],
    ["cuenta_corriente", 0],
  // [Línea 147] Cierra el bloque o estructura (]);).
  ]);
  // [Línea 148] Recorre cada elemento en un bucle: for (const fila of filasPorForma) {
  for (const fila of filasPorForma) {
    // [Línea 149] Ejecuta o evalúa: mapaFormas.set(fila.forma, Number(fila.importe));
    mapaFormas.set(fila.forma, Number(fila.importe));
  // [Línea 150] Cierra el bloque o estructura (}).
  }

  // [Línea 152] Declara 'porFormaDePago' y le asigna el valor resultante.
  const porFormaDePago = (["contado", "tarjeta", "cuenta_corriente"] as const).map((forma) => ({
    // [Línea 153] Ejecuta o evalúa: forma,
    forma,
    // [Línea 154] Define o asigna el campo/parámetro 'importe'.
    importe: mapaFormas.get(forma) ?? 0,
  // [Línea 155] Ejecuta o evalúa: }));
  }));

  // 7. Los 5 productos más vendidos del mes, ordenados por unidades vendidas (RF-T3).
  // [Línea 158] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filasMasVendidos'.
  const filasMasVendidos = await db
    // [Línea 159] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({
      // [Línea 160] Define o asigna el campo/parámetro 'productoId'.
      productoId: facturaItems.productoId,
      // [Línea 161] Define o asigna el campo/parámetro 'codigo'.
      codigo: facturaItems.codigo,
      // [Línea 162] Define o asigna el campo/parámetro 'descripcion'.
      descripcion: facturaItems.descripcion,
      // [Línea 163] Define o asigna el campo/parámetro 'unidades'.
      unidades: sql<number>`coalesce(sum(${facturaItems.cantidad}), 0)`.as("unidades"),
      // [Línea 164] Define o asigna el campo/parámetro 'importe'.
      importe: sql<number>`coalesce(sum(${facturaItems.subtotal}), 0)`.as("importe"),
    // [Línea 165] Cierra el bloque o estructura (})).
    })
    // [Línea 166] Define la tabla origen de la consulta SQL: .from(facturaItems)
    .from(facturaItems)
    // [Línea 167] Hace un INNER JOIN con otra tabla relacionada: .innerJoin(facturas, eq(facturaItems.facturaId, facturas.id))
    .innerJoin(facturas, eq(facturaItems.facturaId, facturas.id))
    // [Línea 168] Aplica el filtro WHERE a la consulta SQL: .where(
    .where(
      // [Línea 169] Ejecuta o evalúa: and(
      and(
        // [Línea 170] Ejecuta o evalúa: eq(facturas.estado, "emitida"),
        eq(facturas.estado, "emitida"),
        // [Línea 171] Ejecuta o evalúa: gte(facturas.fecha, desdeMes),
        gte(facturas.fecha, desdeMes),
        // [Línea 172] Ejecuta o evalúa: lte(facturas.fecha, hastaHoy),
        lte(facturas.fecha, hastaHoy),
      // [Línea 173] Cierra el bloque o estructura (),).
      ),
    // [Línea 174] Ejecuta o evalúa: )
    )
    // [Línea 175] Agrupa filas en SQL para calcular sumas o conteos: .groupBy(facturaItems.productoId, facturaItems.codigo, facturaItems.descripcion)
    .groupBy(facturaItems.productoId, facturaItems.codigo, facturaItems.descripcion)
    // [Línea 176] Ordena las filas del resultado SQL: .orderBy(desc(sql`unidades`), desc(sql`importe`))
    .orderBy(desc(sql`unidades`), desc(sql`importe`))
    // [Línea 177] Limita la cantidad de filas por página: .limit(5);
    .limit(5);

  // [Línea 179] Declara 'masVendidos' y le asigna el valor resultante.
  const masVendidos = filasMasVendidos.map((fila) => ({
    // [Línea 180] Define o asigna el campo/parámetro 'productoId'.
    productoId: fila.productoId,
    // [Línea 181] Define o asigna el campo/parámetro 'codigo'.
    codigo: fila.codigo,
    // [Línea 182] Define o asigna el campo/parámetro 'descripcion'.
    descripcion: fila.descripcion,
    // [Línea 183] Define o asigna el campo/parámetro 'unidades'.
    unidades: Number(fila.unidades),
    // [Línea 184] Define o asigna el campo/parámetro 'importe'.
    importe: Number(fila.importe),
  // [Línea 185] Ejecuta o evalúa: }));
  }));

  // [Línea 187] Devuelve el valor: {
  return {
    // [Línea 188] Define o asigna el campo/parámetro 'hoy'.
    hoy: {
      // [Línea 189] Define o asigna el campo/parámetro 'cantidad'.
      cantidad: Number(resumenHoy.cantidad),
      // [Línea 190] Define o asigna el campo/parámetro 'importe'.
      importe: Number(resumenHoy.importe),
    // [Línea 191] Cierra el bloque o estructura (},).
    },
    // [Línea 192] Define o asigna el campo/parámetro 'mes'.
    mes: {
      // [Línea 193] Define o asigna el campo/parámetro 'cantidad'.
      cantidad: cantidadMes,
      // [Línea 194] Define o asigna el campo/parámetro 'importe'.
      importe: importeMes,
      // [Línea 195] Ejecuta o evalúa: ticketPromedio,
      ticketPromedio,
    // [Línea 196] Cierra el bloque o estructura (},).
    },
    // [Línea 197] Define o asigna el campo/parámetro 'cuentasCorrientes'.
    cuentasCorrientes: {
      // [Línea 198] Ejecuta o evalúa: totalAdeudado,
      totalAdeudado,
      // [Línea 199] Ejecuta o evalúa: clientesConSaldo,
      clientesConSaldo,
    // [Línea 200] Cierra el bloque o estructura (},).
    },
    // [Línea 201] Define o asigna el campo/parámetro 'bajoMinimo'.
    bajoMinimo: {
      // [Línea 202] Define o asigna el campo/parámetro 'cantidad'.
      cantidad: Number(cantidadBajoMinimo),
    // [Línea 203] Cierra el bloque o estructura (},).
    },
    // [Línea 204] Ejecuta o evalúa: ventasDiarias,
    ventasDiarias,
    // [Línea 205] Ejecuta o evalúa: porFormaDePago,
    porFormaDePago,
    // [Línea 206] Ejecuta o evalúa: masVendidos,
    masVendidos,
  // [Línea 207] Cierra el bloque o estructura (};).
  };
// [Línea 208] Cierra el bloque o estructura (}).
}

// [Línea 210] Define el tipo de datos 'DatosTablero' en TypeScript.
export type DatosTablero = Awaited<ReturnType<typeof obtenerTablero>>;
