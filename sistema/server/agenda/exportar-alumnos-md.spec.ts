import { describe, expect, it } from "vitest";

import { exportar_alumnos_md } from "./exportar-alumnos-md";

describe("exportar_alumnos_md", () => {
  it("genera una sección por comisión con la tabla de ancho fijo", () => {
    const markdown = exportar_alumnos_md([
      {
        name: "Programación 4 - C1",
        students: [
          {
            legajo: "54865",
            apellido: "Cequi",
            nombre: "Sofía",
            telefono: "(381)467-0231",
            github: "sofceq",
          },
          {
            legajo: "63428",
            apellido: "Albornoz",
            nombre: "Tomás Emilio",
            telefono: "(381)548-4231",
            github: null,
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
        "Legajo  Nombre y Apellido                         Teléfono        GitHub",
        "------  ----------------------------------------  --------------  -------------------------",
        "54865   Cequi, Sofía                              (381)467-0231   sofceq",
        "63428   Albornoz, Tomás Emilio                    (381)548-4231   -",
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
          students: [
            {
              legajo: "1234567",
              apellido: "Apellido extremadamente largo para la columna",
              nombre: "Nombre",
              telefono: null,
              github: null,
            },
          ],
        },
      ],
      "Materia de prueba",
    );

    expect(markdown).toContain("# Materia de prueba\n\n## Comisión especial");
    expect(markdown).toContain(
      "1234567  Apellido extremadamente largo para la columna, Nombre  -               -",
    );
  });
});
