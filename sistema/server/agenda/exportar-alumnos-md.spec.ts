import { describe, expect, it } from "vitest";

import { exportar_alumnos_md } from "./exportar-alumnos-md";

describe("exportar_alumnos_md", () => {
  it("genera una sección por comisión con la tabla de ancho fijo", () => {
    const markdown = exportar_alumnos_md([
      {
        name: "Programación 4 - C1",
        assessments: [
          { id: "tp1", title: "TP 1" },
          { id: "tp2", title: "TP 2" },
          { id: "tp3", title: "TP 3" },
          { id: "tp4", title: "TP 4" },
        ],
        students: [
          {
            legajo: "54865",
            apellido: "Cequi",
            nombre: "Sofía",
            telefono: "(381)467-0231",
            github: "sofceq",
            asistencia: "4",
            assessmentStatuses: {
              tp1: "pendiente",
              tp2: "error",
              tp3: "falla",
              tp4: "presentado",
            },
          },
          {
            legajo: "63428",
            apellido: "Albornoz",
            nombre: "Tomás Emilio",
            telefono: "(381)548-4231",
            github: null,
            asistencia: "3",
            assessmentStatuses: {},
          },
        ],
      },
    ]);

    expect(markdown).toBe(
      [
        "# TUP 2026 - Programación IV",
        "",
        "## C1",
        "```text",
        "Legajo  Nombre y Apellido                         Teléfono        GitHub                     Asistencia  Practicos",
        "------  ----------------------------------------  --------------  -------------------------  ----------  ----------",
        "54865   Cequi, Sofía                              (381)467-0231   sofceq                     4           ⚫️🔴🟡🟢",
        "63428   Albornoz, Tomás Emilio                    (381)548-4231   -                          3           ⚫️⚫️⚫️⚫️",
        "```",
        "",
      ].join("\n"),
    );
  });

  it("ensancha una columna cuando un dato supera el mínimo", () => {
    const markdown = exportar_alumnos_md(
      [
        {
          name: "Comisión especial",
          assessments: [],
          students: [
            {
              legajo: "1234567",
              apellido: "Apellido extremadamente largo para la columna",
              nombre: "Nombre",
              telefono: null,
              github: null,
              asistencia: "0",
              assessmentStatuses: {},
            },
          ],
        },
      ],
      "Materia de prueba",
    );

    expect(markdown).toContain("# Materia de prueba\n\n## Comisión especial");
    expect(markdown).toContain(
      "1234567  Apellido extremadamente largo para la columna, Nombre  -               -                          0           -",
    );
  });
});
