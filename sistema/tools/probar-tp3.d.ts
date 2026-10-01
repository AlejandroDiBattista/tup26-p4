export interface ResultadoTp3 {
  estado: "pendiente" | "presentado";
  /** Líneas agregadas respecto de enunciados/tp3/agenda.html. */
  lineas: number;
  detalle: string;
}
export function comprobarArchivo(programa: string, original?: string): Promise<ResultadoTp3>;
export function comprobarAlumno(
  legajo: string,
  root?: string,
  original?: string,
): Promise<ResultadoTp3 & { legajo: string }>;
