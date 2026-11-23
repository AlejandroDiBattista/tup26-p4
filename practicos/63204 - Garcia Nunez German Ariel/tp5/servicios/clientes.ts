/* ==========================================================================
   SERVICIO DE CLIENTES Y CUENTA CORRIENTE
   Cumple con los requisitos funcionales RF-C1, RF-C2, RF-C3, RF-C4, RF-C6, RF-C7 y la Regla 7:
   
   REGLA DE NEGOCIO 7 (LA FUENTE ÚNICA DE LA VERDAD):
   El saldo de un cliente NO se guarda como un número estático en la tabla 'clientes'.
   ¿Por qué? Porque si se guardara en una columna estática, cualquier error o fallo de concurrencia
   dejaría el saldo desfasado de los movimientos reales. En su lugar, el saldo siempre se calcula
   en tiempo real haciendo la suma de los débitos (facturas que debe) menos los créditos (recibos
   que pagó o anulaciones), garantizando consistencia contable matemática inmutable.
   ========================================================================== */

/* los import traen operadores y funciones de Drizzle ORM para armar consultas SQL:
   - and: une condiciones con el operador lógico AND
   - asc: ordena ascendentemente (A-Z o fechas más viejas primero)
   - count: cuenta la cantidad de registros (COUNT(*))
   - desc: ordena descendentemente (Z-A o fechas más nuevas primero)
   - eq: igualdad (=)
   - gt: mayor estricto (>)
   - like: búsqueda por coincidencia parcial (LIKE '%texto%')
   - lt: menor estricto (<)
   - ne: distinto o no igual (!=)
   - or: une condiciones con el operador lógico OR
   - sql: permite escribir sentencias SQL nativas de manera segura
   - sum: función agregada para sumar valores (SUM(columna)) */
import { and, asc, count, desc, eq, gt, like, lt, ne, or, sql, sum } from "drizzle-orm";

/* importamos la conexión estándar 'db' y el tipo 'Conexion' para admitir llamadas transaccionales */
import { db, type Conexion } from "@/basedatos/conexion";

/* importamos las tablas del esquema relacional y el tipo TypeScript Cliente */
import { clientes, facturas, movimientosCuenta, type Cliente } from "@/basedatos/esquema";

/* importamos los esquemas de validación Zod para verificar la carga y edición de clientes */
import { esquemaClienteEdicion, esquemaClienteNuevo } from "@/esquemas/clientes";

/* importamos funciones para formatear DNI/CUIT, números de factura y calcular los límites del día */
import { formatearDocumento, formatearNumeroFactura, inicioDelDia, finDelDia } from "@/lib/formato";

/* importamos la clase de error de la API y el helper de elemento no encontrado */
import { ApiError, noEncontrado } from "./errores";

/* importamos helpers para paginación, validación y el tipo del usuario en sesión */
import { leerPaginacion, respuestaPaginada, validar, type UsuarioSesion } from "./comunes";

/* ==========================================================================
   EXPRESIÓN SQL: saldoCalculado
   ¿Para qué sirve? Es una subconsulta SQL reutilizable que calcula el saldo de cada cliente
   al momento de hacer un SELECT masivo en el listado de clientes.
   ¿Cómo funciona? Suma el importe si el movimiento es 'debito' y lo resta si es distinto ('credito').
   Usa COALESCE para que si el cliente no tiene ningún movimiento devuelva 0 en vez de NULL.
   ========================================================================== */
const saldoCalculado = sql<number>`coalesce((
  select sum(case when ${movimientosCuenta.tipo} = 'debito' then ${movimientosCuenta.importe} else -${movimientosCuenta.importe} end)
  from ${movimientosCuenta}
  where ${movimientosCuenta.clienteId} = "clientes"."id"
), 0)`;

/* ==========================================================================
   REGLA 7: saldoDeCliente
   ¿Para qué sirve? Calcula la deuda exacta acumulada de UN solo cliente por su id.
   ¿Por qué recibe 'conexion'? Porque puede ejecutarse usando 'db' para lecturas comunes,
   o usando 'tx' dentro de una transacción atómica al confirmar una venta en cuenta corriente.
   ========================================================================== */
export async function saldoDeCliente(conexion: Conexion, idCliente: number): Promise<number> {
  /* ejecutamos una consulta sobre la tabla movimientosCuenta filtrando por el cliente:
     - debitos: suma todos los movimientos donde tipo = 'debito' (compras fiadas)
     - creditos: suma todos los movimientos donde tipo = 'credito' (pagos o anulaciones) */
  const fila = await conexion
    .select({
      debitos: sum(sql`case when ${movimientosCuenta.tipo} = 'debito' then ${movimientosCuenta.importe} else 0 end`),
      creditos: sum(sql`case when ${movimientosCuenta.tipo} = 'credito' then ${movimientosCuenta.importe} else 0 end`),
    })
    .from(movimientosCuenta)
    .where(eq(movimientosCuenta.clienteId, idCliente))
    .get();

  /* el saldo final es la resta directa: débitos menos créditos */
  return Number(fila?.debitos ?? 0) - Number(fila?.creditos ?? 0);
}

/* tipo de datos que describe los filtros aceptados en la búsqueda de clientes */
type FiltrosClientes = {
  q?: string;
  conDeuda?: string;
  orden?: string; // "nombre" (por defecto) o "saldo"
  activo?: string; // "true" (por defecto) o "todos"
  page?: string;
  pageSize?: string;
};

/* ==========================================================================
   RF-C1 y RF-C6: LISTADO PAGINADO DE CLIENTES CON SALDOS Y FILTROS
   ¿Para qué sirve? Muestra la lista de clientes con su información de contacto,
   su saldo adeudado y el estado de su cuenta corriente.
   Permite filtrar solo los que tienen deuda pendiente (conDeuda=true).
   ========================================================================== */
export async function listarClientes(_usuario: UsuarioSesion, parametros: FiltrosClientes) {
  /* extraemos los valores numéricos de página, tamaño de página y salto (offset) */
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  /* creamos un arreglo para construir dinámicamente las cláusulas WHERE */
  const condiciones = [];

  /* si el usuario escribió un texto en el buscador 'q':
     limpiamos caracteres no numéricos para buscar por DNI/CUIT sin puntos ni guiones,
     y usamos 'like' para buscar por nombre o número de documento */
  if (parametros.q) {
    const textoBuscado = `%${parametros.q}%`;
    const soloDigitos = parametros.q.replace(/\D/g, ""); // "28.456.789" -> "28456789"
    condiciones.push(
      soloDigitos
        ? or(like(clientes.nombre, textoBuscado), like(clientes.nroDoc, `%${soloDigitos}%`))
        : like(clientes.nombre, textoBuscado),
    );
  }

  /* por defecto solo mostramos clientes activos a menos que explícitamente se pida 'todos' */
  if (parametros.activo !== "todos") condiciones.push(eq(clientes.activo, true));

  /* si se activa el filtro conDeuda=true, solo traemos clientes cuyo saldo calculado sea mayor a 0 */
  if (parametros.conDeuda === "true") condiciones.push(gt(saldoCalculado, 0));

  /* combinamos todas las condiciones con el operador AND */
  const filtro = and(...condiciones);

  /* definimos el orden de las filas: si se pide por saldo o conDeuda, ordenamos de mayor a menor deuda */
  const orden = parametros.orden === "saldo" || parametros.conDeuda === "true"
    ? [desc(saldoCalculado), asc(clientes.nombre)]
    : [asc(clientes.nombre)];

  /* ejecutamos la consulta trayendo los datos del cliente y el saldo calculado en una sola llamada SQL */
  const filas = await db
    .select({ cliente: clientes, saldo: saldoCalculado })
    .from(clientes)
    .where(filtro)
    .orderBy(...orden)
    .limit(tamanoPagina)
    .offset(salto);

  /* contamos cuántos clientes coinciden en total con el filtro para armar la paginación */
  const [{ total }] = await db.select({ total: count() }).from(clientes).where(filtro);

  /* mapeamos cada fila usando la función aClientePublico para calcular el crédito disponible y formatear el DNI */
  const respuesta = respuestaPaginada(
    filas.map((fila) => aClientePublico(fila.cliente, Number(fila.saldo))),
    pagina,
    tamanoPagina,
    total,
  );

  /* RF-C6: si se pidieron los clientes con deuda, sumamos el total general adeudado en la ferretería */
  if (parametros.conDeuda === "true") {
    const [{ totalAdeudado }] = await db
      .select({ totalAdeudado: sql<number>`coalesce(sum(${saldoCalculado}), 0)` })
      .from(clientes)
      .where(filtro);
    return { ...respuesta, totalAdeudado: Number(totalAdeudado) };
  }

  return respuesta;
}

/* ==========================================================================
   RF-C3: OBTENER FICHA COMPLETA DE UN CLIENTE
   ¿Para qué sirve? Muestra los datos personales del cliente, su saldo al día
   y las últimas 6 facturas que se le emitieron en el comercio.
   ========================================================================== */
export async function obtenerCliente(_usuario: UsuarioSesion, idCliente: number) {
  /* buscamos el cliente por su ID en la tabla clientes */
  const clienteEncontrado = await db.select().from(clientes).where(eq(clientes.id, idCliente)).get();
  
  /* si no existe arrojamos error 404 */
  if (!clienteEncontrado) throw noEncontrado("El cliente");

  /* calculamos su saldo en cuenta corriente */
  const saldo = await saldoDeCliente(db, idCliente);

  /* buscamos las últimas 6 facturas asociadas a este cliente ordenadas de la más reciente a la más antigua */
  const filasFacturas = await db
    .select()
    .from(facturas)
    .where(eq(facturas.clienteId, idCliente))
    .orderBy(desc(facturas.fecha))
    .limit(6);

  /* mapeamos las facturas para incluir el número legal formateado y la fecha en formato ISO string */
  const ultimasFacturas = filasFacturas.map((factura) => ({
    id: factura.id,
    numeroFormateado: formatearNumeroFactura(factura.puntoVenta, factura.numero),
    fecha: factura.fecha.toISOString(),
    total: factura.total,
    formaPago: factura.formaPago,
    estado: factura.estado,
  }));

  /* devolvemos los datos del cliente combinados con el historial de sus últimas compras */
  return { ...aClientePublico(clienteEncontrado, saldo), ultimasFacturas };
}

/* ==========================================================================
   RF-C2 / RF-V2: CREAR NUEVO CLIENTE (ALTA DE CLIENTE)
   ¿Para qué sirve? Permite registrar un cliente nuevo desde la pantalla de clientes
   o desde el modal de alta rápida dentro de la pantalla de Nueva Venta.
   ========================================================================== */
export async function crearCliente(usuario: UsuarioSesion, datosSinValidar: unknown) {
  /* validamos con Zod que los campos cumplan con tipos y tamaños obligatorios */
  const datos = validar(esquemaClienteNuevo, datosSinValidar);

  /* limpiamos el número de documento para guardar únicamente los dígitos limpios en la base de datos */
  const documentoNuevo = datos.nroDoc.replace(/\D/g, "");

  /* verificamos que no exista otro cliente registrado con ese mismo número de documento */
  await verificarDocumentoLibre(documentoNuevo);

  /* insertamos el nuevo cliente en la base de datos y recuperamos su registro con .returning() */
  const [clienteCreado] = await db
    .insert(clientes)
    .values({
      tipoDoc: datos.tipoDoc,
      nroDoc: documentoNuevo,
      nombre: datos.nombre,
      domicilio: datos.domicilio || null,
      telefono: datos.telefono || null,
      email: datos.email || null,
      cuentaCorriente: datos.cuentaCorriente ?? false,
      limiteCredito: datos.cuentaCorriente ? (datos.limiteCredito ?? null) : null,
    })
    .returning();

  /* devolvemos el cliente creado a través de obtenerCliente */
  return obtenerCliente(usuario, clienteCreado.id);
}

/* ==========================================================================
   RF-C2 y RF-C7: EDITAR CLIENTE Y BAJA LÓGICA
   ¿Para qué sirve? Modifica los datos del cliente o lo da de baja lógica (activo = false).
   REGLA DE SEGURIDAD CONTABLE:
   No se puede dar de baja a un cliente ni quitarle la opción de cuenta corriente
   si todavía tiene saldo pendiente de pago (saldo != 0).
   ========================================================================== */
export async function editarCliente(usuario: UsuarioSesion, idCliente: number, datosSinValidar: unknown) {
  /* validamos los campos editados con el esquema Zod de edición */
  const datos = validar(esquemaClienteEdicion, datosSinValidar);

  /* buscamos el cliente actual en la base de datos */
  const clienteExistente = await db.select().from(clientes).where(eq(clientes.id, idCliente)).get();
  if (!clienteExistente) throw noEncontrado("El cliente");

  /* calculamos el saldo actual del cliente */
  const saldo = await saldoDeCliente(db, idCliente);

  /* comprobamos si intentan desactivarlo o si intentan desactivarle la cuenta corriente */
  const quiereDesactivar = datos.activo === false;
  const quiereQuitarCuenta = datos.cuentaCorriente === false && clienteExistente.cuentaCorriente;

  /* si quiere desactivarlo o quitarle la cuenta pero tiene deuda o crédito a favor, frenamos con error 422 */
  if ((quiereDesactivar || quiereQuitarCuenta) && saldo !== 0) {
    throw new ApiError(422, "SALDO_PENDIENTE", "El cliente tiene saldo pendiente en su cuenta corriente.");
  }

  /* preparamos el objeto con los cambios que se van a impactar en la tabla */
  const cambios: Partial<Cliente> = {};
  if (datos.tipoDoc !== undefined) cambios.tipoDoc = datos.tipoDoc;
  if (datos.nroDoc !== undefined) {
    cambios.nroDoc = datos.nroDoc.replace(/\D/g, "");
    /* si modificó el documento, verificamos que no pertenezca a otro cliente */
    if (cambios.nroDoc !== clienteExistente.nroDoc) await verificarDocumentoLibre(cambios.nroDoc, idCliente);
  }
  if (datos.nombre !== undefined) cambios.nombre = datos.nombre;
  if (datos.domicilio !== undefined) cambios.domicilio = datos.domicilio || null;
  if (datos.telefono !== undefined) cambios.telefono = datos.telefono || null;
  if (datos.email !== undefined) cambios.email = datos.email || null;
  if (datos.cuentaCorriente !== undefined) cambios.cuentaCorriente = datos.cuentaCorriente;
  if (datos.limiteCredito !== undefined) cambios.limiteCredito = datos.limiteCredito;
  if (datos.activo !== undefined) cambios.activo = datos.activo;

  /* actualizamos el registro en la base de datos */
  await db.update(clientes).set(cambios).where(eq(clientes.id, idCliente));

  /* devolvemos los datos del cliente actualizados */
  return obtenerCliente(usuario, idCliente);
}

/* ==========================================================================
   RF-C4: OBTENER ESTADO DE CUENTA CORRIENTE EN ORDEN CRONOLÓGICO
   ¿Para qué sirve? Muestra el extracto bancario/comercial de la cuenta del cliente:
   cada factura fiada (débito) y cada recibo cobrado (crédito), calculando el saldo
   acumulado renglón por renglón.
   ========================================================================== */
export async function obtenerCuentaCorriente(
  _usuario: UsuarioSesion,
  idCliente: number,
  parametros: { desde?: string; hasta?: string },
) {
  /* verificamos que el cliente exista */
  const clienteEncontrado = await db.select().from(clientes).where(eq(clientes.id, idCliente)).get();
  if (!clienteEncontrado) throw noEncontrado("El cliente");

  /* si el usuario aplicó un filtro de fecha 'desde', calculamos el saldo que venía acumulado
     antes de esa fecha (saldo anterior) para que el balance inicial sea correcto */
  let saldoAnterior = 0;
  if (parametros.desde) {
    const fila = await db
      .select({
        saldo: sql<number>`coalesce(sum(case when ${movimientosCuenta.tipo} = 'debito' then ${movimientosCuenta.importe} else -${movimientosCuenta.importe} end), 0)`,
      })
      .from(movimientosCuenta)
      .where(and(eq(movimientosCuenta.clienteId, idCliente), lt(movimientosCuenta.fecha, inicioDelDia(parametros.desde))))
      .get();
    saldoAnterior = Number(fila?.saldo ?? 0);
  }

  /* preparamos las condiciones de rango de fechas para traer los movimientos del período pedido */
  const condiciones = [eq(movimientosCuenta.clienteId, idCliente)];
  if (parametros.desde) condiciones.push(sql`${movimientosCuenta.fecha} >= ${inicioDelDia(parametros.desde).getTime()}`);
  if (parametros.hasta) condiciones.push(sql`${movimientosCuenta.fecha} <= ${finDelDia(parametros.hasta).getTime()}`);

  /* consultamos los movimientos en orden cronológico (del más antiguo al más nuevo) */
  const filas = await db
    .select()
    .from(movimientosCuenta)
    .where(and(...condiciones))
    .orderBy(asc(movimientosCuenta.fecha), asc(movimientosCuenta.id));

  /* recorremos los movimientos en orden con .map():
     iniciamos con el saldo anterior y vamos sumando los débitos y restando los créditos
     para dejar asentado el saldo exacto que quedaba tras cada operación */
  let saldoAcumulado = saldoAnterior;
  const movimientos = filas.map((movimiento) => {
    saldoAcumulado += movimiento.tipo === "debito" ? movimiento.importe : -movimiento.importe;
    return {
      fecha: movimiento.fecha.toISOString(),
      tipo: movimiento.tipo,
      importe: movimiento.importe,
      descripcion: movimiento.descripcion,
      facturaId: movimiento.facturaId,
      pagoId: movimiento.pagoId,
      saldo: saldoAcumulado,
    };
  });

  /* devolvemos el extracto completo */
  return {
    cliente: { id: clienteEncontrado.id, nombre: clienteEncontrado.nombre },
    saldoAnterior,
    movimientos,
    saldo: saldoAcumulado,
  };
}

/* ==========================================================================
   FUNCIONES INTERNAS AUXILIARES
   ========================================================================== */

/* aClientePublico: normaliza los datos del cliente para la respuesta pública:
   - formatea el documento con puntos o guiones (formatearDocumento)
   - calcula el saldo disponible (limiteCredito - saldo) */
export function aClientePublico(cliente: Cliente, saldo: number) {
  return {
    id: cliente.id,
    tipoDoc: cliente.tipoDoc,
    nroDoc: formatearDocumento(cliente.tipoDoc, cliente.nroDoc),
    nombre: cliente.nombre,
    domicilio: cliente.domicilio,
    telefono: cliente.telefono,
    email: cliente.email,
    cuentaCorriente: cliente.cuentaCorriente,
    limiteCredito: cliente.limiteCredito,
    saldo,
    disponible: cliente.limiteCredito === null ? null : cliente.limiteCredito - saldo,
    activo: cliente.activo,
  };
}

/* tipo TypeScript derivado de la función aClientePublico */
export type ClientePublico = ReturnType<typeof aClientePublico>;

/* verificarDocumentoLibre: comprueba en la base de datos que no exista otro cliente con el mismo documento.
   Si se está editando, ignora el id del propio cliente que se está modificando */
async function verificarDocumentoLibre(nroDoc: string, idQueSeEdita?: number) {
  const condicion = idQueSeEdita
    ? and(eq(clientes.nroDoc, nroDoc), ne(clientes.id, idQueSeEdita))
    : eq(clientes.nroDoc, nroDoc);
  
  const otroCliente = await db.select({ id: clientes.id }).from(clientes).where(condicion).get();
  
  if (otroCliente) {
    throw new ApiError(409, "DOCUMENTO_DUPLICADO", "Ya existe un cliente con ese documento.", [
      { campo: "nroDoc", mensaje: "Ya existe un cliente con ese documento." },
    ]);
  }
}
