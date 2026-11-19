// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Script de verificación de invariantes ("pnpm run db:verificar").
// Comprueba los puntos de la sección 10.8:
// - Que la existencia de CADA producto coincida con la suma de sus movimientos de stock.
// - Que ningún producto tenga existencia negativa.
// - Que el saldo de CADA cliente coincida con débitos menos créditos y no sea negativo.
// [Línea 6] Inicia un bloque de importación de dependencias.
import "dotenv/config";
// [Línea 7] Importa elementos desde 'drizzle-orm'.
import { eq, sql } from "drizzle-orm";
// [Línea 8] Importa elementos desde './conexion'.
import { db } from "./conexion";
// [Línea 9] Importa elementos desde './esquema'.
import { clientes, movimientosCuenta, movimientosStock, productos } from "./esquema";
// [Línea 10] Importa elementos desde '@/servicios/clientes'.
import { saldoDeCliente } from "@/servicios/clientes";

// [Línea 12] Declara la función asíncrona 'verificarConsistencia'.
async function verificarConsistencia() {
  // [Línea 13] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'todosLosProductos'.
  const todosLosProductos = await db.select().from(productos);
  // [Línea 14] Recorre cada elemento en un bucle: for (const prod of todosLosProductos) {
  for (const prod of todosLosProductos) {
    // [Línea 15] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'fila'.
    const fila = await db
      // [Línea 16] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
      .select({ suma: sql<number>`coalesce(sum(${movimientosStock.cantidad}), 0)` })
      // [Línea 17] Define la tabla origen de la consulta SQL: .from(movimientosStock)
      .from(movimientosStock)
      // [Línea 18] Aplica el filtro WHERE a la consulta SQL: .where(eq(movimientosStock.productoId, prod.id))
      .where(eq(movimientosStock.productoId, prod.id))
      // [Línea 19] Ejecuta la consulta y obtiene una sola fila (o undefined si no hay coincidencias).
      .get();
    // [Línea 20] Declara 'sumaMovimientos' y le asigna el valor resultante.
    const sumaMovimientos = Number(fila?.suma ?? 0);
    // [Línea 21] Verifica la condición: if (prod.existencia !== sumaMovimientos || prod.existencia < 0) {
    if (prod.existencia !== sumaMovimientos || prod.existencia < 0) {
      // [Línea 22] Corta la ejecución y lanza el error: throw new Error(
      throw new Error(
        // [Línea 23] Ejecuta o evalúa: `Inconsistencia en producto ${prod.codigo}: existencia=${prod.existencia}, sumaM
        `Inconsistencia en producto ${prod.codigo}: existencia=${prod.existencia}, sumaMovimientos=${sumaMovimientos}`,
      // [Línea 24] Cierra el bloque o estructura ();).
      );
    // [Línea 25] Cierra el bloque o estructura (}).
    }
  // [Línea 26] Cierra el bloque o estructura (}).
  }

  // [Línea 28] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'todosLosClientes'.
  const todosLosClientes = await db.select().from(clientes);
  // [Línea 29] Recorre cada elemento en un bucle: for (const cli of todosLosClientes) {
  for (const cli of todosLosClientes) {
    // [Línea 30] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'saldo'.
    const saldo = await saldoDeCliente(db, cli.id);
    // [Línea 31] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'movimientos'.
    const movimientos = await db
      // [Línea 32] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
      .select()
      // [Línea 33] Define la tabla origen de la consulta SQL: .from(movimientosCuenta)
      .from(movimientosCuenta)
      // [Línea 34] Aplica el filtro WHERE a la consulta SQL: .where(eq(movimientosCuenta.clienteId, cli.id));
      .where(eq(movimientosCuenta.clienteId, cli.id));
    // [Línea 35] Declara 'calculado' y le asigna el valor resultante.
    const calculado = movimientos.reduce(
      // [Línea 36] Ejecuta o evalúa: (acc, m) => acc + (m.tipo === "debito" ? m.importe : -m.importe),
      (acc, m) => acc + (m.tipo === "debito" ? m.importe : -m.importe),
      // [Línea 37] Ejecuta o evalúa: 0,
      0,
    // [Línea 38] Cierra el bloque o estructura ();).
    );
    // [Línea 39] Verifica la condición: if (saldo !== calculado || saldo < 0) {
    if (saldo !== calculado || saldo < 0) {
      // [Línea 40] Corta la ejecución y lanza el error: throw new Error(`Inconsistencia en cliente ${cli.nombre}: saldo=${saldo}`);
      throw new Error(`Inconsistencia en cliente ${cli.nombre}: saldo=${saldo}`);
    // [Línea 41] Cierra el bloque o estructura (}).
    }
  // [Línea 42] Cierra el bloque o estructura (}).
  }

  // [Línea 44] Ejecuta o evalúa: console.log(
  console.log(
    // [Línea 45] Ejecuta o evalúa: `OK: ${todosLosProductos.length} productos y ${todosLosClientes.length} clientes
    `OK: ${todosLosProductos.length} productos y ${todosLosClientes.length} clientes verificados sin diferencias.`,
  // [Línea 46] Cierra el bloque o estructura ();).
  );
// [Línea 47] Cierra el bloque o estructura (}).
}

// [Línea 49] Ejecuta o evalúa: verificarConsistencia().catch((err) => {
verificarConsistencia().catch((err) => {
  // [Línea 50] Ejecuta o evalúa: console.error(err);
  console.error(err);
  // [Línea 51] Ejecuta o evalúa: process.exit(1);
  process.exit(1);
// [Línea 52] Cierra el bloque o estructura (});).
});
