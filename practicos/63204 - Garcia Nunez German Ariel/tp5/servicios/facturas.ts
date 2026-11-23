/* ==========================================================================
   SERVICIO DE FACTURAS (VENTAS, CONSULTA Y ANULACIÓN)
   Este archivo contiene el núcleo de las reglas de negocio del sistema de ventas.
   Cumple con los requisitos funcionales RF-V1 a RF-V9 y las reglas 1 a 9 del trabajo:
   - Control estricto de stock y prevención de stock negativo (Regla 1 y 2).
   - Congelamiento de precios unitarios históricos al momento de la venta (Regla 3).
   - Numeración correlativa automática sin saltos por punto de venta (Regla 4).
   - Anulación exclusiva por administrador con reversión de stock y créditos (Regla 5).
   - Validación de cuenta corriente y límites de crédito (Regla 6).
   - Transacciones atómicas completas: o se guarda todo o no se guarda nada.
   ========================================================================== */

/* los import son declaraciones que traen funciones y utilidades de bibliotecas externas y módulos locales:
   - operadores de drizzle-orm para armar consultas sql tipadas (and, count, desc, eq, gte, inArray, like, lte, or, sql)
   - la conexión a la base de datos (db) y el tipo de conexión o transacción (Conexion)
   - las tablas del esquema relacional (clientes, facturaItems, facturas, movimientosCuenta, productos, usuarios)
   - los esquemas de validación Zod para datos de facturación y anulación
   - funciones de ayuda de fechas, números de factura y formatos
   - clases de error personalizadas y funciones para verificar roles y paginación
   - servicios hermanos: moverStock (para descontar/reponer stock) y saldoDeCliente (para cuenta corriente) */
import { and, count, desc, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import { db, type Conexion } from "@/basedatos/conexion";
import {
  clientes,
  facturaItems,
  facturas,
  movimientosCuenta,
  productos,
  usuarios,
} from "@/basedatos/esquema";
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

/* ==========================================================================
   RF-V1: OBTENER PRÓXIMO NÚMERO DE FACTURA
   Esta función calcula de forma preliminar qué número de comprobante le tocaría a la venta.
   Es importante destacar que este número es INFORMATIVO para mostrarlo en la interfaz visual.
   El número legal definitivo se calcula y reserva recién cuando el usuario hace clic en Confirmar venta,
   dentro de una transacción atómica para que si dos vendedores cobran al mismo segundo no haya choques ni huecos.
   ========================================================================== */
export async function obtenerProximoNumeroFactura(_usuario: UsuarioSesion) {
  /* calculamos el número consultando el máximo número emitido en la base de datos + 1 */
  const proximo = await calcularProximoNumero(db);

  /* devolvemos el punto de venta (ej: 1), el número entero (ej: 42) y el número formateado con ceros a la izquierda (ej: '0001-00000042') */
  return {
    puntoVenta: PUNTO_DE_VENTA,
    numero: proximo,
    numeroFormateado: formatearNumeroFactura(PUNTO_DE_VENTA, proximo),
  };
}

/* ==========================================================================
   RF-V1 a RF-V6: EMISIÓN COMPLETA DE FACTURA (VENTA)
   Esta es la función más importante del sistema comercial.
   Recibe el usuario que vende, los datos enviados por la pantalla o api (sin validar),
   y opcionalmente una fecha fija (útil para pruebas o seeds).
   Ejecuta todo el proceso dentro de una TRANSACCIÓN ATÓMICA (db.transaction).
   Si cualquier renglón se queda sin stock, si el cliente supera su crédito o si falla el servidor,
   la transacción hace ROLLBACK automático: no se guarda la factura, no se descuenta stock y no se genera deuda.
   ========================================================================== */
export async function emitirFactura(
  usuarioVendedor: UsuarioSesion,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
  /* primero que nada, pasamos los datos por el esquema Zod (esquemaFacturaNueva).
     si falta algún campo obligatorio, los tipos son incorrectos o las cantidades son <= 0,
     la función validar() frena la ejecución lanzando un error 400 antes de tocar la base de datos */
  const compraCliente = validar(esquemaFacturaNueva, datosSinValidar);

  /* abrimos la transacción de base de datos con drizzle-orm.
     la variable 'tx' representa la conexión transaccional aislada.
     todas las consultas adentro deben usar 'tx' en vez de 'db' para estar bajo el mismo candado ACID */
  const idFacturaCreada = await db.transaction(async (tx) => {

    /* ----------------------------------------------------------------------
       PASO 1: BUSCAR Y VALIDAR TODOS LOS PRODUCTOS DE LA VENTA
       En vez de hacer una consulta a la base de datos por cada producto en un bucle lento,
       extraemos todos los id con .map() y usamos el operador inArray para traerlos todos juntos en una sola consulta SQL rápida.
       ---------------------------------------------------------------------- */
    const idsProductosPedidos = compraCliente.items.map((item) => item.productoId);
    const productosEncontrados = await tx
      .select()
      .from(productos)
      .where(inArray(productos.id, idsProductosPedidos));

    /* creamos un Map (diccionario en memoria) indexado por el id del producto.
       esto nos permite buscar cada producto en tiempo constante O(1) de manera super eficiente */
    const mapaProductos = new Map(productosEncontrados.map((prod) => [prod.id, prod]));

    /* recorremos los ítems pedidos por el cliente para asegurar que existan y que sigan activos en el catálogo */
    for (const itemPedido of compraCliente.items) {
      const productoCatalogo = mapaProductos.get(itemPedido.productoId);
      /* si el producto no existe en la base de datos, lanzamos error 404 */
      if (!productoCatalogo) throw noEncontrado(`El producto #${itemPedido.productoId}`);
      
      /* si el producto fue dado de baja lógicamente (activo === false), impedimos su venta con error 422 */
      if (!productoCatalogo.activo) {
        throw new ApiError(
          422,
          "PRODUCTO_INACTIVO",
          `El producto "${productoCatalogo.descripcion}" está dado de baja y no se puede vender.`,
        );
      }
    }

    /* ----------------------------------------------------------------------
       PASO 2: VERIFICAR AL CLIENTE Y VALIDAR REGLAS DE CUENTA CORRIENTE
       Si el clienteId no es nulo, buscamos al cliente en la base de datos.
       Si eligió pagar con cuenta corriente, verificamos que sea un cliente registrado y habilitado.
       ---------------------------------------------------------------------- */
    let clienteComprador = null;
    if (compraCliente.clienteId !== null) {
      clienteComprador = await tx
        .select()
        .from(clientes)
        .where(eq(clientes.id, compraCliente.clienteId))
        .get();

      /* si no se encontró o está inactivo, rechazamos la operación */
      if (!clienteComprador || !clienteComprador.activo) {
        throw noEncontrado("El cliente");
      }
    }

    /* Regla de negocio 6: no se puede vender en cuenta corriente a un consumidor final anónimo
       o a un cliente que tenga la opción de cuenta corriente deshabilitada */
    if (compraCliente.pago.forma === "cuenta_corriente") {
      if (!clienteComprador || !clienteComprador.cuentaCorriente) {
        throw new ApiError(
          422,
          "CUENTA_CORRIENTE_NO_HABILITADA",
          "Para vender en cuenta corriente el comprador debe ser un cliente registrado y habilitado.",
        );
      }
    }

    /* ----------------------------------------------------------------------
       PASO 3: COMPROBAR EXISTENCIA DE STOCK PARA CADA RENGLÓN (REGLA 1)
       Verificamos que el stock actual en el catálogo alcance para cubrir la cantidad solicitada.
       Si faltan existencias de uno o más productos, acumulamos el detalle en un arreglo y devolvemos error 409.
       ---------------------------------------------------------------------- */
    const faltantesDeStock = [];
    for (const itemPedido of compraCliente.items) {
      const productoCatalogo = mapaProductos.get(itemPedido.productoId)!;
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
    
    /* si hubo al menos un faltante, detenemos la transacción con un error 409 de conflicto */
    if (faltantesDeStock.length > 0) {
      throw new ApiError(
        409,
        "STOCK_INSUFICIENTE",
        "No hay existencia suficiente para completar la venta.",
        faltantesDeStock,
      );
    }

    /* ----------------------------------------------------------------------
       PASO 4: CONGELAMIENTO HISTÓRICO DE PRECIOS Y CÁLCULO DE TOTALES (REGLA 3)
       Tomamos el precio unitario vigente en este instante en la tabla productos.
       Este precio se guarda en el renglón de la factura de forma inmutable,
       garantizando que si en el futuro el producto sube de precio por inflación,
       esta factura emitida conserve exactamente el valor histórico por el que se vendió.
       ---------------------------------------------------------------------- */
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

    /* calculamos la suma total de la factura acumulando los subtotales de cada renglón con .reduce() */
    const totalFactura = renglonesCalculados.reduce((suma, r) => suma + r.subtotal, 0);

    /* ----------------------------------------------------------------------
       PASO 5: VALIDACIÓN DE PAGO (CONTADO O CUENTA CORRIENTE)
       - Si es contado: el dinero recibido en efectivo debe ser igual o superior al total de la factura.
       - Si es cuenta corriente: calculamos la deuda actual del cliente más esta compra;
         si tiene un límite de crédito fijado y la nueva deuda lo sobrepasa, rechazamos la venta.
       ---------------------------------------------------------------------- */
    let montoRecibidoContado: number | null = null;
    if (compraCliente.pago.forma === "contado") {
      /* si no ingresó monto recibido explícito, asumimos el pago exacto */
      montoRecibidoContado = compraCliente.pago.montoRecibido ?? totalFactura;
      if (montoRecibidoContado < totalFactura) {
        throw new ApiError(
          422,
          "MONTO_INSUFICIENTE",
          "El monto recibido no alcanza para cubrir el total de la venta.",
        );
      }
    }

    if (compraCliente.pago.forma === "cuenta_corriente" && clienteComprador) {
      /* consultamos el saldo actual que debe el cliente usando la función saldoDeCliente */
      const saldoActualCliente = await saldoDeCliente(tx, clienteComprador.id);
      const nuevoSaldoCliente = saldoActualCliente + totalFactura;
      
      /* si el cliente tiene un límite de crédito asignado y el nuevo saldo lo excede, bloqueamos con error 422 */
      if (
        clienteComprador.limiteCredito !== null &&
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

    /* ----------------------------------------------------------------------
       PASO 6: ASIGNAR EL PRÓXIMO NÚMERO CORRELATIVO DEFINITIVO (REGLA 4)
       Calculamos el número legal consecutivo usando la transacción 'tx'.
       Esto bloquea la fila y garantiza correlatividad estricta sin saltos ni duplicados.
       ---------------------------------------------------------------------- */
    const numeroAsignado = await calcularProximoNumero(tx);
    const fechaEmision = opciones.fecha ?? new Date();
    const numeroFormateado = formatearNumeroFactura(PUNTO_DE_VENTA, numeroAsignado);

    /* ----------------------------------------------------------------------
       PASO 7: INSERTAR CABECERA DE FACTURA Y SUS RENGLONES
       Insertamos primero el registro principal en la tabla 'facturas' y obtenemos su ID generado con .returning().
       Luego insertamos todos los renglones en la tabla 'facturaItems' vinculados a ese facturaId.
       ---------------------------------------------------------------------- */
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

    /* insertamos en bloque todos los renglones de la factura con sus precios congelados */
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

    /* ----------------------------------------------------------------------
       PASO 8: DESCONTAR EL STOCK DE MANERA ATÓMICA CON moverStock (REGLAS 1 Y 2)
       Para cada renglón vendido, llamamos a la función moverStock pasándole la cantidad negativa (-renglon.cantidad).
       Esta función hace un UPDATE seguro con condición 'WHERE existencia >= cantidad' y registra el kardex en movimientosStock.
       ---------------------------------------------------------------------- */
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

    /* ----------------------------------------------------------------------
       PASO 9: IMPACTO EN CUENTA CORRIENTE (SI CORRESPONDE)
       Si la forma de pago fue 'cuenta_corriente', asentamos un débito en la tabla 'movimientosCuenta'
       para que la deuda del cliente quede formalmente registrada y sume en su saldo contable.
       ---------------------------------------------------------------------- */
    if (compraCliente.pago.forma === "cuenta_corriente" && clienteComprador) {
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

    /* devolvemos el id de la factura recién creada para que la transacción termine con éxito (COMMIT) */
    return facturaInsertada.id;
  });

  /* una vez confirmada la transacción, consultamos y devolvemos la factura completa con todas sus relaciones */
  return obtenerFactura(usuarioVendedor, idFacturaCreada);
}

/* ==========================================================================
   RF-V9: ANULACIÓN DE FACTURA (REGLA 5)
   - Solo los administradores pueden anular (exigirAdmin).
   - Es obligatorio fundamentar el motivo de anulación.
   - En una transacción atómica:
     1. Se marca la factura como 'anulada' con fecha, usuario y motivo (no se borra físicamente).
     2. Se reingresan las unidades al stock (cantidad positiva) con tipo de movimiento 'anulacion'.
     3. Si había sido vendida en cuenta corriente, se emite un crédito en movimientosCuenta para devolverle el saldo al cliente.
   ========================================================================== */
export async function anularFactura(
  usuarioAdmin: UsuarioSesion,
  idFactura: number,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
  /* verificamos que el usuario que ejecuta la acción tenga rol 'admin'. Si no, lanza error 403 */
  exigirAdmin(usuarioAdmin);

  /* validamos con Zod que el motivo de anulación haya sido completado correctamente */
  const datosAnulacion = validar(esquemaAnulacion, datosSinValidar);

  /* ejecutamos la anulación dentro de una transacción atómica de base de datos */
  await db.transaction(async (tx) => {
    /* buscamos la factura que se desea anular */
    const facturaExistente = await tx
      .select()
      .from(facturas)
      .where(eq(facturas.id, idFactura))
      .get();

    /* si la factura no existe lanzamos error 404 */
    if (!facturaExistente) throw noEncontrado("La factura");

    /* si la factura ya estaba anulada previamente, evitamos anularla dos veces (error 409) */
    if (facturaExistente.estado === "anulada") {
      throw new ApiError(409, "FACTURA_ANULADA", "La factura ya se encuentra anulada.");
    }

    const fechaAnulacion = opciones.fecha ?? new Date();
    const numeroFormateado = formatearNumeroFactura(
      facturaExistente.puntoVenta,
      facturaExistente.numero,
    );

    /* 1. Actualizamos el estado de la factura a 'anulada' y guardamos quién y por qué la anuló */
    await tx
      .update(facturas)
      .set({
        estado: "anulada",
        motivoAnulacion: datosAnulacion.motivo,
        fechaAnulacion,
        usuarioAnulacionId: usuarioAdmin.id,
      })
      .where(eq(facturas.id, idFactura));

    /* 2. Buscamos todos los renglones que componían esta factura para reingresar el stock */
    const renglones = await tx
      .select()
      .from(facturaItems)
      .where(eq(facturaItems.facturaId, idFactura));

    /* para cada ítem vendido, devolvemos las unidades al depósito usando moverStock con cantidad positiva */
    for (const renglon of renglones) {
      await moverStock(tx, {
        productoId: renglon.productoId,
        cantidad: renglon.cantidad, // positivo: vuelve a sumar al stock disponible
        tipo: "anulacion",
        motivo: `Anulación ${numeroFormateado}: ${datosAnulacion.motivo}`,
        usuarioId: usuarioAdmin.id,
        facturaId: idFactura,
        fecha: fechaAnulacion,
      });
    }

    /* 3. Si la venta original fue a cuenta corriente, asentamos un movimiento de 'credito' en la cuenta del cliente para anular la deuda */
    if (
      facturaExistente.formaPago === "cuenta_corriente" &&
      facturaExistente.clienteId !== null
    ) {
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

  /* devolvemos la factura con sus datos actualizados para reflejar el estado anulado en la interfaz */
  return obtenerFactura(usuarioAdmin, idFactura);
}

/* tipo de datos para los filtros de búsqueda en el listado de facturas */
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

/* ==========================================================================
   RF-V8: LISTADO PAGINADO DE FACTURAS CON FILTROS Y TOTALES
   Permite buscar facturas por rango de fechas, cliente, vendedor, forma de pago y estado.
   También calcula el total recaudado en comprobantes emitidos que cumplen con esos mismos filtros.
   ========================================================================== */
export async function listarFacturas(_usuario: UsuarioSesion, parametros: FiltrosFacturas) {
  /* leemos la página actual, el tamaño de página y el salto (offset) para la paginación */
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  /* creamos un arreglo donde iremos agregando las condiciones SQL de forma dinámica según qué filtros vengan presentes */
  const condiciones = [];

  /* filtro por fecha 'desde' (a partir de las 00:00:00 de ese día) */
  if (parametros.desde) condiciones.push(gte(facturas.fecha, inicioDelDia(parametros.desde)));
  
  /* filtro por fecha 'hasta' (hasta las 23:59:59 de ese día) */
  if (parametros.hasta) condiciones.push(lte(facturas.fecha, finDelDia(parametros.hasta)));
  
  /* filtro por cliente específico */
  if (parametros.clienteId) condiciones.push(eq(facturas.clienteId, Number(parametros.clienteId)));
  
  /* filtro por vendedor que emitió la factura */
  if (parametros.vendedorId) condiciones.push(eq(facturas.usuarioId, Number(parametros.vendedorId)));
  
  /* filtro por forma de pago (contado, tarjeta o cuenta corriente) */
  if (
    parametros.forma === "contado" ||
    parametros.forma === "tarjeta" ||
    parametros.forma === "cuenta_corriente"
  ) {
    condiciones.push(eq(facturas.formaPago, parametros.forma));
  }

  /* filtro por estado (emitida o anulada) */
  if (parametros.estado === "emitida" || parametros.estado === "anulada") {
    condiciones.push(eq(facturas.estado, parametros.estado));
  }

  /* buscador de texto libre 'q': si el usuario escribió un número busca por número de factura o nombre de cliente; si es texto, busca por nombre */
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

  /* unimos todas las condiciones con el operador AND de SQL */
  const filtro = and(...condiciones);

  /* ejecutamos la consulta principal trayendo las facturas con JOIN a clientes y usuarios (vendedores) */
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

  /* contamos la cantidad total de facturas que cumplen los filtros para calcular el total de páginas */
  const [{ total }] = await db
    .select({ total: count() })
    .from(facturas)
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .where(filtro);

  /* calculamos la suma total recaudada solo para las facturas EMITIDAS (las anuladas no suman dinero) */
  const filtroEmitidas = and(filtro, eq(facturas.estado, "emitida"));
  const [{ totalEmitido }] = await db
    .select({ totalEmitido: sql<number>`coalesce(sum(${facturas.total}), 0)` })
    .from(facturas)
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .where(filtroEmitidas);

  /* mapeamos los registros planos de la base de datos a un formato JSON limpio y estructurado para la vista */
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

  /* devolvemos la estructura con los datos paginados y el monto total acumulado */
  return {
    ...respuestaPaginada(datos, pagina, tamanoPagina, total),
    totalEmitido: Number(totalEmitido),
  };
}

/* ==========================================================================
   RF-V7: OBTENER FACTURA COMPLETA POR ID
   Busca una factura en particular con todo su detalle:
   - Encabezado de la factura, vendedor y cliente (con domicilio).
   - Renglones de ítems vendidos con sus cantidades y precios congelados.
   - Datos desglosados de pago (efectivo y vuelto, o datos de tarjeta).
   - Datos de anulación si el comprobante está anulado.
   - Saldo actual del cliente si fue en cuenta corriente.
   ========================================================================== */
export async function obtenerFactura(_usuario: UsuarioSesion, idFactura: number) {
  /* consultamos la cabecera de la factura con joins a clientes y usuarios */
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

  /* si no existe arrojamos error 404 */
  if (!fila) throw noEncontrado("La factura");

  const { factura } = fila;

  /* consultamos todos los renglones correspondientes a esta factura en facturaItems */
  const renglones = await db
    .select()
    .from(facturaItems)
    .where(eq(facturaItems.facturaId, idFactura));

  /* armamos la estructura del detalle de pago según la forma en que se cobró */
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

  /* si la factura fue anulada, recuperamos la información del administrador que la anuló y el motivo */
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

  /* preparamos la respuesta final del comprobante con todos los datos integrados */
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

  /* si fue en cuenta corriente, consultamos también el saldo actualizado del cliente */
  if (factura.formaPago === "cuenta_corriente" && factura.clienteId) {
    const saldoCliente = await saldoDeCliente(db, factura.clienteId);
    return { ...respuestaBase, saldoCliente };
  }

  return respuestaBase;
}

/* tipo de TypeScript inferido para el tipo de retorno completo de una factura */
export type FacturaCompleta = Awaited<ReturnType<typeof obtenerFactura>>;

/* ==========================================================================
   FUNCIÓN AUXILIAR: CALCULAR PRÓXIMO NÚMERO CORRELATIVO
   Consulta el número más alto emitido hasta el momento para el punto de venta actual
   y le suma 1 con la función SQL MAX() y COALESCE() para evitar saltos.
   ========================================================================== */
async function calcularProximoNumero(conexion: Conexion): Promise<number> {
  const fila = await conexion
    .select({ ultimo: sql<number>`coalesce(max(${facturas.numero}), 0)` })
    .from(facturas)
    .where(eq(facturas.puntoVenta, PUNTO_DE_VENTA))
    .get();
  return Number(fila?.ultimo ?? 0) + 1;
}
