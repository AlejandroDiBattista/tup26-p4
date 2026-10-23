// Errores de negocio. Los controladores los traducen a códigos HTTP.

export class ErrorNegocio extends Error {
  constructor(mensaje: string, readonly status: number) {
    super(mensaje);
    this.name = new.target.name;
  }
}

/** El recurso pedido no existe (404). */
export class NoEncontrado extends ErrorNegocio {
  constructor(mensaje: string) {
    super(mensaje, 404);
  }
}

/** Los datos recibidos no son válidos (400). */
export class DatosInvalidos extends ErrorNegocio {
  constructor(mensaje: string) {
    super(mensaje, 400);
  }
}

/** La operación choca con el estado actual: email repetido, actividad completada, etc. (409). */
export class Conflicto extends ErrorNegocio {
  constructor(mensaje: string) {
    super(mensaje, 409);
  }
}
