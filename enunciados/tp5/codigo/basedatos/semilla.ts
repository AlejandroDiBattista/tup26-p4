// Script de datos iniciales ("pnpm run db:seed").
// Cumple las secciones 8 y 10.7:
// - Carga al menos 2 usuarios (uno por rol), 5 categorías, 30 productos, 10 clientes
//   y más de 50 facturas repartidas en los últimos 30 días.
// - Usa LOS MISMOS SERVICIOS que la aplicación para crear productos, movimientos,
//   clientes, facturas, anulaciones y pagos: así el stock, los saldos y la numeración
//   cumplen todas las reglas de negocio.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./conexion";
import {
  categorias,
  clientes,
  facturaItems,
  facturas,
  movimientosCuenta,
  movimientosStock,
  pagos,
  productos,
  usuarios,
} from "./esquema";
import { crearCategoria } from "@/servicios/categorias";
import { crearProducto } from "@/servicios/productos";
import { registrarMovimientoManual } from "@/servicios/stock";
import { crearCliente } from "@/servicios/clientes";
import { emitirFactura, anularFactura } from "@/servicios/facturas";
import { registrarPago } from "@/servicios/pagos";
import type { UsuarioSesion } from "@/servicios/comunes";

async function sembrarBaseDatos() {
  console.log("Limpiando tablas existentes...");
  await db.delete(movimientosCuenta);
  await db.delete(movimientosStock);
  await db.delete(facturaItems);
  await db.delete(pagos);
  await db.delete(facturas);
  await db.delete(productos);
  await db.delete(categorias);
  await db.delete(clientes);
  await db.delete(usuarios);

  // 1. Usuarios (RF-U3: primer administrador + vendedores).
  console.log("Creando usuarios de prueba...");
  const hashAdmin = await bcrypt.hash("admin1234", 10);
  const hashVendedor = await bcrypt.hash("vendedor1234", 10);

  const [adminLaura] = await db
    .insert(usuarios)
    .values({
      nombre: "Laura Méndez",
      email: "laura@ferreteria.test",
      hashContrasena: hashAdmin,
      rol: "admin",
      activo: true,
    })
    .returning();

  const [vendedorPablo] = await db
    .insert(usuarios)
    .values({
      nombre: "Pablo Ruiz",
      email: "pablo@ferreteria.test",
      hashContrasena: hashVendedor,
      rol: "vendedor",
      activo: true,
    })
    .returning();

  const [vendedoraSofia] = await db
    .insert(usuarios)
    .values({
      nombre: "Sofía Castro",
      email: "sofia@ferreteria.test",
      hashContrasena: hashVendedor,
      rol: "vendedor",
      activo: true,
    })
    .returning();

  const sesionAdmin: UsuarioSesion = {
    id: adminLaura.id,
    nombre: adminLaura.nombre,
    email: adminLaura.email,
    rol: "admin",
  };
  const sesionPablo: UsuarioSesion = {
    id: vendedorPablo.id,
    nombre: vendedorPablo.nombre,
    email: vendedorPablo.email,
    rol: "vendedor",
  };
  const sesionSofia: UsuarioSesion = {
    id: vendedoraSofia.id,
    nombre: vendedoraSofia.nombre,
    email: vendedoraSofia.email,
    rol: "vendedor",
  };

  // 2. Categorías (6 categorías).
  console.log("Creando categorías...");
  const nombresCategorias = [
    "Herramientas",
    "Electricidad",
    "Plomería",
    "Pinturería",
    "Bulonería y fijaciones",
    "Seguridad industrial",
  ];
  const mapaCategorias = new Map<string, number>();
  for (const nombreCat of nombresCategorias) {
    const creada = await crearCategoria(sesionAdmin, { nombre: nombreCat });
    mapaCategorias.set(nombreCat, creada.id);
  }

  // 3. Productos (30 productos con stock inicial amplio; 4 quedarán bajo mínimo al final).
  console.log("Creando 30 productos con stock inicial...");
  const fechaHace32Dias = new Date(Date.now() - 32 * 86_400_000);
  const catalogoInicial = [
    { codigo: "HE-001", descripcion: "Martillo carpintero 500 g", cat: "Herramientas", precio: 1250000, min: 5, inicial: 45 },
    { codigo: "HE-002", descripcion: "Destornillador Phillips PH2 imantado", cat: "Herramientas", precio: 480000, min: 8, inicial: 60 },
    { codigo: "HE-003", descripcion: "Pinza universal aislada 8 pulgadas", cat: "Herramientas", precio: 1420000, min: 5, inicial: 40 },
    { codigo: "HE-004", descripcion: "Llave francesa ajustable 10 pulgadas", cat: "Herramientas", precio: 1890000, min: 4, inicial: 35 },
    { codigo: "HE-005", descripcion: "Cinta métrica 5 m autofrenante", cat: "Herramientas", precio: 760000, min: 10, inicial: 8 }, // bajo mínimo
    { codigo: "HE-006", descripcion: "Sierra manual arco profesional 12 pulgadas", cat: "Herramientas", precio: 1150000, min: 5, inicial: 30 },
    { codigo: "EL-001", descripcion: "Cinta aisladora PVC 20 m negra", cat: "Electricidad", precio: 190000, min: 15, inicial: 120 },
    { codigo: "EL-002", descripcion: "Lámpara LED 12 W luz fría E27", cat: "Electricidad", precio: 320000, min: 20, inicial: 140 },
    { codigo: "EL-003", descripcion: "Llave térmica bipolar 2x25 A DIN", cat: "Electricidad", precio: 1650000, min: 6, inicial: 50 },
    { codigo: "EL-004", descripcion: "Disyuntor diferencial 2x40 A 30 mA", cat: "Electricidad", precio: 4200000, min: 4, inicial: 25 },
    { codigo: "EL-005", descripcion: "Alargue zapatilla 5 tomas con térmica 3 m", cat: "Electricidad", precio: 1380000, min: 8, inicial: 5 }, // bajo mínimo
    { codigo: "EL-006", descripcion: "Cable unipolar 2,5 mm rollo x 10 m", cat: "Electricidad", precio: 1540000, min: 6, inicial: 45 },
    { codigo: "PL-001", descripcion: "Cinta de teflón alta densidad 3/4 x 10 m", cat: "Plomería", precio: 140000, min: 20, inicial: 110 },
    { codigo: "PL-002", descripcion: "Flexible mallado acero 1/2 x 40 cm", cat: "Plomería", precio: 690000, min: 10, inicial: 55 },
    { codigo: "PL-003", descripcion: "Llave esférica bronce 3/4 paso total", cat: "Plomería", precio: 1950000, min: 6, inicial: 35 },
    { codigo: "PL-004", descripcion: "Sifón doble extensible PVC bajo mesada", cat: "Plomería", precio: 840000, min: 6, inicial: 40 },
    { codigo: "PL-005", descripcion: "Sellador silicona neutra transparente 280 ml", cat: "Plomería", precio: 920000, min: 10, inicial: 6 }, // bajo mínimo
    { codigo: "PI-001", descripcion: "Látex interior blanco mate balde 4 L", cat: "Pinturería", precio: 2680000, min: 6, inicial: 40 },
    { codigo: "PI-002", descripcion: "Rodillo lana sintética 22 cm antigota", cat: "Pinturería", precio: 720000, min: 10, inicial: 55 },
    { codigo: "PI-003", descripcion: "Pincel virola nº 20 cerda blanca", cat: "Pinturería", precio: 410000, min: 12, inicial: 70 },
    { codigo: "PI-004", descripcion: "Aguarrás mineral botella 1 L", cat: "Pinturería", precio: 530000, min: 10, inicial: 60 },
    { codigo: "PI-005", descripcion: "Lija al agua grano 180 pack x 5 hojas", cat: "Pinturería", precio: 290000, min: 15, inicial: 90 },
    { codigo: "BU-001", descripcion: "Tarugos nylon nº 8 con tope caja x 100", cat: "Bulonería y fijaciones", precio: 580000, min: 10, inicial: 80 },
    { codigo: "BU-002", descripcion: "Tornillos autoperforantes dry-wall 6x1 caja x 100", cat: "Bulonería y fijaciones", precio: 640000, min: 10, inicial: 75 },
    { codigo: "BU-003", descripcion: "Precintos plásticos negros 200 mm bolsa x 100", cat: "Bulonería y fijaciones", precio: 450000, min: 12, inicial: 85 },
    { codigo: "BU-004", descripcion: "Disco de corte metal 115 x 1,0 mm", cat: "Bulonería y fijaciones", precio: 260000, min: 25, inicial: 130 },
    { codigo: "BU-005", descripcion: "Adhesivo epoxi bicomponente 10 min", cat: "Bulonería y fijaciones", precio: 810000, min: 8, inicial: 50 },
    { codigo: "SE-001", descripcion: "Guantes moteados algodón par", cat: "Seguridad industrial", precio: 240000, min: 20, inicial: 110 },
    { codigo: "SE-002", descripcion: "Antiparras policarbonato transparentes", cat: "Seguridad industrial", precio: 560000, min: 10, inicial: 6 }, // bajo mínimo
    { codigo: "SE-003", descripcion: "Protector auditivo endoaural con cordón", cat: "Seguridad industrial", precio: 310000, min: 15, inicial: 70 },
  ];

  const productosCreados = [];
  for (const item of catalogoInicial) {
    const prod = await crearProducto(
      sesionAdmin,
      {
        codigo: item.codigo,
        descripcion: item.descripcion,
        categoriaId: mapaCategorias.get(item.cat)!,
        precio: item.precio,
        stockMinimo: item.min,
        stockInicial: item.inicial,
      },
      { fecha: fechaHace32Dias },
    );
    productosCreados.push(prod);
  }

  // Un egreso manual por rotura y un ingreso por reposición para que el historial tenga todos los tipos.
  await registrarMovimientoManual(
    sesionAdmin,
    productosCreados[0].id,
    { tipo: "egreso", cantidad: 2, motivo: "Rotura", observacion: "Mango astillado en depósito" },
    { fecha: new Date(Date.now() - 18 * 86_400_000) },
  );
  await registrarMovimientoManual(
    sesionAdmin,
    productosCreados[7].id,
    { tipo: "ingreso", cantidad: 20, motivo: "Reposición", observacion: "Ingreso caja proveedor" },
    { fecha: new Date(Date.now() - 12 * 86_400_000) },
  );

  // 4. Clientes (10 clientes: 7 con cuenta corriente habilitada y 3 solo contado/tarjeta).
  console.log("Creando 10 clientes...");
  const listaClientes = [
    { tipoDoc: "DNI" as const, nroDoc: "28.456.123", nombre: "Mariana López", domicilio: "Las Heras 455", telefono: "381 455-2210", email: "mariana.lopez@correo.test", cuentaCorriente: true, limiteCredito: 40000000 },
    { tipoDoc: "CUIT" as const, nroDoc: "30-71428910-9", nombre: "Constructora del Norte SRL", domicilio: "Av. Mate de Luna 2140", telefono: "381 422-8900", email: "compras@delnorte.test", cuentaCorriente: true, limiteCredito: 95000000 },
    { tipoDoc: "DNI" as const, nroDoc: "32.190.844", nombre: "Ricardo Gómez", domicilio: "San Lorenzo 812", telefono: "381 512-3341", email: "rgomez@correo.test", cuentaCorriente: true, limiteCredito: 25000000 },
    { tipoDoc: "CUIT" as const, nroDoc: "20-25811430-4", nombre: "Jorge Villalba Instalaciones", domicilio: "Mendoza 1120", telefono: "381 498-7712", email: "jvillalba@correo.test", cuentaCorriente: true, limiteCredito: 35000000 },
    { tipoDoc: "DNI" as const, nroDoc: "35.678.901", nombre: "Lucía Fernández", domicilio: "25 de Mayo 640", telefono: "381 601-4490", email: "lucia.f@correo.test", cuentaCorriente: true, limiteCredito: 20000000 },
    { tipoDoc: "CUIT" as const, nroDoc: "30-68912045-2", nombre: "Mantenimiento Integral SA", domicilio: "Av. Roca 950", telefono: "381 431-5500", email: "admin@mantenimiento.test", cuentaCorriente: true, limiteCredito: null },
    { tipoDoc: "DNI" as const, nroDoc: "29.334.556", nombre: "Esteban Pereyra", domicilio: "Crisóstomo Álvarez 310", telefono: "381 544-9821", email: "epereyra@correo.test", cuentaCorriente: true, limiteCredito: 18000000 },
    { tipoDoc: "DNI" as const, nroDoc: "40.112.789", nombre: "Camila Soraire", domicilio: "Laprida 720", telefono: "381 677-1203", email: "csoraire@correo.test", cuentaCorriente: false, limiteCredito: null },
    { tipoDoc: "DNI" as const, nroDoc: "24.889.102", nombre: "Héctor Molina", domicilio: "Santiago del Estero 1450", telefono: "381 410-6632", email: "hmolina@correo.test", cuentaCorriente: false, limiteCredito: null },
    { tipoDoc: "CUIT" as const, nroDoc: "27-31450988-6", nombre: "Valeria Quiroga", domicilio: "Maipú 530", telefono: "381 589-0045", email: "vquiroga@correo.test", cuentaCorriente: false, limiteCredito: null },
  ];

  const clientesCreados = [];
  for (const datosCli of listaClientes) {
    const cli = await crearCliente(sesionAdmin, datosCli);
    clientesCreados.push(cli);
  }

  // 5. Facturas: 54 ventas repartidas en los últimos 30 días + 1 anulada y pagos en cuenta corriente.
  console.log("Emitiendo 54 facturas en los últimos 30 días...");
  const vendedores = [sesionAdmin, sesionPablo, sesionSofia];
  const indicesProductosRotacion = [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29];

  const ahora = Date.now();
  for (let i = 0; i < 50; i++) {
    // Repartimos desde hace 29 días hasta hoy (las últimas 3 caen en hoy).
    const diasAtras = i >= 47 ? 0 : 29 - Math.floor((i * 29) / 47);
    const fechaVenta = new Date(ahora - diasAtras * 86_400_000 - ((i % 5) + 1) * 3_600_000);
    const vendedor = vendedores[i % vendedores.length];

    const prod1 = productosCreados[indicesProductosRotacion[i % indicesProductosRotacion.length]];
    const prod2 =
      productosCreados[indicesProductosRotacion[(i + 5) % indicesProductosRotacion.length]];

    const items =
      prod1.id === prod2.id
        ? [{ productoId: prod1.id, cantidad: 2 }]
        : [
            { productoId: prod1.id, cantidad: (i % 2) + 1 },
            { productoId: prod2.id, cantidad: 1 },
          ];

    const esTarjeta = i % 3 === 1;
    const clienteOpcional = i % 2 === 0 ? null : clientesCreados[i % clientesCreados.length].id;

    await emitirFactura(
      vendedor,
      {
        clienteId: clienteOpcional,
        items,
        pago: esTarjeta
          ? {
              forma: "tarjeta",
              tarjeta: {
                tipo: i % 2 === 0 ? "debito" : "credito",
                marca: i % 4 === 0 ? "Mastercard" : "Visa",
                ultimos4: String(1000 + ((i * 137) % 9000)),
              },
            }
          : { forma: "contado" },
      },
      { fecha: fechaVenta },
    );
  }

  // 4 ventas en cuenta corriente y pagos parciales para dejar 3 clientes con saldo pendiente.
  const fCuenta1 = await emitirFactura(
    sesionPablo,
    {
      clienteId: clientesCreados[0].id, // Mariana López
      items: [
        { productoId: productosCreados[0].id, cantidad: 1 },
        { productoId: productosCreados[6].id, cantidad: 2 },
      ],
      pago: { forma: "cuenta_corriente" },
    },
    { fecha: new Date(ahora - 6 * 86_400_000) },
  );

  await registrarPago(
    sesionPablo,
    clientesCreados[0].id,
    { importe: 500000, medio: "transferencia", observacion: "Pago parcial por transferencia" },
    { fecha: new Date(ahora - 4 * 86_400_000) },
  );

  await emitirFactura(
    sesionAdmin,
    {
      clienteId: clientesCreados[1].id, // Constructora del Norte SRL
      items: [
        { productoId: productosCreados[9].id, cantidad: 1 },
        { productoId: productosCreados[17].id, cantidad: 1 },
      ],
      pago: { forma: "cuenta_corriente" },
    },
    { fecha: new Date(ahora - 5 * 86_400_000) },
  );

  await emitirFactura(
    sesionSofia,
    {
      clienteId: clientesCreados[2].id, // Ricardo Gómez
      items: [{ productoId: productosCreados[3].id, cantidad: 1 }],
      pago: { forma: "cuenta_corriente" },
    },
    { fecha: new Date(ahora - 2 * 86_400_000) },
  );

  // Una factura emitida y luego anulada por el administrador para mostrar el estado Anulada.
  const facturaParaAnular = await emitirFactura(
    sesionPablo,
    {
      clienteId: clientesCreados[3].id,
      items: [{ productoId: productosCreados[2].id, cantidad: 2 }],
      pago: { forma: "cuenta_corriente" },
    },
    { fecha: new Date(ahora - 3 * 86_400_000) },
  );

  await anularFactura(
    sesionAdmin,
    facturaParaAnular.id,
    { motivo: "Error en la carga de cantidades solicitadas por el cliente" },
    { fecha: new Date(ahora - 3 * 86_400_000 + 1800_000) },
  );

  console.log("Datos iniciales cargados con éxito:");
  console.log(" - Admin:    laura@ferreteria.test / admin1234");
  console.log(" - Vendedor: pablo@ferreteria.test / vendedor1234");
  console.log(` - Última factura de Mariana: ${fCuenta1.numeroFormateado}`);
}

sembrarBaseDatos().catch((err) => {
  console.error("Error al sembrar la base de datos:", err);
  process.exit(1);
});
