export const NO_ENCONTRADO = 'NO_ENCONTRADO';
export const ACTIVIDAD_COMPLETADA = 'ACTIVIDAD_COMPLETADA';

type TipoDeError = typeof NO_ENCONTRADO | typeof ACTIVIDAD_COMPLETADA;

export class ErrorDeNegocio extends Error {
  constructor(public tipo: TipoDeError, mensaje: string) {
    super(mensaje);
  }
}
