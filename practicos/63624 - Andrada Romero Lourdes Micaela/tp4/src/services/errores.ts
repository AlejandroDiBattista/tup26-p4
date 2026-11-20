// Error de negocio con el código HTTP que corresponde devolver.
export class ErrorNegocio extends Error {
  constructor(public status: number, mensaje: string) {
    super(mensaje);
  }
}

export const noEncontrado = (que: string) => new ErrorNegocio(404, `${que} no encontrado`);
export const invalido = (mensaje: string) => new ErrorNegocio(400, mensaje);
export const conflicto = (mensaje: string) => new ErrorNegocio(409, mensaje);
