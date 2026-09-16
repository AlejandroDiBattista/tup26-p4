export interface ResultadoTp2 {
  estado: "pendiente" | "error" | "presentado";
  lineas: number;
  detalle: string;
}
export function comprobarArchivo(programa: string): Promise<ResultadoTp2>;
export function comprobarAlumno(legajo: string, root?: string): Promise<ResultadoTp2 & { legajo: string }>;
