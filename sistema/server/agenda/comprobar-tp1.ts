import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { z } from "zod";

import { normalizar_identificador_enunciado } from "./publicar-enunciado-trabajo.js";
import { assessmentGrid, getAssessment, listStudents, setAssessmentResult } from "./store.js";

const execFileAsync = promisify(execFile);
const resultSchema = z.object({
  legajo: z.string(),
  estado: z.enum(["pendiente", "error", "falla", "presentado"]),
});

export async function ejecutarPruebaTp1(legajo: string) {
  const { stdout } = await execFileAsync(
    process.execPath,
    [path.resolve("tools/probar-tp1.js"), "--json", legajo],
    { timeout: 20_000, killSignal: "SIGKILL", maxBuffer: 1024 * 1024, env: {} },
  );
  const [result] = z.array(resultSchema).length(1).parse(JSON.parse(stdout));
  if (result.legajo !== legajo) throw new Error("La prueba devolvió otro legajo.");
  return result;
}

export async function comprobarTp1(
  ownerEmail: string,
  assessmentId: string,
  legajos: string[],
  ejecutar = ejecutarPruebaTp1,
) {
  const assessment = await getAssessment(ownerEmail, assessmentId);
  if (normalizar_identificador_enunciado(assessment.title) !== "tp1") {
    throw new Error("Esta comprobación solo está disponible para TP1.");
  }
  const roster = await listStudents(ownerEmail);
  const allowed = new Set(roster.map((student) => student.legajo));
  const selected = [...new Set(legajos)];
  if (!selected.length || selected.some((legajo) => !/^\d+$/.test(legajo) || !allowed.has(legajo))) {
    throw new Error("Seleccioná alumnos de tu padrón para comprobar TP1.");
  }

  const results: Array<{ legajo: string; status?: z.infer<typeof resultSchema>["estado"]; error?: string }> = [];
  let next = 0;
  // Keep the server responsive and bound the number of student processes.
  await Promise.all(Array.from({ length: Math.min(4, selected.length) }, async () => {
    while (next < selected.length) {
      const legajo = selected[next++];
      try {
        const result = await ejecutar(legajo);
        results.push({ legajo, status: result.estado });
      } catch {
        results.push({ legajo, error: "No se pudo ejecutar la comprobación. El estado no se modificó." });
      }
    }
  }));

  for (const result of results) {
    if (!result.status) continue;
    try {
      await setAssessmentResult(ownerEmail, { assessmentId, legajo: result.legajo, status: result.status });
    } catch {
      result.error = "No se pudo guardar el resultado.";
    }
  }
  const saved = await assessmentGrid(ownerEmail);
  for (const result of results) {
    if (result.error) continue;
    const cell = saved.rows.find((row) => row.legajo === result.legajo)?.cells
      .find((item) => item.assessmentId === assessmentId);
    if (cell?.status !== result.status) result.error = "No se pudo verificar el estado guardado.";
  }
  return {
    updated: results.filter((result) => !result.error).length,
    failed: results.filter((result) => result.error).length,
    results,
  };
}
