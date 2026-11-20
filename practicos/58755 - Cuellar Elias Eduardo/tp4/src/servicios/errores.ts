// Errores de dominio. El servicio no conoce HTTP: la capa de API traduce cada código a un status.
export type CodigoError = "VALIDACION" | "NO_ENCONTRADO" | "CONFLICTO" | "REGLA_NEGOCIO";

export abstract class ErrorDominio extends Error {
  abstract readonly codigo: CodigoError;

  constructor(
    mensaje: string,
    readonly campo?: string,
  ) {
    super(mensaje);
    this.name = new.target.name;
  }
}

/** Datos de entrada inválidos (formato, obligatorios, longitud). */
export class ErrorValidacion extends ErrorDominio {
  readonly codigo = "VALIDACION";
}

/** El recurso solicitado no existe. */
export class ErrorNoEncontrado extends ErrorDominio {
  readonly codigo = "NO_ENCONTRADO";
}

/** La operación choca con datos existentes (por ejemplo, un email repetido). */
export class ErrorConflicto extends ErrorDominio {
  readonly codigo = "CONFLICTO";
}

/** La operación es válida en forma pero la prohíbe una regla de negocio. */
export class ErrorReglaNegocio extends ErrorDominio {
  readonly codigo = "REGLA_NEGOCIO";
}

/** Detecta violaciones de UNIQUE de SQLite, aunque vengan envueltas (Drizzle anida la causa). */
export function esViolacionUnica(error: unknown): boolean {
  for (let actual = error; actual instanceof Error; actual = actual.cause) {
    if (actual.message.includes("UNIQUE constraint failed")) return true;
  }
  return false;
}
