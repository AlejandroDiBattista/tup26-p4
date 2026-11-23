/* ==========================================================================
   SERVICIO DE PAGOS Y RECIBOS DE COBRANZA (CUENTA CORRIENTE)
   Cumple con el requisito funcional RF-C5 y las Reglas de Negocio 4, 7 y 8:
   
   - Regla 4: Numeración correlativa estricta sin saltos para los recibos (R 0001-00000001).
   - Regla 7: El pago asienta un movimiento de tipo 'credito' en movimientosCuenta que resta la deuda.
   - Regla 8: Un pago NUNCA puede superar la deuda actual del cliente (no se admiten saldos a favor).
   - Todo se procesa dentro de una sola transacción atómica (db.transaction).
   ========================================================================== */

/* los import traen utilidades de Drizzle ORM para consultas y operadores SQL:
   - and: operador lógico AND
   - eq: operador de igualdad SQL (=)
   - sql: plantilla para escribir fragmentos de SQL nativo como COALESCE y MAX */
import { and, eq, sql } from "drizzle-orm";

/* importamos la conexión estándar a la base de datos */
import { db } from "@/basedatos/conexion";

/* importamos las tablas del esquema que intervienen en los cobros:
   clientes (para verificar el estado del cliente), movimientosCuenta (para asentar el crédito),
   pagos (para guardar el recibo oficial) y usuarios (para saber qué cajero cobró) */
import { clientes, movimientosCuenta, pagos, usuarios } from "@/basedatos/esquema";

/* importamos el validador Zod que comprueba el importe, el medio de pago y la observación */
import { esquemaPagoNuevo } from "@/esquemas/clientes";

/* importamos el formateador de recibos (ej: 'R 0001-00000042') y el número del punto de venta */
import { formatearNumeroRecibo, PUNTO_DE_VENTA } from "@/lib/formato";

/* importamos la clase de error de la API y el generador de error 404 */
import { ApiError, noEncontrado } from "./errores";

/* importamos la función validar de Zod y el tipo de sesión del usuario */
import { validar, type UsuarioSesion } from "./comunes";

/* importamos la función saldoDeCliente para consultar la deuda real antes de autorizar el pago */
import { saldoDeCliente } from "./clientes";

/* ==========================================================================
   RF-C5: REGISTRAR PAGO A CUENTA (COBRANZA)
   ¿Para qué sirve? Permite al cajero/vendedor cobrar dinero a un cliente con cuenta corriente.
   ¿Cómo funciona?
   1. Valida los datos con Zod.
   2. Abre una transacción atómica de base de datos (db.transaction).
   3. Verifica que el cliente exista, esté activo y tenga cuenta corriente habilitada.
   4. Consulta el saldo que debe en ese instante: si el pago es mayor a la deuda, aborta (Regla 8).
   5. Calcula el próximo número de recibo sin huecos (Regla 4).
   6. Inserta el recibo en la tabla 'pagos' e inserta el crédito en 'movimientosCuenta'.
   ========================================================================== */
export async function registrarPago(
  usuario: UsuarioSesion,
  idCliente: number,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
  /* primero pasamos los datos recibidos por el validador Zod para comprobar que el importe sea mayor a 0 */
  const datos = validar(esquemaPagoNuevo, datosSinValidar);

  /* abrimos la transacción atómica de base de datos; la variable 'tx' representa la conexión transaccional */
  const idPagoCreado = await db.transaction(async (tx) => {
    /* buscamos al cliente en la base de datos usando tx */
    const clienteEncontrado = await tx.select().from(clientes).where(eq(clientes.id, idCliente)).get();
    
    /* si no existe o está inactivo, rechazamos con 404 */
    if (!clienteEncontrado || !clienteEncontrado.activo) throw noEncontrado("El cliente");

    /* si el cliente no tiene cuenta corriente habilitada, impedimos registrar un pago en cuenta con error 422 */
    if (!clienteEncontrado.cuentaCorriente) {
      throw new ApiError(
        422,
        "CUENTA_CORRIENTE_NO_HABILITADA",
        "El cliente no tiene cuenta corriente habilitada.",
      );
    }

    /* consultamos la deuda exacta que tiene el cliente usando la conexión transaccional tx */
    const saldoActual = await saldoDeCliente(tx, idCliente);

    /* REGLA DE NEGOCIO 8:
       Un cliente nunca puede entregar más dinero del que debe; el sistema no permite saldos a favor.
       Si el saldo adeudado es $10.000 y el cliente quiere pagar $12.000, lanzamos error 422 */
    if (datos.importe > saldoActual) {
      throw new ApiError(
        422,
        "PAGO_SUPERA_DEUDA",
        "El importe del pago no puede superar el saldo adeudado.",
        [{ campo: "importe", mensaje: "El importe supera el saldo adeudado." }],
      );
    }

    /* REGLA DE NEGOCIO 4:
       Numeración correlativa sin saltos ni huecos.
       Buscamos el número de recibo más alto emitido hasta el momento en este punto de venta
       y le sumamos 1 de manera atómica dentro de la transacción */
    const filaUltimo = await tx
      .select({ ultimo: sql<number>`coalesce(max(${pagos.numeroRecibo}), 0)` })
      .from(pagos)
      .where(eq(pagos.puntoVenta, PUNTO_DE_VENTA))
      .get();
    
    const proximoNumero = Number(filaUltimo?.ultimo ?? 0) + 1;
    const fechaPago = opciones.fecha ?? new Date();

    /* insertamos la cabecera del recibo oficial en la tabla 'pagos' */
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

    /* generamos el texto del número de recibo oficial con ceros a la izquierda (ej: 'R 0001-00000042') */
    const numeroReciboTexto = formatearNumeroRecibo(PUNTO_DE_VENTA, proximoNumero);

    /* insertamos inmediatamente el movimiento de tipo 'credito' en la tabla 'movimientosCuenta'
       para que la deuda del cliente baje matemáticamente en ese mismo instante */
    await tx.insert(movimientosCuenta).values({
      clienteId: idCliente,
      facturaId: null,
      pagoId: pagoCreado.id,
      tipo: "credito",
      importe: datos.importe,
      descripcion: `Recibo ${numeroReciboTexto}`,
      fecha: fechaPago,
    });

    /* devolvemos el id del pago creado para confirmar la transacción */
    return pagoCreado.id;
  });

  /* una vez que la transacción hizo COMMIT con éxito, consultamos el recibo completo para devolverlo al cliente */
  return obtenerPago(usuario, idPagoCreado);
}

/* ==========================================================================
   RF-C5: OBTENER DETALLE DE UN RECIBO DE PAGO
   ¿Para qué sirve? Recupera toda la información de un recibo emitido para poder
   mostrarlo en pantalla o imprimir el comprobante oficial de cobranza.
   ========================================================================== */
export async function obtenerPago(_usuario: UsuarioSesion, idPago: number) {
  /* realizamos una consulta con innerJoin a clientes y usuarios para traer todos los datos vinculados */
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

  /* si no existe arrojamos un error 404 */
  if (!fila) throw noEncontrado("El recibo de pago");

  const { pago } = fila;

  /* consultamos el saldo restante que le queda al cliente tras este pago */
  const saldoCliente = await saldoDeCliente(db, pago.clienteId);

  /* devolvemos el comprobante completo con todos los campos normalizados */
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

/* tipo TypeScript inferido que representa la estructura completa de un recibo devuelto por la API */
export type PagoPublico = Awaited<ReturnType<typeof obtenerPago>>;
