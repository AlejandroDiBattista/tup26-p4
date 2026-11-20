// Script de pruebas exhaustivas para verificar todas las reglas de negocio,
// servicios, esquemas y casos borde antes de la entrega y defensa del parcial.
import "dotenv/config";
import { db } from "./conexion";
import { clientes, facturas, movimientosCuenta, movimientosStock, productos, usuarios } from "./esquema";
import { iniciarSesion, cambiarContrasena } from "@/servicios/autenticacion";
import { listarUsuarios, crearUsuario, editarUsuario, restablecerContrasena } from "@/servicios/usuarios";
import { listarCategorias, crearCategoria, editarCategoria } from "@/servicios/categorias";
import { listarProductos, crearProducto, editarProducto, obtenerProducto } from "@/servicios/productos";
import { moverStock, registrarMovimientoManual, listarMovimientosStock } from "@/servicios/stock";
import { listarClientes, crearCliente, editarCliente, obtenerCliente, obtenerCuentaCorriente, saldoDeCliente } from "@/servicios/clientes";
import { emitirFactura, anularFactura, obtenerFactura, listarFacturas, obtenerProximoNumeroFactura } from "@/servicios/facturas";
import { registrarPago, obtenerPago } from "@/servicios/pagos";
import { obtenerTablero } from "@/servicios/tablero";
import { ApiError } from "@/servicios/errores";
import type { UsuarioSesion } from "@/servicios/comunes";

let erroresTotales = 0;

function afirmar(condicion: boolean, mensaje: string) {
  if (!condicion) {
    console.error(`❌ FALLÓ: ${mensaje}`);
    erroresTotales++;
  } else {
    console.log(`✓ OK: ${mensaje}`);
  }
}

async function esperarError(promesa: Promise<unknown>, codigoEsperado: string, mensaje: string) {
  try {
    await promesa;
    console.error(`❌ FALLÓ (debía lanzar error ${codigoEsperado}): ${mensaje}`);
    erroresTotales++;
  } catch (error) {
    if (error instanceof ApiError && error.code === codigoEsperado) {
      console.log(`✓ OK (capturado ${codigoEsperado}): ${mensaje}`);
    } else {
      console.error(`❌ FALLÓ (código incorrecto ${(error as any)?.code}): ${mensaje}`, error);
      erroresTotales++;
    }
  }
}

async function ejecutarPruebas() {
  console.log("=== INICIANDO VERIFICACIÓN COMPLETA DEL SISTEMA ===");

  // 1. AUTENTICACIÓN
  console.log("\n--- Probando Autenticación ---");
  const admin = await iniciarSesion({ email: "laura@ferreteria.test", password: "••••••••" }).catch(() => null);
  afirmar(admin === null, "Login con password incorrecto es rechazado");

  const adminValido = await iniciarSesion({ email: "laura@ferreteria.test", password: "admin1234" });
  afirmar(adminValido.rol === "admin" && adminValido.email === "laura@ferreteria.test", "Login exitoso de Administrador");

  const vendedorValido = await iniciarSesion({ email: "pablo@ferreteria.test", password: "vendedor1234" });
  afirmar(vendedorValido.rol === "vendedor", "Login exitoso de Vendedor");

  await esperarError(
    iniciarSesion({ email: "noexiste@test.com", password: "123" }),
    "CREDENCIALES_INVALIDAS",
    "Usuario inexistente devuelve CREDENCIALES_INVALIDAS",
  );

  // 2. PERMISOS Y ROLES
  console.log("\n--- Probando Permisos por Rol ---");
  await esperarError(
    listarUsuarios(vendedorValido, {}),
    "SIN_PERMISO",
    "Vendedor no puede listar usuarios (403)",
  );

  await esperarError(
    crearCategoria(vendedorValido, { nombre: "Cat Vendedor" }),
    "SIN_PERMISO",
    "Vendedor no puede crear categorías (403)",
  );

  await esperarError(
    crearProducto(vendedorValido, {
      codigo: "TEST-01",
      descripcion: "Test",
      categoriaId: 1,
      precio: 1000,
      stockMinimo: 1,
    }),
    "SIN_PERMISO",
    "Vendedor no puede crear productos (403)",
  );

  // 3. REGLA OPERACION SOBRE SI MISMO
  console.log("\n--- Probando Seguridad sobre Administrador ---");
  await esperarError(
    editarUsuario(adminValido, adminValido.id, { activo: false }),
    "OPERACION_SOBRE_SI_MISMO",
    "Admin no puede desactivarse a sí mismo",
  );
  await esperarError(
    editarUsuario(adminValido, adminValido.id, { rol: "vendedor" }),
    "OPERACION_SOBRE_SI_MISMO",
    "Admin no puede quitarse su propio rol de admin",
  );

  // 4. CATEGORÍAS
  console.log("\n--- Probando Categorías ---");
  const codigoAleatorio = Math.floor(Math.random() * 90000 + 10000);
  const nombreNuevaCat = `Categoría Prueba ${codigoAleatorio}`;
  const catCreada = await crearCategoria(adminValido, { nombre: nombreNuevaCat });
  afirmar(catCreada.id > 0, "Categoría creada con éxito");

  await esperarError(
    crearCategoria(adminValido, { nombre: nombreNuevaCat }),
    "NOMBRE_DUPLICADO",
    "Rechaza nombre de categoría duplicado (409)",
  );

  // 5. PRODUCTOS Y CONTROL DE EXISTENCIAS
  console.log("\n--- Probando Productos y Stock ---");
  const codigoProductoTest = `TP-${codigoAleatorio}`;
  const prodCreado = await crearProducto(adminValido, {
    codigo: codigoProductoTest,
    descripcion: `Producto Prueba ${codigoAleatorio}`,
    categoriaId: catCreada.id,
    precio: 250000, // $ 2.500,00
    stockMinimo: 5,
    stockInicial: 10,
  });
  afirmar(prodCreado.existencia === 10, "Producto creado con stock inicial de 10 unidades");

  await esperarError(
    crearProducto(adminValido, {
      codigo: codigoProductoTest,
      descripcion: "Otro",
      categoriaId: catCreada.id,
      precio: 100,
      stockMinimo: 1,
    }),
    "CODIGO_DUPLICADO",
    "Rechaza código de producto duplicado (409)",
  );

  // Rechazo de existencia manual en PATCH
  await esperarError(
    editarProducto(adminValido, prodCreado.id, { existencia: 50 }),
    "VALIDACION",
    "PATCH /api/productos no acepta 'existencia' (rechazado con 422)",
  );

  // Movimiento manual de egreso
  const movEgreso = await registrarMovimientoManual(adminValido, prodCreado.id, {
    tipo: "egreso",
    cantidad: 2,
    motivo: "Rotura",
    observacion: "Prueba egreso",
  });
  afirmar(movEgreso.existenciaResultante === 8, "Egreso manual descuenta stock correctamente a 8");

  // Egreso superior a existencia
  await esperarError(
    registrarMovimientoManual(adminValido, prodCreado.id, {
      tipo: "egreso",
      cantidad: 50,
      motivo: "Ajuste de inventario",
    }),
    "STOCK_INSUFICIENTE",
    "Egreso manual que dejaría stock negativo es rechazado (409 STOCK_INSUFICIENTE)",
  );

  // No permitir desactivar categoría con productos activos
  await esperarError(
    editarCategoria(adminValido, catCreada.id, { activa: false }),
    "CATEGORIA_EN_USO",
    "No permite desactivar categoría con productos activos (409)",
  );

  // 6. CLIENTES Y CUENTA CORRIENTE
  console.log("\n--- Probando Clientes y Saldo ---");
  const dniClienteTest = `${codigoAleatorio}12`;
  const clienteTest = await crearCliente(adminValido, {
    tipoDoc: "DNI",
    nroDoc: dniClienteTest,
    nombre: `Cliente Test ${codigoAleatorio}`,
    telefono: "381 400-0000",
    cuentaCorriente: true,
    limiteCredito: 500000, // $ 5.000,00 de límite
  });
  afirmar(clienteTest.id > 0 && clienteTest.saldo === 0, "Cliente creado con saldo 0");

  await esperarError(
    crearCliente(adminValido, {
      tipoDoc: "DNI",
      nroDoc: dniClienteTest,
      nombre: "Duplicado",
    }),
    "DOCUMENTO_DUPLICADO",
    "Rechaza documento de cliente duplicado (409)",
  );

  // 7. FACTURACIÓN Y TRANSACCIONES
  console.log("\n--- Probando Facturación Atómica ---");
  // A. Venta contado consumidor final
  const ventaContado = await emitirFactura(vendedorValido, {
    clienteId: null,
    items: [{ productoId: prodCreado.id, cantidad: 2 }],
    pago: { forma: "contado", montoRecibido: 1000000 },
  });
  afirmar(ventaContado.total === 500000, "Venta contado por 2 unidades calculó total de $ 5.000,00");
  afirmar(ventaContado.pago.forma === "contado" && (ventaContado.pago as any).vuelto === 500000, "Cálculo exacto de vuelto en contado");

  // Verificar stock descontado
  const prodDespuesVenta = await obtenerProducto(adminValido, prodCreado.id);
  afirmar(prodDespuesVenta.existencia === 6, "Stock descontado de 8 a 6 unidades tras venta");

  // B. Venta en cuenta corriente a consumidor final (no permitida)
  await esperarError(
    emitirFactura(vendedorValido, {
      clienteId: null,
      items: [{ productoId: prodCreado.id, cantidad: 1 }],
      pago: { forma: "cuenta_corriente" },
    }),
    "CUENTA_CORRIENTE_NO_HABILITADA",
    "Consumidor final no puede comprar en cuenta corriente (422)",
  );

  // C. Venta que supera el límite de crédito
  // El producto cuesta $ 2.500,00. 3 unidades = $ 7.500,00. Límite es $ 5.000,00.
  await esperarError(
    emitirFactura(vendedorValido, {
      clienteId: clienteTest.id,
      items: [{ productoId: prodCreado.id, cantidad: 3 }],
      pago: { forma: "cuenta_corriente" },
    }),
    "LIMITE_CREDITO_EXCEDIDO",
    "Venta a cuenta corriente que supera límite es rechazada (422 LIMITE_CREDITO_EXCEDIDO)",
  );

  // D. Venta en cuenta corriente válida dentro del límite
  const ventaCtaCte = await emitirFactura(vendedorValido, {
    clienteId: clienteTest.id,
    items: [{ productoId: prodCreado.id, cantidad: 1 }], // $ 2.500,00
    pago: { forma: "cuenta_corriente" },
  });
  afirmar(ventaCtaCte.total === 250000, "Venta en cuenta corriente emitida correctamente");

  // Verificar saldo del cliente
  const saldoCliente = await saldoDeCliente(db, clienteTest.id);
  afirmar(saldoCliente === 250000, "Saldo del cliente refleja el débito de $ 2.500,00");

  // Intentar desactivar cliente con saldo pendiente
  await esperarError(
    editarCliente(adminValido, clienteTest.id, { activo: false }),
    "SALDO_PENDIENTE",
    "No permite desactivar cliente con saldo pendiente (422 SALDO_PENDIENTE)",
  );

  // E. Pago de cuenta corriente
  console.log("\n--- Probando Registro de Pagos ---");
  // Pago mayor que la deuda
  await esperarError(
    registrarPago(vendedorValido, clienteTest.id, {
      importe: 300000, // $ 3.000,00 supera los $ 2.500,00
      medio: "efectivo",
    }),
    "PAGO_SUPERA_DEUDA",
    "Pago que supera la deuda es rechazado (422 PAGO_SUPERA_DEUDA)",
  );

  // Pago parcial válido
  const pagoRealizado = await registrarPago(vendedorValido, clienteTest.id, {
    importe: 100000, // $ 1.000,00
    medio: "transferencia",
    observacion: "Pago prueba",
  });
  afirmar(pagoRealizado.saldoCliente === 150000, "Pago registrado: saldo restante es $ 1.500,00");
  afirmar(pagoRealizado.numeroRecibo.startsWith("R 0001-"), "Número de recibo correlativo formateado");

  // F. Anulación de Factura
  console.log("\n--- Probando Anulación de Facturas ---");
  // Vendedor intentando anular
  await esperarError(
    anularFactura(vendedorValido, ventaCtaCte.id, { motivo: "Error vendedor" }),
    "SIN_PERMISO",
    "Vendedor no puede anular facturas (403)",
  );

  // Anulación válida por administrador
  const stockAntesAnulacion = (await obtenerProducto(adminValido, prodCreado.id)).existencia;
  const facAnulada = await anularFactura(adminValido, ventaCtaCte.id, {
    motivo: "Devolución por falla",
  });
  afirmar(facAnulada.estado === "anulada", "Factura queda con estado 'anulada'");

  // Reingreso del stock
  const stockDespuesAnulacion = (await obtenerProducto(adminValido, prodCreado.id)).existencia;
  afirmar(stockDespuesAnulacion === stockAntesAnulacion + 1, "Stock reingresado tras anular factura");

  // Re-anulación rechazada
  await esperarError(
    anularFactura(adminValido, ventaCtaCte.id, { motivo: "Otra vez" }),
    "FACTURA_ANULADA",
    "No permite anular una factura ya anulada (409 FACTURA_ANULADA)",
  );

  // 8. TABLERO
  console.log("\n--- Probando Tablero de Inicio ---");
  const tablero = await obtenerTablero(adminValido);
  afirmar(tablero.ventasDiarias.length === 30, "Tablero devuelve exactamente 30 días sin huecos");
  afirmar(tablero.porFormaDePago.length === 3, "Tablero incluye las 3 formas de pago");
  afirmar(tablero.masVendidos.length <= 5, "Tablero lista hasta los 5 más vendidos");

  // 9. REGLAS DE NUMERACIÓN Y CONGELAMIENTO DE PRECIOS
  console.log("\n--- Probando Congelamiento de Precios e Invariantes ---");
  // Cambiar precio del producto en el catálogo
  await editarProducto(adminValido, prodCreado.id, { precio: 990000 });
  const facConsultada = await obtenerFactura(adminValido, ventaContado.id);
  afirmar(
    facConsultada.items[0].precioUnitario === 250000,
    "El precio de la factura ya emitida NO cambió tras modificar el catálogo (Regla 3: precio congelado)",
  );

  console.log("\n=======================================================");
  if (erroresTotales === 0) {
    console.log("🎉 TODAS LAS VERIFICACIONES PASARON CON ÉXITO SIN ERRORES!");
  } else {
    console.error(`💥 SE DETECTARON ${erroresTotales} ERRORES.`);
  }
}

ejecutarPruebas().catch((err) => {
  console.error("Error inesperado en pruebas:", err);
  process.exit(1);
});
