// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Servicio de FACTURAS (ventas, consulta y anulación).
// RF-V1 a RF-V9. Reglas 1, 2, 3, 4, 5, 6, 7 y 9.
// [Línea 3] Importa elementos desde 'drizzle-orm'.
import { and, count, desc, eq, gte, inArray, like, lte, or, sql } from "drizzle-orm";
// [Línea 4] Importa elementos desde '@/basedatos/conexion'.
import { db, type Conexion } from "@/basedatos/conexion";
// [Línea 5] Inicia un bloque de importación de dependencias.
import {
  // [Línea 6] Importa 'clientes' desde el módulo.
  clientes,
  // [Línea 7] Importa 'facturaItems' desde el módulo.
  facturaItems,
  // [Línea 8] Importa 'facturas' desde el módulo.
  facturas,
  // [Línea 9] Importa 'movimientosCuenta' desde el módulo.
  movimientosCuenta,
  // [Línea 10] Importa 'productos' desde el módulo.
  productos,
  // [Línea 11] Importa 'usuarios' desde el módulo.
  usuarios,
// [Línea 12] Cierra la lista de importaciones provenientes del módulo '@/basedatos/esquema'.
} from "@/basedatos/esquema";
// [Línea 13] Importa elementos desde '@/esquemas/facturas'.
import { esquemaAnulacion, esquemaFacturaNueva } from "@/esquemas/facturas";
// [Línea 14] Inicia un bloque de importación de dependencias.
import {
  // [Línea 15] Importa 'finDelDia' desde el módulo.
  finDelDia,
  // [Línea 16] Importa 'formatearDocumento' desde el módulo.
  formatearDocumento,
  // [Línea 17] Importa 'formatearNumeroFactura' desde el módulo.
  formatearNumeroFactura,
  // [Línea 18] Importa 'inicioDelDia' desde el módulo.
  inicioDelDia,
  // [Línea 19] Importa 'PUNTO_DE_VENTA' desde el módulo.
  PUNTO_DE_VENTA,
// [Línea 20] Cierra la lista de importaciones provenientes del módulo '@/lib/formato'.
} from "@/lib/formato";
// [Línea 21] Importa elementos desde './errores'.
import { ApiError, noEncontrado } from "./errores";
// [Línea 22] Inicia un bloque de importación de dependencias.
import {
  // [Línea 23] Importa 'exigirAdmin' desde el módulo.
  exigirAdmin,
  // [Línea 24] Importa 'leerPaginacion' desde el módulo.
  leerPaginacion,
  // [Línea 25] Importa 'respuestaPaginada' desde el módulo.
  respuestaPaginada,
  // [Línea 26] Importa 'validar' desde el módulo.
  validar,
  // [Línea 27] Importa 'type UsuarioSesion' desde el módulo.
  type UsuarioSesion,
// [Línea 28] Cierra la lista de importaciones provenientes del módulo './comunes'.
} from "./comunes";
// [Línea 29] Importa elementos desde './stock'.
import { moverStock } from "./stock";
// [Línea 30] Importa elementos desde './clientes'.
import { saldoDeCliente } from "./clientes";

// RF-V1: devuelve el próximo número informativo para mostrar en la pantalla de Nueva venta.
// El número definitivo se asigna recién al confirmar dentro de la transacción (regla 4).
// [Línea 34] Declara la función asíncrona 'obtenerProximoNumeroFactura'.
export async function obtenerProximoNumeroFactura(_usuario: UsuarioSesion) {
  // [Línea 35] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'proximo'.
  const proximo = await calcularProximoNumero(db);
  // [Línea 36] Devuelve el valor: {
  return {
    // [Línea 37] Define o asigna el campo/parámetro 'puntoVenta'.
    puntoVenta: PUNTO_DE_VENTA,
    // [Línea 38] Define o asigna el campo/parámetro 'numero'.
    numero: proximo,
    // [Línea 39] Define o asigna el campo/parámetro 'numeroFormateado'.
    numeroFormateado: formatearNumeroFactura(PUNTO_DE_VENTA, proximo),
  // [Línea 40] Cierra el bloque o estructura (};).
  };
// [Línea 41] Cierra el bloque o estructura (}).
}

// RF-V1 a RF-V6: emite una factura completa en UNA SOLA TRANSACCIÓN ATÓMICA.
// Si cualquier paso falla, no se graba ni factura, ni descuento de stock, ni deuda.
// [Línea 45] Declara la función asíncrona 'emitirFactura'.
export async function emitirFactura(
  // [Línea 46] Define o asigna el campo/parámetro 'usuarioVendedor'.
  usuarioVendedor: UsuarioSesion,
  // [Línea 47] Define o asigna el campo/parámetro 'datosSinValidar'.
  datosSinValidar: unknown,
  // [Línea 48] Define o asigna el campo/parámetro 'opciones'.
  opciones: { fecha?: Date } = {},
// [Línea 49] Ejecuta o evalúa: ) {
) {
  // [Línea 50] Declara 'compraCliente' y le asigna el valor resultante.
  const compraCliente = validar(esquemaFacturaNueva, datosSinValidar);

  // [Línea 52] Ejecuta una transacción atómica en la base de datos (todo o nada) y guarda el resultado en 'idFacturaCreada'.
  const idFacturaCreada = await db.transaction(async (tx) => {
    // Paso 1: buscar todos los productos pedidos y verificar que existan y estén activos.
    // [Línea 54] Declara 'idsProductosPedidos' y le asigna el valor resultante.
    const idsProductosPedidos = compraCliente.items.map((item) => item.productoId);
    // [Línea 55] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'productosEncontrados'.
    const productosEncontrados = await tx
      // [Línea 56] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
      .select()
      // [Línea 57] Define la tabla origen de la consulta SQL: .from(productos)
      .from(productos)
      // [Línea 58] Aplica el filtro WHERE a la consulta SQL: .where(inArray(productos.id, idsProductosPedidos));
      .where(inArray(productos.id, idsProductosPedidos));

    // [Línea 60] Declara 'mapaProductos' y le asigna el valor resultante.
    const mapaProductos = new Map(productosEncontrados.map((prod) => [prod.id, prod]));

    // [Línea 62] Recorre cada elemento en un bucle: for (const itemPedido of compraCliente.items) {
    for (const itemPedido of compraCliente.items) {
      // [Línea 63] Declara 'productoCatalogo' y le asigna el valor resultante.
      const productoCatalogo = mapaProductos.get(itemPedido.productoId);
      // [Línea 64] Verifica la condición: if (!productoCatalogo) throw noEncontrado(`El producto #${itemPedido.productoId}`);
      if (!productoCatalogo) throw noEncontrado(`El producto #${itemPedido.productoId}`);
      // [Línea 65] Verifica la condición: if (!productoCatalogo.activo) {
      if (!productoCatalogo.activo) {
        // [Línea 66] Corta la ejecución y lanza el error: throw new ApiError(
        throw new ApiError(
          // [Línea 67] Ejecuta o evalúa: 422,
          422,
          // [Línea 68] Ejecuta o evalúa: "PRODUCTO_INACTIVO",
          "PRODUCTO_INACTIVO",
          // [Línea 69] Ejecuta o evalúa: `El producto "${productoCatalogo.descripcion}" está dado de baja y no se puede v
          `El producto "${productoCatalogo.descripcion}" está dado de baja y no se puede vender.`,
        // [Línea 70] Cierra el bloque o estructura ();).
        );
      // [Línea 71] Cierra el bloque o estructura (}).
      }
    // [Línea 72] Cierra el bloque o estructura (}).
    }

    // Paso 2: verificar al cliente comprador y las reglas de cuenta corriente (regla 6).
    // [Línea 75] Declara 'clienteComprador' y le asigna el valor resultante.
    let clienteComprador = null;
    // [Línea 76] Verifica la condición: if (compraCliente.clienteId !== null) {
    if (compraCliente.clienteId !== null) {
      // [Línea 77] Ejecuta o evalúa: clienteComprador = await tx
      clienteComprador = await tx
        // [Línea 78] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
        .select()
        // [Línea 79] Define la tabla origen de la consulta SQL: .from(clientes)
        .from(clientes)
        // [Línea 80] Aplica el filtro WHERE a la consulta SQL: .where(eq(clientes.id, compraCliente.clienteId))
        .where(eq(clientes.id, compraCliente.clienteId))
        // [Línea 81] Ejecuta la consulta y obtiene una sola fila (o undefined si no hay coincidencias).
        .get();
      // [Línea 82] Verifica la condición: if (!clienteComprador || !clienteComprador.activo) {
      if (!clienteComprador || !clienteComprador.activo) {
        // [Línea 83] Corta la ejecución y lanza el error: throw noEncontrado("El cliente");
        throw noEncontrado("El cliente");
      // [Línea 84] Cierra el bloque o estructura (}).
      }
    // [Línea 85] Cierra el bloque o estructura (}).
    }

    // [Línea 87] Verifica la condición: if (compraCliente.pago.forma === "cuenta_corriente") {
    if (compraCliente.pago.forma === "cuenta_corriente") {
      // [Línea 88] Verifica la condición: if (!clienteComprador || !clienteComprador.cuentaCorriente) {
      if (!clienteComprador || !clienteComprador.cuentaCorriente) {
        // [Línea 89] Corta la ejecución y lanza el error: throw new ApiError(
        throw new ApiError(
          // [Línea 90] Ejecuta o evalúa: 422,
          422,
          // [Línea 91] Ejecuta o evalúa: "CUENTA_CORRIENTE_NO_HABILITADA",
          "CUENTA_CORRIENTE_NO_HABILITADA",
          // [Línea 92] Ejecuta o evalúa: "Para vender en cuenta corriente el comprador debe ser un cliente registrado y h
          "Para vender en cuenta corriente el comprador debe ser un cliente registrado y habilitado.",
        // [Línea 93] Cierra el bloque o estructura ();).
        );
      // [Línea 94] Cierra el bloque o estructura (}).
      }
    // [Línea 95] Cierra el bloque o estructura (}).
    }

    // Paso 3: comprobar que la existencia alcance para todos los renglones (regla 1).
    // [Línea 98] Declara 'faltantesDeStock' y le asigna el valor resultante.
    const faltantesDeStock = [];
    // [Línea 99] Recorre cada elemento en un bucle: for (const itemPedido of compraCliente.items) {
    for (const itemPedido of compraCliente.items) {
      // [Línea 100] Declara 'productoCatalogo' y le asigna el valor resultante.
      const productoCatalogo = mapaProductos.get(itemPedido.productoId)!;
      // [Línea 101] Verifica la condición: if (productoCatalogo.existencia < itemPedido.cantidad) {
      if (productoCatalogo.existencia < itemPedido.cantidad) {
        // [Línea 102] Ejecuta o evalúa: faltantesDeStock.push({
        faltantesDeStock.push({
          // [Línea 103] Define o asigna el campo/parámetro 'productoId'.
          productoId: productoCatalogo.id,
          // [Línea 104] Define o asigna el campo/parámetro 'codigo'.
          codigo: productoCatalogo.codigo,
          // [Línea 105] Define o asigna el campo/parámetro 'descripcion'.
          descripcion: productoCatalogo.descripcion,
          // [Línea 106] Define o asigna el campo/parámetro 'solicitado'.
          solicitado: itemPedido.cantidad,
          // [Línea 107] Define o asigna el campo/parámetro 'disponible'.
          disponible: productoCatalogo.existencia,
        // [Línea 108] Cierra el bloque o estructura (});).
        });
      // [Línea 109] Cierra el bloque o estructura (}).
      }
    // [Línea 110] Cierra el bloque o estructura (}).
    }
    // [Línea 111] Verifica la condición: if (faltantesDeStock.length > 0) {
    if (faltantesDeStock.length > 0) {
      // [Línea 112] Corta la ejecución y lanza el error: throw new ApiError(
      throw new ApiError(
        // [Línea 113] Ejecuta o evalúa: 409,
        409,
        // [Línea 114] Ejecuta o evalúa: "STOCK_INSUFICIENTE",
        "STOCK_INSUFICIENTE",
        // [Línea 115] Ejecuta o evalúa: "No hay existencia suficiente para completar la venta.",
        "No hay existencia suficiente para completar la venta.",
        // [Línea 116] Ejecuta o evalúa: faltantesDeStock,
        faltantesDeStock,
      // [Línea 117] Cierra el bloque o estructura ();).
      );
    // [Línea 118] Cierra el bloque o estructura (}).
    }

    // Paso 4: congelar el precio actual del catálogo y calcular subtotales y total (regla 3).
    // [Línea 121] Declara 'renglonesCalculados' y le asigna el valor resultante.
    const renglonesCalculados = compraCliente.items.map((itemPedido) => {
      // [Línea 122] Declara 'productoCatalogo' y le asigna el valor resultante.
      const productoCatalogo = mapaProductos.get(itemPedido.productoId)!;
      // [Línea 123] Declara 'precioUnitario' y le asigna el valor resultante.
      const precioUnitario = productoCatalogo.precio;
      // [Línea 124] Declara 'subtotalRenglon' y le asigna el valor resultante.
      const subtotalRenglon = precioUnitario * itemPedido.cantidad;
      // [Línea 125] Devuelve el valor: {
      return {
        // [Línea 126] Define o asigna el campo/parámetro 'productoId'.
        productoId: productoCatalogo.id,
        // [Línea 127] Define o asigna el campo/parámetro 'codigo'.
        codigo: productoCatalogo.codigo,
        // [Línea 128] Define o asigna el campo/parámetro 'descripcion'.
        descripcion: productoCatalogo.descripcion,
        // [Línea 129] Define o asigna el campo/parámetro 'cantidad'.
        cantidad: itemPedido.cantidad,
        // [Línea 130] Ejecuta o evalúa: precioUnitario,
        precioUnitario,
        // [Línea 131] Define o asigna el campo/parámetro 'subtotal'.
        subtotal: subtotalRenglon,
      // [Línea 132] Cierra el bloque o estructura (};).
      };
    // [Línea 133] Cierra el bloque o estructura (});).
    });

    // [Línea 135] Declara 'totalFactura' y le asigna el valor resultante.
    const totalFactura = renglonesCalculados.reduce((suma, r) => suma + r.subtotal, 0);

    // Paso 5: validar el monto recibido (en contado) o el límite de crédito (en cuenta corriente).
    // [Línea 138] Declara 'montoRecibidoContado: number | null' y le asigna el valor resultante.
    let montoRecibidoContado: number | null = null;
    // [Línea 139] Verifica la condición: if (compraCliente.pago.forma === "contado") {
    if (compraCliente.pago.forma === "contado") {
      // [Línea 140] Ejecuta o evalúa: montoRecibidoContado = compraCliente.pago.montoRecibido ?? totalFactura;
      montoRecibidoContado = compraCliente.pago.montoRecibido ?? totalFactura;
      // [Línea 141] Verifica la condición: if (montoRecibidoContado < totalFactura) {
      if (montoRecibidoContado < totalFactura) {
        // [Línea 142] Corta la ejecución y lanza el error: throw new ApiError(
        throw new ApiError(
          // [Línea 143] Ejecuta o evalúa: 422,
          422,
          // [Línea 144] Ejecuta o evalúa: "MONTO_INSUFICIENTE",
          "MONTO_INSUFICIENTE",
          // [Línea 145] Ejecuta o evalúa: "El monto recibido no alcanza para cubrir el total de la venta.",
          "El monto recibido no alcanza para cubrir el total de la venta.",
        // [Línea 146] Cierra el bloque o estructura ();).
        );
      // [Línea 147] Cierra el bloque o estructura (}).
      }
    // [Línea 148] Cierra el bloque o estructura (}).
    }

    // [Línea 150] Verifica la condición: if (compraCliente.pago.forma === "cuenta_corriente" && clienteComprador) {
    if (compraCliente.pago.forma === "cuenta_corriente" && clienteComprador) {
      // [Línea 151] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'saldoActualCliente'.
      const saldoActualCliente = await saldoDeCliente(tx, clienteComprador.id);
      // [Línea 152] Declara 'nuevoSaldoCliente' y le asigna el valor resultante.
      const nuevoSaldoCliente = saldoActualCliente + totalFactura;
      // [Línea 153] Verifica la condición: if (
      if (
        // [Línea 154] Ejecuta o evalúa: clienteComprador.limiteCredito !== null &&
        clienteComprador.limiteCredito !== null &&
        // [Línea 155] Ejecuta o evalúa: nuevoSaldoCliente > clienteComprador.limiteCredito
        nuevoSaldoCliente > clienteComprador.limiteCredito
      // [Línea 156] Ejecuta o evalúa: ) {
      ) {
        // [Línea 157] Declara 'excedente' y le asigna el valor resultante.
        const excedente = nuevoSaldoCliente - clienteComprador.limiteCredito;
        // [Línea 158] Corta la ejecución y lanza el error: throw new ApiError(
        throw new ApiError(
          // [Línea 159] Ejecuta o evalúa: 422,
          422,
          // [Línea 160] Ejecuta o evalúa: "LIMITE_CREDITO_EXCEDIDO",
          "LIMITE_CREDITO_EXCEDIDO",
          // [Línea 161] Ejecuta o evalúa: "La venta supera el límite de crédito disponible del cliente.",
          "La venta supera el límite de crédito disponible del cliente.",
          // [Línea 162] Ejecuta o evalúa: [
          [
            // [Línea 163] Ejecuta o evalúa: {
            {
              // [Línea 164] Define o asigna el campo/parámetro 'saldoActual'.
              saldoActual: saldoActualCliente,
              // [Línea 165] Define o asigna el campo/parámetro 'limite'.
              limite: clienteComprador.limiteCredito,
              // [Línea 166] Ejecuta o evalúa: excedente,
              excedente,
            // [Línea 167] Cierra el bloque o estructura (},).
            },
          // [Línea 168] Ejecuta o evalúa: ],
          ],
        // [Línea 169] Cierra el bloque o estructura ();).
        );
      // [Línea 170] Cierra el bloque o estructura (}).
      }
    // [Línea 171] Cierra el bloque o estructura (}).
    }

    // Paso 6: asignar el próximo número correlativo sin huecos (regla 4).
    // [Línea 174] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'numeroAsignado'.
    const numeroAsignado = await calcularProximoNumero(tx);
    // [Línea 175] Declara 'fechaEmision' y le asigna el valor resultante.
    const fechaEmision = opciones.fecha ?? new Date();
    // [Línea 176] Declara 'numeroFormateado' y le asigna el valor resultante.
    const numeroFormateado = formatearNumeroFactura(PUNTO_DE_VENTA, numeroAsignado);

    // Paso 7: insertar la cabecera de la factura y sus renglones con precios congelados.
    // [Línea 179] Declara 'datosTarjeta' y le asigna el valor resultante.
    const datosTarjeta =
      // [Línea 180] Ejecuta o evalúa: compraCliente.pago.forma === "tarjeta" ? compraCliente.pago.tarjeta : null;
      compraCliente.pago.forma === "tarjeta" ? compraCliente.pago.tarjeta : null;

    // [Línea 182] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[facturaInsertada]'.
    const [facturaInsertada] = await tx
      // [Línea 183] Inserta una nueva fila en la tabla indicada de la base de datos.
      .insert(facturas)
      // [Línea 184] Define los valores de las columnas a insertar.
      .values({
        // [Línea 185] Define o asigna el campo/parámetro 'puntoVenta'.
        puntoVenta: PUNTO_DE_VENTA,
        // [Línea 186] Define o asigna el campo/parámetro 'numero'.
        numero: numeroAsignado,
        // [Línea 187] Define o asigna el campo/parámetro 'fecha'.
        fecha: fechaEmision,
        // [Línea 188] Define o asigna el campo/parámetro 'clienteId'.
        clienteId: compraCliente.clienteId,
        // [Línea 189] Define o asigna el campo/parámetro 'usuarioId'.
        usuarioId: usuarioVendedor.id,
        // [Línea 190] Define o asigna el campo/parámetro 'total'.
        total: totalFactura,
        // [Línea 191] Define o asigna el campo/parámetro 'formaPago'.
        formaPago: compraCliente.pago.forma,
        // [Línea 192] Define o asigna el campo/parámetro 'montoRecibido'.
        montoRecibido: montoRecibidoContado,
        // [Línea 193] Define o asigna el campo/parámetro 'tarjetaTipo'.
        tarjetaTipo: datosTarjeta ? datosTarjeta.tipo : null,
        // [Línea 194] Define o asigna el campo/parámetro 'tarjetaMarca'.
        tarjetaMarca: datosTarjeta ? datosTarjeta.marca : null,
        // [Línea 195] Define o asigna el campo/parámetro 'tarjetaUltimos4'.
        tarjetaUltimos4: datosTarjeta ? datosTarjeta.ultimos4 : null,
        // [Línea 196] Define o asigna el campo/parámetro 'estado'.
        estado: "emitida",
      // [Línea 197] Cierra el bloque o estructura (})).
      })
      // [Línea 198] Solicita que SQLite devuelva los datos de la fila recién insertada o actualizada.
      .returning();

    // [Línea 200] Inserta una nueva fila en la tabla indicada de la base de datos.
    await tx.insert(facturaItems).values(
      // [Línea 201] Ejecuta o evalúa: renglonesCalculados.map((renglon) => ({
      renglonesCalculados.map((renglon) => ({
        // [Línea 202] Define o asigna el campo/parámetro 'facturaId'.
        facturaId: facturaInsertada.id,
        // [Línea 203] Define o asigna el campo/parámetro 'productoId'.
        productoId: renglon.productoId,
        // [Línea 204] Define o asigna el campo/parámetro 'codigo'.
        codigo: renglon.codigo,
        // [Línea 205] Define o asigna el campo/parámetro 'descripcion'.
        descripcion: renglon.descripcion,
        // [Línea 206] Define o asigna el campo/parámetro 'cantidad'.
        cantidad: renglon.cantidad,
        // [Línea 207] Define o asigna el campo/parámetro 'precioUnitario'.
        precioUnitario: renglon.precioUnitario,
        // [Línea 208] Define o asigna el campo/parámetro 'subtotal'.
        subtotal: renglon.subtotal,
      // [Línea 209] Ejecuta o evalúa: })),
      })),
    // [Línea 210] Cierra el bloque o estructura ();).
    );

    // Paso 8: descontar la existencia de cada producto de forma atómica con moverStock (reglas 1 y 2).
    // [Línea 213] Recorre cada elemento en un bucle: for (const renglon of renglonesCalculados) {
    for (const renglon of renglonesCalculados) {
      // [Línea 214] Espera a que se complete la operación asíncrona: await moverStock(tx, {
      await moverStock(tx, {
        // [Línea 215] Define o asigna el campo/parámetro 'productoId'.
        productoId: renglon.productoId,
        // [Línea 216] Define o asigna el campo/parámetro 'cantidad'.
        cantidad: -renglon.cantidad,
        // [Línea 217] Define o asigna el campo/parámetro 'tipo'.
        tipo: "venta",
        // [Línea 218] Define o asigna el campo/parámetro 'motivo'.
        motivo: `Venta ${numeroFormateado}`,
        // [Línea 219] Define o asigna el campo/parámetro 'usuarioId'.
        usuarioId: usuarioVendedor.id,
        // [Línea 220] Define o asigna el campo/parámetro 'facturaId'.
        facturaId: facturaInsertada.id,
        // [Línea 221] Define o asigna el campo/parámetro 'fecha'.
        fecha: fechaEmision,
      // [Línea 222] Cierra el bloque o estructura (});).
      });
    // [Línea 223] Cierra el bloque o estructura (}).
    }

    // Paso 9: si la venta es en cuenta corriente, registrar el débito en la cuenta del cliente.
    // [Línea 226] Verifica la condición: if (compraCliente.pago.forma === "cuenta_corriente" && clienteComprador) {
    if (compraCliente.pago.forma === "cuenta_corriente" && clienteComprador) {
      // [Línea 227] Inserta una nueva fila en la tabla indicada de la base de datos.
      await tx.insert(movimientosCuenta).values({
        // [Línea 228] Define o asigna el campo/parámetro 'clienteId'.
        clienteId: clienteComprador.id,
        // [Línea 229] Define o asigna el campo/parámetro 'facturaId'.
        facturaId: facturaInsertada.id,
        // [Línea 230] Define o asigna el campo/parámetro 'pagoId'.
        pagoId: null,
        // [Línea 231] Define o asigna el campo/parámetro 'tipo'.
        tipo: "debito",
        // [Línea 232] Define o asigna el campo/parámetro 'importe'.
        importe: totalFactura,
        // [Línea 233] Define o asigna el campo/parámetro 'descripcion'.
        descripcion: `Factura ${numeroFormateado}`,
        // [Línea 234] Define o asigna el campo/parámetro 'fecha'.
        fecha: fechaEmision,
      // [Línea 235] Cierra el bloque o estructura (});).
      });
    // [Línea 236] Cierra el bloque o estructura (}).
    }

    // [Línea 238] Devuelve el valor: facturaInsertada.id;
    return facturaInsertada.id;
  // [Línea 239] Cierra el bloque o estructura (});).
  });

  // [Línea 241] Devuelve el valor: obtenerFactura(usuarioVendedor, idFacturaCreada);
  return obtenerFactura(usuarioVendedor, idFacturaCreada);
// [Línea 242] Cierra el bloque o estructura (}).
}

// RF-V9: anula una factura (solo administrador, motivo obligatorio). Regla 5.
// Reingresa el stock y, si fue en cuenta corriente, registra un crédito en la cuenta del cliente.
// [Línea 246] Declara la función asíncrona 'anularFactura'.
export async function anularFactura(
  // [Línea 247] Define o asigna el campo/parámetro 'usuarioAdmin'.
  usuarioAdmin: UsuarioSesion,
  // [Línea 248] Define o asigna el campo/parámetro 'idFactura'.
  idFactura: number,
  // [Línea 249] Define o asigna el campo/parámetro 'datosSinValidar'.
  datosSinValidar: unknown,
  // [Línea 250] Define o asigna el campo/parámetro 'opciones'.
  opciones: { fecha?: Date } = {},
// [Línea 251] Ejecuta o evalúa: ) {
) {
  // [Línea 252] Verifica en el servidor que el usuario sea 'admin'; si es 'vendedor' lanza 403 SIN_PERMISO.
  exigirAdmin(usuarioAdmin);
  // [Línea 253] Declara 'datosAnulacion' y le asigna el valor resultante.
  const datosAnulacion = validar(esquemaAnulacion, datosSinValidar);

  // [Línea 255] Abre una transacción atómica en la base de datos: si algo falla adentro, revierte todos los cambios.
  await db.transaction(async (tx) => {
    // [Línea 256] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'facturaExistente'.
    const facturaExistente = await tx
      // [Línea 257] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
      .select()
      // [Línea 258] Define la tabla origen de la consulta SQL: .from(facturas)
      .from(facturas)
      // [Línea 259] Aplica el filtro WHERE a la consulta SQL: .where(eq(facturas.id, idFactura))
      .where(eq(facturas.id, idFactura))
      // [Línea 260] Ejecuta la consulta y obtiene una sola fila (o undefined si no hay coincidencias).
      .get();

    // [Línea 262] Verifica la condición: if (!facturaExistente) throw noEncontrado("La factura");
    if (!facturaExistente) throw noEncontrado("La factura");
    // [Línea 263] Verifica la condición: if (facturaExistente.estado === "anulada") {
    if (facturaExistente.estado === "anulada") {
      // [Línea 264] Corta la ejecución y lanza el error: throw new ApiError(409, "FACTURA_ANULADA", "La factura ya se encuentra anulada.");
      throw new ApiError(409, "FACTURA_ANULADA", "La factura ya se encuentra anulada.");
    // [Línea 265] Cierra el bloque o estructura (}).
    }

    // [Línea 267] Declara 'fechaAnulacion' y le asigna el valor resultante.
    const fechaAnulacion = opciones.fecha ?? new Date();
    // [Línea 268] Declara 'numeroFormateado' y le asigna el valor resultante.
    const numeroFormateado = formatearNumeroFactura(
      // [Línea 269] Ejecuta o evalúa: facturaExistente.puntoVenta,
      facturaExistente.puntoVenta,
      // [Línea 270] Ejecuta o evalúa: facturaExistente.numero,
      facturaExistente.numero,
    // [Línea 271] Cierra el bloque o estructura ();).
    );

    // 1. Marcar la factura como anulada conservando su historial.
    // [Línea 274] Espera a que se complete la operación asíncrona: await tx
    await tx
      // [Línea 275] Actualiza las columnas de la tabla que cumplan la condición WHERE.
      .update(facturas)
      // [Línea 276] Define las columnas y valores nuevos para el UPDATE.
      .set({
        // [Línea 277] Define o asigna el campo/parámetro 'estado'.
        estado: "anulada",
        // [Línea 278] Define o asigna el campo/parámetro 'motivoAnulacion'.
        motivoAnulacion: datosAnulacion.motivo,
        // [Línea 279] Ejecuta o evalúa: fechaAnulacion,
        fechaAnulacion,
        // [Línea 280] Define o asigna el campo/parámetro 'usuarioAnulacionId'.
        usuarioAnulacionId: usuarioAdmin.id,
      // [Línea 281] Cierra el bloque o estructura (})).
      })
      // [Línea 282] Aplica el filtro WHERE a la consulta SQL: .where(eq(facturas.id, idFactura));
      .where(eq(facturas.id, idFactura));

    // 2. Reingresar la existencia de cada renglón con un movimiento de tipo "anulacion".
    // [Línea 285] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'renglones'.
    const renglones = await tx
      // [Línea 286] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
      .select()
      // [Línea 287] Define la tabla origen de la consulta SQL: .from(facturaItems)
      .from(facturaItems)
      // [Línea 288] Aplica el filtro WHERE a la consulta SQL: .where(eq(facturaItems.facturaId, idFactura));
      .where(eq(facturaItems.facturaId, idFactura));

    // [Línea 290] Recorre cada elemento en un bucle: for (const renglon of renglones) {
    for (const renglon of renglones) {
      // [Línea 291] Espera a que se complete la operación asíncrona: await moverStock(tx, {
      await moverStock(tx, {
        // [Línea 292] Define o asigna el campo/parámetro 'productoId'.
        productoId: renglon.productoId,
        // [Línea 293] Define o asigna el campo/parámetro 'cantidad'.
        cantidad: renglon.cantidad, // positivo: vuelve a entrar al stock
        // [Línea 294] Define o asigna el campo/parámetro 'tipo'.
        tipo: "anulacion",
        // [Línea 295] Define o asigna el campo/parámetro 'motivo'.
        motivo: `Anulación ${numeroFormateado}: ${datosAnulacion.motivo}`,
        // [Línea 296] Define o asigna el campo/parámetro 'usuarioId'.
        usuarioId: usuarioAdmin.id,
        // [Línea 297] Define o asigna el campo/parámetro 'facturaId'.
        facturaId: idFactura,
        // [Línea 298] Define o asigna el campo/parámetro 'fecha'.
        fecha: fechaAnulacion,
      // [Línea 299] Cierra el bloque o estructura (});).
      });
    // [Línea 300] Cierra el bloque o estructura (}).
    }

    // 3. Si la venta fue en cuenta corriente, acreditar el importe en la cuenta del cliente.
    // [Línea 303] Verifica la condición: if (
    if (
      // [Línea 304] Ejecuta o evalúa: facturaExistente.formaPago === "cuenta_corriente" &&
      facturaExistente.formaPago === "cuenta_corriente" &&
      // [Línea 305] Ejecuta o evalúa: facturaExistente.clienteId !== null
      facturaExistente.clienteId !== null
    // [Línea 306] Ejecuta o evalúa: ) {
    ) {
      // [Línea 307] Inserta una nueva fila en la tabla indicada de la base de datos.
      await tx.insert(movimientosCuenta).values({
        // [Línea 308] Define o asigna el campo/parámetro 'clienteId'.
        clienteId: facturaExistente.clienteId,
        // [Línea 309] Define o asigna el campo/parámetro 'facturaId'.
        facturaId: idFactura,
        // [Línea 310] Define o asigna el campo/parámetro 'pagoId'.
        pagoId: null,
        // [Línea 311] Define o asigna el campo/parámetro 'tipo'.
        tipo: "credito",
        // [Línea 312] Define o asigna el campo/parámetro 'importe'.
        importe: facturaExistente.total,
        // [Línea 313] Define o asigna el campo/parámetro 'descripcion'.
        descripcion: `Anulación factura ${numeroFormateado}`,
        // [Línea 314] Define o asigna el campo/parámetro 'fecha'.
        fecha: fechaAnulacion,
      // [Línea 315] Cierra el bloque o estructura (});).
      });
    // [Línea 316] Cierra el bloque o estructura (}).
    }
  // [Línea 317] Cierra el bloque o estructura (});).
  });

  // [Línea 319] Devuelve el valor: obtenerFactura(usuarioAdmin, idFactura);
  return obtenerFactura(usuarioAdmin, idFactura);
// [Línea 320] Cierra el bloque o estructura (}).
}

// [Línea 322] Define el tipo de datos 'FiltrosFacturas' en TypeScript.
type FiltrosFacturas = {
  // [Línea 323] Ejecuta o evalúa: q?: string;
  q?: string;
  // [Línea 324] Ejecuta o evalúa: desde?: string;
  desde?: string;
  // [Línea 325] Ejecuta o evalúa: hasta?: string;
  hasta?: string;
  // [Línea 326] Ejecuta o evalúa: clienteId?: string;
  clienteId?: string;
  // [Línea 327] Ejecuta o evalúa: vendedorId?: string;
  vendedorId?: string;
  // [Línea 328] Ejecuta o evalúa: forma?: string;
  forma?: string;
  // [Línea 329] Ejecuta o evalúa: estado?: string;
  estado?: string;
  // [Línea 330] Ejecuta o evalúa: page?: string;
  page?: string;
  // [Línea 331] Ejecuta o evalúa: pageSize?: string;
  pageSize?: string;
// [Línea 332] Cierra el bloque o estructura (};).
};

// RF-V8: listado paginado de facturas con filtros y suma del total emitido.
// [Línea 335] Declara la función asíncrona 'listarFacturas'.
export async function listarFacturas(_usuario: UsuarioSesion, parametros: FiltrosFacturas) {
  // [Línea 336] Declara '{ pagina, tamanoPagina, salto }' y le asigna el valor resultante.
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  // [Línea 338] Declara 'condiciones' y le asigna el valor resultante.
  const condiciones = [];
  // [Línea 339] Verifica la condición: if (parametros.desde) condiciones.push(gte(facturas.fecha, inicioDelDia(parametros.desde)));
  if (parametros.desde) condiciones.push(gte(facturas.fecha, inicioDelDia(parametros.desde)));
  // [Línea 340] Verifica la condición: if (parametros.hasta) condiciones.push(lte(facturas.fecha, finDelDia(parametros.hasta)));
  if (parametros.hasta) condiciones.push(lte(facturas.fecha, finDelDia(parametros.hasta)));
  // [Línea 341] Verifica la condición: if (parametros.clienteId) condiciones.push(eq(facturas.clienteId, Number(parametros.clienteId)));
  if (parametros.clienteId) condiciones.push(eq(facturas.clienteId, Number(parametros.clienteId)));
  // [Línea 342] Verifica la condición: if (parametros.vendedorId) condiciones.push(eq(facturas.usuarioId, Number(parametros.vendedorId)));
  if (parametros.vendedorId) condiciones.push(eq(facturas.usuarioId, Number(parametros.vendedorId)));
  // [Línea 343] Verifica la condición: if (
  if (
    // [Línea 344] Ejecuta o evalúa: parametros.forma === "contado" ||
    parametros.forma === "contado" ||
    // [Línea 345] Ejecuta o evalúa: parametros.forma === "tarjeta" ||
    parametros.forma === "tarjeta" ||
    // [Línea 346] Ejecuta o evalúa: parametros.forma === "cuenta_corriente"
    parametros.forma === "cuenta_corriente"
  // [Línea 347] Ejecuta o evalúa: ) {
  ) {
    // [Línea 348] Ejecuta o evalúa: condiciones.push(eq(facturas.formaPago, parametros.forma));
    condiciones.push(eq(facturas.formaPago, parametros.forma));
  // [Línea 349] Cierra el bloque o estructura (}).
  }
  // [Línea 350] Verifica la condición: if (parametros.estado === "emitida" || parametros.estado === "anulada") {
  if (parametros.estado === "emitida" || parametros.estado === "anulada") {
    // [Línea 351] Ejecuta o evalúa: condiciones.push(eq(facturas.estado, parametros.estado));
    condiciones.push(eq(facturas.estado, parametros.estado));
  // [Línea 352] Cierra el bloque o estructura (}).
  }
  // [Línea 353] Verifica la condición: if (parametros.q) {
  if (parametros.q) {
    // [Línea 354] Declara 'textoBuscado' y le asigna el valor resultante.
    const textoBuscado = parametros.q.trim();
    // [Línea 355] Declara 'soloDigitos' y le asigna el valor resultante.
    const soloDigitos = Number(textoBuscado.replace(/\D/g, ""));
    // [Línea 356] Verifica la condición: if (!Number.isNaN(soloDigitos) && soloDigitos > 0) {
    if (!Number.isNaN(soloDigitos) && soloDigitos > 0) {
      // [Línea 357] Ejecuta o evalúa: condiciones.push(
      condiciones.push(
        // [Línea 358] Ejecuta o evalúa: or(
        or(
          // [Línea 359] Ejecuta o evalúa: eq(facturas.numero, soloDigitos),
          eq(facturas.numero, soloDigitos),
          // [Línea 360] Ejecuta o evalúa: like(clientes.nombre, `%${textoBuscado}%`),
          like(clientes.nombre, `%${textoBuscado}%`),
        // [Línea 361] Cierra el bloque o estructura (),).
        ),
      // [Línea 362] Cierra el bloque o estructura ();).
      );
    // [Línea 363] Rama else: se ejecuta si no se cumplió la condición anterior.
    } else {
      // [Línea 364] Ejecuta o evalúa: condiciones.push(like(clientes.nombre, `%${textoBuscado}%`));
      condiciones.push(like(clientes.nombre, `%${textoBuscado}%`));
    // [Línea 365] Cierra el bloque o estructura (}).
    }
  // [Línea 366] Cierra el bloque o estructura (}).
  }

  // [Línea 368] Declara 'filtro' y le asigna el valor resultante.
  const filtro = and(...condiciones);

  // [Línea 370] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filas'.
  const filas = await db
    // [Línea 371] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({
      // [Línea 372] Define o asigna el campo/parámetro 'factura'.
      factura: facturas,
      // [Línea 373] Define o asigna el campo/parámetro 'nombreCliente'.
      nombreCliente: clientes.nombre,
      // [Línea 374] Define o asigna el campo/parámetro 'tipoDocCliente'.
      tipoDocCliente: clientes.tipoDoc,
      // [Línea 375] Define o asigna el campo/parámetro 'nroDocCliente'.
      nroDocCliente: clientes.nroDoc,
      // [Línea 376] Define o asigna el campo/parámetro 'nombreVendedor'.
      nombreVendedor: usuarios.nombre,
    // [Línea 377] Cierra el bloque o estructura (})).
    })
    // [Línea 378] Define la tabla origen de la consulta SQL: .from(facturas)
    .from(facturas)
    // [Línea 379] Hace un LEFT JOIN opcional con otra tabla: .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    // [Línea 380] Hace un INNER JOIN con otra tabla relacionada: .innerJoin(usuarios, eq(facturas.usuarioId, usuarios.id))
    .innerJoin(usuarios, eq(facturas.usuarioId, usuarios.id))
    // [Línea 381] Aplica el filtro WHERE a la consulta SQL: .where(filtro)
    .where(filtro)
    // [Línea 382] Ordena las filas del resultado SQL: .orderBy(desc(facturas.fecha), desc(facturas.id))
    .orderBy(desc(facturas.fecha), desc(facturas.id))
    // [Línea 383] Limita la cantidad de filas por página: .limit(tamanoPagina)
    .limit(tamanoPagina)
    // [Línea 384] Desplaza el inicio de lectura según el número de página: .offset(salto);
    .offset(salto);

  // [Línea 386] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[{ total }]'.
  const [{ total }] = await db
    // [Línea 387] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({ total: count() })
    // [Línea 388] Define la tabla origen de la consulta SQL: .from(facturas)
    .from(facturas)
    // [Línea 389] Hace un LEFT JOIN opcional con otra tabla: .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    // [Línea 390] Aplica el filtro WHERE a la consulta SQL: .where(filtro);
    .where(filtro);

  // Suma de las facturas EMITIDAS que cumplen con el filtro actual.
  // [Línea 393] Declara 'filtroEmitidas' y le asigna el valor resultante.
  const filtroEmitidas = and(filtro, eq(facturas.estado, "emitida"));
  // [Línea 394] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[{ totalEmitido }]'.
  const [{ totalEmitido }] = await db
    // [Línea 395] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({ totalEmitido: sql<number>`coalesce(sum(${facturas.total}), 0)` })
    // [Línea 396] Define la tabla origen de la consulta SQL: .from(facturas)
    .from(facturas)
    // [Línea 397] Hace un LEFT JOIN opcional con otra tabla: .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    // [Línea 398] Aplica el filtro WHERE a la consulta SQL: .where(filtroEmitidas);
    .where(filtroEmitidas);

  // [Línea 400] Declara 'datos' y le asigna el valor resultante.
  const datos = filas.map((fila) => ({
    // [Línea 401] Define o asigna el campo/parámetro 'id'.
    id: fila.factura.id,
    // [Línea 402] Define o asigna el campo/parámetro 'puntoVenta'.
    puntoVenta: fila.factura.puntoVenta,
    // [Línea 403] Define o asigna el campo/parámetro 'numero'.
    numero: fila.factura.numero,
    // [Línea 404] Define o asigna el campo/parámetro 'numeroFormateado'.
    numeroFormateado: formatearNumeroFactura(fila.factura.puntoVenta, fila.factura.numero),
    // [Línea 405] Define o asigna el campo/parámetro 'fecha'.
    fecha: fila.factura.fecha.toISOString(),
    // [Línea 406] Define o asigna el campo/parámetro 'estado'.
    estado: fila.factura.estado,
    // [Línea 407] Define o asigna el campo/parámetro 'cliente'.
    cliente:
      // [Línea 408] Ejecuta o evalúa: fila.factura.clienteId && fila.nombreCliente
      fila.factura.clienteId && fila.nombreCliente
        // [Línea 409] Ejecuta o evalúa: ? {
        ? {
            // [Línea 410] Define o asigna el campo/parámetro 'id'.
            id: fila.factura.clienteId,
            // [Línea 411] Define o asigna el campo/parámetro 'nombre'.
            nombre: fila.nombreCliente,
            // [Línea 412] Define o asigna el campo/parámetro 'tipoDoc'.
            tipoDoc: fila.tipoDocCliente!,
            // [Línea 413] Define o asigna el campo/parámetro 'nroDoc'.
            nroDoc: formatearDocumento(fila.tipoDocCliente!, fila.nroDocCliente!),
          // [Línea 414] Cierra el bloque o estructura (}).
          }
        // [Línea 415] Ejecuta o evalúa: : null,
        : null,
    // [Línea 416] Define o asigna el campo/parámetro 'vendedor'.
    vendedor: { id: fila.factura.usuarioId, nombre: fila.nombreVendedor },
    // [Línea 417] Define o asigna el campo/parámetro 'total'.
    total: fila.factura.total,
    // [Línea 418] Define o asigna el campo/parámetro 'formaPago'.
    formaPago: fila.factura.formaPago,
  // [Línea 419] Ejecuta o evalúa: }));
  }));

  // [Línea 421] Devuelve el valor: {
  return {
    // [Línea 422] Ejecuta o evalúa: ...respuestaPaginada(datos, pagina, tamanoPagina, total),
    ...respuestaPaginada(datos, pagina, tamanoPagina, total),
    // [Línea 423] Define o asigna el campo/parámetro 'totalEmitido'.
    totalEmitido: Number(totalEmitido),
  // [Línea 424] Cierra el bloque o estructura (};).
  };
// [Línea 425] Cierra el bloque o estructura (}).
}

// RF-V7: obtiene una factura completa con sus renglones, forma de pago y datos de anulación.
// [Línea 428] Declara la función asíncrona 'obtenerFactura'.
export async function obtenerFactura(_usuario: UsuarioSesion, idFactura: number) {
  // [Línea 429] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'fila'.
  const fila = await db
    // [Línea 430] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({
      // [Línea 431] Define o asigna el campo/parámetro 'factura'.
      factura: facturas,
      // [Línea 432] Define o asigna el campo/parámetro 'nombreCliente'.
      nombreCliente: clientes.nombre,
      // [Línea 433] Define o asigna el campo/parámetro 'tipoDocCliente'.
      tipoDocCliente: clientes.tipoDoc,
      // [Línea 434] Define o asigna el campo/parámetro 'nroDocCliente'.
      nroDocCliente: clientes.nroDoc,
      // [Línea 435] Define o asigna el campo/parámetro 'domicilioCliente'.
      domicilioCliente: clientes.domicilio,
      // [Línea 436] Define o asigna el campo/parámetro 'nombreVendedor'.
      nombreVendedor: usuarios.nombre,
    // [Línea 437] Cierra el bloque o estructura (})).
    })
    // [Línea 438] Define la tabla origen de la consulta SQL: .from(facturas)
    .from(facturas)
    // [Línea 439] Hace un LEFT JOIN opcional con otra tabla: .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    .leftJoin(clientes, eq(facturas.clienteId, clientes.id))
    // [Línea 440] Hace un INNER JOIN con otra tabla relacionada: .innerJoin(usuarios, eq(facturas.usuarioId, usuarios.id))
    .innerJoin(usuarios, eq(facturas.usuarioId, usuarios.id))
    // [Línea 441] Aplica el filtro WHERE a la consulta SQL: .where(eq(facturas.id, idFactura))
    .where(eq(facturas.id, idFactura))
    // [Línea 442] Ejecuta la consulta y obtiene una sola fila (o undefined si no hay coincidencias).
    .get();

  // [Línea 444] Verifica la condición: if (!fila) throw noEncontrado("La factura");
  if (!fila) throw noEncontrado("La factura");

  // [Línea 446] Declara '{ factura }' y le asigna el valor resultante.
  const { factura } = fila;
  // [Línea 447] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'renglones'.
  const renglones = await db
    // [Línea 448] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select()
    // [Línea 449] Define la tabla origen de la consulta SQL: .from(facturaItems)
    .from(facturaItems)
    // [Línea 450] Aplica el filtro WHERE a la consulta SQL: .where(eq(facturaItems.facturaId, idFactura));
    .where(eq(facturaItems.facturaId, idFactura));

  // Si es pago contado devolvemos montoRecibido y vuelto; si es tarjeta, los datos seguros.
  // [Línea 453] Declara 'detallePago:' y le asigna el valor resultante.
  let detallePago:
    // [Línea 454] Ejecuta o evalúa: | { forma: "contado"; montoRecibido: number; vuelto: number }
    | { forma: "contado"; montoRecibido: number; vuelto: number }
    // [Línea 455] Ejecuta o evalúa: | {
    | {
        // [Línea 456] Define o asigna el campo/parámetro 'forma'.
        forma: "tarjeta";
        // [Línea 457] Define o asigna el campo/parámetro 'tarjeta'.
        tarjeta: { tipo: "debito" | "credito"; marca: string; ultimos4: string };
      // [Línea 458] Cierra el bloque o estructura (}).
      }
    // [Línea 459] Ejecuta o evalúa: | { forma: "cuenta_corriente" };
    | { forma: "cuenta_corriente" };

  // [Línea 461] Verifica la condición: if (factura.formaPago === "contado") {
  if (factura.formaPago === "contado") {
    // [Línea 462] Declara 'recibido' y le asigna el valor resultante.
    const recibido = factura.montoRecibido ?? factura.total;
    // [Línea 463] Ejecuta o evalúa: detallePago = {
    detallePago = {
      // [Línea 464] Define o asigna el campo/parámetro 'forma'.
      forma: "contado",
      // [Línea 465] Define o asigna el campo/parámetro 'montoRecibido'.
      montoRecibido: recibido,
      // [Línea 466] Define o asigna el campo/parámetro 'vuelto'.
      vuelto: recibido - factura.total,
    // [Línea 467] Cierra el bloque o estructura (};).
    };
  // [Línea 468] Verifica la condición: } else if (factura.formaPago === "tarjeta") {
  } else if (factura.formaPago === "tarjeta") {
    // [Línea 469] Ejecuta o evalúa: detallePago = {
    detallePago = {
      // [Línea 470] Define o asigna el campo/parámetro 'forma'.
      forma: "tarjeta",
      // [Línea 471] Define o asigna el campo/parámetro 'tarjeta'.
      tarjeta: {
        // [Línea 472] Define o asigna el campo/parámetro 'tipo'.
        tipo: factura.tarjetaTipo ?? "debito",
        // [Línea 473] Define o asigna el campo/parámetro 'marca'.
        marca: factura.tarjetaMarca ?? "Visa",
        // [Línea 474] Define o asigna el campo/parámetro 'ultimos4'.
        ultimos4: factura.tarjetaUltimos4 ?? "0000",
      // [Línea 475] Cierra el bloque o estructura (},).
      },
    // [Línea 476] Cierra el bloque o estructura (};).
    };
  // [Línea 477] Rama else: se ejecuta si no se cumplió la condición anterior.
  } else {
    // [Línea 478] Ejecuta o evalúa: detallePago = { forma: "cuenta_corriente" };
    detallePago = { forma: "cuenta_corriente" };
  // [Línea 479] Cierra el bloque o estructura (}).
  }

  // [Línea 481] Declara 'datosAnulacion' y le asigna el valor resultante.
  let datosAnulacion = null;
  // [Línea 482] Verifica la condición: if (factura.estado === "anulada") {
  if (factura.estado === "anulada") {
    // [Línea 483] Declara 'usuarioAnulacion' y le asigna el valor resultante.
    let usuarioAnulacion = null;
    // [Línea 484] Verifica la condición: if (factura.usuarioAnulacionId) {
    if (factura.usuarioAnulacionId) {
      // [Línea 485] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filaAdmin'.
      const filaAdmin = await db
        // [Línea 486] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
        .select({ id: usuarios.id, nombre: usuarios.nombre })
        // [Línea 487] Define la tabla origen de la consulta SQL: .from(usuarios)
        .from(usuarios)
        // [Línea 488] Aplica el filtro WHERE a la consulta SQL: .where(eq(usuarios.id, factura.usuarioAnulacionId))
        .where(eq(usuarios.id, factura.usuarioAnulacionId))
        // [Línea 489] Ejecuta la consulta y obtiene una sola fila (o undefined si no hay coincidencias).
        .get();
      // [Línea 490] Verifica la condición: if (filaAdmin) usuarioAnulacion = filaAdmin;
      if (filaAdmin) usuarioAnulacion = filaAdmin;
    // [Línea 491] Cierra el bloque o estructura (}).
    }
    // [Línea 492] Ejecuta o evalúa: datosAnulacion = {
    datosAnulacion = {
      // [Línea 493] Define o asigna el campo/parámetro 'fecha'.
      fecha: (factura.fechaAnulacion ?? factura.fecha).toISOString(),
      // [Línea 494] Define o asigna el campo/parámetro 'motivo'.
      motivo: factura.motivoAnulacion ?? "",
      // [Línea 495] Define o asigna el campo/parámetro 'usuario'.
      usuario: usuarioAnulacion,
    // [Línea 496] Cierra el bloque o estructura (};).
    };
  // [Línea 497] Cierra el bloque o estructura (}).
  }

  // [Línea 499] Declara 'respuestaBase' y le asigna el valor resultante.
  const respuestaBase = {
    // [Línea 500] Define o asigna el campo/parámetro 'id'.
    id: factura.id,
    // [Línea 501] Define o asigna el campo/parámetro 'puntoVenta'.
    puntoVenta: factura.puntoVenta,
    // [Línea 502] Define o asigna el campo/parámetro 'numero'.
    numero: factura.numero,
    // [Línea 503] Define o asigna el campo/parámetro 'numeroFormateado'.
    numeroFormateado: formatearNumeroFactura(factura.puntoVenta, factura.numero),
    // [Línea 504] Define o asigna el campo/parámetro 'fecha'.
    fecha: factura.fecha.toISOString(),
    // [Línea 505] Define o asigna el campo/parámetro 'estado'.
    estado: factura.estado,
    // [Línea 506] Define o asigna el campo/parámetro 'cliente'.
    cliente:
      // [Línea 507] Ejecuta o evalúa: factura.clienteId && fila.nombreCliente
      factura.clienteId && fila.nombreCliente
        // [Línea 508] Ejecuta o evalúa: ? {
        ? {
            // [Línea 509] Define o asigna el campo/parámetro 'id'.
            id: factura.clienteId,
            // [Línea 510] Define o asigna el campo/parámetro 'nombre'.
            nombre: fila.nombreCliente,
            // [Línea 511] Define o asigna el campo/parámetro 'tipoDoc'.
            tipoDoc: fila.tipoDocCliente!,
            // [Línea 512] Define o asigna el campo/parámetro 'nroDoc'.
            nroDoc: formatearDocumento(fila.tipoDocCliente!, fila.nroDocCliente!),
            // [Línea 513] Define o asigna el campo/parámetro 'domicilio'.
            domicilio: fila.domicilioCliente,
          // [Línea 514] Cierra el bloque o estructura (}).
          }
        // [Línea 515] Ejecuta o evalúa: : null,
        : null,
    // [Línea 516] Define o asigna el campo/parámetro 'vendedor'.
    vendedor: { id: factura.usuarioId, nombre: fila.nombreVendedor },
    // [Línea 517] Define o asigna el campo/parámetro 'items'.
    items: renglones.map((r) => ({
      // [Línea 518] Define o asigna el campo/parámetro 'productoId'.
      productoId: r.productoId,
      // [Línea 519] Define o asigna el campo/parámetro 'codigo'.
      codigo: r.codigo,
      // [Línea 520] Define o asigna el campo/parámetro 'descripcion'.
      descripcion: r.descripcion,
      // [Línea 521] Define o asigna el campo/parámetro 'cantidad'.
      cantidad: r.cantidad,
      // [Línea 522] Define o asigna el campo/parámetro 'precioUnitario'.
      precioUnitario: r.precioUnitario,
      // [Línea 523] Define o asigna el campo/parámetro 'subtotal'.
      subtotal: r.subtotal,
    // [Línea 524] Ejecuta o evalúa: })),
    })),
    // [Línea 525] Define o asigna el campo/parámetro 'total'.
    total: factura.total,
    // [Línea 526] Define o asigna el campo/parámetro 'pago'.
    pago: detallePago,
    // [Línea 527] Ejecuta o evalúa: ...(datosAnulacion ? { anulacion: datosAnulacion } : {}),
    ...(datosAnulacion ? { anulacion: datosAnulacion } : {}),
  // [Línea 528] Cierra el bloque o estructura (};).
  };

  // [Línea 530] Verifica la condición: if (factura.formaPago === "cuenta_corriente" && factura.clienteId) {
  if (factura.formaPago === "cuenta_corriente" && factura.clienteId) {
    // [Línea 531] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'saldoCliente'.
    const saldoCliente = await saldoDeCliente(db, factura.clienteId);
    // [Línea 532] Devuelve el valor: { ...respuestaBase, saldoCliente };
    return { ...respuestaBase, saldoCliente };
  // [Línea 533] Cierra el bloque o estructura (}).
  }

  // [Línea 535] Devuelve el valor: respuestaBase;
  return respuestaBase;
// [Línea 536] Cierra el bloque o estructura (}).
}

// [Línea 538] Define el tipo de datos 'FacturaCompleta' en TypeScript.
export type FacturaCompleta = Awaited<ReturnType<typeof obtenerFactura>>;

// Calcula el siguiente número correlativo dentro del punto de venta actual.
// [Línea 541] Declara la función asíncrona 'calcularProximoNumero'.
async function calcularProximoNumero(conexion: Conexion): Promise<number> {
  // [Línea 542] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'fila'.
  const fila = await conexion
    // [Línea 543] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({ ultimo: sql<number>`coalesce(max(${facturas.numero}), 0)` })
    // [Línea 544] Define la tabla origen de la consulta SQL: .from(facturas)
    .from(facturas)
    // [Línea 545] Aplica el filtro WHERE a la consulta SQL: .where(eq(facturas.puntoVenta, PUNTO_DE_VENTA))
    .where(eq(facturas.puntoVenta, PUNTO_DE_VENTA))
    // [Línea 546] Ejecuta la consulta y obtiene una sola fila (o undefined si no hay coincidencias).
    .get();
  // [Línea 547] Devuelve el valor: Number(fila?.ultimo ?? 0) + 1;
  return Number(fila?.ultimo ?? 0) + 1;
// [Línea 548] Cierra el bloque o estructura (}).
}
