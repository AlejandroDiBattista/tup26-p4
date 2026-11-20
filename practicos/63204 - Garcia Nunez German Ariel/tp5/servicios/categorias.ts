// Servicio de CATEGORÍAS. RF-P7.
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/basedatos/conexion";
import { categorias, productos } from "@/basedatos/esquema";
import { esquemaCategoriaEdicion, esquemaCategoriaNueva } from "@/esquemas/productos";
import { ApiError, noEncontrado } from "./errores";
import { exigirAdmin, validar, type UsuarioSesion } from "./comunes";

// Cantidad de productos activos de cada categoría (subconsulta).
const cantidadProductosActivos = sql<number>`(
  select count(*) from ${productos}
  where ${productos.categoriaId} = ${categorias.id} and ${productos.activo} = 1
)`;

// RF-P7: lista de categorías activas, sin paginar.
// Con "todas" el administrador ve también las inactivas (pantalla de Categorías).
export async function listarCategorias(usuario: UsuarioSesion, parametros: { todas?: string } = {}) {
  const verTodas = parametros.todas === "true" && usuario.rol === "admin";
  return db
    .select({
      id: categorias.id,
      nombre: categorias.nombre,
      activa: categorias.activa,
      cantidadProductos: cantidadProductosActivos,
    })
    .from(categorias)
    .where(verTodas ? undefined : eq(categorias.activa, true))
    .orderBy(asc(categorias.nombre));
}

// RF-P7: alta. El nombre es único.
export async function crearCategoria(usuario: UsuarioSesion, datosSinValidar: unknown) {
  exigirAdmin(usuario);
  const datos = validar(esquemaCategoriaNueva, datosSinValidar);
  await verificarNombreLibre(datos.nombre);
  const [categoriaCreada] = await db.insert(categorias).values({ nombre: datos.nombre }).returning();
  return categoriaCreada;
}

// RF-P7: edición y baja. No se puede desactivar si tiene productos activos.
export async function editarCategoria(usuario: UsuarioSesion, idCategoria: number, datosSinValidar: unknown) {
  exigirAdmin(usuario);
  const datos = validar(esquemaCategoriaEdicion, datosSinValidar);

  const categoriaExistente = await db.select().from(categorias).where(eq(categorias.id, idCategoria)).get();
  if (!categoriaExistente) throw noEncontrado("La categoría");

  if (datos.nombre) await verificarNombreLibre(datos.nombre, idCategoria);

  if (datos.activa === false) {
    const productoActivo = await db
      .select({ id: productos.id })
      .from(productos)
      .where(and(eq(productos.categoriaId, idCategoria), eq(productos.activo, true)))
      .get();
    if (productoActivo) {
      throw new ApiError(409, "CATEGORIA_EN_USO", "La categoría tiene productos activos y no se puede desactivar.");
    }
  }

  const [categoriaEditada] = await db
    .update(categorias)
    .set(datos)
    .where(eq(categorias.id, idCategoria))
    .returning();
  return categoriaEditada;
}

// Lanza 409 NOMBRE_DUPLICADO si otra categoría ya usa ese nombre.
async function verificarNombreLibre(nombre: string, idQueSeEdita?: number) {
  const condicion = idQueSeEdita
    ? and(sql`lower(${categorias.nombre}) = lower(${nombre})`, ne(categorias.id, idQueSeEdita))
    : sql`lower(${categorias.nombre}) = lower(${nombre})`;
  const otraCategoria = await db.select({ id: categorias.id }).from(categorias).where(condicion).get();
  if (otraCategoria) {
    throw new ApiError(409, "NOMBRE_DUPLICADO", "Ya existe una categoría con ese nombre.", [
      { campo: "nombre", mensaje: "Ya existe una categoría con ese nombre." },
    ]);
  }
}
