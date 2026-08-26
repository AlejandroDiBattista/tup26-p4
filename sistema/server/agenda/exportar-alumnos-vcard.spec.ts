import { describe, expect, it } from "vitest";

import {
  exportar_alumnos_vcard,
  normalizarTelefonoVCard,
} from "./exportar-alumnos-vcard";

describe("exportar_alumnos_vcard", () => {
  it("genera una tarjeta vCard por alumno con datos importables", () => {
    const vcard = exportar_alumnos_vcard([
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
            telefono: null,
            github: null,
          },
          {
            legajo: "54865",
            apellido: "Cequi",
            nombre: "Sofía",
            telefono: "(381)467-0231",
            github: "sofceq",
          },
        ],
      },
    ]);

    expect(vcard).toBe(
      [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Cequi;Sofía;;;",
        "FN:Cequi\\, Sofía",
        "TEL;TYPE=CELL:+5493814670231",
        "URL:https://github.com/sofceq",
        "NOTE:Legajo: 54865",
        "CATEGORIES:Alumnos",
        "END:VCARD",
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Albornoz;Tomás Emilio;;;",
        "FN:Albornoz\\, Tomás Emilio",
        "NOTE:Legajo: 63428",
        "CATEGORIES:Alumnos",
        "END:VCARD",
        "",
      ].join("\r\n"),
    );
  });

  it("normaliza teléfonos locales e internacionales", () => {
    expect(normalizarTelefonoVCard("(381)467-0231")).toBe("+5493814670231");
    expect(normalizarTelefonoVCard("+54 9 381 467-0231")).toBe(
      "+5493814670231",
    );
    expect(normalizarTelefonoVCard("00 54 9 381 467-0231")).toBe(
      "+5493814670231",
    );
    expect(normalizarTelefonoVCard(null)).toBeNull();
  });
});
