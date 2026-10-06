import { beforeEach, expect, it, vi } from "vitest";
import { comprobarTp2 } from "./comprobar-tp2";
import { assessmentGrid, getAssessment, listStudents, setAssessmentResult } from "./store";

vi.mock("./store.js", () => ({ getAssessment: vi.fn(), listStudents: vi.fn(), setAssessmentResult: vi.fn(), assessmentGrid: vi.fn() }));
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getAssessment).mockResolvedValue({ title: "TP 2" } as never);
  vi.mocked(listStudents).mockResolvedValue([{ legajo: "100" }] as never);
  vi.mocked(assessmentGrid).mockResolvedValue({ rows: [{ legajo: "100", cells: [{ assessmentId: "tp2", status: "presentado" }] }] } as never);
});
it("guarda el estado del seleccionado, deduplica y devuelve el detalle", async () => {
  const run = vi.fn().mockResolvedValue({ legajo: "100", estado: "presentado", lineas: 100, detalle: "Compila." });
  const result = await comprobarTp2("teacher@example.test", "tp2", ["100", "100"], run);
  expect(run).toHaveBeenCalledTimes(1);
  expect(setAssessmentResult).toHaveBeenCalledExactlyOnceWith("teacher@example.test", { assessmentId: "tp2", legajo: "100", status: "presentado" });
  expect(result).toMatchObject({ updated: 1, failed: 0, results: [{ lineas: 100, detalle: "Compila." }] });
});
it("rechaza otro TP y alumnos ajenos sin guardar", async () => {
  const run = vi.fn();
  await expect(comprobarTp2("teacher@example.test", "tp2", ["999"], run)).rejects.toThrow("padrón");
  vi.mocked(getAssessment).mockResolvedValue({ title: "TP1" } as never);
  await expect(comprobarTp2("teacher@example.test", "tp1", ["100"], run)).rejects.toThrow("solo");
  expect(run).not.toHaveBeenCalled();
  expect(setAssessmentResult).not.toHaveBeenCalled();
});
it("un fallo técnico no altera el estado", async () => {
  const run = vi.fn().mockRejectedValue(new Error("timeout"));
  expect(await comprobarTp2("teacher@example.test", "tp2", ["100"], run)).toMatchObject({ updated: 0, failed: 1 });
  expect(setAssessmentResult).not.toHaveBeenCalled();
});
