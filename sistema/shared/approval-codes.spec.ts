import { describe, expect, it } from "vitest";
import { parseApprovalCodes, previewApprovalCodes } from "./approval-codes";

describe("códigos de aprobación", () => {
  it.each([
    ["00", 10],
    ["20", 10],
    ["40", 10],
    ["60", 10],
    ["80", 10],
    ["12", 6],
    ["32", 6],
    ["92", 6],
    ["19", 9.5],
    ["99", 9.5],
    ["03", 1.5],
  ])("decodifica %s como %s sin redondear", (encoded, score) => {
    expect(parseApprovalCodes(`60001.${encoded}.a1B23.07`).entries).toEqual([
      { legajo: "60001", score },
    ]);
  });

  it("extrae mensajes mezclados, conserva ceros y elige la mayor nota de un alumno", () => {
    const parsed = parseApprovalCodes(
      `[6/10/26, 21:10] Alumno: 60001.12.abc.05\n60002.03.123.00; 60001.20.uv0.96, 60001.08.a1.42.`,
    );
    expect(parsed).toEqual({
      entries: [
        { legajo: "60001", score: 10 },
        { legajo: "60002", score: 1.5 },
      ],
      invalid: [],
      duplicates: 2,
    });
  });

  it("rechaza formatos incompletos y notas fuera del rango sin aceptar fragmentos", () => {
    const parsed = parseApprovalCodes(
      "60001.1.abc.42 60002.123.uv0.42 60003.12. 60004.12.abc.42.extra 60005.21.abc.42",
    );
    expect(parsed.entries).toEqual([]);
    expect(parsed.invalid.map((entry) => entry.reason)).toEqual([
      "format",
      "format",
      "format",
      "format",
      "score",
    ]);
    expect(parseApprovalCodes("prefijo60001.12.abc.42").entries).toEqual([]);
  });

  it("exige cuatro partes y sus longitudes sin rescatar fragmentos de códigos inválidos", () => {
    const invalidCodes = [
      "60001.12.abc",
      "60001.12.abc.4",
      "60001.12.abc.123",
      "60001.12.abc.xx",
      "6001.12.abc.42",
      "600001.12.abc.42",
      "60001.12..42",
      "60001.12.wxyz.42",
      "60001.12.abc.42.00",
      "60001.12.abc.42texto",
    ];
    const parsed = parseApprovalCodes(invalidCodes.join("\n"));
    expect(parsed.entries).toEqual([]);
    expect(parsed.invalid).toHaveLength(invalidCodes.length);
    expect(parsed.invalid.every((entry) => entry.reason === "format")).toBe(true);
  });

  it("usa solo la segunda parte para la nota, sin interpretar respuestas ni verificación", () => {
    expect(
      parseApprovalCodes("60001.32.0.00 60002.32.ABCUV012.99 60003.32.123456789.12").entries,
    ).toEqual([
      { legajo: "60001", score: 6 },
      { legajo: "60002", score: 6 },
      { legajo: "60003", score: 6 },
    ]);
    expect(parseApprovalCodes('"06001.20.0.07"').entries).toEqual([{ legajo: "06001", score: 10 }]);
  });

  it("distingue altas, notas menores/iguales y alumnos fuera del padrón", () => {
    expect(
      previewApprovalCodes(
        [
          { legajo: "1", score: 7 },
          { legajo: "2", score: 5 },
          { legajo: "3", score: 6 },
          { legajo: "4", score: 10 },
        ],
        [
          { legajo: "1", score: null },
          { legajo: "2", score: 8 },
          { legajo: "3", score: 6 },
        ],
      ).map((row) => row.status),
    ).toEqual(["planned", "unchanged", "unchanged", "unknown"]);
  });
});
