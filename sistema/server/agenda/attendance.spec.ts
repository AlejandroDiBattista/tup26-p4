import { createDb } from "@agent-native/core/db";
import { eq } from "@agent-native/core/db/schema";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import action from "../../actions/set-attendance";
import { getDb } from "../db/index";
import { attendance } from "../db/schema";
import { attendanceGrid, listStudents, setAttendance, studentSummary } from "./store";

let db: Awaited<ReturnType<typeof createDb>>;
vi.mock("../db/index.js", () => ({ getDb: () => db }));
const owner = "teacher@example.test";

beforeEach(async () => {
  db = await createDb({ driver: "sqlite", filename: ":memory:" });
  if (!("exec" in db.$client)) throw new Error("Expected SQLite test database");
  db.$client.exec(`
    CREATE TABLE subjects (id TEXT PRIMARY KEY, name TEXT, academic_year INTEGER, term TEXT, owner_email TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE courses (id TEXT PRIMARY KEY, subject_id TEXT, name TEXT, commission TEXT, classroom TEXT, term TEXT, owner_email TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE students (id TEXT PRIMARY KEY, legajo TEXT, apellido TEXT, nombre TEXT, telefono TEXT, github TEXT, es_colaborador INTEGER, owner_email TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE enrollments (id TEXT PRIMARY KEY, course_id TEXT, student_id TEXT, owner_email TEXT, created_at TEXT);
    CREATE TABLE class_sessions (id TEXT PRIMARY KEY, course_id TEXT, date TEXT, start_time TEXT, end_time TEXT, status TEXT, cancellation_reason TEXT, cancellation_note TEXT, topic TEXT, owner_email TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE attendance (id TEXT PRIMARY KEY, session_id TEXT, student_id TEXT, status TEXT, present INTEGER, owner_email TEXT, created_at TEXT, updated_at TEXT,
      UNIQUE (owner_email, session_id, student_id));
    CREATE TABLE assessments (id TEXT PRIMARY KEY, subject_id TEXT, course_id TEXT, kind TEXT, title TEXT, date TEXT, graded INTEGER, sort_order INTEGER, owner_email TEXT, created_at TEXT, updated_at TEXT);
    INSERT INTO subjects VALUES ('subject', 'Programación IV', 2026, '', 'teacher@example.test', '', '');
    INSERT INTO courses VALUES
      ('c1', 'subject', 'C1', 'C1', '', '', 'teacher@example.test', '', ''),
      ('c3', 'subject', 'C3', 'C3', '', '', 'teacher@example.test', '', '');
    INSERT INTO students VALUES
      ('s1', '60001', 'Uno', 'Alumno', NULL, NULL, 0, 'teacher@example.test', '', ''),
      ('s2', '60002', 'Dos', 'Alumno', NULL, NULL, 0, 'teacher@example.test', '', '');
    INSERT INTO enrollments VALUES
      ('e1', 'c1', 's1', 'teacher@example.test', ''),
      ('e2', 'c3', 's2', 'teacher@example.test', '');
    INSERT INTO class_sessions VALUES
      ('cl1', 'c1', '2026-01-01', '19:00', '21:00', 'programada', NULL, NULL, NULL, 'teacher@example.test', '', ''),
      ('cl2', 'c1', '2026-01-02', '19:00', '21:00', 'programada', NULL, NULL, NULL, 'teacher@example.test', '', ''),
      ('cl3', 'c1', '2026-01-03', '19:00', '21:00', 'programada', NULL, NULL, NULL, 'teacher@example.test', '', ''),
      ('cl4', 'c1', '2026-01-04', '19:00', '21:00', 'programada', NULL, NULL, NULL, 'teacher@example.test', '', ''),
      ('other-class', 'c3', '2026-01-05', '20:00', '22:00', 'programada', NULL, NULL, NULL, 'teacher@example.test', '', '');
  `);
});

afterEach(() => {
  if (db && "close" in db.$client) db.$client.close();
});

describe("asistencia tarde en SQL", () => {
  it("acepta tarde en la acción, guarda, relee y permite corregir o limpiar", async () => {
    expect(
      await action.run(
        { classId: "cl1", entries: [{ legajo: "60001", status: "tarde" }] },
        { caller: "http", userEmail: owner },
      ),
    ).toMatchObject({ updated: [{ legajo: "60001", status: "tarde" }] });
    expect(
      await getDb().select().from(attendance).where(eq(attendance.sessionId, "cl1")),
    ).toMatchObject([{ status: "tarde", present: false }]);
    await setAttendance(owner, {
      sessionId: "cl1",
      entries: [{ legajo: "60001", status: "presente" }],
    });
    expect(await getDb().select().from(attendance)).toMatchObject([
      { status: "presente", present: true },
    ]);
    await setAttendance(owner, { sessionId: "cl1", entries: [{ legajo: "60001", status: null }] });
    expect(await getDb().select().from(attendance)).toEqual([]);
  });

  it("computa media asistencia en padrón, grilla y ficha, solo en su comisión", async () => {
    for (const [sessionId, status] of [
      ["cl1", "presente"],
      ["cl2", "tarde"],
      ["cl3", "ausente"],
      ["cl4", "justificada"],
    ]) {
      await setAttendance(owner, { sessionId, entries: [{ legajo: "60001", status }] });
    }
    expect(
      (await listStudents(owner)).find((student) => student.legajo === "60001")?.clasesPresentes,
    ).toBe(1.5);
    const grid = await attendanceGrid(owner);
    const row = grid.rows.find((student) => student.legajo === "60001");
    expect(row).toMatchObject({
      presentes: 1,
      tardes: 1,
      ausentes: 1,
      justificadas: 1,
      asistencias: 1.5,
      porcentaje: 50,
    });
    expect(row?.cells).toHaveLength(4);
    expect(grid.rows.find((student) => student.legajo === "60002")?.cells).toHaveLength(1);
    expect((await studentSummary(owner, "60001")).totales).toMatchObject({
      clasesPresentes: 1,
      clasesTarde: 1,
      clasesAusentes: 1,
      clasesJustificadas: 1,
      clasesMarcadas: 4,
      asistencias: 1.5,
      asistenciaPorcentaje: 50,
    });
  });

  it("rechaza alumnos de otra comisión y clases de otro docente sin guardar", async () => {
    await expect(
      setAttendance(owner, { sessionId: "cl1", entries: [{ legajo: "60002", status: "tarde" }] }),
    ).rejects.toThrow("no pertenece");
    await expect(
      setAttendance("other@example.test", {
        sessionId: "cl1",
        entries: [{ legajo: "60001", status: "tarde" }],
      }),
    ).rejects.toThrow();
    expect(await getDb().select().from(attendance)).toEqual([]);
  });
});
