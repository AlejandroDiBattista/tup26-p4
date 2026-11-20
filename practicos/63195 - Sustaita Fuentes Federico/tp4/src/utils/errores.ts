// Errores que puede lanzar el servicio. No saben nada de HTTP:
// el middleware de errores traduce cada tipo a un código de estado.
export type TipoError = 'validacion' | 'no-encontrado' | 'conflicto';

export class ErrorNegocio extends Error {
  constructor(public tipo: TipoError, mensaje: string) {
    super(mensaje);
  }
}

export const invalido = (mensaje: string) => new ErrorNegocio('validacion', mensaje);
export const noEncontrado = (recurso: string) => new ErrorNegocio('no-encontrado', `${recurso} no encontrado`);
export const conflicto = (mensaje: string) => new ErrorNegocio('conflicto', mensaje);
