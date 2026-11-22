// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: servicios/pagos.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================
//
// [DEFENSA PARCIAL] ¿Dónde se impide registrar un pago mayor a la deuda? En registrarPago().
// Si importePago > saldoActual, lanza error 422 (Unprocessable Entity).
//

// Servicio de PAGOS (recibos de cuenta corriente). RF-C5. Reglas 4, 7 y 8.
// Acá importamos funciones y operadores de Drizzle ORM para interactuar con la base de datos
import { and, eq, sql } from "drizzle-orm";
// Acá importamos la conexión y definición de tablas de la base de datos
import { db } from "@/basedatos/conexion";
// Acá importamos la conexión y definición de tablas de la base de datos
import { clientes, movimientosCuenta, pagos, usuarios } from "@/basedatos/esquema";
// Acá importamos esquemas de validación
import { esquemaPagoNuevo } from "@/esquemas/clientes";
// Acá importamos formateadores de moneda (pesos argentinos $), fechas y números
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

  // Iniciamos una transacción atómica: o se ejecutan todos los cambios juntos o no se guarda ninguno
  const idPagoCreado = await db.transaction(async (tx) => {
    const clienteEncontrado = await tx.select().from(clientes).where(eq(clientes.id, idCliente)).get();
    // Comprobamos si el registro solicitado existe en el sistema
    if (!clienteEncontrado || !clienteEncontrado.activo) throw noEncontrado("El cliente");

    // Comprobamos si el registro solicitado existe en el sistema
    if (!clienteEncontrado.cuentaCorriente) {
      // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
      throw new ApiError(
        422,
        "CUENTA_CORRIENTE_NO_HABILITADA",
        "El cliente no tiene cuenta corriente habilitada.",
      );
    }

    const saldoActual = await saldoDeCliente(tx, idCliente);

    // Regla 8: un pago no supera la deuda (no se admiten saldos a favor).
    if (datos.importe > saldoActual) {
      // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
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

    // Insertamos el nuevo registro en la base de datos
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
