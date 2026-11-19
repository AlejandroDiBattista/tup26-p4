// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Script de datos iniciales ("pnpm run db:seed").
// Cumple las secciones 8 y 10.7:
// - Carga al menos 2 usuarios (uno por rol), 5 categorías, 30 productos, 10 clientes
//   y más de 50 facturas repartidas en los últimos 30 días.
// - Usa LOS MISMOS SERVICIOS que la aplicación para crear productos, movimientos,
//   clientes, facturas, anulaciones y pagos: así el stock, los saldos y la numeración
//   cumplen todas las reglas de negocio.
// [Línea 8] Inicia un bloque de importación de dependencias.
import "dotenv/config";
// [Línea 9] Importa elementos desde 'bcryptjs'.
import bcrypt from "bcryptjs";
// [Línea 10] Importa elementos desde './conexion'.
import { db } from "./conexion";
// [Línea 11] Inicia un bloque de importación de dependencias.
import {
  // [Línea 12] Importa 'categorias' desde el módulo.
  categorias,
  // [Línea 13] Importa 'clientes' desde el módulo.
  clientes,
  // [Línea 14] Importa 'facturaItems' desde el módulo.
  facturaItems,
  // [Línea 15] Importa 'facturas' desde el módulo.
  facturas,
  // [Línea 16] Importa 'movimientosCuenta' desde el módulo.
  movimientosCuenta,
  // [Línea 17] Importa 'movimientosStock' desde el módulo.
  movimientosStock,
  // [Línea 18] Importa 'pagos' desde el módulo.
  pagos,
  // [Línea 19] Importa 'productos' desde el módulo.
  productos,
  // [Línea 20] Importa 'usuarios' desde el módulo.
  usuarios,
// [Línea 21] Cierra la lista de importaciones provenientes del módulo './esquema'.
} from "./esquema";
// [Línea 22] Importa elementos desde '@/servicios/categorias'.
import { crearCategoria } from "@/servicios/categorias";
// [Línea 23] Importa elementos desde '@/servicios/productos'.
import { crearProducto } from "@/servicios/productos";
// [Línea 24] Importa elementos desde '@/servicios/stock'.
import { registrarMovimientoManual } from "@/servicios/stock";
// [Línea 25] Importa elementos desde '@/servicios/clientes'.
import { crearCliente } from "@/servicios/clientes";
// [Línea 26] Importa elementos desde '@/servicios/facturas'.
import { emitirFactura, anularFactura } from "@/servicios/facturas";
// [Línea 27] Importa elementos desde '@/servicios/pagos'.
import { registrarPago } from "@/servicios/pagos";
// [Línea 28] Importa tipos de TypeScript (solo para chequeo al compilar): import type { UsuarioSesion } from "@/servicios/comunes";
import type { UsuarioSesion } from "@/servicios/comunes";

// [Línea 30] Declara la función asíncrona 'sembrarBaseDatos'.
async function sembrarBaseDatos() {
  // [Línea 31] Ejecuta o evalúa: console.log("Limpiando tablas existentes...");
  console.log("Limpiando tablas existentes...");
  // [Línea 32] Borra las filas de la tabla indicada.
  await db.delete(movimientosCuenta);
  // [Línea 33] Borra las filas de la tabla indicada.
  await db.delete(movimientosStock);
  // [Línea 34] Borra las filas de la tabla indicada.
  await db.delete(facturaItems);
  // [Línea 35] Borra las filas de la tabla indicada.
  await db.delete(pagos);
  // [Línea 36] Borra las filas de la tabla indicada.
  await db.delete(facturas);
  // [Línea 37] Borra las filas de la tabla indicada.
  await db.delete(productos);
  // [Línea 38] Borra las filas de la tabla indicada.
  await db.delete(categorias);
  // [Línea 39] Borra las filas de la tabla indicada.
  await db.delete(clientes);
  // [Línea 40] Borra las filas de la tabla indicada.
  await db.delete(usuarios);

  // 1. Usuarios (RF-U3: primer administrador + vendedores).
  // [Línea 43] Ejecuta o evalúa: console.log("Creando usuarios de prueba...");
  console.log("Creando usuarios de prueba...");
  // [Línea 44] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'hashAdmin'.
  const hashAdmin = await bcrypt.hash("admin1234", 10);
  // [Línea 45] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'hashVendedor'.
  const hashVendedor = await bcrypt.hash("vendedor1234", 10);

  // [Línea 47] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[adminLaura]'.
  const [adminLaura] = await db
    // [Línea 48] Inserta una nueva fila en la tabla indicada de la base de datos.
    .insert(usuarios)
    // [Línea 49] Define los valores de las columnas a insertar.
    .values({
      // [Línea 50] Define o asigna el campo/parámetro 'nombre'.
      nombre: "Laura Méndez",
      // [Línea 51] Define o asigna el campo/parámetro 'email'.
      email: "laura@ferreteria.test",
      // [Línea 52] Define o asigna el campo/parámetro 'hashContrasena'.
      hashContrasena: hashAdmin,
      // [Línea 53] Define o asigna el campo/parámetro 'rol'.
      rol: "admin",
      // [Línea 54] Define o asigna el campo/parámetro 'activo'.
      activo: true,
    // [Línea 55] Cierra el bloque o estructura (})).
    })
    // [Línea 56] Solicita que SQLite devuelva los datos de la fila recién insertada o actualizada.
    .returning();

  // [Línea 58] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[vendedorPablo]'.
  const [vendedorPablo] = await db
    // [Línea 59] Inserta una nueva fila en la tabla indicada de la base de datos.
    .insert(usuarios)
    // [Línea 60] Define los valores de las columnas a insertar.
    .values({
      // [Línea 61] Define o asigna el campo/parámetro 'nombre'.
      nombre: "Pablo Ruiz",
      // [Línea 62] Define o asigna el campo/parámetro 'email'.
      email: "pablo@ferreteria.test",
      // [Línea 63] Define o asigna el campo/parámetro 'hashContrasena'.
      hashContrasena: hashVendedor,
      // [Línea 64] Define o asigna el campo/parámetro 'rol'.
      rol: "vendedor",
      // [Línea 65] Define o asigna el campo/parámetro 'activo'.
      activo: true,
    // [Línea 66] Cierra el bloque o estructura (})).
    })
    // [Línea 67] Solicita que SQLite devuelva los datos de la fila recién insertada o actualizada.
    .returning();

  // [Línea 69] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[vendedoraSofia]'.
  const [vendedoraSofia] = await db
    // [Línea 70] Inserta una nueva fila en la tabla indicada de la base de datos.
    .insert(usuarios)
    // [Línea 71] Define los valores de las columnas a insertar.
    .values({
      // [Línea 72] Define o asigna el campo/parámetro 'nombre'.
      nombre: "Sofía Castro",
      // [Línea 73] Define o asigna el campo/parámetro 'email'.
      email: "sofia@ferreteria.test",
      // [Línea 74] Define o asigna el campo/parámetro 'hashContrasena'.
      hashContrasena: hashVendedor,
      // [Línea 75] Define o asigna el campo/parámetro 'rol'.
      rol: "vendedor",
      // [Línea 76] Define o asigna el campo/parámetro 'activo'.
      activo: true,
    // [Línea 77] Cierra el bloque o estructura (})).
    })
    // [Línea 78] Solicita que SQLite devuelva los datos de la fila recién insertada o actualizada.
    .returning();

  // [Línea 80] Declara 'sesionAdmin: UsuarioSesion' y le asigna el valor resultante.
  const sesionAdmin: UsuarioSesion = {
    // [Línea 81] Define o asigna el campo/parámetro 'id'.
    id: adminLaura.id,
    // [Línea 82] Define o asigna el campo/parámetro 'nombre'.
    nombre: adminLaura.nombre,
    // [Línea 83] Define o asigna el campo/parámetro 'email'.
    email: adminLaura.email,
    // [Línea 84] Define o asigna el campo/parámetro 'rol'.
    rol: "admin",
  // [Línea 85] Cierra el bloque o estructura (};).
  };
  // [Línea 86] Declara 'sesionPablo: UsuarioSesion' y le asigna el valor resultante.
  const sesionPablo: UsuarioSesion = {
    // [Línea 87] Define o asigna el campo/parámetro 'id'.
    id: vendedorPablo.id,
    // [Línea 88] Define o asigna el campo/parámetro 'nombre'.
    nombre: vendedorPablo.nombre,
    // [Línea 89] Define o asigna el campo/parámetro 'email'.
    email: vendedorPablo.email,
    // [Línea 90] Define o asigna el campo/parámetro 'rol'.
    rol: "vendedor",
  // [Línea 91] Cierra el bloque o estructura (};).
  };
  // [Línea 92] Declara 'sesionSofia: UsuarioSesion' y le asigna el valor resultante.
  const sesionSofia: UsuarioSesion = {
    // [Línea 93] Define o asigna el campo/parámetro 'id'.
    id: vendedoraSofia.id,
    // [Línea 94] Define o asigna el campo/parámetro 'nombre'.
    nombre: vendedoraSofia.nombre,
    // [Línea 95] Define o asigna el campo/parámetro 'email'.
    email: vendedoraSofia.email,
    // [Línea 96] Define o asigna el campo/parámetro 'rol'.
    rol: "vendedor",
  // [Línea 97] Cierra el bloque o estructura (};).
  };

  // 2. Categorías (6 categorías).
  // [Línea 100] Ejecuta o evalúa: console.log("Creando categorías...");
  console.log("Creando categorías...");
  // [Línea 101] Declara 'nombresCategorias' y le asigna el valor resultante.
  const nombresCategorias = [
    // [Línea 102] Ejecuta o evalúa: "Herramientas",
    "Herramientas",
    // [Línea 103] Ejecuta o evalúa: "Electricidad",
    "Electricidad",
    // [Línea 104] Ejecuta o evalúa: "Plomería",
    "Plomería",
    // [Línea 105] Ejecuta o evalúa: "Pinturería",
    "Pinturería",
    // [Línea 106] Ejecuta o evalúa: "Bulonería y fijaciones",
    "Bulonería y fijaciones",
    // [Línea 107] Ejecuta o evalúa: "Seguridad industrial",
    "Seguridad industrial",
  // [Línea 108] Ejecuta o evalúa: ];
  ];
  // [Línea 109] Declara 'mapaCategorias' y le asigna el valor resultante.
  const mapaCategorias = new Map<string, number>();
  // [Línea 110] Recorre cada elemento en un bucle: for (const nombreCat of nombresCategorias) {
  for (const nombreCat of nombresCategorias) {
    // [Línea 111] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'creada'.
    const creada = await crearCategoria(sesionAdmin, { nombre: nombreCat });
    // [Línea 112] Ejecuta o evalúa: mapaCategorias.set(nombreCat, creada.id);
    mapaCategorias.set(nombreCat, creada.id);
  // [Línea 113] Cierra el bloque o estructura (}).
  }

  // 3. Productos (30 productos con stock inicial amplio; 4 quedarán bajo mínimo al final).
  // [Línea 116] Ejecuta o evalúa: console.log("Creando 30 productos con stock inicial...");
  console.log("Creando 30 productos con stock inicial...");
  // [Línea 117] Declara 'fechaHace32Dias' y le asigna el valor resultante.
  const fechaHace32Dias = new Date(Date.now() - 32 * 86_400_000);
  // [Línea 118] Declara 'catalogoInicial' y le asigna el valor resultante.
  const catalogoInicial = [
    // [Línea 119] Ejecuta o evalúa: { codigo: "HE-001", descripcion: "Martillo carpintero 500 g", cat: "Herramientas
    { codigo: "HE-001", descripcion: "Martillo carpintero 500 g", cat: "Herramientas", precio: 1250000, min: 5, inicial: 45 },
    // [Línea 120] Ejecuta o evalúa: { codigo: "HE-002", descripcion: "Destornillador Phillips PH2 imantado", cat: "H
    { codigo: "HE-002", descripcion: "Destornillador Phillips PH2 imantado", cat: "Herramientas", precio: 480000, min: 8, inicial: 60 },
    // [Línea 121] Ejecuta o evalúa: { codigo: "HE-003", descripcion: "Pinza universal aislada 8 pulgadas", cat: "Her
    { codigo: "HE-003", descripcion: "Pinza universal aislada 8 pulgadas", cat: "Herramientas", precio: 1420000, min: 5, inicial: 40 },
    // [Línea 122] Ejecuta o evalúa: { codigo: "HE-004", descripcion: "Llave francesa ajustable 10 pulgadas", cat: "H
    { codigo: "HE-004", descripcion: "Llave francesa ajustable 10 pulgadas", cat: "Herramientas", precio: 1890000, min: 4, inicial: 35 },
    // [Línea 123] Ejecuta o evalúa: { codigo: "HE-005", descripcion: "Cinta métrica 5 m autofrenante", cat: "Herrami
    { codigo: "HE-005", descripcion: "Cinta métrica 5 m autofrenante", cat: "Herramientas", precio: 760000, min: 10, inicial: 8 }, // bajo mínimo
    // [Línea 124] Ejecuta o evalúa: { codigo: "HE-006", descripcion: "Sierra manual arco profesional 12 pulgadas", c
    { codigo: "HE-006", descripcion: "Sierra manual arco profesional 12 pulgadas", cat: "Herramientas", precio: 1150000, min: 5, inicial: 30 },
    // [Línea 125] Ejecuta o evalúa: { codigo: "EL-001", descripcion: "Cinta aisladora PVC 20 m negra", cat: "Electri
    { codigo: "EL-001", descripcion: "Cinta aisladora PVC 20 m negra", cat: "Electricidad", precio: 190000, min: 15, inicial: 120 },
    // [Línea 126] Ejecuta o evalúa: { codigo: "EL-002", descripcion: "Lámpara LED 12 W luz fría E27", cat: "Electric
    { codigo: "EL-002", descripcion: "Lámpara LED 12 W luz fría E27", cat: "Electricidad", precio: 320000, min: 20, inicial: 140 },
    // [Línea 127] Ejecuta o evalúa: { codigo: "EL-003", descripcion: "Llave térmica bipolar 2x25 A DIN", cat: "Elect
    { codigo: "EL-003", descripcion: "Llave térmica bipolar 2x25 A DIN", cat: "Electricidad", precio: 1650000, min: 6, inicial: 50 },
    // [Línea 128] Ejecuta o evalúa: { codigo: "EL-004", descripcion: "Disyuntor diferencial 2x40 A 30 mA", cat: "Ele
    { codigo: "EL-004", descripcion: "Disyuntor diferencial 2x40 A 30 mA", cat: "Electricidad", precio: 4200000, min: 4, inicial: 25 },
    // [Línea 129] Ejecuta o evalúa: { codigo: "EL-005", descripcion: "Alargue zapatilla 5 tomas con térmica 3 m", ca
    { codigo: "EL-005", descripcion: "Alargue zapatilla 5 tomas con térmica 3 m", cat: "Electricidad", precio: 1380000, min: 8, inicial: 5 }, // bajo mínimo
    // [Línea 130] Ejecuta o evalúa: { codigo: "EL-006", descripcion: "Cable unipolar 2,5 mm rollo x 10 m", cat: "Ele
    { codigo: "EL-006", descripcion: "Cable unipolar 2,5 mm rollo x 10 m", cat: "Electricidad", precio: 1540000, min: 6, inicial: 45 },
    // [Línea 131] Ejecuta o evalúa: { codigo: "PL-001", descripcion: "Cinta de teflón alta densidad 3/4 x 10 m", cat
    { codigo: "PL-001", descripcion: "Cinta de teflón alta densidad 3/4 x 10 m", cat: "Plomería", precio: 140000, min: 20, inicial: 110 },
    // [Línea 132] Ejecuta o evalúa: { codigo: "PL-002", descripcion: "Flexible mallado acero 1/2 x 40 cm", cat: "Plo
    { codigo: "PL-002", descripcion: "Flexible mallado acero 1/2 x 40 cm", cat: "Plomería", precio: 690000, min: 10, inicial: 55 },
    // [Línea 133] Ejecuta o evalúa: { codigo: "PL-003", descripcion: "Llave esférica bronce 3/4 paso total", cat: "P
    { codigo: "PL-003", descripcion: "Llave esférica bronce 3/4 paso total", cat: "Plomería", precio: 1950000, min: 6, inicial: 35 },
    // [Línea 134] Ejecuta o evalúa: { codigo: "PL-004", descripcion: "Sifón doble extensible PVC bajo mesada", cat: 
    { codigo: "PL-004", descripcion: "Sifón doble extensible PVC bajo mesada", cat: "Plomería", precio: 840000, min: 6, inicial: 40 },
    // [Línea 135] Ejecuta o evalúa: { codigo: "PL-005", descripcion: "Sellador silicona neutra transparente 280 ml",
    { codigo: "PL-005", descripcion: "Sellador silicona neutra transparente 280 ml", cat: "Plomería", precio: 920000, min: 10, inicial: 6 }, // bajo mínimo
    // [Línea 136] Ejecuta o evalúa: { codigo: "PI-001", descripcion: "Látex interior blanco mate balde 4 L", cat: "P
    { codigo: "PI-001", descripcion: "Látex interior blanco mate balde 4 L", cat: "Pinturería", precio: 2680000, min: 6, inicial: 40 },
    // [Línea 137] Ejecuta o evalúa: { codigo: "PI-002", descripcion: "Rodillo lana sintética 22 cm antigota", cat: "
    { codigo: "PI-002", descripcion: "Rodillo lana sintética 22 cm antigota", cat: "Pinturería", precio: 720000, min: 10, inicial: 55 },
    // [Línea 138] Ejecuta o evalúa: { codigo: "PI-003", descripcion: "Pincel virola nº 20 cerda blanca", cat: "Pintu
    { codigo: "PI-003", descripcion: "Pincel virola nº 20 cerda blanca", cat: "Pinturería", precio: 410000, min: 12, inicial: 70 },
    // [Línea 139] Ejecuta o evalúa: { codigo: "PI-004", descripcion: "Aguarrás mineral botella 1 L", cat: "Pinturerí
    { codigo: "PI-004", descripcion: "Aguarrás mineral botella 1 L", cat: "Pinturería", precio: 530000, min: 10, inicial: 60 },
    // [Línea 140] Ejecuta o evalúa: { codigo: "PI-005", descripcion: "Lija al agua grano 180 pack x 5 hojas", cat: "
    { codigo: "PI-005", descripcion: "Lija al agua grano 180 pack x 5 hojas", cat: "Pinturería", precio: 290000, min: 15, inicial: 90 },
    // [Línea 141] Ejecuta o evalúa: { codigo: "BU-001", descripcion: "Tarugos nylon nº 8 con tope caja x 100", cat: 
    { codigo: "BU-001", descripcion: "Tarugos nylon nº 8 con tope caja x 100", cat: "Bulonería y fijaciones", precio: 580000, min: 10, inicial: 80 },
    // [Línea 142] Ejecuta o evalúa: { codigo: "BU-002", descripcion: "Tornillos autoperforantes dry-wall 6x1 caja x 
    { codigo: "BU-002", descripcion: "Tornillos autoperforantes dry-wall 6x1 caja x 100", cat: "Bulonería y fijaciones", precio: 640000, min: 10, inicial: 75 },
    // [Línea 143] Ejecuta o evalúa: { codigo: "BU-003", descripcion: "Precintos plásticos negros 200 mm bolsa x 100"
    { codigo: "BU-003", descripcion: "Precintos plásticos negros 200 mm bolsa x 100", cat: "Bulonería y fijaciones", precio: 450000, min: 12, inicial: 85 },
    // [Línea 144] Ejecuta o evalúa: { codigo: "BU-004", descripcion: "Disco de corte metal 115 x 1,0 mm", cat: "Bulo
    { codigo: "BU-004", descripcion: "Disco de corte metal 115 x 1,0 mm", cat: "Bulonería y fijaciones", precio: 260000, min: 25, inicial: 130 },
    // [Línea 145] Ejecuta o evalúa: { codigo: "BU-005", descripcion: "Adhesivo epoxi bicomponente 10 min", cat: "Bul
    { codigo: "BU-005", descripcion: "Adhesivo epoxi bicomponente 10 min", cat: "Bulonería y fijaciones", precio: 810000, min: 8, inicial: 50 },
    // [Línea 146] Ejecuta o evalúa: { codigo: "SE-001", descripcion: "Guantes moteados algodón par", cat: "Seguridad
    { codigo: "SE-001", descripcion: "Guantes moteados algodón par", cat: "Seguridad industrial", precio: 240000, min: 20, inicial: 110 },
    // [Línea 147] Ejecuta o evalúa: { codigo: "SE-002", descripcion: "Antiparras policarbonato transparentes", cat: 
    { codigo: "SE-002", descripcion: "Antiparras policarbonato transparentes", cat: "Seguridad industrial", precio: 560000, min: 10, inicial: 6 }, // bajo mínimo
    // [Línea 148] Ejecuta o evalúa: { codigo: "SE-003", descripcion: "Protector auditivo endoaural con cordón", cat:
    { codigo: "SE-003", descripcion: "Protector auditivo endoaural con cordón", cat: "Seguridad industrial", precio: 310000, min: 15, inicial: 70 },
  // [Línea 149] Ejecuta o evalúa: ];
  ];

  // [Línea 151] Declara 'productosCreados' y le asigna el valor resultante.
  const productosCreados = [];
  // [Línea 152] Recorre cada elemento en un bucle: for (const item of catalogoInicial) {
  for (const item of catalogoInicial) {
    // [Línea 153] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'prod'.
    const prod = await crearProducto(
      // [Línea 154] Ejecuta o evalúa: sesionAdmin,
      sesionAdmin,
      // [Línea 155] Ejecuta o evalúa: {
      {
        // [Línea 156] Define o asigna el campo/parámetro 'codigo'.
        codigo: item.codigo,
        // [Línea 157] Define o asigna el campo/parámetro 'descripcion'.
        descripcion: item.descripcion,
        // [Línea 158] Define o asigna el campo/parámetro 'categoriaId'.
        categoriaId: mapaCategorias.get(item.cat)!,
        // [Línea 159] Define o asigna el campo/parámetro 'precio'.
        precio: item.precio,
        // [Línea 160] Define o asigna el campo/parámetro 'stockMinimo'.
        stockMinimo: item.min,
        // [Línea 161] Define o asigna el campo/parámetro 'stockInicial'.
        stockInicial: item.inicial,
      // [Línea 162] Cierra el bloque o estructura (},).
      },
      // [Línea 163] Ejecuta o evalúa: { fecha: fechaHace32Dias },
      { fecha: fechaHace32Dias },
    // [Línea 164] Cierra el bloque o estructura ();).
    );
    // [Línea 165] Ejecuta o evalúa: productosCreados.push(prod);
    productosCreados.push(prod);
  // [Línea 166] Cierra el bloque o estructura (}).
  }

  // Un egreso manual por rotura y un ingreso por reposición para que el historial tenga todos los tipos.
  // [Línea 169] Espera a que se complete la operación asíncrona: await registrarMovimientoManual(
  await registrarMovimientoManual(
    // [Línea 170] Ejecuta o evalúa: sesionAdmin,
    sesionAdmin,
    // [Línea 171] Ejecuta o evalúa: productosCreados[0].id,
    productosCreados[0].id,
    // [Línea 172] Ejecuta o evalúa: { tipo: "egreso", cantidad: 2, motivo: "Rotura", observacion: "Mango astillado e
    { tipo: "egreso", cantidad: 2, motivo: "Rotura", observacion: "Mango astillado en depósito" },
    // [Línea 173] Ejecuta o evalúa: { fecha: new Date(Date.now() - 18 * 86_400_000) },
    { fecha: new Date(Date.now() - 18 * 86_400_000) },
  // [Línea 174] Cierra el bloque o estructura ();).
  );
  // [Línea 175] Espera a que se complete la operación asíncrona: await registrarMovimientoManual(
  await registrarMovimientoManual(
    // [Línea 176] Ejecuta o evalúa: sesionAdmin,
    sesionAdmin,
    // [Línea 177] Ejecuta o evalúa: productosCreados[7].id,
    productosCreados[7].id,
    // [Línea 178] Ejecuta o evalúa: { tipo: "ingreso", cantidad: 20, motivo: "Reposición", observacion: "Ingreso caj
    { tipo: "ingreso", cantidad: 20, motivo: "Reposición", observacion: "Ingreso caja proveedor" },
    // [Línea 179] Ejecuta o evalúa: { fecha: new Date(Date.now() - 12 * 86_400_000) },
    { fecha: new Date(Date.now() - 12 * 86_400_000) },
  // [Línea 180] Cierra el bloque o estructura ();).
  );

  // 4. Clientes (10 clientes: 7 con cuenta corriente habilitada y 3 solo contado/tarjeta).
  // [Línea 183] Ejecuta o evalúa: console.log("Creando 10 clientes...");
  console.log("Creando 10 clientes...");
  // [Línea 184] Declara 'listaClientes' y le asigna el valor resultante.
  const listaClientes = [
    // [Línea 185] Ejecuta o evalúa: { tipoDoc: "DNI" as const, nroDoc: "28.456.123", nombre: "Mariana López", domici
    { tipoDoc: "DNI" as const, nroDoc: "28.456.123", nombre: "Mariana López", domicilio: "Las Heras 455", telefono: "381 455-2210", email: "mariana.lopez@correo.test", cuentaCorriente: true, limiteCredito: 40000000 },
    // [Línea 186] Ejecuta o evalúa: { tipoDoc: "CUIT" as const, nroDoc: "30-71428910-9", nombre: "Constructora del N
    { tipoDoc: "CUIT" as const, nroDoc: "30-71428910-9", nombre: "Constructora del Norte SRL", domicilio: "Av. Mate de Luna 2140", telefono: "381 422-8900", email: "compras@delnorte.test", cuentaCorriente: true, limiteCredito: 95000000 },
    // [Línea 187] Ejecuta o evalúa: { tipoDoc: "DNI" as const, nroDoc: "32.190.844", nombre: "Ricardo Gómez", domici
    { tipoDoc: "DNI" as const, nroDoc: "32.190.844", nombre: "Ricardo Gómez", domicilio: "San Lorenzo 812", telefono: "381 512-3341", email: "rgomez@correo.test", cuentaCorriente: true, limiteCredito: 25000000 },
    // [Línea 188] Ejecuta o evalúa: { tipoDoc: "CUIT" as const, nroDoc: "20-25811430-4", nombre: "Jorge Villalba Ins
    { tipoDoc: "CUIT" as const, nroDoc: "20-25811430-4", nombre: "Jorge Villalba Instalaciones", domicilio: "Mendoza 1120", telefono: "381 498-7712", email: "jvillalba@correo.test", cuentaCorriente: true, limiteCredito: 35000000 },
    // [Línea 189] Ejecuta o evalúa: { tipoDoc: "DNI" as const, nroDoc: "35.678.901", nombre: "Lucía Fernández", domi
    { tipoDoc: "DNI" as const, nroDoc: "35.678.901", nombre: "Lucía Fernández", domicilio: "25 de Mayo 640", telefono: "381 601-4490", email: "lucia.f@correo.test", cuentaCorriente: true, limiteCredito: 20000000 },
    // [Línea 190] Ejecuta o evalúa: { tipoDoc: "CUIT" as const, nroDoc: "30-68912045-2", nombre: "Mantenimiento Inte
    { tipoDoc: "CUIT" as const, nroDoc: "30-68912045-2", nombre: "Mantenimiento Integral SA", domicilio: "Av. Roca 950", telefono: "381 431-5500", email: "admin@mantenimiento.test", cuentaCorriente: true, limiteCredito: null },
    // [Línea 191] Ejecuta o evalúa: { tipoDoc: "DNI" as const, nroDoc: "29.334.556", nombre: "Esteban Pereyra", domi
    { tipoDoc: "DNI" as const, nroDoc: "29.334.556", nombre: "Esteban Pereyra", domicilio: "Crisóstomo Álvarez 310", telefono: "381 544-9821", email: "epereyra@correo.test", cuentaCorriente: true, limiteCredito: 18000000 },
    // [Línea 192] Ejecuta o evalúa: { tipoDoc: "DNI" as const, nroDoc: "40.112.789", nombre: "Camila Soraire", domic
    { tipoDoc: "DNI" as const, nroDoc: "40.112.789", nombre: "Camila Soraire", domicilio: "Laprida 720", telefono: "381 677-1203", email: "csoraire@correo.test", cuentaCorriente: false, limiteCredito: null },
    // [Línea 193] Ejecuta o evalúa: { tipoDoc: "DNI" as const, nroDoc: "24.889.102", nombre: "Héctor Molina", domici
    { tipoDoc: "DNI" as const, nroDoc: "24.889.102", nombre: "Héctor Molina", domicilio: "Santiago del Estero 1450", telefono: "381 410-6632", email: "hmolina@correo.test", cuentaCorriente: false, limiteCredito: null },
    // [Línea 194] Ejecuta o evalúa: { tipoDoc: "CUIT" as const, nroDoc: "27-31450988-6", nombre: "Valeria Quiroga", 
    { tipoDoc: "CUIT" as const, nroDoc: "27-31450988-6", nombre: "Valeria Quiroga", domicilio: "Maipú 530", telefono: "381 589-0045", email: "vquiroga@correo.test", cuentaCorriente: false, limiteCredito: null },
  // [Línea 195] Ejecuta o evalúa: ];
  ];

  // [Línea 197] Declara 'clientesCreados' y le asigna el valor resultante.
  const clientesCreados = [];
  // [Línea 198] Recorre cada elemento en un bucle: for (const datosCli of listaClientes) {
  for (const datosCli of listaClientes) {
    // [Línea 199] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'cli'.
    const cli = await crearCliente(sesionAdmin, datosCli);
    // [Línea 200] Ejecuta o evalúa: clientesCreados.push(cli);
    clientesCreados.push(cli);
  // [Línea 201] Cierra el bloque o estructura (}).
  }

  // 5. Facturas: 54 ventas repartidas en los últimos 30 días + 1 anulada y pagos en cuenta corriente.
  // [Línea 204] Ejecuta o evalúa: console.log("Emitiendo 54 facturas en los últimos 30 días...");
  console.log("Emitiendo 54 facturas en los últimos 30 días...");
  // [Línea 205] Declara 'vendedores' y le asigna el valor resultante.
  const vendedores = [sesionAdmin, sesionPablo, sesionSofia];
  // [Línea 206] Declara 'indicesProductosRotacion' y le asigna el valor resultante.
  const indicesProductosRotacion = [0, 1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29];

  // [Línea 208] Declara 'ahora' y le asigna el valor resultante.
  const ahora = Date.now();
  // [Línea 209] Recorre cada elemento en un bucle: for (let i = 0; i < 50; i++) {
  for (let i = 0; i < 50; i++) {
    // Repartimos desde hace 29 días hasta hoy (las últimas 3 caen en hoy).
    // [Línea 211] Declara 'diasAtras' y le asigna el valor resultante.
    const diasAtras = i >= 47 ? 0 : 29 - Math.floor((i * 29) / 47);
    // [Línea 212] Declara 'fechaVenta' y le asigna el valor resultante.
    const fechaVenta = new Date(ahora - diasAtras * 86_400_000 - ((i % 5) + 1) * 3_600_000);
    // [Línea 213] Declara 'vendedor' y le asigna el valor resultante.
    const vendedor = vendedores[i % vendedores.length];

    // [Línea 215] Declara 'prod1' y le asigna el valor resultante.
    const prod1 = productosCreados[indicesProductosRotacion[i % indicesProductosRotacion.length]];
    // [Línea 216] Declara 'prod2' y le asigna el valor resultante.
    const prod2 =
      // [Línea 217] Ejecuta o evalúa: productosCreados[indicesProductosRotacion[(i + 5) % indicesProductosRotacion.len
      productosCreados[indicesProductosRotacion[(i + 5) % indicesProductosRotacion.length]];

    // [Línea 219] Declara 'items' y le asigna el valor resultante.
    const items =
      // [Línea 220] Ejecuta o evalúa: prod1.id === prod2.id
      prod1.id === prod2.id
        // [Línea 221] Ejecuta o evalúa: ? [{ productoId: prod1.id, cantidad: 2 }]
        ? [{ productoId: prod1.id, cantidad: 2 }]
        // [Línea 222] Ejecuta o evalúa: : [
        : [
            // [Línea 223] Ejecuta o evalúa: { productoId: prod1.id, cantidad: (i % 2) + 1 },
            { productoId: prod1.id, cantidad: (i % 2) + 1 },
            // [Línea 224] Ejecuta o evalúa: { productoId: prod2.id, cantidad: 1 },
            { productoId: prod2.id, cantidad: 1 },
          // [Línea 225] Ejecuta o evalúa: ];
          ];

    // [Línea 227] Declara 'esTarjeta' y le asigna el valor resultante.
    const esTarjeta = i % 3 === 1;
    // [Línea 228] Declara 'clienteOpcional' y le asigna el valor resultante.
    const clienteOpcional = i % 2 === 0 ? null : clientesCreados[i % clientesCreados.length].id;

    // [Línea 230] Espera a que se complete la operación asíncrona: await emitirFactura(
    await emitirFactura(
      // [Línea 231] Ejecuta o evalúa: vendedor,
      vendedor,
      // [Línea 232] Ejecuta o evalúa: {
      {
        // [Línea 233] Define o asigna el campo/parámetro 'clienteId'.
        clienteId: clienteOpcional,
        // [Línea 234] Ejecuta o evalúa: items,
        items,
        // [Línea 235] Define o asigna el campo/parámetro 'pago'.
        pago: esTarjeta
          // [Línea 236] Ejecuta o evalúa: ? {
          ? {
              // [Línea 237] Define o asigna el campo/parámetro 'forma'.
              forma: "tarjeta",
              // [Línea 238] Define o asigna el campo/parámetro 'tarjeta'.
              tarjeta: {
                // [Línea 239] Define o asigna el campo/parámetro 'tipo'.
                tipo: i % 2 === 0 ? "debito" : "credito",
                // [Línea 240] Define o asigna el campo/parámetro 'marca'.
                marca: i % 4 === 0 ? "Mastercard" : "Visa",
                // [Línea 241] Define o asigna el campo/parámetro 'ultimos4'.
                ultimos4: String(1000 + ((i * 137) % 9000)),
              // [Línea 242] Cierra el bloque o estructura (},).
              },
            // [Línea 243] Cierra el bloque o estructura (}).
            }
          // [Línea 244] Ejecuta o evalúa: : { forma: "contado" },
          : { forma: "contado" },
      // [Línea 245] Cierra el bloque o estructura (},).
      },
      // [Línea 246] Ejecuta o evalúa: { fecha: fechaVenta },
      { fecha: fechaVenta },
    // [Línea 247] Cierra el bloque o estructura ();).
    );
  // [Línea 248] Cierra el bloque o estructura (}).
  }

  // 4 ventas en cuenta corriente y pagos parciales para dejar 3 clientes con saldo pendiente.
  // [Línea 251] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'fCuenta1'.
  const fCuenta1 = await emitirFactura(
    // [Línea 252] Ejecuta o evalúa: sesionPablo,
    sesionPablo,
    // [Línea 253] Ejecuta o evalúa: {
    {
      // [Línea 254] Define o asigna el campo/parámetro 'clienteId'.
      clienteId: clientesCreados[0].id, // Mariana López
      // [Línea 255] Define o asigna el campo/parámetro 'items'.
      items: [
        // [Línea 256] Ejecuta o evalúa: { productoId: productosCreados[0].id, cantidad: 1 },
        { productoId: productosCreados[0].id, cantidad: 1 },
        // [Línea 257] Ejecuta o evalúa: { productoId: productosCreados[6].id, cantidad: 2 },
        { productoId: productosCreados[6].id, cantidad: 2 },
      // [Línea 258] Ejecuta o evalúa: ],
      ],
      // [Línea 259] Define o asigna el campo/parámetro 'pago'.
      pago: { forma: "cuenta_corriente" },
    // [Línea 260] Cierra el bloque o estructura (},).
    },
    // [Línea 261] Ejecuta o evalúa: { fecha: new Date(ahora - 6 * 86_400_000) },
    { fecha: new Date(ahora - 6 * 86_400_000) },
  // [Línea 262] Cierra el bloque o estructura ();).
  );

  // [Línea 264] Espera a que se complete la operación asíncrona: await registrarPago(
  await registrarPago(
    // [Línea 265] Ejecuta o evalúa: sesionPablo,
    sesionPablo,
    // [Línea 266] Ejecuta o evalúa: clientesCreados[0].id,
    clientesCreados[0].id,
    // [Línea 267] Ejecuta o evalúa: { importe: 500000, medio: "transferencia", observacion: "Pago parcial por transf
    { importe: 500000, medio: "transferencia", observacion: "Pago parcial por transferencia" },
    // [Línea 268] Ejecuta o evalúa: { fecha: new Date(ahora - 4 * 86_400_000) },
    { fecha: new Date(ahora - 4 * 86_400_000) },
  // [Línea 269] Cierra el bloque o estructura ();).
  );

  // [Línea 271] Espera a que se complete la operación asíncrona: await emitirFactura(
  await emitirFactura(
    // [Línea 272] Ejecuta o evalúa: sesionAdmin,
    sesionAdmin,
    // [Línea 273] Ejecuta o evalúa: {
    {
      // [Línea 274] Define o asigna el campo/parámetro 'clienteId'.
      clienteId: clientesCreados[1].id, // Constructora del Norte SRL
      // [Línea 275] Define o asigna el campo/parámetro 'items'.
      items: [
        // [Línea 276] Ejecuta o evalúa: { productoId: productosCreados[9].id, cantidad: 1 },
        { productoId: productosCreados[9].id, cantidad: 1 },
        // [Línea 277] Ejecuta o evalúa: { productoId: productosCreados[17].id, cantidad: 1 },
        { productoId: productosCreados[17].id, cantidad: 1 },
      // [Línea 278] Ejecuta o evalúa: ],
      ],
      // [Línea 279] Define o asigna el campo/parámetro 'pago'.
      pago: { forma: "cuenta_corriente" },
    // [Línea 280] Cierra el bloque o estructura (},).
    },
    // [Línea 281] Ejecuta o evalúa: { fecha: new Date(ahora - 5 * 86_400_000) },
    { fecha: new Date(ahora - 5 * 86_400_000) },
  // [Línea 282] Cierra el bloque o estructura ();).
  );

  // [Línea 284] Espera a que se complete la operación asíncrona: await emitirFactura(
  await emitirFactura(
    // [Línea 285] Ejecuta o evalúa: sesionSofia,
    sesionSofia,
    // [Línea 286] Ejecuta o evalúa: {
    {
      // [Línea 287] Define o asigna el campo/parámetro 'clienteId'.
      clienteId: clientesCreados[2].id, // Ricardo Gómez
      // [Línea 288] Define o asigna el campo/parámetro 'items'.
      items: [{ productoId: productosCreados[3].id, cantidad: 1 }],
      // [Línea 289] Define o asigna el campo/parámetro 'pago'.
      pago: { forma: "cuenta_corriente" },
    // [Línea 290] Cierra el bloque o estructura (},).
    },
    // [Línea 291] Ejecuta o evalúa: { fecha: new Date(ahora - 2 * 86_400_000) },
    { fecha: new Date(ahora - 2 * 86_400_000) },
  // [Línea 292] Cierra el bloque o estructura ();).
  );

  // Una factura emitida y luego anulada por el administrador para mostrar el estado Anulada.
  // [Línea 295] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'facturaParaAnular'.
  const facturaParaAnular = await emitirFactura(
    // [Línea 296] Ejecuta o evalúa: sesionPablo,
    sesionPablo,
    // [Línea 297] Ejecuta o evalúa: {
    {
      // [Línea 298] Define o asigna el campo/parámetro 'clienteId'.
      clienteId: clientesCreados[3].id,
      // [Línea 299] Define o asigna el campo/parámetro 'items'.
      items: [{ productoId: productosCreados[2].id, cantidad: 2 }],
      // [Línea 300] Define o asigna el campo/parámetro 'pago'.
      pago: { forma: "cuenta_corriente" },
    // [Línea 301] Cierra el bloque o estructura (},).
    },
    // [Línea 302] Ejecuta o evalúa: { fecha: new Date(ahora - 3 * 86_400_000) },
    { fecha: new Date(ahora - 3 * 86_400_000) },
  // [Línea 303] Cierra el bloque o estructura ();).
  );

  // [Línea 305] Espera a que se complete la operación asíncrona: await anularFactura(
  await anularFactura(
    // [Línea 306] Ejecuta o evalúa: sesionAdmin,
    sesionAdmin,
    // [Línea 307] Ejecuta o evalúa: facturaParaAnular.id,
    facturaParaAnular.id,
    // [Línea 308] Ejecuta o evalúa: { motivo: "Error en la carga de cantidades solicitadas por el cliente" },
    { motivo: "Error en la carga de cantidades solicitadas por el cliente" },
    // [Línea 309] Ejecuta o evalúa: { fecha: new Date(ahora - 3 * 86_400_000 + 1800_000) },
    { fecha: new Date(ahora - 3 * 86_400_000 + 1800_000) },
  // [Línea 310] Cierra el bloque o estructura ();).
  );

  // [Línea 312] Ejecuta o evalúa: console.log("Datos iniciales cargados con éxito:");
  console.log("Datos iniciales cargados con éxito:");
  // [Línea 313] Ejecuta o evalúa: console.log(" - Admin:    laura@ferreteria.test / admin1234");
  console.log(" - Admin:    laura@ferreteria.test / admin1234");
  // [Línea 314] Ejecuta o evalúa: console.log(" - Vendedor: pablo@ferreteria.test / vendedor1234");
  console.log(" - Vendedor: pablo@ferreteria.test / vendedor1234");
  // [Línea 315] Ejecuta o evalúa: console.log(` - Última factura de Mariana: ${fCuenta1.numeroFormateado}`);
  console.log(` - Última factura de Mariana: ${fCuenta1.numeroFormateado}`);
// [Línea 316] Cierra el bloque o estructura (}).
}

// [Línea 318] Ejecuta o evalúa: sembrarBaseDatos().catch((err) => {
sembrarBaseDatos().catch((err) => {
  // [Línea 319] Ejecuta o evalúa: console.error("Error al sembrar la base de datos:", err);
  console.error("Error al sembrar la base de datos:", err);
  // [Línea 320] Ejecuta o evalúa: process.exit(1);
  process.exit(1);
// [Línea 321] Cierra el bloque o estructura (});).
});
