/* ==========================================================================
   SERVICIO DE PRODUCTOS Y CATÁLOGO
   Cumple con los requisitos funcionales RF-P1, RF-P2 y RF-P3 del sistema:
   
   - RF-P1: Consulta y listado del catálogo con filtros (código, nombre, categoría, bajo mínimo).
   - RF-P2: Alta y edición de productos (solo administradores).
   - RF-P3: Baja lógica (activo = false) preservando el historial de ventas previas.
   
   REGLA DE INTEGRIDAD:
   Al dar de alta un producto nuevo con stock inicial, la existencia se inicializa en 0 y las unidades
   se ingresan obligatoriamente a través de moverStock() con tipo "ingreso", garantizando que
   el kardex de auditoría registre el stock inicial desde el primer segundo.
   ========================================================================== */

/* los import traen operadores y funciones de Drizzle ORM para consultas a la base de datos:
   - and: une condiciones con AND lógico
   - asc: orden ascendente (A-Z)
   - count: cuenta cantidad de registros (COUNT(*))
   - eq: igualdad (=)
   - like: búsqueda parcial (LIKE '%...%')
   - lt: menor estricto (<)
   - ne: distinto (!=)
   - or: une condiciones con OR lógico */
import { and, asc, count, eq, like, lt, ne, or } from "drizzle-orm";

/* importamos la conexión estándar 'db' a la base de datos */
import { db } from "@/basedatos/conexion";

/* importamos las tablas relacionales categorias y productos */
import { categorias, productos } from "@/basedatos/esquema";

/* importamos los esquemas Zod para validar el alta y la edición de productos */
import { esquemaProductoEdicion, esquemaProductoNuevo } from "@/esquemas/productos";

/* importamos la clase de error HTTP y el helper 404 */
import { ApiError, noEncontrado } from "./errores";

/* importamos helpers de permisos de administrador, paginación, respuestas y sesión */
import { exigirAdmin, leerPaginacion, respuestaPaginada, validar, type UsuarioSesion } from "./comunes";

/* importamos moverStock para registrar de forma atómica el stock inicial del producto */
import { moverStock } from "./stock";

/* definimos el tipo de datos para los filtros de búsqueda en el catálogo */
type FiltrosProductos = {
  q?: string;
  categoriaId?: string;
  bajoMinimo?: string;
  activo?: string; // "true" (por defecto), "false" o "todos" (solo admin)
  page?: string;
  pageSize?: string;
};

/* ==========================================================================
   RF-P1: LISTAR CATÁLOGO DE PRODUCTOS
   ¿Para qué sirve? Permite buscar productos por código (ej: 'HE-001') o descripción (ej: 'Martillo'),
   filtrar por categoría o ver los productos que están por debajo del stock mínimo.
   ========================================================================== */
export async function listarProductos(usuario: UsuarioSesion, parametros: FiltrosProductos) {
  /* calculamos la página actual, el tamaño de página y el salto (offset) para SQL */
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  /* creamos el arreglo de condiciones WHERE dinámicas */
  const condiciones = [];

  /* si el usuario ingresó texto en 'q', buscamos coincidencias tanto en el código como en la descripción */
  if (parametros.q) {
    const textoBuscado = `%${parametros.q}%`;
    condiciones.push(or(like(productos.codigo, textoBuscado), like(productos.descripcion, textoBuscado)));
  }

  /* si filtró por categoría, agregamos WHERE categoriaId = ? */
  if (parametros.categoriaId) condiciones.push(eq(productos.categoriaId, Number(parametros.categoriaId)));

  /* si activó bajoMinimo=true, filtramos donde la existencia real sea menor al stockMinimo (alerta de reposición) */
  if (parametros.bajoMinimo === "true") condiciones.push(lt(productos.existencia, productos.stockMinimo));

  /* control de visibilidad por rol: los vendedores comunes solo pueden ver productos activos (activo: true).
     los administradores pueden optar por ver 'todos', solo los activos o solo los inactivos */
  const filtroActivo = usuario.rol === "admin" ? (parametros.activo ?? "true") : "true";
  if (filtroActivo === "true") condiciones.push(eq(productos.activo, true));
  if (filtroActivo === "false") condiciones.push(eq(productos.activo, false));

  /* unimos todas las condiciones con AND */
  const filtro = and(...condiciones);

  /* ejecutamos la consulta uniendo productos con categorías (innerJoin) y ordenando alfabéticamente por código */
  const filas = await consultaProductos()
    .where(filtro)
    .orderBy(asc(productos.codigo))
    .limit(tamanoPagina)
    .offset(salto);

  /* contamos cuántos productos en total cumplen el filtro para calcular la cantidad de páginas */
  const [{ total }] = await db.select({ total: count() }).from(productos).where(filtro);

  /* transformamos cada fila con .map(aProductoPublico) para agregar la bandera bajoMinimo y devolver la respuesta paginada */
  return respuestaPaginada(filas.map(aProductoPublico), pagina, tamanoPagina, total);
}

/* ==========================================================================
   RF-P1: OBTENER UN PRODUCTO POR ID
   ¿Para qué sirve? Recupera toda la ficha técnica de un producto individual.
   ========================================================================== */
export async function obtenerProducto(_usuario: UsuarioSesion, idProducto: number) {
  const fila = await consultaProductos().where(eq(productos.id, idProducto)).get();
  if (!fila) throw noEncontrado("El producto");
  return aProductoPublico(fila);
}

/* ==========================================================================
   RF-P2: CREAR PRODUCTO (ALTA DE PRODUCTO)
   ¿Para qué sirve? Da de alta un nuevo artículo en la ferretería.
   ¿Quién puede hacerlo? Exclusivo administradores (exigirAdmin).
   ¿Cómo maneja el stock inicial? La tabla 'productos' se crea con existencia = 0,
   y si el usuario especificó stock inicial, se llama a moverStock() dentro de la misma
   transacción para que el kardex registre el movimiento de ingreso formalmente.
   ========================================================================== */
export async function crearProducto(
  usuario: UsuarioSesion,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
  /* verificamos permisos de administrador */
  exigirAdmin(usuario);

  /* validamos con Zod tipos, precios positivos y campos requeridos */
  const datos = validar(esquemaProductoNuevo, datosSinValidar);

  /* comprobamos que el código no esté repetido en la base de datos */
  await verificarCodigoLibre(datos.codigo);

  /* comprobamos que la categoría exista y esté activa */
  await verificarCategoriaActiva(datos.categoriaId);

  /* abrimos la transacción atómica para insertar el producto y su stock inicial en un solo paso */
  const idProductoCreado = await db.transaction(async (tx) => {
    /* insertamos el producto con su código en mayúsculas y existencia inicial en 0 */
    const [productoCreado] = await tx
      .insert(productos)
      .values({
        codigo: datos.codigo.toUpperCase(),
        descripcion: datos.descripcion,
        categoriaId: datos.categoriaId,
        precio: datos.precio,
        stockMinimo: datos.stockMinimo,
        existencia: 0,
      })
      .returning();

    /* si se especificó una cantidad inicial de unidades, registramos el ingreso con moverStock */
    if (datos.stockInicial && datos.stockInicial > 0) {
      await moverStock(tx, {
        productoId: productoCreado.id,
        cantidad: datos.stockInicial,
        tipo: "ingreso",
        motivo: "Stock inicial",
        usuarioId: usuario.id,
        fecha: opciones.fecha,
      });
    }

    return productoCreado.id;
  });

  /* devolvemos la ficha del producto recién creado */
  return obtenerProducto(usuario, idProductoCreado);
}

/* ==========================================================================
   RF-P2 y RF-P3: EDITAR PRODUCTO Y BAJA LÓGICA
   ¿Para qué sirve? Modifica descripción, precio, categoría, stock mínimo o activa/desactiva el producto.
   REGLA DE SEGURIDAD ARQUITECTÓNICA:
   La propiedad 'existencia' NO está presente en el esquema Zod de edición.
   Si alguien intenta enviar 'existencia' en el body de un PUT o PATCH, Zod lo rechaza con error 422.
   El stock solo se puede modificar a través del servicio de movimientos de stock.
   ========================================================================== */
export async function editarProducto(usuario: UsuarioSesion, idProducto: number, datosSinValidar: unknown) {
  /* comprobamos rol de administrador */
  exigirAdmin(usuario);

  /* validamos los campos recibidos con el esquema de edición de Zod */
  const datos = validar(esquemaProductoEdicion, datosSinValidar);

  /* verificamos que el producto exista en la base de datos */
  const productoExistente = await db.select().from(productos).where(eq(productos.id, idProducto)).get();
  if (!productoExistente) throw noEncontrado("El producto");

  /* si se envió un nuevo código, lo pasamos a mayúsculas y verificamos que no colisione con otro producto */
  if (datos.codigo) {
    datos.codigo = datos.codigo.toUpperCase();
    await verificarCodigoLibre(datos.codigo, idProducto);
  }

  /* si se modificó la categoría, verificamos que la nueva categoría exista y esté activa */
  if (datos.categoriaId) await verificarCategoriaActiva(datos.categoriaId);

  /* actualizamos los datos en la tabla productos */
  await db.update(productos).set(datos).where(eq(productos.id, idProducto));

  /* devolvemos el producto actualizado */
  return obtenerProducto(usuario, idProducto);
}

/* ==========================================================================
   FUNCIONES INTERNAS AUXILIARES
   ========================================================================== */

/* consultaProductos: realiza el SELECT con el innerJoin a la tabla categorias para traer el nombre de la categoría */
function consultaProductos() {
  return db
    .select({ producto: productos, categoriaNombre: categorias.nombre })
    .from(productos)
    .innerJoin(categorias, eq(productos.categoriaId, categorias.id));
}

/* tipo TypeScript inferido para una fila de la consulta */
type FilaProducto = NonNullable<Awaited<ReturnType<ReturnType<typeof consultaProductos>["get"]>>>;

/* aProductoPublico: formatea la respuesta JSON pública agregando la propiedad calculada bajoMinimo */
function aProductoPublico(fila: FilaProducto) {
  const { producto } = fila;
  return {
    id: producto.id,
    codigo: producto.codigo,
    descripcion: producto.descripcion,
    categoria: { id: producto.categoriaId, nombre: fila.categoriaNombre },
    precio: producto.precio,
    existencia: producto.existencia,
    stockMinimo: producto.stockMinimo,
    bajoMinimo: producto.existencia < producto.stockMinimo,
    activo: producto.activo,
  };
}

/* exportamos el tipo ProductoPublico para usarlo en el tipado de los componentes React */
export type ProductoPublico = ReturnType<typeof aProductoPublico>;

/* verificarCodigoLibre: comprueba que no haya dos productos con el mismo código en la base de datos */
async function verificarCodigoLibre(codigo: string, idQueSeEdita?: number) {
  const condicion = idQueSeEdita
    ? and(eq(productos.codigo, codigo.toUpperCase()), ne(productos.id, idQueSeEdita))
    : eq(productos.codigo, codigo.toUpperCase());

  const otroProducto = await db.select({ id: productos.id }).from(productos).where(condicion).get();
  
  if (otroProducto) {
    throw new ApiError(409, "CODIGO_DUPLICADO", "Ya existe un producto con ese código.", [
      { campo: "codigo", mensaje: "Ya existe un producto con ese código." },
    ]);
  }
}

/* verificarCategoriaActiva: asegura que la categoría asignada al producto exista y no esté dada de baja */
async function verificarCategoriaActiva(idCategoria: number) {
  const categoria = await db.select().from(categorias).where(eq(categorias.id, idCategoria)).get();
  if (!categoria || !categoria.activa) {
    throw new ApiError(422, "VALIDACION", "Hay campos con errores.", [
      { campo: "categoriaId", mensaje: "La categoría no existe o está inactiva." },
    ]);
  }
}
