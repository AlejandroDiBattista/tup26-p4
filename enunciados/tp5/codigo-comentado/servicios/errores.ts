// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Única clase de error que lanzan los servicios (sección 10.4).
// El adaptador de la API la convierte en la respuesta JSON estándar:
// { "error": { "code": "...", "message": "...", "details": [...] } }

// [Línea 5] Define el tipo de datos 'DetalleError' en TypeScript.
export type DetalleError = Record<string, unknown>;

// [Línea 7] Declara y exporta una clase reutilizable.
export class ApiError extends Error {
  // [Línea 8] Define o asigna el campo/parámetro 'status'.
  status: number; // código HTTP: 401, 403, 404, 409, 422...
  // [Línea 9] Define o asigna el campo/parámetro 'code'.
  code: string; // código del error: "STOCK_INSUFICIENTE", "VALIDACION"...
  // [Línea 10] Ejecuta o evalúa: details?: DetalleError[]; // detalle opcional por campo o por producto
  details?: DetalleError[]; // detalle opcional por campo o por producto

  // [Línea 12] Ejecuta o evalúa: constructor(status: number, code: string, message: string, details?: DetalleErro
  constructor(status: number, code: string, message: string, details?: DetalleError[]) {
    // [Línea 13] Ejecuta o evalúa: super(message);
    super(message);
    // [Línea 14] Ejecuta o evalúa: this.status = status;
    this.status = status;
    // [Línea 15] Ejecuta o evalúa: this.code = code;
    this.code = code;
    // [Línea 16] Ejecuta o evalúa: this.details = details;
    this.details = details;
  // [Línea 17] Cierra el bloque o estructura (}).
  }
// [Línea 18] Cierra el bloque o estructura (}).
}

// Atajos para los errores más comunes, así el código de los servicios se lee mejor.
// [Línea 21] Declara y exporta la constante 'noEncontrado'.
export const noEncontrado = (queCosa: string) =>
  // [Línea 22] Ejecuta o evalúa: new ApiError(404, "NO_ENCONTRADO", `${queCosa} no existe.`);
  new ApiError(404, "NO_ENCONTRADO", `${queCosa} no existe.`);

// [Línea 24] Declara y exporta la constante 'sinPermiso'.
export const sinPermiso = () =>
  // [Línea 25] Ejecuta o evalúa: new ApiError(403, "SIN_PERMISO", "Tu rol no permite realizar esta operación.");
  new ApiError(403, "SIN_PERMISO", "Tu rol no permite realizar esta operación.");

// [Línea 27] Declara y exporta la constante 'noAutenticado'.
export const noAutenticado = () =>
  // [Línea 28] Ejecuta o evalúa: new ApiError(401, "NO_AUTENTICADO", "Tenés que iniciar sesión.");
  new ApiError(401, "NO_AUTENTICADO", "Tenés que iniciar sesión.");
