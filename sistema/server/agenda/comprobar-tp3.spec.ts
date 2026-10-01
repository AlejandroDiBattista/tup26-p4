import { beforeEach, expect, it, vi } from "vitest";
import { comprobarTp3 } from "./comprobar-tp3";
import * as script from "../../tools/probar-tp3.js";
import path from "node:path";
import { assessmentGrid, getAssessment, listStudents, setAssessmentResult } from "./store";

vi.mock("./store.js", () => ({
  getAssessment: vi.fn(),
  listStudents: vi.fn(),
  setAssessmentResult: vi.fn(),
  assessmentGrid: vi.fn(),
}));
beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.mocked(getAssessment).mockResolvedValue({ title: "TP 3" } as never);
  vi.mocked(listStudents).mockResolvedValue([{ legajo: "100" }, { legajo: "101" }] as never);
  vi.mocked(assessmentGrid).mockResolvedValue({
    rows: [
      { legajo: "100", cells: [{ assessmentId: "tp3", status: "presentado" }] },
      { legajo: "101", cells: [{ assessmentId: "tp3", status: "pendiente" }] },
    ],
  } as never);
});
it("lee las entregas directamente con rutas explícitas, sin iniciar otro runtime", async () => {
  const read = vi.spyOn(script, "comprobarAlumno").mockResolvedValue({
    legajo: "100",
    estado: "presentado",
    lineas: 100,
    detalle: "100 líneas agregadas.",
  });
  expect(await comprobarTp3("teacher@example.test", "tp3", ["100"])).toMatchObject({
    updated: 1,
    failed: 0,
  });
  expect(read).toHaveBeenCalledExactlyOnceWith(
    "100",
    path.resolve("../practicos"),
    path.resolve("../enunciados/tp3/agenda.html"),
  );
});
it("guarda y verifica los estados y el detalle de los seleccionados, deduplicando legajos", async () => {
  const run = vi.fn(async (legajo: string) => ({
    legajo,
    estado: legajo === "100" ? ("presentado" as const) : ("pendiente" as const),
    lineas: legajo === "100" ? 100 : 99,
    detalle: "Líneas agregadas respecto del enunciado.",
  }));
  const result = await comprobarTp3("teacher@example.test", "tp3", ["100", "100", "101"], run);
  expect(run).toHaveBeenCalledTimes(2);
  expect(setAssessmentResult).toHaveBeenCalledWith("teacher@example.test", {
    assessmentId: "tp3",
    legajo: "100",
    status: "presentado",
  });
  expect(setAssessmentResult).toHaveBeenCalledWith("teacher@example.test", {
    assessmentId: "tp3",
    legajo: "101",
    status: "pendiente",
  });
  expect(result).toMatchObject({ updated: 2, failed: 0 });
  expect(result.results).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ legajo: "100", lineas: 100 }),
      expect.objectContaining({ legajo: "101", lineas: 99 }),
    ]),
  );
  expect(getAssessment).toHaveBeenCalledWith("teacher@example.test", "tp3");
  expect(listStudents).toHaveBeenCalledWith("teacher@example.test");
});
it("rechaza otro TP y alumnos ajenos sin guardar", async () => {
  const run = vi.fn();
  await expect(comprobarTp3("teacher@example.test", "tp3", ["999"], run)).rejects.toThrow("padrón");
  vi.mocked(getAssessment).mockResolvedValue({ title: "TP2" } as never);
  await expect(comprobarTp3("teacher@example.test", "tp2", ["100"], run)).rejects.toThrow("solo");
  expect(run).not.toHaveBeenCalled();
  expect(setAssessmentResult).not.toHaveBeenCalled();
});
it("un fallo técnico o un resultado de otro alumno no alteran el estado", async () => {
  const run = vi.fn().mockRejectedValueOnce(new Error("timeout")).mockResolvedValueOnce({
    legajo: "999",
    estado: "presentado",
    lineas: 150,
    detalle: "Otro alumno",
  });
  expect(await comprobarTp3("teacher@example.test", "tp3", ["100", "101"], run)).toMatchObject({
    updated: 0,
    failed: 2,
  });
  expect(setAssessmentResult).not.toHaveBeenCalled();
});
it("informa si el estado guardado no coincide al verificarlo", async () => {
  const run = vi.fn().mockResolvedValue({
    legajo: "100",
    estado: "pendiente",
    lineas: 50,
    detalle: "Faltan líneas.",
  });
  expect(await comprobarTp3("teacher@example.test", "tp3", ["100"], run)).toMatchObject({
    updated: 0,
    failed: 1,
    results: [{ error: "No se pudo verificar el estado guardado." }],
  });
});
it("informa que el guardado falló por una base dañada", async () => {
  vi.mocked(setAssessmentResult).mockRejectedValue(new Error("database disk image is malformed"));
  const run = vi
    .fn()
    .mockResolvedValue({
      legajo: "100",
      estado: "presentado",
      lineas: 150,
      detalle: "150 líneas agregadas.",
    });
  expect(await comprobarTp3("teacher@example.test", "tp3", ["100"], run)).toMatchObject({
    updated: 0,
    failed: 1,
    results: [
      {
        status: "presentado",
        error: "No se pudo guardar el resultado: la base de datos está dañada.",
      },
    ],
  });
});
