import { beforeEach, describe, expect, it, vi } from "vitest";

import { comprobarTp1 } from "./comprobar-tp1";
import { assessmentGrid, getAssessment, listStudents, setAssessmentResult } from "./store";

vi.mock("./store.js", () => ({
  getAssessment: vi.fn(), listStudents: vi.fn(), setAssessmentResult: vi.fn(), assessmentGrid: vi.fn(),
}));
const owner = "teacher@example.test";
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getAssessment).mockResolvedValue({ title: "TP 1" } as never);
  vi.mocked(listStudents).mockResolvedValue([{ legajo: "100" }, { legajo: "200" }] as never);
  vi.mocked(assessmentGrid).mockResolvedValue({ rows: [
    { legajo: "100", cells: [{ assessmentId: "tp1", status: "presentado" }] },
  ] } as never);
});

describe("comprobar TP1", () => {
  it("actualiza solo los seleccionados, deduplica y verifica lo guardado", async () => {
    const run = vi.fn().mockResolvedValue({ legajo: "100", estado: "presentado" });
    const result = await comprobarTp1(owner, "tp1", ["100", "100"], run);
    expect(run).toHaveBeenCalledTimes(1);
    expect(getAssessment).toHaveBeenCalledWith(owner, "tp1");
    expect(listStudents).toHaveBeenCalledWith(owner);
    expect(setAssessmentResult).toHaveBeenCalledExactlyOnceWith(owner, { assessmentId: "tp1", legajo: "100", status: "presentado" });
    expect(assessmentGrid).toHaveBeenCalledWith(owner);
    expect(result).toMatchObject({ updated: 1, failed: 0 });
  });

  it("rechaza otro TP o un legajo ajeno antes de ejecutar programas", async () => {
    const run = vi.fn();
    await expect(comprobarTp1(owner, "tp1", ["999"], run)).rejects.toThrow("padrón");
    vi.mocked(getAssessment).mockResolvedValue({ title: "TP 2" } as never);
    await expect(comprobarTp1(owner, "tp2", ["100"], run)).rejects.toThrow("solo");
    expect(run).not.toHaveBeenCalled();
    expect(setAssessmentResult).not.toHaveBeenCalled();
  });

  it("no cambia estados si el comprobador falla, pero guarda los demás", async () => {
    const run = vi.fn().mockImplementation(async (legajo) => {
      if (legajo === "200") throw new Error("timeout");
      return { legajo, estado: "presentado" };
    });
    const result = await comprobarTp1(owner, "tp1", ["100", "200"], run);
    expect(result).toMatchObject({ updated: 1, failed: 1 });
    expect(setAssessmentResult).toHaveBeenCalledTimes(1);
    expect(result.results.find((row) => row.legajo === "200")?.error).toBeTruthy();
  });

  it("no informa éxito cuando la lectura no confirma el estado", async () => {
    const run = vi.fn().mockResolvedValue({ legajo: "100", estado: "falla" });
    expect(await comprobarTp1(owner, "tp1", ["100"], run)).toMatchObject({ updated: 0, failed: 1 });
  });
});
