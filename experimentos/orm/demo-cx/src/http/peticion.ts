import { getTableColumns, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import type { Filtro } from '../busqueda.js';

export class ErrorPeticion extends Error {
  constructor(message: string, public readonly status = 400) { super(message); }
}

export function id(valor: unknown): number {
  if (typeof valor !== 'string' || !/^[1-9]\d*$/.test(valor) || !Number.isSafeInteger(Number(valor))) {
    throw new ErrorPeticion('El ID debe ser un entero positivo.');
  }
  return Number(valor);
}

export function cuerpo<T extends SQLiteTable>(valor: unknown, tabla: T, parcial: true, permitidos?: string[]): Partial<InferInsertModel<T>>;
export function cuerpo<T extends SQLiteTable>(valor: unknown, tabla: T, parcial?: false): InferInsertModel<T>;
export function cuerpo<T extends SQLiteTable>(valor: unknown, tabla: T, parcial = false, permitidos?: string[]) {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) throw new ErrorPeticion('Se requiere un objeto JSON.');
  const columnas = getTableColumns(tabla);
  const campos = permitidos ?? Object.keys(columnas).filter((campo) => campo !== 'id' && campo !== 'clienteId');
  const datos = valor as Record<string, unknown>;
  for (const [campo, contenido] of Object.entries(datos)) {
    if (!campos.includes(campo)) throw new ErrorPeticion(`Campo no permitido: ${campo}`);
    if (contenido === null ? columnas[campo].notNull : typeof contenido !== 'string') {
      throw new ErrorPeticion(`Tipo inválido para ${campo}.`);
    }
  }
  if (!parcial) {
    for (const campo of campos) {
      if (columnas[campo].notNull && !columnas[campo].hasDefault && datos[campo] === undefined) {
        throw new ErrorPeticion(`Falta el campo ${campo}.`);
      }
    }
  }
  return datos;
}

export function filtro<T extends SQLiteTable>(query: Record<string, unknown>, tabla: T, extras: string[] = []): Filtro<InferSelectModel<T>> {
  const columnas = getTableColumns(tabla);
  if ('q' in query) {
    if (Object.keys(query).length !== 1 || typeof query.q !== 'string') {
      throw new ErrorPeticion('Usá q como texto libre o filtros por campo, sin combinarlos.');
    }
    return query.q;
  }
  const resultado: Record<string, string | number | null> = {};
  for (const [campo, valor] of Object.entries(query)) {
    if ((!Object.hasOwn(columnas, campo) && !extras.includes(campo)) || typeof valor !== 'string') {
      throw new ErrorPeticion(`Filtro inválido: ${campo}`);
    }
    if (columnas[campo]?.dataType === 'number') resultado[campo] = id(valor);
    else resultado[campo] = valor === 'null' && columnas[campo] && !columnas[campo].notNull ? null : valor;
  }
  return resultado as Filtro<InferSelectModel<T>>;
}
