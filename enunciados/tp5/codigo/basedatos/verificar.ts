// Script de verificación de invariantes ("pnpm run db:verificar").
// Comprueba los puntos de la sección 10.8:
// - Que la existencia de CADA producto coincida con la suma de sus movimientos de stock.
// - Que ningún producto tenga existencia negativa.
// - Que el saldo de CADA cliente coincida con débitos menos créditos y no sea negativo.
import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import { db } from "./conexion";
import { clientes, movimientosCuenta, movimientosStock, productos } from "./esquema";
import { saldoDeCliente } from "@/servicios/clientes";

async function verificarConsistencia() {
  const todosLosProductos = await db.select().from(productos);
  for (const prod of todosLosProductos) {
    const fila = await db
      .select({ suma: sql<number>`coalesce(sum(${movimientosStock.cantidad}), 0)` })
      .from(movimientosStock)
      .where(eq(movimientosStock.productoId, prod.id))
      .get();
    const sumaMovimientos = Number(fila?.suma ?? 0);
    if (prod.existencia !== sumaMovimientos || prod.existencia < 0) {
      throw new Error(
        `Inconsistencia en producto ${prod.codigo}: existencia=${prod.existencia}, sumaMovimientos=${sumaMovimientos}`,
      );
    }
  }

  const todosLosClientes = await db.select().from(clientes);
  for (const cli of todosLosClientes) {
    const saldo = await saldoDeCliente(db, cli.id);
    const movimientos = await db
      .select()
      .from(movimientosCuenta)
      .where(eq(movimientosCuenta.clienteId, cli.id));
    const calculado = movimientos.reduce(
      (acc, m) => acc + (m.tipo === "debito" ? m.importe : -m.importe),
      0,
    );
    if (saldo !== calculado || saldo < 0) {
      throw new Error(`Inconsistencia en cliente ${cli.nombre}: saldo=${saldo}`);
    }
  }

  console.log(
    `OK: ${todosLosProductos.length} productos y ${todosLosClientes.length} clientes verificados sin diferencias.`,
  );
}

verificarConsistencia().catch((err) => {
  console.error(err);
  process.exit(1);
});
