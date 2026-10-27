export interface ResultadoTp4 {
  estado: "pendiente" | "presentado";
  detalle: string;
  legajo: string;
}
export function comprobarAlumno(legajo: string, root?: string): Promise<ResultadoTp4>;
