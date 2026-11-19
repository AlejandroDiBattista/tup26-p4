// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Servicio de PAGOS (recibos de cuenta corriente). RF-C5. Reglas 4, 7 y 8.
// [Línea 2] Importa elementos desde 'drizzle-orm'.
import { and, eq, sql } from "drizzle-orm";
// [Línea 3] Importa elementos desde '@/basedatos/conexion'.
import { db } from "@/basedatos/conexion";
// [Línea 4] Importa elementos desde '@/basedatos/esquema'.
import { clientes, movimientosCuenta, pagos, usuarios } from "@/basedatos/esquema";
// [Línea 5] Importa elementos desde '@/esquemas/clientes'.
import { esquemaPagoNuevo } from "@/esquemas/clientes";
// [Línea 6] Importa elementos desde '@/lib/formato'.
import { formatearNumeroRecibo, PUNTO_DE_VENTA } from "@/lib/formato";
// [Línea 7] Importa elementos desde './errores'.
import { ApiError, noEncontrado } from "./errores";
// [Línea 8] Importa elementos desde './comunes'.
import { validar, type UsuarioSesion } from "./comunes";
// [Línea 9] Importa elementos desde './clientes'.
import { saldoDeCliente } from "./clientes";

// RF-C5: registra un pago a cuenta.
// Graba el recibo con su número correlativo y el crédito en la cuenta corriente
// en una sola transacción. Nunca permite pagar más que la deuda (regla 8).
// [Línea 14] Declara la función asíncrona 'registrarPago'.
export async function registrarPago(
  // [Línea 15] Define o asigna el campo/parámetro 'usuario'.
  usuario: UsuarioSesion,
  // [Línea 16] Define o asigna el campo/parámetro 'idCliente'.
  idCliente: number,
  // [Línea 17] Define o asigna el campo/parámetro 'datosSinValidar'.
  datosSinValidar: unknown,
  // [Línea 18] Define o asigna el campo/parámetro 'opciones'.
  opciones: { fecha?: Date } = {},
// [Línea 19] Ejecuta o evalúa: ) {
) {
  // [Línea 20] Declara 'datos' y le asigna el valor resultante.
  const datos = validar(esquemaPagoNuevo, datosSinValidar);

  // [Línea 22] Ejecuta una transacción atómica en la base de datos (todo o nada) y guarda el resultado en 'idPagoCreado'.
  const idPagoCreado = await db.transaction(async (tx) => {
    // [Línea 23] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'clienteEncontrado'.
    const clienteEncontrado = await tx.select().from(clientes).where(eq(clientes.id, idCliente)).get();
    // [Línea 24] Verifica la condición: if (!clienteEncontrado || !clienteEncontrado.activo) throw noEncontrado("El cliente");
    if (!clienteEncontrado || !clienteEncontrado.activo) throw noEncontrado("El cliente");

    // [Línea 26] Verifica la condición: if (!clienteEncontrado.cuentaCorriente) {
    if (!clienteEncontrado.cuentaCorriente) {
      // [Línea 27] Corta la ejecución y lanza el error: throw new ApiError(
      throw new ApiError(
        // [Línea 28] Ejecuta o evalúa: 422,
        422,
        // [Línea 29] Ejecuta o evalúa: "CUENTA_CORRIENTE_NO_HABILITADA",
        "CUENTA_CORRIENTE_NO_HABILITADA",
        // [Línea 30] Ejecuta o evalúa: "El cliente no tiene cuenta corriente habilitada.",
        "El cliente no tiene cuenta corriente habilitada.",
      // [Línea 31] Cierra el bloque o estructura ();).
      );
    // [Línea 32] Cierra el bloque o estructura (}).
    }

    // [Línea 34] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'saldoActual'.
    const saldoActual = await saldoDeCliente(tx, idCliente);

    // Regla 8: un pago no supera la deuda (no se admiten saldos a favor).
    // [Línea 37] Verifica la condición: if (datos.importe > saldoActual) {
    if (datos.importe > saldoActual) {
      // [Línea 38] Corta la ejecución y lanza el error: throw new ApiError(
      throw new ApiError(
        // [Línea 39] Ejecuta o evalúa: 422,
        422,
        // [Línea 40] Ejecuta o evalúa: "PAGO_SUPERA_DEUDA",
        "PAGO_SUPERA_DEUDA",
        // [Línea 41] Ejecuta o evalúa: "El importe del pago no puede superar el saldo adeudado.",
        "El importe del pago no puede superar el saldo adeudado.",
        // [Línea 42] Ejecuta o evalúa: [{ saldoActual, importe: datos.importe }],
        [{ saldoActual, importe: datos.importe }],
      // [Línea 43] Cierra el bloque o estructura ();).
      );
    // [Línea 44] Cierra el bloque o estructura (}).
    }

    // Regla 4: numeración correlativa y sin huecos para los recibos.
    // [Línea 47] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filaUltimo'.
    const filaUltimo = await tx
      // [Línea 48] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
      .select({ ultimo: sql<number>`coalesce(max(${pagos.numeroRecibo}), 0)` })
      // [Línea 49] Define la tabla origen de la consulta SQL: .from(pagos)
      .from(pagos)
      // [Línea 50] Aplica el filtro WHERE a la consulta SQL: .where(eq(pagos.puntoVenta, PUNTO_DE_VENTA))
      .where(eq(pagos.puntoVenta, PUNTO_DE_VENTA))
      // [Línea 51] Ejecuta la consulta y obtiene una sola fila (o undefined si no hay coincidencias).
      .get();
    // [Línea 52] Declara 'proximoNumero' y le asigna el valor resultante.
    const proximoNumero = Number(filaUltimo?.ultimo ?? 0) + 1;
    // [Línea 53] Declara 'fechaPago' y le asigna el valor resultante.
    const fechaPago = opciones.fecha ?? new Date();

    // [Línea 55] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[pagoCreado]'.
    const [pagoCreado] = await tx
      // [Línea 56] Inserta una nueva fila en la tabla indicada de la base de datos.
      .insert(pagos)
      // [Línea 57] Define los valores de las columnas a insertar.
      .values({
        // [Línea 58] Define o asigna el campo/parámetro 'puntoVenta'.
        puntoVenta: PUNTO_DE_VENTA,
        // [Línea 59] Define o asigna el campo/parámetro 'numeroRecibo'.
        numeroRecibo: proximoNumero,
        // [Línea 60] Define o asigna el campo/parámetro 'fecha'.
        fecha: fechaPago,
        // [Línea 61] Define o asigna el campo/parámetro 'clienteId'.
        clienteId: idCliente,
        // [Línea 62] Define o asigna el campo/parámetro 'usuarioId'.
        usuarioId: usuario.id,
        // [Línea 63] Define o asigna el campo/parámetro 'importe'.
        importe: datos.importe,
        // [Línea 64] Define o asigna el campo/parámetro 'medio'.
        medio: datos.medio,
        // [Línea 65] Define o asigna el campo/parámetro 'observacion'.
        observacion: datos.observacion || null,
      // [Línea 66] Cierra el bloque o estructura (})).
      })
      // [Línea 67] Solicita que SQLite devuelva los datos de la fila recién insertada o actualizada.
      .returning();

    // [Línea 69] Declara 'numeroReciboTexto' y le asigna el valor resultante.
    const numeroReciboTexto = formatearNumeroRecibo(PUNTO_DE_VENTA, proximoNumero);

    // [Línea 71] Inserta una nueva fila en la tabla indicada de la base de datos.
    await tx.insert(movimientosCuenta).values({
      // [Línea 72] Define o asigna el campo/parámetro 'clienteId'.
      clienteId: idCliente,
      // [Línea 73] Define o asigna el campo/parámetro 'facturaId'.
      facturaId: null,
      // [Línea 74] Define o asigna el campo/parámetro 'pagoId'.
      pagoId: pagoCreado.id,
      // [Línea 75] Define o asigna el campo/parámetro 'tipo'.
      tipo: "credito",
      // [Línea 76] Define o asigna el campo/parámetro 'importe'.
      importe: datos.importe,
      // [Línea 77] Define o asigna el campo/parámetro 'descripcion'.
      descripcion: `Recibo ${numeroReciboTexto}`,
      // [Línea 78] Define o asigna el campo/parámetro 'fecha'.
      fecha: fechaPago,
    // [Línea 79] Cierra el bloque o estructura (});).
    });

    // [Línea 81] Devuelve el valor: pagoCreado.id;
    return pagoCreado.id;
  // [Línea 82] Cierra el bloque o estructura (});).
  });

  // [Línea 84] Devuelve el valor: obtenerPago(usuario, idPagoCreado);
  return obtenerPago(usuario, idPagoCreado);
// [Línea 85] Cierra el bloque o estructura (}).
}

// RF-C5: obtiene un recibo por id (para verlo e imprimirlo).
// [Línea 88] Declara la función asíncrona 'obtenerPago'.
export async function obtenerPago(_usuario: UsuarioSesion, idPago: number) {
  // [Línea 89] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'fila'.
  const fila = await db
    // [Línea 90] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({
      // [Línea 91] Define o asigna el campo/parámetro 'pago'.
      pago: pagos,
      // [Línea 92] Define o asigna el campo/parámetro 'nombreCliente'.
      nombreCliente: clientes.nombre,
      // [Línea 93] Define o asigna el campo/parámetro 'tipoDocCliente'.
      tipoDocCliente: clientes.tipoDoc,
      // [Línea 94] Define o asigna el campo/parámetro 'nroDocCliente'.
      nroDocCliente: clientes.nroDoc,
      // [Línea 95] Define o asigna el campo/parámetro 'domicilioCliente'.
      domicilioCliente: clientes.domicilio,
      // [Línea 96] Define o asigna el campo/parámetro 'nombreUsuario'.
      nombreUsuario: usuarios.nombre,
    // [Línea 97] Cierra el bloque o estructura (})).
    })
    // [Línea 98] Define la tabla origen de la consulta SQL: .from(pagos)
    .from(pagos)
    // [Línea 99] Hace un INNER JOIN con otra tabla relacionada: .innerJoin(clientes, eq(pagos.clienteId, clientes.id))
    .innerJoin(clientes, eq(pagos.clienteId, clientes.id))
    // [Línea 100] Hace un INNER JOIN con otra tabla relacionada: .innerJoin(usuarios, eq(pagos.usuarioId, usuarios.id))
    .innerJoin(usuarios, eq(pagos.usuarioId, usuarios.id))
    // [Línea 101] Aplica el filtro WHERE a la consulta SQL: .where(and(eq(pagos.id, idPago)))
    .where(and(eq(pagos.id, idPago)))
    // [Línea 102] Ejecuta la consulta y obtiene una sola fila (o undefined si no hay coincidencias).
    .get();

  // [Línea 104] Verifica la condición: if (!fila) throw noEncontrado("El recibo de pago");
  if (!fila) throw noEncontrado("El recibo de pago");

  // [Línea 106] Declara '{ pago }' y le asigna el valor resultante.
  const { pago } = fila;
  // [Línea 107] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'saldoCliente'.
  const saldoCliente = await saldoDeCliente(db, pago.clienteId);

  // [Línea 109] Devuelve el valor: {
  return {
    // [Línea 110] Define o asigna el campo/parámetro 'id'.
    id: pago.id,
    // [Línea 111] Define o asigna el campo/parámetro 'puntoVenta'.
    puntoVenta: pago.puntoVenta,
    // [Línea 112] Define o asigna el campo/parámetro 'numero'.
    numero: pago.numeroRecibo,
    // [Línea 113] Define o asigna el campo/parámetro 'numeroRecibo'.
    numeroRecibo: formatearNumeroRecibo(pago.puntoVenta, pago.numeroRecibo),
    // [Línea 114] Define o asigna el campo/parámetro 'fecha'.
    fecha: pago.fecha.toISOString(),
    // [Línea 115] Define o asigna el campo/parámetro 'cliente'.
    cliente: {
      // [Línea 116] Define o asigna el campo/parámetro 'id'.
      id: pago.clienteId,
      // [Línea 117] Define o asigna el campo/parámetro 'nombre'.
      nombre: fila.nombreCliente,
      // [Línea 118] Define o asigna el campo/parámetro 'tipoDoc'.
      tipoDoc: fila.tipoDocCliente,
      // [Línea 119] Define o asigna el campo/parámetro 'nroDoc'.
      nroDoc: fila.nroDocCliente,
      // [Línea 120] Define o asigna el campo/parámetro 'domicilio'.
      domicilio: fila.domicilioCliente,
    // [Línea 121] Cierra el bloque o estructura (},).
    },
    // [Línea 122] Define o asigna el campo/parámetro 'importe'.
    importe: pago.importe,
    // [Línea 123] Define o asigna el campo/parámetro 'medio'.
    medio: pago.medio,
    // [Línea 124] Define o asigna el campo/parámetro 'observacion'.
    observacion: pago.observacion,
    // [Línea 125] Define o asigna el campo/parámetro 'usuario'.
    usuario: { id: pago.usuarioId, nombre: fila.nombreUsuario },
    // [Línea 126] Ejecuta o evalúa: saldoCliente,
    saldoCliente,
  // [Línea 127] Cierra el bloque o estructura (};).
  };
// [Línea 128] Cierra el bloque o estructura (}).
}

// [Línea 130] Define el tipo de datos 'PagoPublico' en TypeScript.
export type PagoPublico = Awaited<ReturnType<typeof obtenerPago>>;
