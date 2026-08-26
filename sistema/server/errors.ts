/**
 * Errores cuyo `statusCode` la capa de acciones devuelve tal cual en vez de
 * esconderlos detrás de un 500 genérico. Usar estos para errores del que llama,
 * así el agente y la UI reciben un 4xx accionable. Una falla de invariante real
 * debe seguir siendo un Error común (500).
 */

export class UserInputError extends Error {
  readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "UserInputError";
  }
}

export class NotFoundError extends Error {
  readonly statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class AuthError extends Error {
  readonly statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
