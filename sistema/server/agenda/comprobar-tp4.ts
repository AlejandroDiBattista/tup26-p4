import path from "node:path";
import { comprobarAlumno } from "../../tools/probar-tp4.js";
import { comprobarTrabajo } from "./comprobar-tp1.js";

export function ejecutarPruebaTp4(legajo: string) {
  return comprobarAlumno(legajo, path.resolve("../practicos"));
}

export function comprobarTp4(
  ownerEmail: string,
  assessmentId: string,
  legajos: string[],
  ejecutar = ejecutarPruebaTp4,
) {
  return comprobarTrabajo(ownerEmail, assessmentId, legajos, "tp4", ejecutar);
}
