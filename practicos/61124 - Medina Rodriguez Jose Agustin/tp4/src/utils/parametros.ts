import { ErrorHttp } from './error-http.ts';

export function leerId(valor: string | string[] | undefined) {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  const id = Number(texto);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorHttp(400, `El id "${texto}" no es válido`);
  }

  return id;
}