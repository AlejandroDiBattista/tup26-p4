/* ==========================================================================
   MANEJO CENTRALIZADO DE ERRORES DE LA API (CLASE ApiError)
   En este sistema no se lanzan excepciones genéricas de JavaScript.
   Todos los servicios lanzan instancias de ApiError, las cuales son capturadas
   automáticamente por los adaptadores para devolver una respuesta JSON homogénea:
   {
     "error": {
       "code": "STOCK_INSUFICIENTE",
       "message": "No hay existencias suficientes.",
       "details": [...]
     }
   }
   ========================================================================== */

/* tipo de dato flexible para los detalles complementarios de un error */
export type DetalleError = Record<string, unknown>;

/* ==========================================================================
   CLASE: ApiError
   Hereda de la clase base nativa Error de JavaScript para mantener el stack trace.
   Agrega propiedades obligatorias:
   - status: código de estado HTTP (400, 401, 403, 404, 409, 422, etc.)
   - code: identificador único en mayúsculas para que el frontend pueda traducirlo o reaccionar
   - details: arreglo opcional con detalles específicos de cada campo o producto
   ========================================================================== */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: DetalleError[];

  constructor(status: number, code: string, message: string, details?: DetalleError[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/* ==========================================================================
   HELPERS Y ATAJOS PARA LOS ERRORES MÁS FRECUENTES
   Permiten que el código de los servicios sea mucho más limpio y legible.
   ========================================================================== */

/* noEncontrado: genera un error HTTP 404 cuando un registro no existe en la base de datos */
export const noEncontrado = (queCosa: string) =>
  new ApiError(404, "NO_ENCONTRADO", `${queCosa} no existe.`);

/* sinPermiso: genera un error HTTP 403 (Forbidden) cuando el rol del usuario no tiene autorización */
export const sinPermiso = () =>
  new ApiError(403, "SIN_PERMISO", "Tu rol no permite realizar esta operación.");

/* noAutenticado: genera un error HTTP 401 (Unauthorized) cuando no hay sesión activa */
export const noAutenticado = () =>
  new ApiError(401, "NO_AUTENTICADO", "Tenés que iniciar sesión.");
