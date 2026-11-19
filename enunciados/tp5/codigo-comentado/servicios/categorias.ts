// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Servicio de CATEGORÍAS. RF-P7.
// [Línea 2] Importa elementos desde 'drizzle-orm'.
import { and, asc, eq, ne, sql } from "drizzle-orm";
// [Línea 3] Importa elementos desde '@/basedatos/conexion'.
import { db } from "@/basedatos/conexion";
// [Línea 4] Importa elementos desde '@/basedatos/esquema'.
import { categorias, productos } from "@/basedatos/esquema";
// [Línea 5] Importa elementos desde '@/esquemas/productos'.
import { esquemaCategoriaEdicion, esquemaCategoriaNueva } from "@/esquemas/productos";
// [Línea 6] Importa elementos desde './errores'.
import { ApiError, noEncontrado } from "./errores";
// [Línea 7] Importa elementos desde './comunes'.
import { exigirAdmin, validar, type UsuarioSesion } from "./comunes";

// Cantidad de productos activos de cada categoría (subconsulta).
// [Línea 10] Declara 'cantidadProductosActivos' y le asigna el valor resultante.
const cantidadProductosActivos = sql<number>`(
  // [Línea 11] Ejecuta o evalúa: select count(*) from ${productos}
  select count(*) from ${productos}
  // [Línea 12] Ejecuta o evalúa: where ${productos.categoriaId} = ${categorias.id} and ${productos.activo} = 1
  where ${productos.categoriaId} = ${categorias.id} and ${productos.activo} = 1
// [Línea 13] Ejecuta o evalúa: )`;
)`;

// RF-P7: lista de categorías activas, sin paginar.
// Con "todas" el administrador ve también las inactivas (pantalla de Categorías).
// [Línea 17] Declara la función asíncrona 'listarCategorias'.
export async function listarCategorias(usuario: UsuarioSesion, parametros: { todas?: string } = {}) {
  // [Línea 18] Declara 'verTodas' y le asigna el valor resultante.
  const verTodas = parametros.todas === "true" && usuario.rol === "admin";
  // [Línea 19] Devuelve el valor: db
  return db
    // [Línea 20] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
    .select({
      // [Línea 21] Define o asigna el campo/parámetro 'id'.
      id: categorias.id,
      // [Línea 22] Define o asigna el campo/parámetro 'nombre'.
      nombre: categorias.nombre,
      // [Línea 23] Define o asigna el campo/parámetro 'activa'.
      activa: categorias.activa,
      // [Línea 24] Define o asigna el campo/parámetro 'cantidadProductos'.
      cantidadProductos: cantidadProductosActivos,
    // [Línea 25] Cierra el bloque o estructura (})).
    })
    // [Línea 26] Define la tabla origen de la consulta SQL: .from(categorias)
    .from(categorias)
    // [Línea 27] Aplica el filtro WHERE a la consulta SQL: .where(verTodas ? undefined : eq(categorias.activa, true))
    .where(verTodas ? undefined : eq(categorias.activa, true))
    // [Línea 28] Ordena las filas del resultado SQL: .orderBy(asc(categorias.nombre));
    .orderBy(asc(categorias.nombre));
// [Línea 29] Cierra el bloque o estructura (}).
}

// RF-P7: alta. El nombre es único.
// [Línea 32] Declara la función asíncrona 'crearCategoria'.
export async function crearCategoria(usuario: UsuarioSesion, datosSinValidar: unknown) {
  // [Línea 33] Verifica en el servidor que el usuario sea 'admin'; si es 'vendedor' lanza 403 SIN_PERMISO.
  exigirAdmin(usuario);
  // [Línea 34] Declara 'datos' y le asigna el valor resultante.
  const datos = validar(esquemaCategoriaNueva, datosSinValidar);
  // [Línea 35] Espera a que se complete la operación asíncrona: await verificarNombreLibre(datos.nombre);
  await verificarNombreLibre(datos.nombre);
  // [Línea 36] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[categoriaCreada]'.
  const [categoriaCreada] = await db.insert(categorias).values({ nombre: datos.nombre }).returning();
  // [Línea 37] Devuelve el valor: categoriaCreada;
  return categoriaCreada;
// [Línea 38] Cierra el bloque o estructura (}).
}

// RF-P7: edición y baja. No se puede desactivar si tiene productos activos.
// [Línea 41] Declara la función asíncrona 'editarCategoria'.
export async function editarCategoria(usuario: UsuarioSesion, idCategoria: number, datosSinValidar: unknown) {
  // [Línea 42] Verifica en el servidor que el usuario sea 'admin'; si es 'vendedor' lanza 403 SIN_PERMISO.
  exigirAdmin(usuario);
  // [Línea 43] Declara 'datos' y le asigna el valor resultante.
  const datos = validar(esquemaCategoriaEdicion, datosSinValidar);

  // [Línea 45] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'categoriaExistente'.
  const categoriaExistente = await db.select().from(categorias).where(eq(categorias.id, idCategoria)).get();
  // [Línea 46] Verifica la condición: if (!categoriaExistente) throw noEncontrado("La categoría");
  if (!categoriaExistente) throw noEncontrado("La categoría");

  // [Línea 48] Verifica la condición: if (datos.nombre) await verificarNombreLibre(datos.nombre, idCategoria);
  if (datos.nombre) await verificarNombreLibre(datos.nombre, idCategoria);

  // [Línea 50] Verifica la condición: if (datos.activa === false) {
  if (datos.activa === false) {
    // [Línea 51] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'productoActivo'.
    const productoActivo = await db
      // [Línea 52] Selecciona las columnas o expresiones SQL que se van a consultar con Drizzle.
      .select({ id: productos.id })
      // [Línea 53] Define la tabla origen de la consulta SQL: .from(productos)
      .from(productos)
      // [Línea 54] Aplica el filtro WHERE a la consulta SQL: .where(and(eq(productos.categoriaId, idCategoria), eq(productos.activo, true)))
      .where(and(eq(productos.categoriaId, idCategoria), eq(productos.activo, true)))
      // [Línea 55] Ejecuta la consulta y obtiene una sola fila (o undefined si no hay coincidencias).
      .get();
    // [Línea 56] Verifica la condición: if (productoActivo) {
    if (productoActivo) {
      // [Línea 57] Corta la ejecución y lanza el error: throw new ApiError(409, "CATEGORIA_EN_USO", "La categoría tiene productos activos y no se puede desactivar.");
      throw new ApiError(409, "CATEGORIA_EN_USO", "La categoría tiene productos activos y no se puede desactivar.");
    // [Línea 58] Cierra el bloque o estructura (}).
    }
  // [Línea 59] Cierra el bloque o estructura (}).
  }

  // [Línea 61] Espera el resultado de la consulta/operación asíncrona y lo asigna a '[categoriaEditada]'.
  const [categoriaEditada] = await db
    // [Línea 62] Actualiza las columnas de la tabla que cumplan la condición WHERE.
    .update(categorias)
    // [Línea 63] Define las columnas y valores nuevos para el UPDATE.
    .set(datos)
    // [Línea 64] Aplica el filtro WHERE a la consulta SQL: .where(eq(categorias.id, idCategoria))
    .where(eq(categorias.id, idCategoria))
    // [Línea 65] Solicita que SQLite devuelva los datos de la fila recién insertada o actualizada.
    .returning();
  // [Línea 66] Devuelve el valor: categoriaEditada;
  return categoriaEditada;
// [Línea 67] Cierra el bloque o estructura (}).
}

// Lanza 409 NOMBRE_DUPLICADO si otra categoría ya usa ese nombre.
// [Línea 70] Declara la función asíncrona 'verificarNombreLibre'.
async function verificarNombreLibre(nombre: string, idQueSeEdita?: number) {
  // [Línea 71] Declara 'condicion' y le asigna el valor resultante.
  const condicion = idQueSeEdita
    // [Línea 72] Ejecuta o evalúa: ? and(sql`lower(${categorias.nombre}) = lower(${nombre})`, ne(categorias.id, idQ
    ? and(sql`lower(${categorias.nombre}) = lower(${nombre})`, ne(categorias.id, idQueSeEdita))
    // [Línea 73] Ejecuta o evalúa: : sql`lower(${categorias.nombre}) = lower(${nombre})`;
    : sql`lower(${categorias.nombre}) = lower(${nombre})`;
  // [Línea 74] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'otraCategoria'.
  const otraCategoria = await db.select({ id: categorias.id }).from(categorias).where(condicion).get();
  // [Línea 75] Verifica la condición: if (otraCategoria) {
  if (otraCategoria) {
    // [Línea 76] Corta la ejecución y lanza el error: throw new ApiError(409, "NOMBRE_DUPLICADO", "Ya existe una categoría con ese nombre.", [
    throw new ApiError(409, "NOMBRE_DUPLICADO", "Ya existe una categoría con ese nombre.", [
      // [Línea 77] Ejecuta o evalúa: { campo: "nombre", mensaje: "Ya existe una categoría con ese nombre." },
      { campo: "nombre", mensaje: "Ya existe una categoría con ese nombre." },
    // [Línea 78] Cierra el bloque o estructura (]);).
    ]);
  // [Línea 79] Cierra el bloque o estructura (}).
  }
// [Línea 80] Cierra el bloque o estructura (}).
}
