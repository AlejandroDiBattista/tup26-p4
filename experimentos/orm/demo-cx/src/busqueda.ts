import { ErrorServicio } from './errores.js';
export type Filtro<T> = string | Partial<{ [K in keyof T]: T[K] | string }>;

const texto = (valor: unknown) => String(valor).normalize('NFD').replace(/\p{M}/gu, '')
  .toLowerCase().trim().replace(/\s+/g, ' ');

export function coincide<T extends object>(registro: T, filtro: Filtro<T>): boolean {
  if (typeof filtro === 'string') {
    return Object.values(registro).some((valor) => valor !== null && typeof valor !== 'object'
      && texto(valor).includes(texto(filtro)));
  }
  return Object.entries(filtro).every(([campo, valor]) => {
    if (valor === undefined) return true;
    if (!Object.hasOwn(registro, campo)) throw new ErrorServicio(`Campo de búsqueda desconocido: ${campo}`);
    const actual = registro[campo as keyof T];
    if (valor === null || typeof valor === 'number') return actual === valor;
    return actual !== null && texto(actual).includes(texto(valor));
  });
}
