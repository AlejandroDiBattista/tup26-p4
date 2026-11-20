import type { Request } from "express";
import type { CriteriosActividad, EstadoActividad } from "../servicios/cliente-repository.js";
import { ErrorDeSolicitud } from "./errores.js";

const ESTADOS: EstadoActividad[] = ["pendiente", "completada", "vencida"];

/** Parámetro de ruta como entero positivo. */
export function numeroDeRuta(valor: unknown, nombre: string): number {
  const numero = typeof valor === "string" ? Number(valor) : Number.NaN;
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ErrorDeSolicitud(`"${nombre}" debe ser un entero positivo`);
  }
  return numero;
}

/** Valor de query string no vacío. */
export function textoDeQuery(valor: unknown): string | undefined {
  if (typeof valor !== "string" || valor.trim() === "") return undefined;
  return valor;
}

/** Fecha ISO válida. */
export function fechaDe(valor: unknown, nombre: string): Date | undefined {
  if (valor === undefined || valor === null) return undefined;
  if (typeof valor !== "string" || Number.isNaN(Date.parse(valor))) {
    throw new ErrorDeSolicitud(`"${nombre}" debe ser una fecha ISO`);
  }
  return new Date(valor);
}

/** Fecha ISO opcional en el query string. */
export function fechaDeQuery(valor: unknown, nombre: string): Date | undefined {
  const texto = textoDeQuery(valor);
  return texto === undefined ? undefined : fechaDe(texto, nombre);
}

/**
 * Cuerpo JSON con campos de texto:
 * - `obligatorios`: tienen que venir con texto.
 * - `noVacios`: pueden faltar, pero si vienen no pueden estar vacíos.
 * - `opcionales`: pueden faltar, ser texto o `null` (para borrar el dato).
 */
export function cuerpoDe<T>(
  body: unknown,
  campos: { obligatorios: string[]; opcionales?: string[]; noVacios?: string[] },
): T {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ErrorDeSolicitud("Se espera un objeto JSON");
  }

  const datos = body as Record<string, unknown>;
  const salida: Record<string, unknown> = {};

  for (const campo of campos.obligatorios) {
    const valor = datos[campo];
    if (typeof valor !== "string" || valor.trim() === "") {
      throw new ErrorDeSolicitud(`El campo "${campo}" es obligatorio`);
    }
    salida[campo] = valor;
  }

  for (const campo of campos.noVacios ?? []) {
    const valor = datos[campo];
    if (valor === undefined) continue;
    if (typeof valor !== "string" || valor.trim() === "") {
      throw new ErrorDeSolicitud(`El campo "${campo}" no puede quedar vacío`);
    }
    salida[campo] = valor;
  }

  for (const campo of campos.opcionales ?? []) {
    const valor = datos[campo];
    if (valor === undefined) continue;
    if (valor !== null && typeof valor !== "string") {
      throw new ErrorDeSolicitud(`El campo "${campo}" debe ser texto o null`);
    }
    salida[campo] = valor;
  }

  return salida as T;
}

/** Criterios de actividad a partir del query string. */
export function criteriosDeActividad(query: Request["query"]): CriteriosActividad {
  const criterios: CriteriosActividad = {};

  const descripcion = textoDeQuery(query.descripcion);
  if (descripcion !== undefined) criterios.descripcion = descripcion;

  const estado = textoDeQuery(query.estado);
  if (estado !== undefined) {
    if (!ESTADOS.includes(estado as EstadoActividad)) {
      throw new ErrorDeSolicitud(`"estado" debe ser uno de: ${ESTADOS.join(", ")}`);
    }
    criterios.estado = estado as EstadoActividad;
  }

  const desde = fechaDeQuery(query.compromisoDesde, "compromisoDesde");
  if (desde !== undefined) criterios.compromisoDesde = desde;

  const hasta = fechaDeQuery(query.compromisoHasta, "compromisoHasta");
  if (hasta !== undefined) criterios.compromisoHasta = hasta;

  if (textoDeQuery(query.sinFecha) === "true") criterios.sinFecha = true;

  return criterios;
}
