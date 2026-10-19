import { describe, expect, it } from "vitest";
import {
  attendanceStatusForArrival,
  parseAttendanceLegajos,
  summarizeAttendance,
} from "./attendance";

describe("llegadas tarde", () => {
  it("marca tarde desde los 20 minutos inclusive y usa el inicio de cada comisión", () => {
    const result = parseAttendanceLegajos(`
[19/10/2026, 19:19:59] WhatsApp: 60001
[19/10/2026, 19:20] WhatsApp: 60002
[19/10/2026, 19:21] WhatsApp: 60003`);
    expect(
      result.entries.map((entry) => attendanceStatusForArrival(entry.arrivalMinutes, "19:00")),
    ).toEqual(["presente", "tarde", "tarde"]);
    expect(attendanceStatusForArrival(result.entries[1].arrivalMinutes, "20:00")).toBe("presente");
  });

  it("conserva el primer horario por alumno y fecha aunque se repita fuera de orden", () => {
    const result = parseAttendanceLegajos(`
[19/10/2026, 19:25] WhatsApp: 60001
[19/10/2026, 19:10] WhatsApp: 60001
[19/10/2026, 19:40] WhatsApp: 60001
[20/10/2026, 19:30] WhatsApp: 60001`);
    expect(result.entries).toEqual([
      { legajo: "60001", date: "2026-10-19", arrivalMinutes: 1150 },
      { legajo: "60001", date: "2026-10-20", arrivalMinutes: 1170 },
    ]);
  });

  it("conserva fecha y hora del mensaje en las líneas siguientes", () => {
    const result = parseAttendanceLegajos(`
[19/10/2026, 19:25] Alumno: presente
60001
60002
[20/10/2026, 19:10] Alumno: 60003
60004`);
    expect(result.entries.map(({ date, arrivalMinutes }) => [date, arrivalMinutes])).toEqual([
      ["2026-10-19", 1165],
      ["2026-10-19", 1165],
      ["2026-10-20", 1150],
      ["2026-10-20", 1150],
    ]);
  });

  it("acepta hora antes de la fecha, año corto y horas de 12 horas", () => {
    const result = parseAttendanceLegajos(`
[19:20, 19/10/26] Alumno: 60001
[19/10/2026, 7:20 p. m.] Alumno: 60002
[19/10/2026, 12:20 a. m.] Alumno: 60003`);
    expect(result.entries.map((entry) => entry.arrivalMinutes)).toEqual([1160, 1160, 20]);
  });

  it("sin hora o sin inicio no inventa una tardanza y mantiene la carga de listas simples", () => {
    const result = parseAttendanceLegajos("50000 60001 65000 49999 65001", "2026-10-19");
    expect(result.valid).toEqual(["50000", "60001", "65000"]);
    expect(result.invalid).toEqual(["49999", "65001"]);
    expect(result.entries.every((entry) => entry.arrivalMinutes === null)).toBe(true);
    expect(attendanceStatusForArrival(null, "19:00")).toBe("presente");
    expect(attendanceStatusForArrival(1160, null)).toBe("presente");
    expect(
      parseAttendanceLegajos("[19/10/2026, 29:99] 60001").entries[0].arrivalMinutes,
    ).toBeNull();
  });

  it("no registra una fecha inexistente", () => {
    expect(parseAttendanceLegajos("[31/02/2026, 19:20] 60001").entries).toEqual([]);
  });
});

describe("cómputo de asistencia", () => {
  it("tarde vale medio presente y justificada no integra el denominador", () => {
    expect(summarizeAttendance(["presente", "tarde", "ausente", "justificada", null])).toEqual({
      presentes: 1,
      tardes: 1,
      ausentes: 1,
      justificadas: 1,
      asistencias: 1.5,
      marcadas: 4,
      porcentaje: 50,
    });
    expect(summarizeAttendance(["tarde"]).porcentaje).toBe(50);
    expect(summarizeAttendance(["justificada", null]).porcentaje).toBeNull();
  });
});
