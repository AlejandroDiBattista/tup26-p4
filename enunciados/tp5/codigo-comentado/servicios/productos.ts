// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: servicios/productos.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Servicio de PRODUCTOS. RF-P1, RF-P2, RF-P3.
// Acá importamos funciones y operadores de Drizzle ORM para interactuar con la base de datos
import { and, asc, count, eq, like, lt, ne, or } from "drizzle-orm";
// Acá importamos la conexión y definición de tablas de la base de datos
import { db } from "@/basedatos/conexion";
// Acá importamos la conexión y definición de tablas de la base de datos
import { categorias, productos } from "@/basedatos/esquema";
// Acá importamos esquemas de validación
import { esquemaProductoEdicion, esquemaProductoNuevo } from "@/esquemas/productos";
import { ApiError, noEncontrado } from "./errores";
import { exigirAdmin, leerPaginacion, respuestaPaginada, validar, type UsuarioSesion } from "./comunes";
import { moverStock } from "./stock";

type FiltrosProductos = {
  q?: string;
  categoriaId?: string;
  bajoMinimo?: string;
  activo?: string; // "true" (por defecto), "false" o "todos" (solo admin)
  page?: string;
  pageSize?: string;
};

// RF-P1: catálogo paginado con búsqueda por código o descripción y filtro por categoría.
export async function listarProductos(usuario: UsuarioSesion, parametros: FiltrosProductos) {
  const { pagina, tamanoPagina, salto } = leerPaginacion(parametros);

  const condiciones = [];
  if (parametros.q) {
    const textoBuscado = `%${parametros.q}%`;
    condiciones.push(or(like(productos.codigo, textoBuscado), like(productos.descripcion, textoBuscado)));
  }
  if (parametros.categoriaId) condiciones.push(eq(productos.categoriaId, Number(parametros.categoriaId)));
  // Verificamos si hay suficiente stock disponible para realizar la venta
  if (parametros.bajoMinimo === "true") condiciones.push(lt(productos.existencia, productos.stockMinimo));

  // El vendedor solo ve productos activos. El admin puede pedir "todos" o los inactivos.
  const filtroActivo = usuario.rol === "admin" ? (parametros.activo ?? "true") : "true";
  if (filtroActivo === "true") condiciones.push(eq(productos.activo, true));
  if (filtroActivo === "false") condiciones.push(eq(productos.activo, false));

  const filtro = and(...condiciones);

  const filas = await consultaProductos()
    .where(filtro)
    .orderBy(asc(productos.codigo))
    .limit(tamanoPagina)
    .offset(salto);
  const [{ total }] = await db.select({ total: count() }).from(productos).where(filtro);

  return respuestaPaginada(filas.map(aProductoPublico), pagina, tamanoPagina, total);
}

// RF-P1: un producto por id.
export async function obtenerProducto(_usuario: UsuarioSesion, idProducto: number) {
  const fila = await consultaProductos().where(eq(productos.id, idProducto)).get();
  if (!fila) throw noEncontrado("El producto");
  return aProductoPublico(fila);
}

// RF-P2: alta de producto. La existencia empieza en 0;
// el stock inicial se carga como un INGRESO (así queda en los movimientos).
export async function crearProducto(
  usuario: UsuarioSesion,
  datosSinValidar: unknown,
  opciones: { fecha?: Date } = {},
) {
  exigirAdmin(usuario);
  const datos = validar(esquemaProductoNuevo, datosSinValidar);
  await verificarCodigoLibre(datos.codigo);
  await verificarCategoriaActiva(datos.categoriaId);

  // Producto y movimiento de stock inicial en una sola transacción.
  // Iniciamos una transacción atómica: o se ejecutan todos los cambios juntos o no se guarda ninguno
  const idProductoCreado = await db.transaction(async (tx) => {
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

    // Verificamos si hay suficiente stock disponible para realizar la venta
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

  return obtenerProducto(usuario, idProductoCreado);
}

// RF-P2 y RF-P3: edición y baja lógica ("activo": false).
// "existencia" no está en el esquema de edición: si llega, se responde 422.
export async function editarProducto(usuario: UsuarioSesion, idProducto: number, datosSinValidar: unknown) {
  exigirAdmin(usuario);
  const datos = validar(esquemaProductoEdicion, datosSinValidar);

  const productoExistente = await db.select().from(productos).where(eq(productos.id, idProducto)).get();
  // Comprobamos si el registro solicitado existe en el sistema
  if (!productoExistente) throw noEncontrado("El producto");

  if (datos.codigo) {
    datos.codigo = datos.codigo.toUpperCase();
    await verificarCodigoLibre(datos.codigo, idProducto);
  }
  if (datos.categoriaId) await verificarCategoriaActiva(datos.categoriaId);

  // Actualizamos los datos del registro en la base de datos
  await db.update(productos).set(datos).where(eq(productos.id, idProducto));
  return obtenerProducto(usuario, idProducto);
}

// ---------- Funciones internas ----------

function consultaProductos() {
  return db
    .select({ producto: productos, categoriaNombre: categorias.nombre })
    .from(productos)
    .innerJoin(categorias, eq(productos.categoriaId, categorias.id));
}

type FilaProducto = NonNullable<Awaited<ReturnType<ReturnType<typeof consultaProductos>["get"]>>>;

// Forma pública del producto (sección 11.4).
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

export type ProductoPublico = ReturnType<typeof aProductoPublico>;

async function verificarCodigoLibre(codigo: string, idQueSeEdita?: number) {
  const condicion = idQueSeEdita
    ? and(eq(productos.codigo, codigo.toUpperCase()), ne(productos.id, idQueSeEdita))
    : eq(productos.codigo, codigo.toUpperCase());
  const otroProducto = await db.select({ id: productos.id }).from(productos).where(condicion).get();
  if (otroProducto) {
    // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
    throw new ApiError(409, "CODIGO_DUPLICADO", "Ya existe un producto con ese código.", [
      { campo: "codigo", mensaje: "Ya existe un producto con ese código." },
    ]);
  }
}

async function verificarCategoriaActiva(idCategoria: number) {
  const categoria = await db.select().from(categorias).where(eq(categorias.id, idCategoria)).get();
  if (!categoria || !categoria.activa) {
    // Lanzamos un error controlado con código de estado HTTP y mensaje explicativo
    throw new ApiError(422, "VALIDACION", "Hay campos con errores.", [
      { campo: "categoriaId", mensaje: "La categoría no existe o está inactiva." },
    ]);
  }
}
