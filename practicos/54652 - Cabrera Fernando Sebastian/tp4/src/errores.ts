/** Error de negocio: lleva el código HTTP con el que hay que responder. */
export class HttpError extends Error {
  constructor(
    public status: number,
    mensaje: string,
  ) {
    super(mensaje);
  }
}
