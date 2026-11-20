// Servicio de CLIENTES y CUENTA CORRIENTE. RF-C1, RF-C2, RF-C3, RF-C4, RF-C6, RF-C7.
//
// Regla 7: saldo del cliente = débitos - créditos. El saldo NO se guarda en la tabla
// de clientes: siempre se calcula desde "movimientos_cuenta" (una sola fuente de verdad).
import { and, asc, count, desc, eq, gt, like, lt, ne, or, sql, sum } from "drizzle-orm";
import { db, type Conexion } from "@/basedatos/conexion";
import { clientes, facturas, movimientosCuenta, type Cliente } from "@/basedatos/esquema";
import { esquemaClienteEdicion, esquemaClienteNuevo } from "@/esquemas/clientes";
import { formatearDocumento, formatearNumeroFactura, inicioDelDia, finDelDia } from "@/lib/formato";
import { ApiError, noEncontrado } from "./errores";
import { leerPaginacion, respuestaPaginada, validar, type UsuarioSesion } from "./comunes";

// Expresión SQL que calcula el saldo de cada cliente (se usa en listados y ordenamientos).
const saldoCalculado = sql<number>`coalesce((
  select sum(case when ${movimientosCuenta.tipo} = 'debito' then ${movimientosCuenta.importe} else -${movimientosCuenta.importe} end)
  from ${movimientosCuenta}
  where ${movimientosCuenta.clienteId} = ${clientes.id}
), 0)`;

// Regla 7: saldo de UN cliente. Recibe "conexion" para poder usarse dentro de una transacción.
export async function saldoDeCliente(conexion: Conexion, idCliente: number): Promise<number> {
  const fila = await conexion
    .select({
      debitos: sum(sql`case when ${movimientosCuenta.tipo} = 'debito' then ${movimientosCuenta.importe} else 0 end`),
      creditos: sum(sql`case when ${movimientosCuenta.tipo} = 'credito' then ${movimientosCuenta.importe} else 0 end`),
    })
    .from(movimientosCuenta)
    .where(eq(movimientosCuenta.clienteId, idCliente))
    .get();
  return Number(fila?.debitos ?? 0) - Number(fila?.creditos ?? 0);
}

type FiltrosClientes = {
  q?: string;
  conDeuda?: string;
  orden?: string; // "nombre" (por defecto) o "saldo"
  activo?: string; // "true" (por defecto) o "todos"
  page?: string;
  pageSize?: string;
};

// RF-C1 y RF-C6: listado con búsqueda por nombre o documento y el saldo de cada cliente.
export async function listarClientes(_usuario: UsuarioSesion, parametros: FiltrosClientes) {
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  const condiciones = [];
  if (parametros.q) {
    const textoBuscado = `%${parametros.q}%`;
    const soloDigitos = parametros.q.replace(/\D/g, ""); // "28.456" -> "28456"
    condiciones.push(
      soloDigitos
        ? or(like(clientes.nombre, textoBuscado), like(clientes.nroDoc, `%${soloDigitos}%`))
        : like(clientes.nombre, textoBuscado),
    );
  }
  if (parametros.activo !== "todos") condiciones.push(eq(clientes.activo, true));
  if (parametros.conDeuda === "true") condiciones.push(gt(saldoCalculado, 0));
  const filtro = and(...condiciones);

  const orden = parametros.orden === "saldo" || parametros.conDeuda === "true"
    ? [desc(saldoCalculado), asc(clientes.nombre)]
    : [asc(clientes.nombre)];

  const filas = await db
    .select({ cliente: clientes, saldo: saldoCalculado })
    .from(clientes)
    .where(filtro)
    .orderBy(...orden)
    .limit(tamanoPagina)
    .offset(salto);
  const [{ total }] = await db.select({ total: count() }).from(clientes).where(filtro);

  const respuesta = respuestaPaginada(
    filas.map((fila) => aClientePublico(fila.cliente, Number(fila.saldo))),
    pagina,
    tamanoPagina,
    total,
  );

  // RF-C6: con conDeuda=true se agrega el total adeudado entre todos los clientes.
  if (parametros.conDeuda === "true") {
    const [{ totalAdeudado }] = await db
      .select({ totalAdeudado: sql<number>`coalesce(sum(${saldoCalculado}), 0)` })
      .from(clientes)
      .where(filtro);
    return { ...respuesta, totalAdeudado: Number(totalAdeudado) };
  }
  return respuesta;
}

// RF-C3: ficha del cliente con su saldo y sus 6 últimas facturas.
export async function obtenerCliente(_usuario: UsuarioSesion, idCliente: number) {
  const clienteEncontrado = await db.select().from(clientes).where(eq(clientes.id, idCliente)).get();
  if (!clienteEncontrado) throw noEncontrado("El cliente");

  const saldo = await saldoDeCliente(db, idCliente);
  const filasFacturas = await db
    .select()
    .from(facturas)
    .where(eq(facturas.clienteId, idCliente))
    .orderBy(desc(facturas.fecha))
    .limit(6);

  const ultimasFacturas = filasFacturas.map((factura) => ({
    id: factura.id,
    numeroFormateado: formatearNumeroFactura(factura.puntoVenta, factura.numero),
    fecha: factura.fecha.toISOString(),
    total: factura.total,
    formaPago: factura.formaPago,
    estado: factura.estado,
  }));

  return { ...aClientePublico(clienteEncontrado, saldo), ultimasFacturas };
}

// RF-C2 / RF-V2: alta de cliente (también desde el modal de Nueva venta).
export async function crearCliente(usuario: UsuarioSesion, datosSinValidar: unknown) {
  const datos = validar(esquemaClienteNuevo, datosSinValidar);
  const documentoNuevo = datos.nroDoc.replace(/\D/g, ""); // se guarda solo con dígitos
  await verificarDocumentoLibre(documentoNuevo);

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

  return obtenerCliente(usuario, clienteCreado.id);
}

// RF-C2 y RF-C7: edición y baja lógica.
// No se puede dar de baja ni quitar la cuenta corriente si el saldo no es cero.
export async function editarCliente(usuario: UsuarioSesion, idCliente: number, datosSinValidar: unknown) {
  const datos = validar(esquemaClienteEdicion, datosSinValidar);

  const clienteExistente = await db.select().from(clientes).where(eq(clientes.id, idCliente)).get();
  if (!clienteExistente) throw noEncontrado("El cliente");

  const saldo = await saldoDeCliente(db, idCliente);
  const quiereDesactivar = datos.activo === false;
  const quiereQuitarCuenta = datos.cuentaCorriente === false && clienteExistente.cuentaCorriente;
  if ((quiereDesactivar || quiereQuitarCuenta) && saldo !== 0) {
    throw new ApiError(422, "SALDO_PENDIENTE", "El cliente tiene saldo pendiente en su cuenta corriente.");
  }

  const cambios: Partial<Cliente> = {};
  if (datos.tipoDoc !== undefined) cambios.tipoDoc = datos.tipoDoc;
  if (datos.nroDoc !== undefined) {
    cambios.nroDoc = datos.nroDoc.replace(/\D/g, "");
    if (cambios.nroDoc !== clienteExistente.nroDoc) await verificarDocumentoLibre(cambios.nroDoc, idCliente);
  }
  if (datos.nombre !== undefined) cambios.nombre = datos.nombre;
  if (datos.domicilio !== undefined) cambios.domicilio = datos.domicilio || null;
  if (datos.telefono !== undefined) cambios.telefono = datos.telefono || null;
  if (datos.email !== undefined) cambios.email = datos.email || null;
  if (datos.cuentaCorriente !== undefined) cambios.cuentaCorriente = datos.cuentaCorriente;
  if (datos.limiteCredito !== undefined) cambios.limiteCredito = datos.limiteCredito;
  if (datos.activo !== undefined) cambios.activo = datos.activo;

  await db.update(clientes).set(cambios).where(eq(clientes.id, idCliente));
  return obtenerCliente(usuario, idCliente);
}

// RF-C4: movimientos de la cuenta corriente en orden cronológico con el saldo acumulado.
export async function obtenerCuentaCorriente(
  _usuario: UsuarioSesion,
  idCliente: number,
  parametros: { desde?: string; hasta?: string },
) {
  const clienteEncontrado = await db.select().from(clientes).where(eq(clientes.id, idCliente)).get();
  if (!clienteEncontrado) throw noEncontrado("El cliente");

  // Si "desde" corta el historial, se calcula lo acumulado antes de ese día.
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

  const condiciones = [eq(movimientosCuenta.clienteId, idCliente)];
  if (parametros.desde) condiciones.push(sql`${movimientosCuenta.fecha} >= ${inicioDelDia(parametros.desde).getTime()}`);
  if (parametros.hasta) condiciones.push(sql`${movimientosCuenta.fecha} <= ${finDelDia(parametros.hasta).getTime()}`);

  const filas = await db
    .select()
    .from(movimientosCuenta)
    .where(and(...condiciones))
    .orderBy(asc(movimientosCuenta.fecha), asc(movimientosCuenta.id));

  // Se recorre en orden y se va acumulando: débito suma, crédito resta.
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

  return {
    cliente: { id: clienteEncontrado.id, nombre: clienteEncontrado.nombre },
    saldoAnterior,
    movimientos,
    saldo: saldoAcumulado,
  };
}

// ---------- Funciones internas ----------

// Forma pública del cliente (sección 11.5). "disponible" = límite - saldo.
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

export type ClientePublico = ReturnType<typeof aClientePublico>;

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
