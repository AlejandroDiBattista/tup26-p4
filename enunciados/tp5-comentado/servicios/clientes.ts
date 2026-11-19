// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Servicio de CLIENTES y CUENTA CORRIENTE. RF-C1, RF-C2, RF-C3, RF-C4, RF-C6, RF-C7.
//
// Regla 7: saldo del cliente = débitos - créditos. El saldo NO se guarda en la tabla
// de clientes: siempre se calcula desde "movimientos_cuenta" (una sola fuente de verdad).
// [Línea 5] Importa elementos desde 'drizzle-orm'.
import { and, asc, count, desc, eq, gt, like, lt, ne, or, sql, sum } from "drizzle-orm";
// [Línea 6] Importa elementos desde '@/basedatos/conexion'.
import { db, type Conexion } from "@/basedatos/conexion";
// [Línea 7] Importa elementos desde '@/basedatos/esquema'.
import { clientes, facturas, movimientosCuenta, type Cliente } from "@/basedatos/esquema";
// [Línea 8] Importa elementos desde '@/esquemas/clientes'.
import { esquemaClienteEdicion, esquemaClienteNuevo } from "@/esquemas/clientes";
// [Línea 9] Importa elementos desde '@/lib/formato'.
import { formatearDocumento, formatearNumeroFactura, inicioDelDia, finDelDia } from "@/lib/formato";
// [Línea 10] Importa elementos desde './errores'.
import { ApiError, noEncontrado } from "./errores";
// [Línea 11] Importa elementos desde './comunes'.
import { leerPaginacion, respuestaPaginada, validar, type UsuarioSesion } from "./comunes";

// Expresión SQL que calcula el saldo de cada cliente (se usa en listados y ordenamientos).
// [Línea 14] Declara 'saldoCalculado' y le asigna el valor resultante.
const saldoCalculado = sql<number>`coalesce((
  // [Línea 15] Ejecuta o evalúa: select sum(case when ${movimientosCuenta.tipo} = 'debito' then ${movimientosCuen
  select sum(case when ${movimientosCuenta.tipo} = 'debito' then ${movimientosCuenta.importe} else -${movimientosCuenta.importe} end)
  // [Línea 16] Ejecuta o evalúa: from ${movimientosCuenta}
  from ${movimientosCuenta}
  // [Línea 17] Ejecuta o evalúa: where ${movimientosCuenta.clienteId} = ${clientes.id}
  where ${movimientosCuenta.clienteId} = ${clientes.id}
// [Línea 18] Ejecuta o evalúa: ), 0)`;
), 0)`;

// Regla 7: saldo de UN cliente. Recibe "conexion" para poder usarse dentro de una transacción.
// [Línea 21] Declara la función asíncrona 'saldoDeCliente'.
export async function saldoDeCliente(conexion: Conexion, idCliente: number): Promise<number> {
  // [Línea 22] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'fila'.
  const fila = await conexion
    // [Línea 23] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({
      // [Línea 24] Define o asigna el campo/parámetro 'debitos'.
      debitos: sum(sql`case when ${movimientosCuenta.tipo} = 'debito' then ${movimientosCuenta.importe} else 0 end`),
      // [Línea 25] Define o asigna el campo/parámetro 'creditos'.
      creditos: sum(sql`case when ${movimientosCuenta.tipo} = 'credito' then ${movimientosCuenta.importe} else 0 end`),
    // [Línea 26] Cierra el bloque o estructura (})).
    })
    // [Línea 27] Define la tabla origen de la consulta SQL: .from(movimientosCuenta)
    .from(movimientosCuenta)
    // [Línea 28] Aplica el filtro WHERE a la consulta SQL: .where(eq(movimientosCuenta.clienteId, idCliente))
    .where(eq(movimientosCuenta.clienteId, idCliente))
    // [Línea 29] Ejecuta la consulta y obtiene una sola fila (o undefined si no hay coincidencias).
    .get();
  // [Línea 30] Devuelve el valor: Number(fila?.debitos ?? 0) - Number(fila?.creditos ?? 0);
  return Number(fila?.debitos ?? 0) - Number(fila?.creditos ?? 0);
// [Línea 31] Cierra el bloque o estructura (}).
}

// [Línea 33] Define el tipo de datos 'FiltrosClientes' en TypeScript.
type FiltrosClientes = {
  // [Línea 34] Ejecuta o evalúa: q?: string;
  q?: string;
  // [Línea 35] Ejecuta o evalúa: conDeuda?: string;
  conDeuda?: string;
  // [Línea 36] Ejecuta o evalúa: orden?: string; // "nombre" (por defecto) o "saldo"
  orden?: string; // "nombre" (por defecto) o "saldo"
  // [Línea 37] Ejecuta o evalúa: activo?: string; // "true" (por defecto) o "todos"
  activo?: string; // "true" (por defecto) o "todos"
  // [Línea 38] Ejecuta o evalúa: page?: string;
  page?: string;
  // [Línea 39] Ejecuta o evalúa: pageSize?: string;
  pageSize?: string;
// [Línea 40] Cierra el bloque o estructura (};).
};

// RF-C1 y RF-C6: listado con búsqueda por nombre o documento y el saldo de cada cliente.
// [Línea 43] Declara la función asíncrona 'listarClientes'.
export async function listarClientes(_usuario: UsuarioSesion, parametros: FiltrosClientes) {
  // [Línea 44] Declara '{ pagina, tamanoPagina, salto }' y le asigna el valor resultante.
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  // [Línea 46] Declara 'condiciones' y le asigna el valor resultante.
  const condiciones = [];
  // [Línea 47] Verifica la condición: if (parametros.q) {
  if (parametros.q) {
    // [Línea 48] Declara 'textoBuscado' y le asigna el valor resultante.
    const textoBuscado = `%${parametros.q}%`;
    // [Línea 49] Declara 'soloDigitos' y le asigna el valor resultante.
    const soloDigitos = parametros.q.replace(/\D/g, ""); // "28.456" -> "28456"
    // [Línea 50] Ejecuta o evalúa: condiciones.push(
    condiciones.push(
      // [Línea 51] Ejecuta o evalúa: soloDigitos
      soloDigitos
        // [Línea 52] Ejecuta o evalúa: ? or(like(clientes.nombre, textoBuscado), like(clientes.nroDoc, `%${soloDigitos}
        ? or(like(clientes.nombre, textoBuscado), like(clientes.nroDoc, `%${soloDigitos}%`))
        // [Línea 53] Ejecuta o evalúa: : like(clientes.nombre, textoBuscado),
        : like(clientes.nombre, textoBuscado),
    // [Línea 54] Cierra el bloque o estructura ();).
    );
  // [Línea 55] Cierra el bloque o estructura (}).
  }
  // [Línea 56] Verifica la condición: if (parametros.activo !== "todos") condiciones.push(eq(clientes.activo, true));
  if (parametros.activo !== "todos") condiciones.push(eq(clientes.activo, true));
  // [Línea 57] Verifica la condición: if (parametros.conDeuda === "true") condiciones.push(gt(saldoCalculado, 0));
  if (parametros.conDeuda === "true") condiciones.push(gt(saldoCalculado, 0));
  // [Línea 58] Declara 'filtro' y le asigna el valor resultante.
  const filtro = and(...condiciones);

  // [Línea 60] Declara 'orden' y le asigna el valor resultante.
  const orden = parametros.orden === "saldo" || parametros.conDeuda === "true"
    // [Línea 61] Ejecuta o evalúa: ? [desc(saldoCalculado), asc(clientes.nombre)]
    ? [desc(saldoCalculado), asc(clientes.nombre)]
    // [Línea 62] Ejecuta o evalúa: : [asc(clientes.nombre)];
    : [asc(clientes.nombre)];

  // [Línea 64] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filas'.
  const filas = await db
    // [Línea 65] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({ cliente: clientes, saldo: saldoCalculado })
    // [Línea 66] Define la tabla origen de la consulta SQL: .from(clientes)
    .from(clientes)
    // [Línea 67] Aplica el filtro WHERE a la consulta SQL: .where(filtro)
    .where(filtro)
    // [Línea 68] Ordena las filas del resultado SQL: .orderBy(...orden)
    .orderBy(...orden)
    // [Línea 69] Limita la cantidad de filas por página: .limit(tamanoPagina)
    .limit(tamanoPagina)
    // [Línea 70] Desplaza el inicio de lectura según el número de página: .offset(salto);
    .offset(salto);
  // [Línea 71] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[{ total }]'.
  const [{ total }] = await db.select({ total: count() }).from(clientes).where(filtro);

  // [Línea 73] Declara 'respuesta' y le asigna el valor resultante.
  const respuesta = respuestaPaginada(
    // [Línea 74] Ejecuta o evalúa: filas.map((fila) => aClientePublico(fila.cliente, Number(fila.saldo))),
    filas.map((fila) => aClientePublico(fila.cliente, Number(fila.saldo))),
    // [Línea 75] Ejecuta o evalúa: pagina,
    pagina,
    // [Línea 76] Ejecuta o evalúa: tamanoPagina,
    tamanoPagina,
    // [Línea 77] Ejecuta o evalúa: total,
    total,
  // [Línea 78] Cierra el bloque o estructura ();).
  );

  // RF-C6: con conDeuda=true se agrega el total adeudado entre todos los clientes.
  // [Línea 81] Verifica la condición: if (parametros.conDeuda === "true") {
  if (parametros.conDeuda === "true") {
    // [Línea 82] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[{ totalAdeudado }]'.
    const [{ totalAdeudado }] = await db
      // [Línea 83] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
      .select({ totalAdeudado: sql<number>`coalesce(sum(${saldoCalculado}), 0)` })
      // [Línea 84] Define la tabla origen de la consulta SQL: .from(clientes)
      .from(clientes)
      // [Línea 85] Aplica el filtro WHERE a la consulta SQL: .where(filtro);
      .where(filtro);
    // [Línea 86] Devuelve el valor: { ...respuesta, totalAdeudado: Number(totalAdeudado) };
    return { ...respuesta, totalAdeudado: Number(totalAdeudado) };
  // [Línea 87] Cierra el bloque o estructura (}).
  }
  // [Línea 88] Devuelve el valor: respuesta;
  return respuesta;
// [Línea 89] Cierra el bloque o estructura (}).
}

// RF-C3: ficha del cliente con su saldo y sus 6 últimas facturas.
// [Línea 92] Declara la función asíncrona 'obtenerCliente'.
export async function obtenerCliente(_usuario: UsuarioSesion, idCliente: number) {
  // [Línea 93] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'clienteEncontrado'.
  const clienteEncontrado = await db.select().from(clientes).where(eq(clientes.id, idCliente)).get();
  // [Línea 94] Verifica la condición: if (!clienteEncontrado) throw noEncontrado("El cliente");
  if (!clienteEncontrado) throw noEncontrado("El cliente");

  // [Línea 96] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'saldo'.
  const saldo = await saldoDeCliente(db, idCliente);
  // [Línea 97] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filasFacturas'.
  const filasFacturas = await db
    // [Línea 98] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select()
    // [Línea 99] Define la tabla origen de la consulta SQL: .from(facturas)
    .from(facturas)
    // [Línea 100] Aplica el filtro WHERE a la consulta SQL: .where(eq(facturas.clienteId, idCliente))
    .where(eq(facturas.clienteId, idCliente))
    // [Línea 101] Ordena las filas del resultado SQL: .orderBy(desc(facturas.fecha))
    .orderBy(desc(facturas.fecha))
    // [Línea 102] Limita la cantidad de filas por página: .limit(6);
    .limit(6);

  // [Línea 104] Declara 'ultimasFacturas' y le asigna el valor resultante.
  const ultimasFacturas = filasFacturas.map((factura) => ({
    // [Línea 105] Define o asigna el campo/parámetro 'id'.
    id: factura.id,
    // [Línea 106] Define o asigna el campo/parámetro 'numeroFormateado'.
    numeroFormateado: formatearNumeroFactura(factura.puntoVenta, factura.numero),
    // [Línea 107] Define o asigna el campo/parámetro 'fecha'.
    fecha: factura.fecha.toISOString(),
    // [Línea 108] Define o asigna el campo/parámetro 'total'.
    total: factura.total,
    // [Línea 109] Define o asigna el campo/parámetro 'formaPago'.
    formaPago: factura.formaPago,
    // [Línea 110] Define o asigna el campo/parámetro 'estado'.
    estado: factura.estado,
  // [Línea 111] Ejecuta o evalúa: }));
  }));

  // [Línea 113] Devuelve el valor: { ...aClientePublico(clienteEncontrado, saldo), ultimasFacturas };
  return { ...aClientePublico(clienteEncontrado, saldo), ultimasFacturas };
// [Línea 114] Cierra el bloque o estructura (}).
}

// RF-C2 / RF-V2: alta de cliente (también desde el modal de Nueva venta).
// [Línea 117] Declara la función asíncrona 'crearCliente'.
export async function crearCliente(usuario: UsuarioSesion, datosSinValidar: unknown) {
  // [Línea 118] Declara 'datos' y le asigna el valor resultante.
  const datos = validar(esquemaClienteNuevo, datosSinValidar);
  // [Línea 119] Declara 'documentoNuevo' y le asigna el valor resultante.
  const documentoNuevo = datos.nroDoc.replace(/\D/g, ""); // se guarda solo con dígitos
  // [Línea 120] Espera a que se complete la operación asíncrona: await verificarDocumentoLibre(documentoNuevo);
  await verificarDocumentoLibre(documentoNuevo);

  // [Línea 122] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[clienteCreado]'.
  const [clienteCreado] = await db
    // [Línea 123] Inserta una nueva fila en la tabla indicada de la base de datos.
    .insert(clientes)
    // [Línea 124] Define los valores de las columnas a insertar.
    .values({
      // [Línea 125] Define o asigna el campo/parámetro 'tipoDoc'.
      tipoDoc: datos.tipoDoc,
      // [Línea 126] Define o asigna el campo/parámetro 'nroDoc'.
      nroDoc: documentoNuevo,
      // [Línea 127] Define o asigna el campo/parámetro 'nombre'.
      nombre: datos.nombre,
      // [Línea 128] Define o asigna el campo/parámetro 'domicilio'.
      domicilio: datos.domicilio || null,
      // [Línea 129] Define o asigna el campo/parámetro 'telefono'.
      telefono: datos.telefono || null,
      // [Línea 130] Define o asigna el campo/parámetro 'email'.
      email: datos.email || null,
      // [Línea 131] Define o asigna el campo/parámetro 'cuentaCorriente'.
      cuentaCorriente: datos.cuentaCorriente ?? false,
      // [Línea 132] Define o asigna el campo/parámetro 'limiteCredito'.
      limiteCredito: datos.cuentaCorriente ? (datos.limiteCredito ?? null) : null,
    // [Línea 133] Cierra el bloque o estructura (})).
    })
    // [Línea 134] Solicita que SQLite devuelva los datos de la fila recién insertada o actualizada.
    .returning();

  // [Línea 136] Devuelve el valor: obtenerCliente(usuario, clienteCreado.id);
  return obtenerCliente(usuario, clienteCreado.id);
// [Línea 137] Cierra el bloque o estructura (}).
}

// RF-C2 y RF-C7: edición y baja lógica.
// No se puede dar de baja ni quitar la cuenta corriente si el saldo no es cero.
// [Línea 141] Declara la función asíncrona 'editarCliente'.
export async function editarCliente(usuario: UsuarioSesion, idCliente: number, datosSinValidar: unknown) {
  // [Línea 142] Declara 'datos' y le asigna el valor resultante.
  const datos = validar(esquemaClienteEdicion, datosSinValidar);

  // [Línea 144] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'clienteExistente'.
  const clienteExistente = await db.select().from(clientes).where(eq(clientes.id, idCliente)).get();
  // [Línea 145] Verifica la condición: if (!clienteExistente) throw noEncontrado("El cliente");
  if (!clienteExistente) throw noEncontrado("El cliente");

  // [Línea 147] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'saldo'.
  const saldo = await saldoDeCliente(db, idCliente);
  // [Línea 148] Declara 'quiereDesactivar' y le asigna el valor resultante.
  const quiereDesactivar = datos.activo === false;
  // [Línea 149] Declara 'quiereQuitarCuenta' y le asigna el valor resultante.
  const quiereQuitarCuenta = datos.cuentaCorriente === false && clienteExistente.cuentaCorriente;
  // [Línea 150] Verifica la condición: if ((quiereDesactivar || quiereQuitarCuenta) && saldo !== 0) {
  if ((quiereDesactivar || quiereQuitarCuenta) && saldo !== 0) {
    // [Línea 151] Corta la ejecución y lanza el error: throw new ApiError(422, "SALDO_PENDIENTE", "El cliente tiene saldo pendiente en su cuenta corriente.");
    throw new ApiError(422, "SALDO_PENDIENTE", "El cliente tiene saldo pendiente en su cuenta corriente.");
  // [Línea 152] Cierra el bloque o estructura (}).
  }

  // [Línea 154] Declara 'cambios: Partial<Cliente>' y le asigna el valor resultante.
  const cambios: Partial<Cliente> = {};
  // [Línea 155] Verifica la condición: if (datos.tipoDoc !== undefined) cambios.tipoDoc = datos.tipoDoc;
  if (datos.tipoDoc !== undefined) cambios.tipoDoc = datos.tipoDoc;
  // [Línea 156] Verifica la condición: if (datos.nroDoc !== undefined) {
  if (datos.nroDoc !== undefined) {
    // [Línea 157] Ejecuta o evalúa: cambios.nroDoc = datos.nroDoc.replace(/\D/g, "");
    cambios.nroDoc = datos.nroDoc.replace(/\D/g, "");
    // [Línea 158] Verifica la condición: if (cambios.nroDoc !== clienteExistente.nroDoc) await verificarDocumentoLibre(cambios.nroDoc, idCliente);
    if (cambios.nroDoc !== clienteExistente.nroDoc) await verificarDocumentoLibre(cambios.nroDoc, idCliente);
  // [Línea 159] Cierra el bloque o estructura (}).
  }
  // [Línea 160] Verifica la condición: if (datos.nombre !== undefined) cambios.nombre = datos.nombre;
  if (datos.nombre !== undefined) cambios.nombre = datos.nombre;
  // [Línea 161] Verifica la condición: if (datos.domicilio !== undefined) cambios.domicilio = datos.domicilio || null;
  if (datos.domicilio !== undefined) cambios.domicilio = datos.domicilio || null;
  // [Línea 162] Verifica la condición: if (datos.telefono !== undefined) cambios.telefono = datos.telefono || null;
  if (datos.telefono !== undefined) cambios.telefono = datos.telefono || null;
  // [Línea 163] Verifica la condición: if (datos.email !== undefined) cambios.email = datos.email || null;
  if (datos.email !== undefined) cambios.email = datos.email || null;
  // [Línea 164] Verifica la condición: if (datos.cuentaCorriente !== undefined) cambios.cuentaCorriente = datos.cuentaCorriente;
  if (datos.cuentaCorriente !== undefined) cambios.cuentaCorriente = datos.cuentaCorriente;
  // [Línea 165] Verifica la condición: if (datos.limiteCredito !== undefined) cambios.limiteCredito = datos.limiteCredito;
  if (datos.limiteCredito !== undefined) cambios.limiteCredito = datos.limiteCredito;
  // [Línea 166] Verifica la condición: if (datos.activo !== undefined) cambios.activo = datos.activo;
  if (datos.activo !== undefined) cambios.activo = datos.activo;

  // [Línea 168] Actualiza las columnas de la tabla que cumplan la condición WHERE.
  await db.update(clientes).set(cambios).where(eq(clientes.id, idCliente));
  // [Línea 169] Devuelve el valor: obtenerCliente(usuario, idCliente);
  return obtenerCliente(usuario, idCliente);
// [Línea 170] Cierra el bloque o estructura (}).
}

// RF-C4: movimientos de la cuenta corriente en orden cronológico con el saldo acumulado.
// [Línea 173] Declara la función asíncrona 'obtenerCuentaCorriente'.
export async function obtenerCuentaCorriente(
  // [Línea 174] Define o asigna el campo/parámetro '_usuario'.
  _usuario: UsuarioSesion,
  // [Línea 175] Define o asigna el campo/parámetro 'idCliente'.
  idCliente: number,
  // [Línea 176] Define o asigna el campo/parámetro 'parametros'.
  parametros: { desde?: string; hasta?: string },
// [Línea 177] Ejecuta o evalúa: ) {
) {
  // [Línea 178] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'clienteEncontrado'.
  const clienteEncontrado = await db.select().from(clientes).where(eq(clientes.id, idCliente)).get();
  // [Línea 179] Verifica la condición: if (!clienteEncontrado) throw noEncontrado("El cliente");
  if (!clienteEncontrado) throw noEncontrado("El cliente");

  // Si "desde" corta el historial, se calcula lo acumulado antes de ese día.
  // [Línea 182] Declara 'saldoAnterior' y le asigna el valor resultante.
  let saldoAnterior = 0;
  // [Línea 183] Verifica la condición: if (parametros.desde) {
  if (parametros.desde) {
    // [Línea 184] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'fila'.
    const fila = await db
      // [Línea 185] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
      .select({
        // [Línea 186] Define o asigna el campo/parámetro 'saldo'.
        saldo: sql<number>`coalesce(sum(case when ${movimientosCuenta.tipo} = 'debito' then ${movimientosCuenta.importe} else -${movimientosCuenta.importe} end), 0)`,
      // [Línea 187] Cierra el bloque o estructura (})).
      })
      // [Línea 188] Define la tabla origen de la consulta SQL: .from(movimientosCuenta)
      .from(movimientosCuenta)
      // [Línea 189] Aplica el filtro WHERE a la consulta SQL: .where(and(eq(movimientosCuenta.clienteId, idCliente), lt(movimientosCuenta.fecha, inicioDelDia(parametros.desde))))
      .where(and(eq(movimientosCuenta.clienteId, idCliente), lt(movimientosCuenta.fecha, inicioDelDia(parametros.desde))))
      // [Línea 190] Ejecuta la consulta y obtiene una sola fila (o undefined si no hay coincidencias).
      .get();
    // [Línea 191] Ejecuta o evalúa: saldoAnterior = Number(fila?.saldo ?? 0);
    saldoAnterior = Number(fila?.saldo ?? 0);
  // [Línea 192] Cierra el bloque o estructura (}).
  }

  // [Línea 194] Declara 'condiciones' y le asigna el valor resultante.
  const condiciones = [eq(movimientosCuenta.clienteId, idCliente)];
  // [Línea 195] Verifica la condición: if (parametros.desde) condiciones.push(sql`${movimientosCuenta.fecha} >= ${inicioDelDia(parametros.desde).getTime()}`);
  if (parametros.desde) condiciones.push(sql`${movimientosCuenta.fecha} >= ${inicioDelDia(parametros.desde).getTime()}`);
  // [Línea 196] Verifica la condición: if (parametros.hasta) condiciones.push(sql`${movimientosCuenta.fecha} <= ${finDelDia(parametros.hasta).getTime()}`);
  if (parametros.hasta) condiciones.push(sql`${movimientosCuenta.fecha} <= ${finDelDia(parametros.hasta).getTime()}`);

  // [Línea 198] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filas'.
  const filas = await db
    // [Línea 199] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select()
    // [Línea 200] Define la tabla origen de la consulta SQL: .from(movimientosCuenta)
    .from(movimientosCuenta)
    // [Línea 201] Aplica el filtro WHERE a la consulta SQL: .where(and(...condiciones))
    .where(and(...condiciones))
    // [Línea 202] Ordena las filas del resultado SQL: .orderBy(asc(movimientosCuenta.fecha), asc(movimientosCuenta.id));
    .orderBy(asc(movimientosCuenta.fecha), asc(movimientosCuenta.id));

  // Se recorre en orden y se va acumulando: débito suma, crédito resta.
  // [Línea 205] Declara 'saldoAcumulado' y le asigna el valor resultante.
  let saldoAcumulado = saldoAnterior;
  // [Línea 206] Declara 'movimientos' y le asigna el valor resultante.
  const movimientos = filas.map((movimiento) => {
    // [Línea 207] Ejecuta o evalúa: saldoAcumulado += movimiento.tipo === "debito" ? movimiento.importe : -movimient
    saldoAcumulado += movimiento.tipo === "debito" ? movimiento.importe : -movimiento.importe;
    // [Línea 208] Devuelve el valor: {
    return {
      // [Línea 209] Define o asigna el campo/parámetro 'fecha'.
      fecha: movimiento.fecha.toISOString(),
      // [Línea 210] Define o asigna el campo/parámetro 'tipo'.
      tipo: movimiento.tipo,
      // [Línea 211] Define o asigna el campo/parámetro 'importe'.
      importe: movimiento.importe,
      // [Línea 212] Define o asigna el campo/parámetro 'descripcion'.
      descripcion: movimiento.descripcion,
      // [Línea 213] Define o asigna el campo/parámetro 'facturaId'.
      facturaId: movimiento.facturaId,
      // [Línea 214] Define o asigna el campo/parámetro 'pagoId'.
      pagoId: movimiento.pagoId,
      // [Línea 215] Define o asigna el campo/parámetro 'saldo'.
      saldo: saldoAcumulado,
    // [Línea 216] Cierra el bloque o estructura (};).
    };
  // [Línea 217] Cierra el bloque o estructura (});).
  });

  // [Línea 219] Devuelve el valor: {
  return {
    // [Línea 220] Define o asigna el campo/parámetro 'cliente'.
    cliente: { id: clienteEncontrado.id, nombre: clienteEncontrado.nombre },
    // [Línea 221] Ejecuta o evalúa: saldoAnterior,
    saldoAnterior,
    // [Línea 222] Ejecuta o evalúa: movimientos,
    movimientos,
    // [Línea 223] Define o asigna el campo/parámetro 'saldo'.
    saldo: saldoAcumulado,
  // [Línea 224] Cierra el bloque o estructura (};).
  };
// [Línea 225] Cierra el bloque o estructura (}).
}

// ---------- Funciones internas ----------

// Forma pública del cliente (sección 11.5). "disponible" = límite - saldo.
// [Línea 230] Declara la función o componente 'aClientePublico'.
export function aClientePublico(cliente: Cliente, saldo: number) {
  // [Línea 231] Devuelve el valor: {
  return {
    // [Línea 232] Define o asigna el campo/parámetro 'id'.
    id: cliente.id,
    // [Línea 233] Define o asigna el campo/parámetro 'tipoDoc'.
    tipoDoc: cliente.tipoDoc,
    // [Línea 234] Define o asigna el campo/parámetro 'nroDoc'.
    nroDoc: formatearDocumento(cliente.tipoDoc, cliente.nroDoc),
    // [Línea 235] Define o asigna el campo/parámetro 'nombre'.
    nombre: cliente.nombre,
    // [Línea 236] Define o asigna el campo/parámetro 'domicilio'.
    domicilio: cliente.domicilio,
    // [Línea 237] Define o asigna el campo/parámetro 'telefono'.
    telefono: cliente.telefono,
    // [Línea 238] Define o asigna el campo/parámetro 'email'.
    email: cliente.email,
    // [Línea 239] Define o asigna el campo/parámetro 'cuentaCorriente'.
    cuentaCorriente: cliente.cuentaCorriente,
    // [Línea 240] Define o asigna el campo/parámetro 'limiteCredito'.
    limiteCredito: cliente.limiteCredito,
    // [Línea 241] Ejecuta o evalúa: saldo,
    saldo,
    // [Línea 242] Define o asigna el campo/parámetro 'disponible'.
    disponible: cliente.limiteCredito === null ? null : cliente.limiteCredito - saldo,
    // [Línea 243] Define o asigna el campo/parámetro 'activo'.
    activo: cliente.activo,
  // [Línea 244] Cierra el bloque o estructura (};).
  };
// [Línea 245] Cierra el bloque o estructura (}).
}

// [Línea 247] Define el tipo de datos 'ClientePublico' en TypeScript.
export type ClientePublico = ReturnType<typeof aClientePublico>;

// [Línea 249] Declara la función asíncrona 'verificarDocumentoLibre'.
async function verificarDocumentoLibre(nroDoc: string, idQueSeEdita?: number) {
  // [Línea 250] Declara 'condicion' y le asigna el valor resultante.
  const condicion = idQueSeEdita
    // [Línea 251] Ejecuta o evalúa: ? and(eq(clientes.nroDoc, nroDoc), ne(clientes.id, idQueSeEdita))
    ? and(eq(clientes.nroDoc, nroDoc), ne(clientes.id, idQueSeEdita))
    // [Línea 252] Ejecuta o evalúa: : eq(clientes.nroDoc, nroDoc);
    : eq(clientes.nroDoc, nroDoc);
  // [Línea 253] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'otroCliente'.
  const otroCliente = await db.select({ id: clientes.id }).from(clientes).where(condicion).get();
  // [Línea 254] Verifica la condición: if (otroCliente) {
  if (otroCliente) {
    // [Línea 255] Corta la ejecución y lanza el error: throw new ApiError(409, "DOCUMENTO_DUPLICADO", "Ya existe un cliente con ese documento.", [
    throw new ApiError(409, "DOCUMENTO_DUPLICADO", "Ya existe un cliente con ese documento.", [
      // [Línea 256] Ejecuta o evalúa: { campo: "nroDoc", mensaje: "Ya existe un cliente con ese documento." },
      { campo: "nroDoc", mensaje: "Ya existe un cliente con ese documento." },
    // [Línea 257] Cierra el bloque o estructura (]);).
    ]);
  // [Línea 258] Cierra el bloque o estructura (}).
  }
// [Línea 259] Cierra el bloque o estructura (}).
}
