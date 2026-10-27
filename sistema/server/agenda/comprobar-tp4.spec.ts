import path from "node:path";
import { beforeEach, expect, it, vi } from "vitest";
import action from "../../actions/comprobar-tp4";
import * as script from "../../tools/probar-tp4.js";
import { comprobarTp4 } from "./comprobar-tp4";
import { assessmentGrid, getAssessment, listStudents, setAssessmentResult } from "./store";

vi.mock("./store.js", () => ({
  getAssessment: vi.fn(), listStudents: vi.fn(), setAssessmentResult: vi.fn(),
  assessmentGrid: vi.fn(), requireUserEmail: (email?: string) => {
    if (!email) throw new Error("Falta el docente.");
    return email;
  },
}));
beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.mocked(getAssessment).mockResolvedValue({ title: "TP 4" } as never);
  vi.mocked(listStudents).mockResolvedValue([{ legajo: "100" }, { legajo: "101" }] as never);
  vi.mocked(assessmentGrid).mockResolvedValue({ rows: [
    { legajo: "100", cells: [{ assessmentId: "tp4", status: "presentado" }] },
    { legajo: "101", cells: [{ assessmentId: "tp4", status: "pendiente" }] },
  ] } as never);
});

it("la acción usa el docente autenticado y lee los archivos directamente", async () => {
  const leer = vi.spyOn(script, "comprobarAlumno").mockResolvedValue({
    legajo: "100", estado: "presentado", detalle: "Entrega encontrada.",
  });
  expect(await action.run({ assessmentId: "tp4", legajos: ["100"] }, {
    userEmail: "teacher@example.test", caller: "http",
  })).toMatchObject({ updated: 1, failed: 0 });
  expect(leer).toHaveBeenCalledExactlyOnceWith("100", path.resolve("../practicos"));
  expect(getAssessment).toHaveBeenCalledWith("teacher@example.test", "tp4");
  expect(setAssessmentResult).toHaveBeenCalledExactlyOnceWith("teacher@example.test", {
    assessmentId: "tp4", legajo: "100", status: "presentado",
  });
});
it("guarda y verifica solo los seleccionados, deduplicando y conservando el detalle", async () => {
  const ejecutar = vi.fn(async (legajo: string) => ({
    legajo, estado: legajo === "100" ? "presentado" as const : "pendiente" as const,
    detalle: legajo === "100" ? "Entrega encontrada." : "Falta MiniCRM.html.",
  }));
  const result = await comprobarTp4("teacher@example.test", "tp4", ["100", "100", "101"], ejecutar);
  expect(ejecutar).toHaveBeenCalledTimes(2);
  expect(setAssessmentResult).toHaveBeenCalledTimes(2);
  expect(result).toMatchObject({ updated: 2, failed: 0 });
  expect(result.results).toContainEqual({ legajo: "101", status: "pendiente", detalle: "Falta MiniCRM.html." });
});
it("rechaza otro TP, una selección vacía y alumnos fuera del padrón antes de escribir", async () => {
  const ejecutar = vi.fn();
  await expect(comprobarTp4("teacher@example.test", "tp4", ["999"], ejecutar)).rejects.toThrow("padrón");
  await expect(comprobarTp4("teacher@example.test", "tp4", [], ejecutar)).rejects.toThrow("padrón");
  vi.mocked(getAssessment).mockResolvedValue({ title: "TP 3" } as never);
  await expect(comprobarTp4("teacher@example.test", "tp3", ["100"], ejecutar)).rejects.toThrow("solo");
  expect(ejecutar).not.toHaveBeenCalled();
  expect(setAssessmentResult).not.toHaveBeenCalled();
});
it("un fallo técnico o un legajo incorrecto conservan el estado anterior", async () => {
  const ejecutar = vi.fn().mockRejectedValueOnce(new Error("EACCES")).mockResolvedValueOnce({
    legajo: "999", estado: "presentado", detalle: "Entrega de otro alumno.",
  });
  expect(await comprobarTp4("teacher@example.test", "tp4", ["100", "101"], ejecutar))
    .toMatchObject({ updated: 0, failed: 2 });
  expect(setAssessmentResult).not.toHaveBeenCalled();
});
it("reporta la verificación fallida y los errores de guardado", async () => {
  const ejecutar = vi.fn().mockResolvedValue({ legajo: "100", estado: "pendiente", detalle: "Falta la entrega." });
  expect(await comprobarTp4("teacher@example.test", "tp4", ["100"], ejecutar))
    .toMatchObject({ updated: 0, failed: 1, results: [{ error: "No se pudo verificar el estado guardado." }] });
  vi.mocked(setAssessmentResult).mockRejectedValue(new Error("database disk image is malformed"));
  expect(await comprobarTp4("teacher@example.test", "tp4", ["100"], ejecutar))
    .toMatchObject({ updated: 0, failed: 1, results: [{ error: expect.stringContaining("base de datos está dañada") }] });
});
