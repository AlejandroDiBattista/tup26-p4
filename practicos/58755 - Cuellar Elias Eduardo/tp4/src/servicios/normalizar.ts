import type { NuevaActividad, NuevoCliente } from "../db/schema.js";
import { ErrorValidacion } from "./errores.js";
import { esFechaValida, hoy, type FechaISO } from "./fechas.js";

// Tipos de entrada derivados del esquema de Drizzle.
export type DatosCliente = Omit<NuevoCliente, "id">;
export type CambiosCliente = Partial<DatosCliente>;
export type DatosActividad = Omit<NuevaActividad, "id" | "clienteId">;
export type CambiosActividad = Partial<Pick<NuevaActividad, "descripcion" | "fechaCompromiso">>;

// Las entradas suelen venir de un body JSON: aunque estén tipadas, se validan en tiempo de ejecución.

const LARGO_MAXIMO = {
  nombre: 80,
  apellido: 80,
  email: 254,
  domicilio: 120,
  localidad: 80,
  descripcion: 500,
} as const;

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CARACTERES_TELEFONO = /^\+?[\d\s().-]+$/;
const SEPARADORES_TELEFONO = /[\s().-]+/;
const DIGITOS_TELEFONO = { min: 6, max: 15 } as const;

// Partículas que se mantienen en minúscula dentro de un nombre ("María de la Vega").
const PARTICULAS = new Set(["de", "del", "la", "las", "los", "y", "e", "da", "di", "van", "von"]);

// ── Primitivas ────────────────────────────────────────────────────────────────

/** undefined = campo ausente; null = campo vacío; string = texto recortado y sin espacios dobles. */
function leerTexto(valor: unknown, campo: string): string | null | undefined {
  if (valor === undefined) return undefined;
  if (valor === null) return null;
  if (typeof valor !== "string") throw new ErrorValidacion(`El campo ${campo} debe ser texto`, campo);
  const limpio = valor.trim().replace(/\s+/g, " ");
  return limpio === "" ? null : limpio;
}

function obligatorio(valor: string | null | undefined, campo: string): string {
  if (valor == null) throw new ErrorValidacion(`El campo ${campo} es obligatorio`, campo);
  return valor;
}

function limitarLargo(valor: string, campo: keyof typeof LARGO_MAXIMO): string {
  const maximo = LARGO_MAXIMO[campo];
  if (valor.length > maximo) {
    throw new ErrorValidacion(`El campo ${campo} admite hasta ${maximo} caracteres`, campo);
  }
  return valor;
}

function comoObjeto(datos: unknown): Record<string, unknown> {
  if (typeof datos !== "object" || datos === null || Array.isArray(datos)) {
    throw new ErrorValidacion("Los datos enviados no son válidos");
  }
  return datos as Record<string, unknown>;
}

function capitalizar(palabra: string): string {
  return palabra.charAt(0).toLocaleUpperCase("es") + palabra.slice(1);
}

/** "maría JOSÉ de la vega" → "María José de la Vega"; respeta guiones y apóstrofos ("O'Connor"). */
function capitalizarNombre(texto: string): string {
  return texto
    .toLocaleLowerCase("es")
    .split(" ")
    .map((palabra, i) =>
      i > 0 && PARTICULAS.has(palabra) ? palabra : palabra.replace(/(^|[-'’])(\p{L})/gu, (_, sep: string, letra: string) => sep + letra.toLocaleUpperCase("es")),
    )
    .join(" ");
}

// ── Campos ────────────────────────────────────────────────────────────────────

function normalizarNombrePropio(valor: unknown, campo: "nombre" | "apellido"): string {
  return capitalizarNombre(limitarLargo(obligatorio(leerTexto(valor, campo), campo), campo));
}

function normalizarEmail(valor: unknown): string {
  const email = limitarLargo(obligatorio(leerTexto(valor, "email"), "email"), "email").toLowerCase();
  if (!FORMATO_EMAIL.test(email)) throw new ErrorValidacion("El email no tiene un formato válido", "email");
  return email;
}

/** "(381) 555 0101" → "381-555-0101"; conserva el "+" inicial internacional. */
function normalizarTelefono(valor: unknown): string | null | undefined {
  const telefono = leerTexto(valor, "telefono");
  if (telefono == null) return telefono;
  if (!CARACTERES_TELEFONO.test(telefono)) {
    throw new ErrorValidacion("El teléfono solo admite dígitos, espacios, guiones, puntos, paréntesis y + inicial", "telefono");
  }
  const grupos = telefono.replace(/^\+/, "").split(SEPARADORES_TELEFONO).filter(Boolean);
  const digitos = grupos.join("").length;
  if (digitos < DIGITOS_TELEFONO.min || digitos > DIGITOS_TELEFONO.max) {
    throw new ErrorValidacion(
      `El teléfono debe tener entre ${DIGITOS_TELEFONO.min} y ${DIGITOS_TELEFONO.max} dígitos`,
      "telefono",
    );
  }
  return (telefono.startsWith("+") ? "+" : "") + grupos.join("-");
}

function normalizarDomicilio(valor: unknown): string | null | undefined {
  const domicilio = leerTexto(valor, "domicilio");
  return domicilio == null ? domicilio : limitarLargo(domicilio, "domicilio");
}

function normalizarLocalidad(valor: unknown): string | null | undefined {
  const localidad = leerTexto(valor, "localidad");
  return localidad == null ? localidad : capitalizarNombre(limitarLargo(localidad, "localidad"));
}

function normalizarDescripcion(valor: unknown): string {
  return capitalizar(limitarLargo(obligatorio(leerTexto(valor, "descripcion"), "descripcion"), "descripcion"));
}

function normalizarFecha(valor: unknown, campo: string): FechaISO | null | undefined {
  const fecha = leerTexto(valor, campo);
  if (fecha == null) return fecha;
  if (!esFechaValida(fecha)) throw new ErrorValidacion(`El campo ${campo} debe ser una fecha válida (AAAA-MM-DD)`, campo);
  return fecha;
}

/** Una actividad no puede darse por finalizada en el futuro. */
export function normalizarFechaFinalizacion(valor: unknown, fechaHoy: FechaISO = hoy()): FechaISO | null | undefined {
  const fecha = normalizarFecha(valor, "fechaFinalizacion");
  if (fecha && fecha > fechaHoy) {
    throw new ErrorValidacion("La fecha de finalización no puede ser posterior a hoy", "fechaFinalizacion");
  }
  return fecha;
}

// ── Entidades ─────────────────────────────────────────────────────────────────

export function normalizarNuevoCliente(datos: DatosCliente): DatosCliente {
  const d = comoObjeto(datos);
  return {
    nombre: normalizarNombrePropio(d.nombre, "nombre"),
    apellido: normalizarNombrePropio(d.apellido, "apellido"),
    email: normalizarEmail(d.email),
    domicilio: normalizarDomicilio(d.domicilio) ?? null,
    localidad: normalizarLocalidad(d.localidad) ?? null,
    telefono: normalizarTelefono(d.telefono) ?? null,
  };
}

/** Solo normaliza los campos presentes; los ausentes no se modifican. */
export function normalizarCambiosCliente(cambios: CambiosCliente): CambiosCliente {
  const c = comoObjeto(cambios);
  const resultado: CambiosCliente = {};
  if (c.nombre !== undefined) resultado.nombre = normalizarNombrePropio(c.nombre, "nombre");
  if (c.apellido !== undefined) resultado.apellido = normalizarNombrePropio(c.apellido, "apellido");
  if (c.email !== undefined) resultado.email = normalizarEmail(c.email);
  if (c.domicilio !== undefined) resultado.domicilio = normalizarDomicilio(c.domicilio) ?? null;
  if (c.localidad !== undefined) resultado.localidad = normalizarLocalidad(c.localidad) ?? null;
  if (c.telefono !== undefined) resultado.telefono = normalizarTelefono(c.telefono) ?? null;
  return resultado;
}

export function normalizarNuevaActividad(datos: DatosActividad, fechaHoy: FechaISO = hoy()): DatosActividad {
  const d = comoObjeto(datos);
  return {
    descripcion: normalizarDescripcion(d.descripcion),
    fechaCompromiso: normalizarFecha(d.fechaCompromiso, "fechaCompromiso") ?? null,
    fechaFinalizacion: normalizarFechaFinalizacion(d.fechaFinalizacion, fechaHoy) ?? null,
  };
}

/** La finalización no se edita: se registra con Clientes.completarActividad. */
export function normalizarCambiosActividad(cambios: CambiosActividad): CambiosActividad {
  const c = comoObjeto(cambios);
  if (c.fechaFinalizacion !== undefined) {
    throw new ErrorValidacion("Para finalizar una actividad use la operación de completar", "fechaFinalizacion");
  }
  const resultado: CambiosActividad = {};
  if (c.descripcion !== undefined) resultado.descripcion = normalizarDescripcion(c.descripcion);
  if (c.fechaCompromiso !== undefined) resultado.fechaCompromiso = normalizarFecha(c.fechaCompromiso, "fechaCompromiso") ?? null;
  return resultado;
}

/** Acepta números o strings numéricos (como llegan en los parámetros de una URL). */
export function normalizarId(valor: unknown, campo = "id"): number {
  const id = typeof valor === "string" && /^\d+$/.test(valor) ? Number(valor) : valor;
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
    throw new ErrorValidacion(`El ${campo} debe ser un entero positivo`, campo);
  }
  return id;
}
