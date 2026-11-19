// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: servicios/facturas.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================
//
// [DEFENSA PARCIAL] ¿Qué tablas se modifican al confirmar una factura?
// Se modifican: 1) facturas, 2) factura_items, 3) productos (stock), 4) movimientos_stock,
// y 5) movimientos_cuenta (si fue en cuenta corriente).
// [DEFENSA PARCIAL] ¿Dónde se asegura que una factura se grabe completa o nada? Con db.transaction().
// [DEFENSA PARCIAL] ¿Dónde se asigna el número? En obtenerProximoNumeroFactura() de forma correlativa.
// [DEFENSA PARCIAL] ¿Si cambia el precio de un producto qué pasa con las facturas emitidas?
// Nada, porque en factura_items se guarda una copia congelada (precio_unitario) al momento de la venta.
// [DEFENSA PARCIAL] ¿Dónde se impide vender en cuenta corriente a Consumidor Final? En la validación previa.
//

// Servicio de FACTURAS (ventas, consulta y anulación).
// RF-V1 a RF-V9. Reglas 1, 2, 3, 4, 5, 6, 7 y 9.
// Acá importamos funciones y operadores de Drizzle ORM para interactuar con la base de datos
import { and, count, desc, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
// Acá importamos la conexión y definición de tablas de la base de datos
import { db, type Conexion } from "@/basedatos/conexion";
import {
  clientes,
  facturaItems,
  facturas,
  movimientosCuenta,
  productos,
  usuarios,
} from "@/basedatos/esquema";
// Acá importamos esquemas de validación
import { esquemaAnulacion, esquemaFacturaNueva } from "@/esquemas/facturas";
import {
  finDelDia,
  formatearDocumento,
  formatearNumeroFactura,
  inicioDelDia,
  PUNTO_DE_VENTA,
} from "@/lib/formato";
import { ApiError, noEncontrado } from "./errores";
import {
  exigirAdmin,
  leerPaginacion,
  respuestaPaginada,
  validar,
  type UsuarioSesion,
} from "./comunes";
import { moverStock } from "./stock";
import { saldoDeCliente } from "./clientes";

// RF-V1: devuelve el próximo número informativo para mostrar en la pantalla de Nueva venta.
// El número definitivo se asigna recién al confirmar dentro de la transacción (regla 4).
export async function obtenerProximoNumeroFactura(_usuario: UsuarioSesion) {
  const proximo = await calcularProximoNumero(db);
  return {
    puntoVenta: PUNTO_DE_VENTA,
    numero: proximo,
    numeroFormateado: formatearNumeroFactura(PUNTO_DE_VENTA, proximo),
  };
}

// RF-V1 a RF-V6: emite una factura completa en UNA SOLA TRANSACCIÓN ATÓMICA.
// Si cualquier paso falla, no se graba ni factura, ni descuento de stock, ni deuda.
export async function emitirFactura(
  usuarioVendedor: UsuarioSesion,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
  const compraCliente = validar(esquemaFacturaNueva, datosSinValidar);

  // Iniciamos una transacción atómica: o se ejecutan todos los cambios juntos o no se guarda ninguno
  const idFacturaCreada = await db.transaction(async (tx) => {
    // Paso 1: buscar todos los productos pedidos y verificar que existan y estén activos.
    const idsProductosPedidos = compraCliente.items.map((item) => item.productoId);
    const productosEncontrados = await tx
      .select()
      .from(productos)
      .where(inArray(productos.id, idsProductosPedidos));

    const mapaProductos = new Map(productosEncontrados.map((prod) => [prod.id, prod]));

    for (const itemPedido of compraCliente.items) {
      const productoCatalogo = mapaProductos.get(itemPedido.productoId);
      // Comprobamos si el registro solicitado existe en el sistema
      if (!productoCatalogo) throw noEncontrado(`El producto #${itemPedido.productoId}`);
      // Comprobamos si el registro solicitado existe en el sistema
      if (!productoCatalogo.activo) {
        // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
        throw new ApiError(
          422,
          "PRODUCTO_INACTIVO",
          `El producto "${productoCatalogo.descripcion}" está dado de baja y no se puede vender.`,
        );
      }
    }

    // Paso 2: verificar al cliente comprador y las reglas de cuenta corriente (regla 6).
    let clienteComprador = null;
    if (compraCliente.clienteId !== null) {
      clienteComprador = await tx
        .select()
        .from(clientes)
        .where(eq(clientes.id, compraCliente.clienteId))
        .get();
      // Comprobamos si el registro solicitado existe en el sistema
      if (!clienteComprador || !clienteComprador.activo) {
        throw noEncontrado("El cliente");
      }
    }

    if (compraCliente.pago.forma === "cuenta_corriente") {
      // Comprobamos si el registro solicitado existe en el sistema
      if (!clienteComprador || !clienteComprador.cuentaCorriente) {
        // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
        throw new ApiError(
          422,
          "CUENTA_CORRIENTE_NO_HABILITADA",
          "Para vender en cuenta corriente el comprador debe ser un cliente registrado y habilitado.",
        );
      }
    }

    // Paso 3: comprobar que la existencia alcance para todos los renglones (regla 1).
    const faltantesDeStock = [];
    for (const itemPedido of compraCliente.items) {
      const productoCatalogo = mapaProductos.get(itemPedido.productoId)!;
      // Verificamos si hay suficiente stock disponible para realizar la venta
      if (productoCatalogo.existencia < itemPedido.cantidad) {
        faltantesDeStock.push({
          productoId: productoCatalogo.id,
          codigo: productoCatalogo.codigo,
          descripcion: productoCatalogo.descripcion,
          solicitado: itemPedido.cantidad,
          disponible: productoCatalogo.existencia,
        });
      }
    }
    if (faltantesDeStock.length > 0) {
      // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
      throw new ApiError(
        409,
        "STOCK_INSUFICIENTE",
        "No hay existencia suficiente para completar la venta.",
        faltantesDeStock,
      );
    }

    // Paso 4: congelar el precio actual del catálogo y calcular subtotales y total (regla 3).
    const renglonesCalculados = compraCliente.items.map((itemPedido) => {
      const productoCatalogo = mapaProductos.get(itemPedido.productoId)!;
      const precioUnitario = productoCatalogo.precio;
      const subtotalRenglon = precioUnitario * itemPedido.cantidad;
      return {
        productoId: productoCatalogo.id,
        codigo: productoCatalogo.codigo,
        descripcion: productoCatalogo.descripcion,
        cantidad: itemPedido.cantidad,
        precioUnitario,
        subtotal: subtotalRenglon,
      };
    });

    const totalFactura = renglonesCalculados.reduce((suma, r) => suma + r.subtotal, 0);

    // Paso 5: validar el monto recibido (en contado) o el límite de crédito (en cuenta corriente).
    let montoRecibidoContado: number | null = null;
    if (compraCliente.pago.forma === "contado") {
      montoRecibidoContado = compraCliente.pago.montoRecibido ?? totalFactura;
      if (montoRecibidoContado < totalFactura) {
        // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
        throw new ApiError(
          422,
          "MONTO_INSUFICIENTE",
          "El monto recibido no alcanza para cubrir el total de la venta.",
        );
      }
    }

    if (compraCliente.pago.forma === "cuenta_corriente" && clienteComprador) {
      const saldoActualCliente = await saldoDeCliente(tx, clienteComprador.id);
      const nuevoSaldoCliente = saldoActualCliente + totalFactura;
      if (
        clienteComprador.limiteCredito !== null &&
        nuevoSaldoCliente > clienteComprador.limiteCredito
      ) {
        const excedente = nuevoSaldoCliente - clienteComprador.limiteCredito;
        // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
        throw new ApiError(
          422,
          "LIMITE_CREDITO_EXCEDIDO",
          "La venta supera el límite de crédito disponible del cliente.",
          [
            {
              saldoActual: saldoActualCliente,
              limite: clienteComprador.limiteCredito,
              excedente,
            },
          ],
        );
      }
    }

    // Paso 6: asignar el próximo número correlativo sin huecos (regla 4).
    const numeroAsignado = await calcularProximoNumero(tx);
    const fechaEmision = opciones.fecha ?? new Date();
    const numeroFormateado = formatearNumeroFactura(PUNTO_DE_VENTA, numeroAsignado);

    // Paso 7: insertar la cabecera de la factura y sus renglones con precios congelados.
    const datosTarjeta =
      compraCliente.pago.forma === "tarjeta" ? compraCliente.pago.tarjeta : null;

    const [facturaInsertada] = await tx
      .insert(facturas)
      .values({
        puntoVenta: PUNTO_DE_VENTA,
        numero: numeroAsignado,
        fecha: fechaEmision,
        clienteId: compraCliente.clienteId,
        usuarioId: usuarioVendedor.id,
        total: totalFactura,
        formaPago: compraCliente.pago.forma,
        montoRecibido: montoRecibidoContado,
        tarjetaTipo: datosTarjeta ? datosTarjeta.tipo : null,
        tarjetaMarca: datosTarjeta ? datosTarjeta.marca : null,
        tarjetaUltimos4: datosTarjeta ? datosTarjeta.ultimos4 : null,
        estado: "emitida",
      })
      .returning();

    // Insertamos el nuevo registro en la base de datos
    await tx.insert(facturaItems).values(
      renglonesCalculados.map((renglon) => ({
        facturaId: facturaInsertada.id,
        productoId: renglon.productoId,
        codigo: renglon.codigo,
        descripcion: renglon.descripcion,
        cantidad: renglon.cantidad,
        precioUnitario: renglon.precioUnitario,
        subtotal: renglon.subtotal,
      })),
    );

    // Paso 8: descontar la existencia de cada producto de forma atómica con moverStock (reglas 1 y 2).
    for (const renglon of renglonesCalculados) {
      await moverStock(tx, {
        productoId: renglon.productoId,
        cantidad: -renglon.cantidad,
        tipo: "venta",
        motivo: `Venta ${numeroFormateado}`,
        usuarioId: usuarioVendedor.id,
        facturaId: facturaInsertada.id,
        fecha: fechaEmision,
      });
    }

    // Paso 9: si la venta es en cuenta corriente, registrar el débito en la cuenta del cliente.
    if (compraCliente.pago.forma === "cuenta_corriente" && clienteComprador) {
      // Insertamos el nuevo registro en la base de datos
      await tx.insert(movimientosCuenta).values({
        clienteId: clienteComprador.id,
        facturaId: facturaInsertada.id,
        pagoId: null,
        tipo: "debito",
        importe: totalFactura,
        descripcion: `Factura ${numeroFormateado}`,
        fecha: fechaEmision,
      });
    }

    return facturaInsertada.id;
  });

  return obtenerFactura(usuarioVendedor, idFacturaCreada);
}

// RF-V9: anula una factura (solo administrador, motivo obligatorio). Regla 5.
// Reingresa el stock y, si fue en cuenta corriente, registra un crédito en la cuenta del cliente.
export async function anularFactura(
  usuarioAdmin: UsuarioSesion,
  idFactura: number,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
  exigirAdmin(usuarioAdmin);
  const datosAnulacion = validar(esquemaAnulacion, datosSinValidar);

  // Iniciamos una transacción atómica: o se ejecutan todos los cambios juntos o no se guarda ninguno
  await db.transaction(async (tx) => {
    const facturaExistente = await tx
      .select()
      .from(facturas)
      .where(eq(facturas.id, idFactura))
      .get();

    if (!facturaExistente) throw noEncontrado("La factura");
    if (facturaExistente.estado === "anulada") {
      // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
      throw new ApiError(409, "FACTURA_ANULADA", "La factura ya se encuentra anulada.");
    }

    const fechaAnulacion = opciones.fecha ?? new Date();
    const numeroFormateado = formatearNumeroFactura(
      facturaExistente.puntoVenta,
      facturaExistente.numero,
    );

    // 1. Marcar la factura como anulada conservando su historial.
    await tx
      .update(facturas)
      .set({
        estado: "anulada",
        motivoAnulacion: datosAnulacion.motivo,
        fechaAnulacion,
        usuarioAnulacionId: usuarioAdmin.id,
      })
      .where(eq(facturas.id, idFactura));

    // 2. Reingresar la existencia de cada renglón con un movimiento de tipo "anulacion".
    const renglones = await tx
      .select()
      .from(facturaItems)
      .where(eq(facturaItems.facturaId, idFactura));

    for (const renglon of renglones) {
      await moverStock(tx, {
        productoId: renglon.productoId,
        cantidad: renglon.cantidad, // positivo: vuelve a entrar al stock
        tipo: "anulacion",
        motivo: `Anulación ${numeroFormateado}: ${datosAnulacion.motivo}`,
        usuarioId: usuarioAdmin.id,
        facturaId: idFactura,
        fecha: fechaAnulacion,
      });
    }

    // 3. Si la venta fue en cuenta corriente, acreditar el importe en la cuenta del cliente.
    if (
      facturaExistente.formaPago === "cuenta_corriente" &&
      facturaExistente.clienteId !== null
    ) {
      // Insertamos el nuevo registro en la base de datos
      await tx.insert(movimientosCuenta).values({
        clienteId: facturaExistente.clienteId,
        facturaId: idFactura,
        pagoId: null,
        tipo: "credito",
        importe: facturaExistente.total,
        descripcion: `Anulación factura ${numeroFormateado}`,
        fecha: fechaAnulacion,
      });
    }
  });

  return obtenerFactura(usuarioAdmin, idFactura);
}

type FiltrosFacturas = {
  q?: string;
  desde?: string;
  hasta?: string;
  clienteId?: string;
  vendedorId?: string;
  forma?: string;
  estado?: string;
  page?: string;
  pageSize?: string;
};

// RF-V8: listado paginado de facturas con filtros y suma del total emitido.
export async function listarFacturas(_usuario: UsuarioSesion, parametros: FiltrosFacturas) {
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  const condiciones = [];
  if (parametros.desde) condiciones.push(gte(facturas.fecha, inicioDelDia(parametros.desde)));
  if (parametros.hasta) condiciones.push(lte(facturas.fecha, finDelDia(parametros.hasta)));
  if (parametros.clienteId) condiciones.push(eq(facturas.clienteId, Number(parametros.clienteId)));
  if (parametros.vendedorId) condiciones.push(eq(facturas.usuarioId, Number(parametros.vendedorId)));
  if (
    parametros.forma === "contado" ||
    parametros.forma === "tarjeta" ||
    parametros.forma === "cuenta_corriente"
  ) {
    condiciones.push(eq(facturas.formaPago, parametros.forma));
  }
  if (parametros.estado === "emitida" || parametros.estado === "anulada") {
    condiciones.push(eq(facturas.estado, parametros.estado));
  }
  if (parametros.q) {
    const textoBuscado = parametros.q.trim();
    const soloDigitos = Number(textoBuscado.replace(/\D/g, ""));
    if (!Number.isNaN(soloDigitos) && soloDigitos > 0) {
      condiciones.push(
        or(
          eq(facturas.numero, soloDigitos),
          like(clientes.nombre, `%${textoBuscado}%`),
        ),
      );
    } else {
      condiciones.push(like(clientes.nombre, `%${textoBuscado}%`));
    }
  }

  const filtro = and(...condiciones);

  const filas = await db
    .select({
      factura: facturas,
      nombreCliente: clientes.nombre,
      tipoDocCliente: clientes.tipoDoc,
      nroDocCliente: clientes.nroDoc,
      nombreVendedor: usuarios.nombre,
    })
    .from(facturas)
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .innerJoin(usuarios, eq(facturas.usuarioId, usuarios.id))
    .where(filtro)
    .orderBy(desc(facturas.fecha), desc(facturas.id))
    .limit(tamanoPagina)
    .offset(salto);

  const [{ total }] = await db
    .select({ total: count() })
    .from(facturas)
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .where(filtro);

  // Suma de las facturas EMITIDAS que cumplen con el filtro actual.
  const filtroEmitidas = and(filtro, eq(facturas.estado, "emitida"));
  const [{ totalEmitido }] = await db
    .select({ totalEmitido: sql<number>`coalesce(sum(${facturas.total}), 0)` })
    .from(facturas)
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .where(filtroEmitidas);

  const datos = filas.map((fila) => ({
    id: fila.factura.id,
    puntoVenta: fila.factura.puntoVenta,
    numero: fila.factura.numero,
    numeroFormateado: formatearNumeroFactura(fila.factura.puntoVenta, fila.factura.numero),
    fecha: fila.factura.fecha.toISOString(),
    estado: fila.factura.estado,
    cliente:
      fila.factura.clienteId && fila.nombreCliente
        ? {
            id: fila.factura.clienteId,
            nombre: fila.nombreCliente,
            tipoDoc: fila.tipoDocCliente!,
            nroDoc: formatearDocumento(fila.tipoDocCliente!, fila.nroDocCliente!),
          }
        : null,
    vendedor: { id: fila.factura.usuarioId, nombre: fila.nombreVendedor },
    total: fila.factura.total,
    formaPago: fila.factura.formaPago,
  }));

  return {
    ...respuestaPaginada(datos, pagina, tamanoPagina, total),
    totalEmitido: Number(totalEmitido),
  };
}

// RF-V7: obtiene una factura completa con sus renglones, forma de pago y datos de anulación.
export async function obtenerFactura(_usuario: UsuarioSesion, idFactura: number) {
  const fila = await db
    .select({
      factura: facturas,
      nombreCliente: clientes.nombre,
      tipoDocCliente: clientes.tipoDoc,
      nroDocCliente: clientes.nroDoc,
      domicilioCliente: clientes.domicilio,
      nombreVendedor: usuarios.nombre,
    })
    .from(facturas)
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .innerJoin(usuarios, eq(facturas.usuarioId, usuarios.id))
    .where(eq(facturas.id, idFactura))
    .get();

  if (!fila) throw noEncontrado("La factura");

  const { factura } = fila;
  const renglones = await db
    .select()
    .from(facturaItems)
    .where(eq(facturaItems.facturaId, idFactura));

  // Si es pago contado devolvemos montoRecibido y vuelto; si es tarjeta, los datos seguros.
  let detallePago:
    | { forma: "contado"; montoRecibido: number; vuelto: number }
    | {
        forma: "tarjeta";
        tarjeta: { tipo: "debito" | "credito"; marca: string; ultimos4: string };
      }
    | { forma: "cuenta_corriente" };

  if (factura.formaPago === "contado") {
    const recibido = factura.montoRecibido ?? factura.total;
    detallePago = {
      forma: "contado",
      montoRecibido: recibido,
      vuelto: recibido - factura.total,
    };
  } else if (factura.formaPago === "tarjeta") {
    detallePago = {
      forma: "tarjeta",
      tarjeta: {
        tipo: factura.tarjetaTipo ?? "debito",
        marca: factura.tarjetaMarca ?? "Visa",
        ultimos4: factura.tarjetaUltimos4 ?? "0000",
      },
    };
  } else {
    detallePago = { forma: "cuenta_corriente" };
  }

  let datosAnulacion = null;
  if (factura.estado === "anulada") {
    let usuarioAnulacion = null;
    if (factura.usuarioAnulacionId) {
      const filaAdmin = await db
        .select({ id: usuarios.id, nombre: usuarios.nombre })
        .from(usuarios)
        .where(eq(usuarios.id, factura.usuarioAnulacionId))
        .get();
      if (filaAdmin) usuarioAnulacion = filaAdmin;
    }
    datosAnulacion = {
      fecha: (factura.fechaAnulacion ?? factura.fecha).toISOString(),
      motivo: factura.motivoAnulacion ?? "",
      usuario: usuarioAnulacion,
    };
  }

  const respuestaBase = {
    id: factura.id,
    puntoVenta: factura.puntoVenta,
    numero: factura.numero,
    numeroFormateado: formatearNumeroFactura(factura.puntoVenta, factura.numero),
    fecha: factura.fecha.toISOString(),
    estado: factura.estado,
    cliente:
      factura.clienteId && fila.nombreCliente
        ? {
            id: factura.clienteId,
            nombre: fila.nombreCliente,
            tipoDoc: fila.tipoDocCliente!,
            nroDoc: formatearDocumento(fila.tipoDocCliente!, fila.nroDocCliente!),
            domicilio: fila.domicilioCliente,
          }
        : null,
    vendedor: { id: factura.usuarioId, nombre: fila.nombreVendedor },
    items: renglones.map((r) => ({
      productoId: r.productoId,
      codigo: r.codigo,
      descripcion: r.descripcion,
      cantidad: r.cantidad,
      precioUnitario: r.precioUnitario,
      subtotal: r.subtotal,
    })),
    total: factura.total,
    pago: detallePago,
    ...(datosAnulacion ? { anulacion: datosAnulacion } : {}),
  };

  if (factura.formaPago === "cuenta_corriente" && factura.clienteId) {
    const saldoCliente = await saldoDeCliente(db, factura.clienteId);
    return { ...respuestaBase, saldoCliente };
  }

  return respuestaBase;
}

export type FacturaCompleta = Awaited<ReturnType<typeof obtenerFactura>>;

// Calcula el siguiente número correlativo dentro del punto de venta actual.
async function calcularProximoNumero(conexion: Conexion): Promise<number> {
  const fila = await conexion
    .select({ ultimo: sql<number>`coalesce(max(${facturas.numero}), 0)` })
    .from(facturas)
    .where(eq(facturas.puntoVenta, PUNTO_DE_VENTA))
    .get();
  return Number(fila?.ultimo ?? 0) + 1;
}
