// Errores de negocio con el código HTTP sugerido para la API.
export class ErrorValidacion extends Error {
  readonly status = 400;
  override name = "ErrorValidacion";
}

export class ErrorNoEncontrado extends Error {
  readonly status = 404;
  override name = "ErrorNoEncontrado";
}

export class ErrorReglaNegocio extends Error {
  readonly status = 409;
  override name = "ErrorReglaNegocio";
}
