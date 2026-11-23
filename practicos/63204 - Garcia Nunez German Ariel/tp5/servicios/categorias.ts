/* ==========================================================================
   SERVICIO DE CATEGORÍAS DE PRODUCTOS
   Cumple con el requisito funcional RF-P7 del sistema:
   
   - RF-P7: Gestión de categorías (Herramientas Manuales, Eléctricas, Pinturería, etc.).
   
   REGLAS DE NEGOCIO:
   1. El nombre de cada categoría debe ser único e irrepetible (comparado sin distinguir mayúsculas/minúsculas).
   2. REGLA DE INTEGRIDAD REFERENCIAL: No se puede desactivar (baja lógica) una categoría
      si todavía tiene productos activos vinculados a ella (error 409 CATEGORIA_EN_USO).
   3. Solo los administradores pueden crear o editar categorías (exigirAdmin).
   ========================================================================== */

/* los import traen utilidades de Drizzle ORM:
   - and: une condiciones con AND lógico
   - asc: orden alfabético ascendente (A-Z)
   - eq: igualdad (=)
   - ne: distinto (!=)
   - sql: plantilla para escribir fragmentos de código SQL nativo */
import { and, asc, eq, ne, sql } from "drizzle-orm";

/* importamos la conexión estándar 'db' a la base de datos */
import { db } from "@/basedatos/conexion";

/* importamos las tablas relacionales categorias y productos */
import { categorias, productos } from "@/basedatos/esquema";

/* importamos los esquemas Zod para validar altas y modificaciones */
import { esquemaCategoriaEdicion, esquemaCategoriaNueva } from "@/esquemas/productos";

/* importamos clases y helpers de manejo de errores HTTP */
import { ApiError, noEncontrado } from "./errores";

/* importamos helpers de verificación de administrador y tipos de sesión */
import { exigirAdmin, validar, type UsuarioSesion } from "./comunes";

/* ==========================================================================
   SUBCONSULTA SQL: cantidadProductosActivos
   ¿Para qué sirve? Calcula de forma dinámica cuántos productos activos pertenecen a cada categoría.
   ¿Cómo funciona? Cuenta las filas en la tabla 'productos' donde categoriaId coincide y activo es 1.
   ========================================================================== */
const cantidadProductosActivos = sql<number>`(
  select count(*) from ${productos}
  where ${productos.categoriaId} = "categorias"."id" and ${productos.activo} = 1
)`;

/* ==========================================================================
   RF-P7: LISTAR CATEGORÍAS
   ¿Para qué sirve? Devuelve todas las categorías disponibles para llenar los menús desplegables
   del catálogo de productos y de la pantalla de administración de categorías.
   Los vendedores ven solo las categorías activas; los administradores pueden ver todas.
   ========================================================================== */
export async function listarCategorias(usuario: UsuarioSesion, parametros: { todas?: string } = {}) {
  /* si el usuario es admin y pasó el parámetro todas=true, permitimos ver también las desactivadas */
  const verTodas = parametros.todas === "true" && usuario.rol === "admin";

  /* ejecutamos la consulta trayendo el id, nombre, estado y la cantidad de productos activos */
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

/* ==========================================================================
   RF-P7: CREAR CATEGORÍA
   ¿Para qué sirve? Permite a un administrador dar de alta una nueva categoría.
   Verifica que no exista otra categoría con el mismo nombre (insensible a mayúsculas).
   ========================================================================== */
export async function crearCategoria(usuario: UsuarioSesion, datosSinValidar: unknown) {
  /* comprobamos que el usuario sea administrador */
  exigirAdmin(usuario);

  /* validamos con Zod que el nombre no esté vacío */
  const datos = validar(esquemaCategoriaNueva, datosSinValidar);

  /* comprobamos que el nombre no esté ocupado */
  await verificarNombreLibre(datos.nombre);

  /* insertamos la categoría en la tabla 'categorias' */
  const [categoriaCreada] = await db.insert(categorias).values({ nombre: datos.nombre }).returning();

  /* devolvemos el registro creado */
  return categoriaCreada;
}

/* ==========================================================================
   RF-P7: EDITAR CATEGORÍA Y BAJA LÓGICA
   ¿Para qué sirve? Modifica el nombre o activa/desactiva la categoría.
   REGLA DE PROTECCIÓN:
   No se puede desactivar una categoría si todavía contiene productos activos,
   evitando que queden artículos huérfanos sin categoría válida.
   ========================================================================== */
export async function editarCategoria(usuario: UsuarioSesion, idCategoria: number, datosSinValidar: unknown) {
  /* comprobamos rol de administrador */
  exigirAdmin(usuario);

  /* validamos los campos con Zod */
  const datos = validar(esquemaCategoriaEdicion, datosSinValidar);

  /* buscamos la categoría en la base de datos */
  const categoriaExistente = await db.select().from(categorias).where(eq(categorias.id, idCategoria)).get();
  if (!categoriaExistente) throw noEncontrado("La categoría");

  /* si cambió el nombre, verificamos que no colisione con otra categoría existente */
  if (datos.nombre) await verificarNombreLibre(datos.nombre, idCategoria);

  /* REGLA DE PROTECCIÓN: si el usuario intenta desactivarla (activa: false),
     verificamos si existe al menos un producto activo vinculado a esta categoría */
  if (datos.activa === false) {
    const productoActivo = await db
      .select({ id: productos.id })
      .from(productos)
      .where(and(eq(productos.categoriaId, idCategoria), eq(productos.activo, true)))
      .get();
    
    /* si hay al menos un producto activo, rechazamos la operación con error 409 de conflicto */
    if (productoActivo) {
      throw new ApiError(409, "CATEGORIA_EN_USO", "La categoría tiene productos activos y no se puede desactivar.");
    }
  }

  /* actualizamos la fila en la tabla 'categorias' */
  const [categoriaEditada] = await db
    .update(categorias)
    .set(datos)
    .where(eq(categorias.id, idCategoria))
    .returning();

  /* devolvemos la categoría actualizada */
  return categoriaEditada;
}

/* ==========================================================================
   FUNCIÓN INTERNA: verificarNombreLibre
   ¿Para qué sirve? Comprueba en la base de datos que no exista otra categoría
   con el mismo nombre usando lower() de SQL para comparar sin importar mayúsculas.
   ========================================================================== */
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
