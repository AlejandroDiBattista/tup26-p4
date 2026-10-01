import path from "node:path";
import { comprobarAlumno } from "../../tools/probar-tp3.js";
import { comprobarTrabajo } from "./comprobar-tp1.js";

export async function ejecutarPruebaTp3(legajo: string) {
  // TP3 solo lee archivos: no necesita iniciar otro runtime por cada alumno.
  // Las rutas explícitas también funcionan cuando Nitro agrupa este módulo.
  return comprobarAlumno(
    legajo,
    path.resolve("../practicos"),
    path.resolve("../enunciados/tp3/agenda.html"),
  );
}

export function comprobarTp3(
  ownerEmail: string,
  assessmentId: string,
  legajos: string[],
  ejecutar = ejecutarPruebaTp3,
) {
  return comprobarTrabajo(ownerEmail, assessmentId, legajos, "tp3", ejecutar);
}
