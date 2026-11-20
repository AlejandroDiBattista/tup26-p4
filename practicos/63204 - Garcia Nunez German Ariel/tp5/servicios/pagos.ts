// Servicio de PAGOS (recibos de cuenta corriente). RF-C5. Reglas 4, 7 y 8.
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/basedatos/conexion";
import { clientes, movimientosCuenta, pagos, usuarios } from "@/basedatos/esquema";
import { esquemaPagoNuevo } from "@/esquemas/clientes";
import { formatearNumeroRecibo, PUNTO_DE_VENTA } from "@/lib/formato";
import { ApiError, noEncontrado } from "./errores";
import { validar, type UsuarioSesion } from "./comunes";
import { saldoDeCliente } from "./clientes";

// RF-C5: registra un pago a cuenta.
// Graba el recibo con su número correlativo y el crédito en la cuenta corriente
// en una sola transacción. Nunca permite pagar más que la deuda (regla 8).
export async function registrarPago(
  usuario: UsuarioSesion,
  idCliente: number,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
  const datos = validar(esquemaPagoNuevo, datosSinValidar);

  const idPagoCreado = await db.transaction(async (tx) => {
    const clienteEncontrado = await tx.select().from(clientes).where(eq(clientes.id, idCliente)).get();
    if (!clienteEncontrado || !clienteEncontrado.activo) throw noEncontrado("El cliente");

    if (!clienteEncontrado.cuentaCorriente) {
      throw new ApiError(
        422,
        "CUENTA_CORRIENTE_NO_HABILITADA",
        "El cliente no tiene cuenta corriente habilitada.",
      );
    }

    const saldoActual = await saldoDeCliente(tx, idCliente);

    // Regla 8: un pago no supera la deuda (no se admiten saldos a favor).
    if (datos.importe > saldoActual) {
      throw new ApiError(
        422,
        "PAGO_SUPERA_DEUDA",
        "El importe del pago no puede superar el saldo adeudado.",
        [{ saldoActual, importe: datos.importe }],
      );
    }

    // Regla 4: numeración correlativa y sin huecos para los recibos.
    const filaUltimo = await tx
      .select({ ultimo: sql<number>`coalesce(max(${pagos.numeroRecibo}), 0)` })
      .from(pagos)
      .where(eq(pagos.puntoVenta, PUNTO_DE_VENTA))
      .get();
    const proximoNumero = Number(filaUltimo?.ultimo ?? 0) + 1;
    const fechaPago = opciones.fecha ?? new Date();

    const [pagoCreado] = await tx
      .insert(pagos)
      .values({
        puntoVenta: PUNTO_DE_VENTA,
        numeroRecibo: proximoNumero,
        fecha: fechaPago,
        clienteId: idCliente,
        usuarioId: usuario.id,
        importe: datos.importe,
        medio: datos.medio,
        observacion: datos.observacion || null,
      })
      .returning();

    const numeroReciboTexto = formatearNumeroRecibo(PUNTO_DE_VENTA, proximoNumero);

    await tx.insert(movimientosCuenta).values({
      clienteId: idCliente,
      facturaId: null,
      pagoId: pagoCreado.id,
      tipo: "credito",
      importe: datos.importe,
      descripcion: `Recibo ${numeroReciboTexto}`,
      fecha: fechaPago,
    });

    return pagoCreado.id;
  });

  return obtenerPago(usuario, idPagoCreado);
}

// RF-C5: obtiene un recibo por id (para verlo e imprimirlo).
export async function obtenerPago(_usuario: UsuarioSesion, idPago: number) {
  const fila = await db
    .select({
      pago: pagos,
      nombreCliente: clientes.nombre,
      tipoDocCliente: clientes.tipoDoc,
      nroDocCliente: clientes.nroDoc,
      domicilioCliente: clientes.domicilio,
      nombreUsuario: usuarios.nombre,
    })
    .from(pagos)
    .innerJoin(clientes, eq(pagos.clienteId, clientes.id))
    .innerJoin(usuarios, eq(pagos.usuarioId, usuarios.id))
    .where(and(eq(pagos.id, idPago)))
    .get();

  if (!fila) throw noEncontrado("El recibo de pago");

  const { pago } = fila;
  const saldoCliente = await saldoDeCliente(db, pago.clienteId);

  return {
    id: pago.id,
    puntoVenta: pago.puntoVenta,
    numero: pago.numeroRecibo,
    numeroRecibo: formatearNumeroRecibo(pago.puntoVenta, pago.numeroRecibo),
    fecha: pago.fecha.toISOString(),
    cliente: {
      id: pago.clienteId,
      nombre: fila.nombreCliente,
      tipoDoc: fila.tipoDocCliente,
      nroDoc: fila.nroDocCliente,
      domicilio: fila.domicilioCliente,
    },
    importe: pago.importe,
    medio: pago.medio,
    observacion: pago.observacion,
    usuario: { id: pago.usuarioId, nombre: fila.nombreUsuario },
    saldoCliente,
  };
}

export type PagoPublico = Awaited<ReturnType<typeof obtenerPago>>;
