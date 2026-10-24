// Las fechas del dominio son días calendario en texto ISO (YYYY-MM-DD), sin hora ni zona.
// Al ser de ancho fijo, se comparan correctamente como strings.
export type FechaISO = string;

const FORMATO_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Fecha de hoy según la zona horaria local (no UTC, para no adelantar el día de noche). */
export function hoy(ahora: Date = new Date()): FechaISO {
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

/** Verifica el formato y que el día exista (rechaza, por ejemplo, 2026-02-30). */
export function esFechaValida(valor: string): boolean {
  const partes = FORMATO_FECHA.exec(valor);
  if (!partes) return false;
  const [anio, mes, dia] = partes.slice(1).map(Number) as [number, number, number];
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
}
