/* ==========================================================================
   UTILIDADES COMUNES DE LA CAPA DE SERVICIOS
   Centraliza la validación declarativa con Zod, la comprobación estricta de roles
   y las operaciones matemáticas de paginación para todas las consultas.
   ========================================================================== */

/* importamos la biblioteca Zod para validación de esquemas en tiempo de ejecución */
import { z } from "zod";

/* importamos la clase ApiError y el helper sinPermiso para arrojar excepciones HTTP tipadas */
import { ApiError, sinPermiso } from "./errores";

/* definimos el tipo de datos UsuarioSesion que describe la información del usuario autenticado:
   - id: identificador numérico único
   - nombre: nombre completo del empleado
   - email: correo electrónico institucional
   - rol: permisos asignados ('admin' o 'vendedor') */
export type UsuarioSesion = {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "vendedor";
};

/* ==========================================================================
   FUNCIÓN: validar
   ¿Para qué sirve? Ejecuta la validación de cualquier dato recibido desde formularios o peticiones HTTP
   utilizando un esquema Zod. Si los datos no cumplen las reglas, arroja un error 422 detallado.
   ¿Por qué es genérica <T>? Porque infiere automáticamente el tipo TypeScript resultante a partir del esquema.
   ========================================================================== */
export function validar<T>(esquema: z.ZodType<T>, datosSinValidar: unknown): T {
  /* ejecutamos safeParse para validar sin que Zod lance una excepción no controlada */
  const resultado = esquema.safeParse(datosSinValidar);

  /* si la validación fue exitosa (success: true), devolvemos los datos tipados y limpios */
  if (resultado.success) return resultado.data;

  /* si hubo errores, mapeamos cada issue de Zod para armar una lista clara de { campo, mensaje } */
  const detalles = resultado.error.issues.map((problema) => ({
    campo: problema.path.join(".") || (problema.code === "unrecognized_keys" ? problema.keys.join(",") : ""),
    mensaje: problema.message,
  }));

  /* arrojamos un error 422 de validación con el detalle de los campos que fallaron */
  throw new ApiError(422, "VALIDACION", "Hay campos con errores.", detalles);
}

/* ==========================================================================
   FUNCIÓN: exigirAdmin
   ¿Para qué sirve? Actúa como guardián de autorización en las operaciones críticas del backend.
   REGLA DE SEGURIDAD ARQUITECTÓNICA:
   Ocultar un botón en la interfaz visual NO es seguridad. Un atacante podría enviar una petición
   HTTP directa con curl o Postman. Esta función comprueba a nivel de servicio que el rol sea 'admin'
   y frena cualquier intento no autorizado arrojando un error 403 (Forbidden).
   ========================================================================== */
export function exigirAdmin(usuario: UsuarioSesion) {
  if (usuario.rol !== "admin") throw sinPermiso();
}

/* ==========================================================================
   FUNCIÓN: leerPaginacion
   ¿Para qué sirve? Calcula de manera segura los parámetros de paginación para consultas SQL:
   - pagina: número de página actual (mínimo 1, por defecto 1)
   - tamanoPagina: cantidad de filas por página (mínimo 1, máximo 100 para proteger el servidor, por defecto 20)
   - salto (offset): cuántas filas saltear en la base de datos = (pagina - 1) * tamanoPagina
   ========================================================================== */
export function leerPaginacion(parametros: { page?: unknown; pageSize?: unknown }) {
  const pagina = Math.max(1, Number(parametros.page) || 1);
  const tamanoPagina = Math.min(100, Math.max(1, Number(parametros.pageSize) || 20));
  return { pagina, tamanoPagina, salto: (pagina - 1) * tamanoPagina };
}

/* ==========================================================================
   FUNCIÓN: respuestaPaginada
   ¿Para qué sirve? Envuelve cualquier lista de resultados en la estructura estándar de respuesta:
   - data: el arreglo con los elementos solicitados
   - page: número de página actual
   - pageSize: tamaño de página utilizado
   - total: cantidad total histórica de elementos que cumplen con el filtro en la base de datos
   ========================================================================== */
export function respuestaPaginada<T>(datos: T[], pagina: number, tamanoPagina: number, total: number) {
  return { data: datos, page: pagina, pageSize: tamanoPagina, total };
}
