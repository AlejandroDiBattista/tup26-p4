# Análisis y Código Línea por Línea: Módulo de Ventas

> **Archivo original:** `servicios/facturas.ts`  
> **Propósito:** Explicación técnica de cada instrucción, tipo de dato, consulta Drizzle ORM y regla de negocio para la defensa del examen parcial.

```typescript
// ============================================================================
// ANÁLISIS DETALLADO LÍNEA POR LÍNEA: SERVICIO DE FACTURACIÓN (servicios/facturas.ts)
// Sistema de Gestión Comercial - Ferretería El Yunque (TP5 / Segundo Parcial)
// Este archivo contiene la lógica central del negocio: emisión de comprobantes,
// transacción atómica de base de datos, congelamiento de precios, control de
// crédito y anulación con reposición automática de stock.
// ============================================================================

// Servicio de FACTURAS (ventas, consulta y anulación).
// RF-V1 a RF-V9. Reglas 1, 2, 3, 4, 5, 6, 7 y 9.
// Importamos operadores lógicos y funciones SQL de Drizzle ORM:
// - 'and', 'or': combinan múltiples condiciones WHERE
// - 'count': función agregada SQL COUNT(*) para contar registros
// - 'desc': ordenamiento descendente (ORDER BY ... DESC)
// - 'eq': operador de igualdad (=)
// - 'gte', 'lte': mayor o igual (>=) y menor o igual (<=)
// - 'inArray': operador SQL IN (...) para buscar listas de IDs
// - 'like': búsqueda por coincidencia parcial de texto LIKE '%...%'
// - 'sql': plantilla para ejecutar fragmentos SQL nativos
import { and, count, desc, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
// Importamos la instancia única de conexión 'db' y el tipo 'Conexion' (transacción tx)
import { db, type Conexion } from "@/basedatos/conexion";
import {
  clientes,
  facturaItems,
  facturas,
  movimientosCuenta,
  productos,
  usuarios,
} from "@/basedatos/esquema";
// Importamos los esquemas Zod para validar los datos antes de operar
import { esquemaAnulacion, esquemaFacturaNueva } from "@/esquemas/facturas";
import {
  finDelDia,
  formatearDocumento,
  formatearNumeroFactura,
  inicioDelDia,
  PUNTO_DE_VENTA,
} from "@/lib/formato";
// Importamos la clase ApiError con código HTTP y helper 'noEncontrado' (404)
import { ApiError, noEncontrado } from "./errores";
import {
  exigirAdmin,
  leerPaginacion,
  respuestaPaginada,
  validar,
  type UsuarioSesion,
} from "./comunes";
// Importamos 'moverStock', que descuenta o repone mercadería de forma atómica
import { moverStock } from "./stock";
// Importamos 'saldoDeCliente' para consultar la deuda acumulada en cuenta corriente
import { saldoDeCliente } from "./clientes";

// RF-V1: devuelve el próximo número informativo para mostrar en la pantalla de Nueva venta.
// El número definitivo se asigna recién al confirmar dentro de la transacción (regla 4).
// Función informativa para el frontend: devuelve el siguiente número de factura (ej: 0001-00000045)
// Parámetro '_usuario': datos del usuario en sesión (tipo UsuarioSesion)
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
// ==========================================================================
// FUNCIÓN PRINCIPAL: emitirFactura
// Parámetros:
// - usuarioVendedor: UsuarioSesion (id, nombre, email, rol)
// - datosSinValidar: unknown (cuerpo JSON recibido desde la petición POST)
// - opciones: { fecha?: Date } (permite fijar fecha en semillas/tests)
// Devuelve: Promise<FacturaCompleta> con todos los datos y renglones
// ==========================================================================
export async function emitirFactura(
  usuarioVendedor: UsuarioSesion,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
// 1. Validamos estrictamente con Zod: si falta algo o hay datos mal formados, lanza 422
  const compraCliente = validar(esquemaFacturaNueva, datosSinValidar);

// 2. INICIO DE LA TRANSACCIÓN ATÓMICA ('tx'):
// Si cualquier instrucción falla o lanza un error, SQLite/Turso hace ROLLBACK
// automático, garantizando que jamás queden facturas a medias o stock descuadrado.
  const idFacturaCreada = await db.transaction(async (tx) => {
    // Paso 1: buscar todos los productos pedidos y verificar que existan y estén activos.
// Extraemos en un array numérico todos los IDs de los productos solicitados
    const idsProductosPedidos = compraCliente.items.map((item) => item.productoId);
// Consultamos en la tabla 'productos' trayendo los registros de esos IDs en una sola consulta SQL
    const productosEncontrados = await tx
      .select()
      .from(productos)
      .where(inArray(productos.id, idsProductosPedidos));

// Creamos un mapa clave-valor (ID -> Producto) para acceder a cada producto en tiempo O(1)
    const mapaProductos = new Map(productosEncontrados.map((prod) => [prod.id, prod]));

    for (const itemPedido of compraCliente.items) {
      const productoCatalogo = mapaProductos.get(itemPedido.productoId);
      if (!productoCatalogo) throw noEncontrado(`El producto #${itemPedido.productoId}`);
// Regla de negocio: comprobamos que el producto no esté dado de baja
      if (!productoCatalogo.activo) {
        throw new ApiError(
          422,
          "PRODUCTO_INACTIVO",
          `El producto "${productoCatalogo.descripcion}" está dado de baja y no se puede vender.`,
        );
      }
    }

    // Paso 2: verificar al cliente comprador y las reglas de cuenta corriente (regla 6).
    let clienteComprador = null;
// Si la venta no es a Consumidor Final, buscamos al cliente en la base de datos
    if (compraCliente.clienteId !== null) {
      clienteComprador = await tx
        .select()
        .from(clientes)
        .where(eq(clientes.id, compraCliente.clienteId))
        .get();
      if (!clienteComprador || !clienteComprador.activo) {
        throw noEncontrado("El cliente");
      }
    }

// Regla 6: Si paga con Cuenta Corriente, exigimos cliente registrado y con 'cuentaCorriente: true'
    if (compraCliente.pago.forma === "cuenta_corriente") {
      if (!clienteComprador || !clienteComprador.cuentaCorriente) {
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
// Regla 1: Verificamos que la existencia en stock alcance para cubrir la cantidad solicitada
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
// Si falta stock en uno o más ítems, abortamos la venta con error 409 (Conflicto de stock)
    if (faltantesDeStock.length > 0) {
      throw new ApiError(
        409,
        "STOCK_INSUFICIENTE",
        "No hay existencia suficiente para completar la venta.",
        faltantesDeStock,
      );
    }

    // Paso 4: congelar el precio actual del catálogo y calcular subtotales y total (regla 3).
// Regla 3 (CONGELAMIENTO DE PRECIOS): Tomamos el precio actual del catálogo y
// calculamos subtotal = precioUnitario * cantidad. Este valor queda guardado en la factura.
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

// Calculamos el total de la factura sumando los subtotales de todos los renglones (en centavos)
    const totalFactura = renglonesCalculados.reduce((suma, r) => suma + r.subtotal, 0);

    // Paso 5: validar el monto recibido (en contado) o el límite de crédito (en cuenta corriente).
    let montoRecibidoContado: number | null = null;
    if (compraCliente.pago.forma === "contado") {
      montoRecibidoContado = compraCliente.pago.montoRecibido ?? totalFactura;
// Si es contado en efectivo, verificamos que el dinero recibido cubra el total
      if (montoRecibidoContado < totalFactura) {
        throw new ApiError(
          422,
          "MONTO_INSUFICIENTE",
          "El monto recibido no alcanza para cubrir el total de la venta.",
        );
      }
    }

    if (compraCliente.pago.forma === "cuenta_corriente" && clienteComprador) {
      const saldoActualCliente = await saldoDeCliente(tx, clienteComprador.id);
// Calculamos cómo quedaría la deuda del cliente si le permitimos esta compra
      const nuevoSaldoCliente = saldoActualCliente + totalFactura;
      if (
        clienteComprador.limiteCredito !== null &&
// Regla 6: Si supera el límite de crédito acordado, rechazamos la venta con error 422
        nuevoSaldoCliente > clienteComprador.limiteCredito
      ) {
        const excedente = nuevoSaldoCliente - clienteComprador.limiteCredito;
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
// Regla 4: Obtenemos el próximo correlativo dentro de la transacción (evita números salteados)
    const numeroAsignado = await calcularProximoNumero(tx);
    const fechaEmision = opciones.fecha ?? new Date();
    const numeroFormateado = formatearNumeroFactura(PUNTO_DE_VENTA, numeroAsignado);

    // Paso 7: insertar la cabecera de la factura y sus renglones con precios congelados.
    const datosTarjeta =
      compraCliente.pago.forma === "tarjeta" ? compraCliente.pago.tarjeta : null;

// Insertamos la cabecera en la tabla 'facturas' y recuperamos el ID generado (returning)
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

// Insertamos en lote todos los renglones en la tabla 'factura_items' con sus precios congelados
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
// Recorremos cada producto vendido para descontar su existencia del stock
    for (const renglon of renglonesCalculados) {
// Llamamos a 'moverStock' con cantidad negativa (-cantidad) para registrar salida y actualizar stock
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
// Si fue en cuenta corriente, asentamos un movimiento de débito (+) en la cuenta corriente del cliente
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
// ==========================================================================
// FUNCIÓN: anularFactura (Solo Administrador)
// Regla 5: Marca la factura como 'anulada', reingresa el stock al catálogo
// y, si fue cuenta corriente, genera un crédito que cancela la deuda.
// ==========================================================================
export async function anularFactura(
  usuarioAdmin: UsuarioSesion,
  idFactura: number,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
// Comprobamos que el usuario tenga rol de administrador (si no, lanza 403 Forbidden)
  exigirAdmin(usuarioAdmin);
  const datosAnulacion = validar(esquemaAnulacion, datosSinValidar);

  await db.transaction(async (tx) => {
    const facturaExistente = await tx
      .select()
      .from(facturas)
      .where(eq(facturas.id, idFactura))
      .get();

    if (!facturaExistente) throw noEncontrado("La factura");
    if (facturaExistente.estado === "anulada") {
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
// Cambiamos el estado a 'anulada' y guardamos el motivo y quién la anuló para auditoría
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
// Llamamos a 'moverStock' con cantidad negativa (-cantidad) para registrar salida y actualizar stock
      await moverStock(tx, {
        productoId: renglon.productoId,
// Reingresamos la mercadería al stock con valor positivo (+cantidad) y motivo de anulación
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
// Si fue en cuenta corriente, asentamos un movimiento de débito (+) en la cuenta corriente del cliente
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
// ==========================================================================
// FUNCIÓN: listarFacturas
// Permite buscar comprobantes con filtros por fecha, cliente, vendedor, medio de pago y estado
// ==========================================================================
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
// ==========================================================================
// FUNCIÓN: obtenerFactura
// Trae el comprobante completo con sus renglones, datos de tarjeta y anulación para imprimir
// ==========================================================================
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
```
