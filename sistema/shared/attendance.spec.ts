import { describe, expect, it } from "vitest";
import {
  attendanceStatusForArrival,
  isRecentAttendanceDate,
  parseAttendanceLegajos,
  prepareAttendanceImport,
  recentAttendanceText,
  summarizeAttendance,
  todayInArgentina,
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

describe("importación reciente por las fechas del texto", () => {
  const rows = [
    { legajo: "60001", course: { id: "c1" } },
    { legajo: "60002", course: { id: "c3" } },
  ];
  const sessions = [
    { id: "old", courseId: "c1", date: "2026-10-26", startTime: "08:00", status: "programada" },
    { id: "first", courseId: "c1", date: "2026-10-27", startTime: "08:00", status: "programada" },
    { id: "c1-28", courseId: "c1", date: "2026-10-28", startTime: "08:00", status: "programada" },
    { id: "c3-28", courseId: "c3", date: "2026-10-28", startTime: "10:00", status: "programada" },
    { id: "c3-29", courseId: "c3", date: "2026-10-29", startTime: "10:00", status: "programada" },
    {
      id: "cancelled",
      courseId: "c1",
      date: "2026-10-29",
      startTime: "08:00",
      status: "cancelada",
    },
    {
      id: "unconfirmed",
      courseId: "c1",
      date: "2026-10-30",
      startTime: "08:00",
      status: "a_confirmar",
    },
    { id: "today", courseId: "c1", date: "2026-11-02", startTime: "08:00", status: "programada" },
    { id: "future", courseId: "c1", date: "2026-11-03", startTime: "08:00", status: "programada" },
  ];

  it("incluye hoy y hace seis días, pero excluye exactamente una semana, anteriores y futuros", () => {
    const text = ["25/10/26", "26/10/26", "27/10/26", "2/11/26", "3/11/26"]
      .map((date) => `[${date}, 08:10] Alumno: 60001 in`)
      .join("\n");
    expect(
      prepareAttendanceImport(text, rows, sessions, "2026-11-02").map((group) => group.date),
    ).toEqual(["2026-10-27", "2026-11-02"]);
    expect(isRecentAttendanceDate("2025-12-31", "2026-01-06")).toBe(true);
    expect(isRecentAttendanceDate("2025-12-30", "2026-01-06")).toBe(false);
  });

  it("carga varias fechas y comisiones con su propio horario y deduplica las salidas", () => {
    const groups = prepareAttendanceImport(
      `
[28/10/26, 8:19:59] Alumno: 60001 in
[28/10/26, 10:12:25] Alumno: 60002 in
[29/10/26, 10:20:00] Alumno: 60002 in
[29/10/26, 12:00:00] Alumno: 60002 out`,
      rows,
      sessions,
      "2026-11-02",
    );
    expect(groups).toEqual([
      { classId: "c1-28", date: "2026-10-28", entries: [{ legajo: "60001", status: "presente" }] },
      { classId: "c3-28", date: "2026-10-28", entries: [{ legajo: "60002", status: "presente" }] },
      { classId: "c3-29", date: "2026-10-29", entries: [{ legajo: "60002", status: "tarde" }] },
    ]);
  });

  it("no inventa fechas ni asistencias y exige alumno y clase programada de su comisión", () => {
    const text = `60001 sin fecha
[28/10/26, 10:10] Alumno: 60002
[28/10/26, 10:15] Desconocido: 60003
[29/10/26, 08:10] Clase cancelada: 60001
[30/10/26, 08:10] Clase a confirmar: 60001
[31/10/26, 08:10] Sin clase: 60001`;
    expect(prepareAttendanceImport(text, rows, sessions, "2026-11-02")).toEqual([
      { classId: "c3-28", date: "2026-10-28", entries: [{ legajo: "60002", status: "presente" }] },
    ]);
    expect(prepareAttendanceImport(text, rows.slice(0, 1), sessions, "2026-11-02")).toEqual([]);
    expect(prepareAttendanceImport("60001 60002", rows, sessions, "2026-11-02")).toEqual([]);
  });

  it("recorta texto y continuaciones al mismo período, sin perder ninguna fecha reciente", () => {
    const recent =
      "[27/10/26, 08:10] Alumno: 60001\ncontinuación\n[29/10/26, 10:10] Alumno: 60002\nsegunda línea";
    const text = `60003 sin fecha\n[26/10/26, 08:10] Alumno: 60001\nantiguo\n${recent}\n[3/11/26, 08:10] Alumno: 60001\nfuturo`;
    expect(recentAttendanceText(text, "2026-11-02")).toBe(recent);
  });

  it("usa el día argentino incluso cuando UTC ya cambió de fecha", () => {
    expect(todayInArgentina(new Date("2026-11-02T02:59:59Z"))).toBe("2026-11-01");
    expect(todayInArgentina(new Date("2026-11-02T03:00:00Z"))).toBe("2026-11-02");
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
