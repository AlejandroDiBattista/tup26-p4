/** Errores de negocio; la capa HTTP los traduce a 404, 400 y 409. */
export class ErrorNoEncontrado extends Error {}
export class ErrorValidacion extends Error {}
export class ErrorConflicto extends Error {}
