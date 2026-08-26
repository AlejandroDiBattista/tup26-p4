import { describe, expect, it } from "vitest";

import { agregarConteoClasesPresentes } from "./conteo-clases-presentes";

describe("agregarConteoClasesPresentes", () => {
  it("asigna el conteo agregado y completa con cero los alumnos sin presentes", () => {
    const roster = [
      { id: "student-1", legajo: "100" },
      { id: "student-2", legajo: "200" },
    ];

    expect(
      agregarConteoClasesPresentes(roster, [
        { studentId: "student-1", clasesPresentes: "3" },
      ]),
    ).toEqual([
      { id: "student-1", legajo: "100", clasesPresentes: 3 },
      { id: "student-2", legajo: "200", clasesPresentes: 0 },
    ]);
  });

  it("ignora conteos de alumnos que no pertenecen al padrón solicitado", () => {
    expect(
      agregarConteoClasesPresentes(
        [{ id: "student-1" }],
        [{ studentId: "student-2", clasesPresentes: 5 }],
      ),
    ).toEqual([{ id: "student-1", clasesPresentes: 0 }]);
  });
});
