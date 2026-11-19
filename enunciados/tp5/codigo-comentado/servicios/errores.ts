// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: servicios/errores.ts
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Única clase de error que lanzan los servicios (sección 10.4).
// El adaptador de la API la convierte en la respuesta JSON estándar:
// { "error": { "code": "...", "message": "...", "details": [...] } }

export type DetalleError = Record<string, unknown>;

export class ApiError extends Error {
  status: number; // código HTTP: 401, 403, 404, 409, 422...
  code: string; // código del error: "STOCK_INSUFICIENTE", "VALIDACION"...
  details?: DetalleError[]; // detalle opcional por campo o por producto

  constructor(status: number, code: string, message: string, details?: DetalleError[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Atajos para los errores más comunes, así el código de los servicios se lee mejor.
export const noEncontrado = (queCosa: string) =>
  new ApiError(404, "NO_ENCONTRADO", `${queCosa} no existe.`);

export const sinPermiso = () =>
  new ApiError(403, "SIN_PERMISO", "Tu rol no permite realizar esta operación.");

export const noAutenticado = () =>
  new ApiError(401, "NO_AUTENTICADO", "Tenés que iniciar sesión.");
