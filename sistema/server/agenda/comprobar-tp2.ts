import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { z } from "zod";
import { comprobarTrabajo } from "./comprobar-tp1.js";

const execFileAsync = promisify(execFile);
const resultSchema = z.object({
  legajo: z.string(),
  estado: z.enum(["pendiente", "error", "presentado"]),
  detalle: z.string(),
  lineas: z.number().int().nonnegative(),
});

export async function ejecutarPruebaTp2(legajo: string) {
  const { stdout } = await execFileAsync(process.execPath,
    [path.resolve("tools/probar-tp2.js"), "--json", legajo],
    { timeout: 20_000, killSignal: "SIGKILL", maxBuffer: 1024 * 1024, env: {} });
  const [result] = z.array(resultSchema).length(1).parse(JSON.parse(stdout));
  return result;
}

export function comprobarTp2(ownerEmail: string, assessmentId: string, legajos: string[], ejecutar = ejecutarPruebaTp2) {
  return comprobarTrabajo(ownerEmail, assessmentId, legajos, "tp2", ejecutar);
}
