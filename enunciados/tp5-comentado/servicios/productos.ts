// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Servicio de PRODUCTOS. RF-P1, RF-P2, RF-P3.
// [Línea 2] Importa elementos desde 'drizzle-orm'.
import { and, asc, count, eq, like, lt, ne, or } from "drizzle-orm";
// [Línea 3] Importa elementos desde '@/basedatos/conexion'.
import { db } from "@/basedatos/conexion";
// [Línea 4] Importa elementos desde '@/basedatos/esquema'.
import { categorias, productos } from "@/basedatos/esquema";
// [Línea 5] Importa elementos desde '@/esquemas/productos'.
import { esquemaProductoEdicion, esquemaProductoNuevo } from "@/esquemas/productos";
// [Línea 6] Importa elementos desde './errores'.
import { ApiError, noEncontrado } from "./errores";
// [Línea 7] Importa elementos desde './comunes'.
import { exigirAdmin, leerPaginacion, respuestaPaginada, validar, type UsuarioSesion } from "./comunes";
// [Línea 8] Importa elementos desde './stock'.
import { moverStock } from "./stock";

// [Línea 10] Define el tipo de datos 'FiltrosProductos' en TypeScript.
type FiltrosProductos = {
  // [Línea 11] Ejecuta o evalúa: q?: string;
  q?: string;
  // [Línea 12] Ejecuta o evalúa: categoriaId?: string;
  categoriaId?: string;
  // [Línea 13] Ejecuta o evalúa: bajoMinimo?: string;
  bajoMinimo?: string;
  // [Línea 14] Ejecuta o evalúa: activo?: string; // "true" (por defecto), "false" o "todos" (solo admin)
  activo?: string; // "true" (por defecto), "false" o "todos" (solo admin)
  // [Línea 15] Ejecuta o evalúa: page?: string;
  page?: string;
  // [Línea 16] Ejecuta o evalúa: pageSize?: string;
  pageSize?: string;
// [Línea 17] Cierra el bloque o estructura (};).
};

// RF-P1: catálogo paginado con búsqueda por código o descripción y filtro por categoría.
// [Línea 20] Declara la función asíncrona 'listarProductos'.
export async function listarProductos(usuario: UsuarioSesion, parametros: FiltrosProductos) {
  // [Línea 21] Declara '{ pagina, tamanoPagina, salto }' y le asigna el valor resultante.
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  // [Línea 23] Declara 'condiciones' y le asigna el valor resultante.
  const condiciones = [];
  // [Línea 24] Verifica la condición: if (parametros.q) {
  if (parametros.q) {
    // [Línea 25] Declara 'textoBuscado' y le asigna el valor resultante.
    const textoBuscado = `%${parametros.q}%`;
    // [Línea 26] Ejecuta o evalúa: condiciones.push(or(like(productos.codigo, textoBuscado), like(productos.descrip
    condiciones.push(or(like(productos.codigo, textoBuscado), like(productos.descripcion, textoBuscado)));
  // [Línea 27] Cierra el bloque o estructura (}).
  }
  // [Línea 28] Verifica la condición: if (parametros.categoriaId) condiciones.push(eq(productos.categoriaId, Number(parametros.categoriaId)));
  if (parametros.categoriaId) condiciones.push(eq(productos.categoriaId, Number(parametros.categoriaId)));
  // [Línea 29] Verifica la condición: if (parametros.bajoMinimo === "true") condiciones.push(lt(productos.existencia, productos.stockMinimo));
  if (parametros.bajoMinimo === "true") condiciones.push(lt(productos.existencia, productos.stockMinimo));

  // El vendedor solo ve productos activos. El admin puede pedir "todos" o los inactivos.
  // [Línea 32] Declara 'filtroActivo' y le asigna el valor resultante.
  const filtroActivo = usuario.rol === "admin" ? (parametros.activo ?? "true") : "true";
  // [Línea 33] Verifica la condición: if (filtroActivo === "true") condiciones.push(eq(productos.activo, true));
  if (filtroActivo === "true") condiciones.push(eq(productos.activo, true));
  // [Línea 34] Verifica la condición: if (filtroActivo === "false") condiciones.push(eq(productos.activo, false));
  if (filtroActivo === "false") condiciones.push(eq(productos.activo, false));

  // [Línea 36] Declara 'filtro' y le asigna el valor resultante.
  const filtro = and(...condiciones);

  // [Línea 38] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'filas'.
  const filas = await consultaProductos()
    // [Línea 39] Aplica el filtro WHERE a la consulta SQL: .where(filtro)
    .where(filtro)
    // [Línea 40] Ordena las filas del resultado SQL: .orderBy(asc(productos.codigo))
    .orderBy(asc(productos.codigo))
    // [Línea 41] Limita la cantidad de filas por página: .limit(tamanoPagina)
    .limit(tamanoPagina)
    // [Línea 42] Desplaza el inicio de lectura según el número de página: .offset(salto);
    .offset(salto);
  // [Línea 43] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[{ total }]'.
  const [{ total }] = await db.select({ total: count() }).from(productos).where(filtro);

  // [Línea 45] Devuelve el valor: respuestaPaginada(filas.map(aProductoPublico), pagina, tamanoPagina, total);
  return respuestaPaginada(filas.map(aProductoPublico), pagina, tamanoPagina, total);
// [Línea 46] Cierra el bloque o estructura (}).
}

// RF-P1: un producto por id.
// [Línea 49] Declara la función asíncrona 'obtenerProducto'.
export async function obtenerProducto(_usuario: UsuarioSesion, idProducto: number) {
  // [Línea 50] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'fila'.
  const fila = await consultaProductos().where(eq(productos.id, idProducto)).get();
  // [Línea 51] Verifica la condición: if (!fila) throw noEncontrado("El producto");
  if (!fila) throw noEncontrado("El producto");
  // [Línea 52] Devuelve el valor: aProductoPublico(fila);
  return aProductoPublico(fila);
// [Línea 53] Cierra el bloque o estructura (}).
}

// RF-P2: alta de producto. La existencia empieza en 0;
// el stock inicial se carga como un INGRESO (así queda en los movimientos).
// [Línea 57] Declara la función asíncrona 'crearProducto'.
export async function crearProducto(
  // [Línea 58] Define o asigna el campo/parámetro 'usuario'.
  usuario: UsuarioSesion,
  // [Línea 59] Define o asigna el campo/parámetro 'datosSinValidar'.
  datosSinValidar: unknown,
  // [Línea 60] Define o asigna el campo/parámetro 'opciones'.
  opciones: { fecha?: Date } = {},
// [Línea 61] Ejecuta o evalúa: ) {
) {
  // [Línea 62] Verifica en el servidor que el usuario sea 'admin'; si es 'vendedor' lanza 403 SIN_PERMISO.
  exigirAdmin(usuario);
  // [Línea 63] Declara 'datos' y le asigna el valor resultante.
  const datos = validar(esquemaProductoNuevo, datosSinValidar);
  // [Línea 64] Espera a que se complete la operación asíncrona: await verificarCodigoLibre(datos.codigo);
  await verificarCodigoLibre(datos.codigo);
  // [Línea 65] Espera a que se complete la operación asíncrona: await verificarCategoriaActiva(datos.categoriaId);
  await verificarCategoriaActiva(datos.categoriaId);

  // Producto y movimiento de stock inicial en una sola transacción.
  // [Línea 68] Ejecuta una transacción atómica en la base de datos (todo o nada) y guarda el resultado en 'idProductoCreado'.
  const idProductoCreado = await db.transaction(async (tx) => {
    // [Línea 69] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[productoCreado]'.
    const [productoCreado] = await tx
      // [Línea 70] Inserta una nueva fila en la tabla indicada de la base de datos.
      .insert(productos)
      // [Línea 71] Define los valores de las columnas a insertar.
      .values({
        // [Línea 72] Define o asigna el campo/parámetro 'codigo'.
        codigo: datos.codigo.toUpperCase(),
        // [Línea 73] Define o asigna el campo/parámetro 'descripcion'.
        descripcion: datos.descripcion,
        // [Línea 74] Define o asigna el campo/parámetro 'categoriaId'.
        categoriaId: datos.categoriaId,
        // [Línea 75] Define o asigna el campo/parámetro 'precio'.
        precio: datos.precio,
        // [Línea 76] Define o asigna el campo/parámetro 'stockMinimo'.
        stockMinimo: datos.stockMinimo,
        // [Línea 77] Define o asigna el campo/parámetro 'existencia'.
        existencia: 0,
      // [Línea 78] Cierra el bloque o estructura (})).
      })
      // [Línea 79] Solicita que SQLite devuelva los datos de la fila recién insertada o actualizada.
      .returning();

    // [Línea 81] Verifica la condición: if (datos.stockInicial && datos.stockInicial > 0) {
    if (datos.stockInicial && datos.stockInicial > 0) {
      // [Línea 82] Espera a que se complete la operación asíncrona: await moverStock(tx, {
      await moverStock(tx, {
        // [Línea 83] Define o asigna el campo/parámetro 'productoId'.
        productoId: productoCreado.id,
        // [Línea 84] Define o asigna el campo/parámetro 'cantidad'.
        cantidad: datos.stockInicial,
        // [Línea 85] Define o asigna el campo/parámetro 'tipo'.
        tipo: "ingreso",
        // [Línea 86] Define o asigna el campo/parámetro 'motivo'.
        motivo: "Stock inicial",
        // [Línea 87] Define o asigna el campo/parámetro 'usuarioId'.
        usuarioId: usuario.id,
        // [Línea 88] Define o asigna el campo/parámetro 'fecha'.
        fecha: opciones.fecha,
      // [Línea 89] Cierra el bloque o estructura (});).
      });
    // [Línea 90] Cierra el bloque o estructura (}).
    }
    // [Línea 91] Devuelve el valor: productoCreado.id;
    return productoCreado.id;
  // [Línea 92] Cierra el bloque o estructura (});).
  });

  // [Línea 94] Devuelve el valor: obtenerProducto(usuario, idProductoCreado);
  return obtenerProducto(usuario, idProductoCreado);
// [Línea 95] Cierra el bloque o estructura (}).
}

// RF-P2 y RF-P3: edición y baja lógica ("activo": false).
// "existencia" no está en el esquema de edición: si llega, se responde 422.
// [Línea 99] Declara la función asíncrona 'editarProducto'.
export async function editarProducto(usuario: UsuarioSesion, idProducto: number, datosSinValidar: unknown) {
  // [Línea 100] Verifica en el servidor que el usuario sea 'admin'; si es 'vendedor' lanza 403 SIN_PERMISO.
  exigirAdmin(usuario);
  // [Línea 101] Declara 'datos' y le asigna el valor resultante.
  const datos = validar(esquemaProductoEdicion, datosSinValidar);

  // [Línea 103] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'productoExistente'.
  const productoExistente = await db.select().from(productos).where(eq(productos.id, idProducto)).get();
  // [Línea 104] Verifica la condición: if (!productoExistente) throw noEncontrado("El producto");
  if (!productoExistente) throw noEncontrado("El producto");

  // [Línea 106] Verifica la condición: if (datos.codigo) {
  if (datos.codigo) {
    // [Línea 107] Ejecuta o evalúa: datos.codigo = datos.codigo.toUpperCase();
    datos.codigo = datos.codigo.toUpperCase();
    // [Línea 108] Espera a que se complete la operación asíncrona: await verificarCodigoLibre(datos.codigo, idProducto);
    await verificarCodigoLibre(datos.codigo, idProducto);
  // [Línea 109] Cierra el bloque o estructura (}).
  }
  // [Línea 110] Verifica la condición: if (datos.categoriaId) await verificarCategoriaActiva(datos.categoriaId);
  if (datos.categoriaId) await verificarCategoriaActiva(datos.categoriaId);

  // [Línea 112] Actualiza las columnas de la tabla que cumplan la condición WHERE.
  await db.update(productos).set(datos).where(eq(productos.id, idProducto));
  // [Línea 113] Devuelve el valor: obtenerProducto(usuario, idProducto);
  return obtenerProducto(usuario, idProducto);
// [Línea 114] Cierra el bloque o estructura (}).
}

// ---------- Funciones internas ----------

// [Línea 118] Declara la función o componente 'consultaProductos'.
function consultaProductos() {
  // [Línea 119] Devuelve el valor: db
  return db
    // [Línea 120] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({ producto: productos, categoriaNombre: categorias.nombre })
    // [Línea 121] Define la tabla origen de la consulta SQL: .from(productos)
    .from(productos)
    // [Línea 122] Hace un INNER JOIN con otra tabla relacionada: .innerJoin(categorias, eq(productos.categoriaId, categorias.id));
    .innerJoin(categorias, eq(productos.categoriaId, categorias.id));
// [Línea 123] Cierra el bloque o estructura (}).
}

// [Línea 125] Define el tipo de datos 'FilaProducto' en TypeScript.
type FilaProducto = NonNullable<Awaited<ReturnType<ReturnType<typeof consultaProductos>["get"]>>>;

// Forma pública del producto (sección 11.4).
// [Línea 128] Declara la función o componente 'aProductoPublico'.
function aProductoPublico(fila: FilaProducto) {
  // [Línea 129] Declara '{ producto }' y le asigna el valor resultante.
  const { producto } = fila;
  // [Línea 130] Devuelve el valor: {
  return {
    // [Línea 131] Define o asigna el campo/parámetro 'id'.
    id: producto.id,
    // [Línea 132] Define o asigna el campo/parámetro 'codigo'.
    codigo: producto.codigo,
    // [Línea 133] Define o asigna el campo/parámetro 'descripcion'.
    descripcion: producto.descripcion,
    // [Línea 134] Define o asigna el campo/parámetro 'categoria'.
    categoria: { id: producto.categoriaId, nombre: fila.categoriaNombre },
    // [Línea 135] Define o asigna el campo/parámetro 'precio'.
    precio: producto.precio,
    // [Línea 136] Define o asigna el campo/parámetro 'existencia'.
    existencia: producto.existencia,
    // [Línea 137] Define o asigna el campo/parámetro 'stockMinimo'.
    stockMinimo: producto.stockMinimo,
    // [Línea 138] Define o asigna el campo/parámetro 'bajoMinimo'.
    bajoMinimo: producto.existencia < producto.stockMinimo,
    // [Línea 139] Define o asigna el campo/parámetro 'activo'.
    activo: producto.activo,
  // [Línea 140] Cierra el bloque o estructura (};).
  };
// [Línea 141] Cierra el bloque o estructura (}).
}

// [Línea 143] Define el tipo de datos 'ProductoPublico' en TypeScript.
export type ProductoPublico = ReturnType<typeof aProductoPublico>;

// [Línea 145] Declara la función asíncrona 'verificarCodigoLibre'.
async function verificarCodigoLibre(codigo: string, idQueSeEdita?: number) {
  // [Línea 146] Declara 'condicion' y le asigna el valor resultante.
  const condicion = idQueSeEdita
    // [Línea 147] Ejecuta o evalúa: ? and(eq(productos.codigo, codigo.toUpperCase()), ne(productos.id, idQueSeEdita)
    ? and(eq(productos.codigo, codigo.toUpperCase()), ne(productos.id, idQueSeEdita))
    // [Línea 148] Ejecuta o evalúa: : eq(productos.codigo, codigo.toUpperCase());
    : eq(productos.codigo, codigo.toUpperCase());
  // [Línea 149] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'otroProducto'.
  const otroProducto = await db.select({ id: productos.id }).from(productos).where(condicion).get();
  // [Línea 150] Verifica la condición: if (otroProducto) {
  if (otroProducto) {
    // [Línea 151] Corta la ejecución y lanza el error: throw new ApiError(409, "CODIGO_DUPLICADO", "Ya existe un producto con ese código.", [
    throw new ApiError(409, "CODIGO_DUPLICADO", "Ya existe un producto con ese código.", [
      // [Línea 152] Ejecuta o evalúa: { campo: "codigo", mensaje: "Ya existe un producto con ese código." },
      { campo: "codigo", mensaje: "Ya existe un producto con ese código." },
    // [Línea 153] Cierra el bloque o estructura (]);).
    ]);
  // [Línea 154] Cierra el bloque o estructura (}).
  }
// [Línea 155] Cierra el bloque o estructura (}).
}

// [Línea 157] Declara la función asíncrona 'verificarCategoriaActiva'.
async function verificarCategoriaActiva(idCategoria: number) {
  // [Línea 158] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'categoria'.
  const categoria = await db.select().from(categorias).where(eq(categorias.id, idCategoria)).get();
  // [Línea 159] Verifica la condición: if (!categoria || !categoria.activa) {
  if (!categoria || !categoria.activa) {
    // [Línea 160] Corta la ejecución y lanza el error: throw new ApiError(422, "VALIDACION", "Hay campos con errores.", [
    throw new ApiError(422, "VALIDACION", "Hay campos con errores.", [
      // [Línea 161] Ejecuta o evalúa: { campo: "categoriaId", mensaje: "La categoría no existe o está inactiva." },
      { campo: "categoriaId", mensaje: "La categoría no existe o está inactiva." },
    // [Línea 162] Cierra el bloque o estructura (]);).
    ]);
  // [Línea 163] Cierra el bloque o estructura (}).
  }
// [Línea 164] Cierra el bloque o estructura (}).
}
