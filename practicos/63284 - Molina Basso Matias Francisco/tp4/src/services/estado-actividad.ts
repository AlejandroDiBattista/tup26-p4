import type { Actividad } from "../db/schema.js";

export type ActividadConEstado = Actividad & {
  completada: boolean;
  vencida: boolean;
};

export function fechaHoy(ahora = new Date()): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ahora);
  const valor = (tipo: string) =>
    partes.find((parte) => parte.type === tipo)!.value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

export function estadoActividad(
  actividad: Actividad,
  hoy = fechaHoy(),
): ActividadConEstado {
  const completada = actividad.fechaFinalizacion !== null;
  const vencida =
    !completada &&
    actividad.fechaCompromiso !== null &&
    actividad.fechaCompromiso < hoy;
  return { ...actividad, completada, vencida };
}
