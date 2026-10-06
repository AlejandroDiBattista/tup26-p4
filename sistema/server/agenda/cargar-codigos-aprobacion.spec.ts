import { createDb } from "@agent-native/core/db";
import { eq } from "@agent-native/core/db/schema";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import action from "../../actions/cargar-codigos-aprobacion";
import { getDb } from "../db/index";
import { assessmentResults } from "../db/schema";
import { cargarCodigosAprobacion } from "./cargar-codigos-aprobacion";
import { raiseAssessmentScore } from "./store";

let db: Awaited<ReturnType<typeof createDb>>;
vi.mock("../db/index.js", () => ({ getDb: () => db }));
const owner = "teacher@example.test";
const other = "other@example.test";

beforeEach(async () => {
  db = await createDb({ driver: "sqlite", filename: ":memory:" });
  if (!("exec" in db.$client)) throw new Error("Expected SQLite test database");
  db.$client.exec(`
    CREATE TABLE subjects (id TEXT PRIMARY KEY, name TEXT, academic_year INTEGER, term TEXT, owner_email TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE courses (id TEXT PRIMARY KEY, subject_id TEXT, name TEXT, commission TEXT, classroom TEXT, term TEXT, owner_email TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE students (id TEXT PRIMARY KEY, legajo TEXT, apellido TEXT, nombre TEXT, telefono TEXT, github TEXT, es_colaborador INTEGER, owner_email TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE enrollments (id TEXT PRIMARY KEY, course_id TEXT, student_id TEXT, owner_email TEXT, created_at TEXT);
    CREATE TABLE attendance (id TEXT PRIMARY KEY, session_id TEXT, student_id TEXT, status TEXT, owner_email TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE assessments (id TEXT PRIMARY KEY, subject_id TEXT, course_id TEXT, kind TEXT, title TEXT, date TEXT, graded INTEGER, sort_order INTEGER, owner_email TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE assessment_results (id TEXT PRIMARY KEY, assessment_id TEXT, student_id TEXT, status TEXT, submitted INTEGER, score REAL, owner_email TEXT, created_at TEXT, updated_at TEXT,
      UNIQUE (owner_email, assessment_id, student_id));
    INSERT INTO subjects VALUES ('subject', 'Programación IV', 2026, '', 'teacher@example.test', '', '');
    INSERT INTO courses VALUES ('c1', 'subject', 'C1', 'C1', '', '', 'teacher@example.test', '', '');
    INSERT INTO courses VALUES ('c3', 'subject', 'C3', 'C3', '', '', 'teacher@example.test', '', '');
    INSERT INTO courses VALUES ('other-course', 'other-subject', 'C1', 'C1', '', '', 'other@example.test', '', '');
    INSERT INTO students VALUES
      ('s1', '60001', 'Uno', 'Alumno', NULL, NULL, 0, 'teacher@example.test', '', ''),
      ('s2', '60002', 'Dos', 'Alumno', NULL, NULL, 0, 'teacher@example.test', '', ''),
      ('s3', '60003', 'Tres', 'Alumno', NULL, NULL, 0, 'teacher@example.test', '', ''),
      ('s4', '60004', 'Cuatro', 'Alumno', NULL, NULL, 0, 'teacher@example.test', '', ''),
      ('other-s1', '60001', 'Otro', 'Alumno', NULL, NULL, 0, 'other@example.test', '', ''),
      ('other-only', '69999', 'Ajeno', 'Alumno', NULL, NULL, 0, 'other@example.test', '', '');
    INSERT INTO enrollments VALUES
      ('e1', 'c1', 's1', 'teacher@example.test', ''), ('e2', 'c3', 's2', 'teacher@example.test', ''),
      ('e3', 'c1', 's3', 'teacher@example.test', ''), ('e4', 'c1', 's4', 'teacher@example.test', ''),
      ('eo1', 'other-course', 'other-s1', 'other@example.test', ''), ('eo2', 'other-course', 'other-only', 'other@example.test', '');
    INSERT INTO assessments VALUES
      ('exam', 'subject', 'c1', 'practico', 'Parcial', NULL, 1, 0, 'teacher@example.test', '', ''),
      ('work', 'subject', 'c1', 'practico', 'TP1', NULL, 0, 1, 'teacher@example.test', '', ''),
      ('other-exam', 'other-subject', 'other-course', 'practico', 'Otro parcial', NULL, 1, 0, 'other@example.test', '', '');
    INSERT INTO assessment_results VALUES
      ('r1', 'exam', 's1', 'presentado', 1, 8, 'teacher@example.test', '', 'original'),
      ('r2', 'exam', 's2', 'falla', 1, 5, 'teacher@example.test', '', 'original'),
      ('r3', 'exam', 's3', 'pendiente', 0, NULL, 'teacher@example.test', '', 'original'),
      ('ro1', 'other-exam', 'other-s1', 'presentado', 1, 9, 'other@example.test', '', 'original');
  `);
});
afterEach(() => {
  if (db && "close" in db.$client) db.$client.close();
});

async function saved(ownerEmail = owner) {
  return getDb()
    .select()
    .from(assessmentResults)
    .where(eq(assessmentResults.ownerEmail, ownerEmail));
}

describe("carga de códigos en SQL", () => {
  it("informa códigos de tres partes o con verificación inválida sin modificar notas", async () => {
    const before = await saved();
    expect(
      await cargarCodigosAprobacion(owner, "exam", "60001.20.abc 60002.20.abc.7 60003.20.abc.xx"),
    ).toMatchObject({
      detected: 0,
      updated: 0,
      failed: 0,
      invalid: [
        { legajo: "60001", reason: "format" },
        { legajo: "60002", reason: "format" },
        { legajo: "60003", reason: "format" },
      ],
    });
    expect(await saved()).toEqual(before);
  });

  it("solo mejora notas y guarda para ambas comisiones, sin tocar notas superiores", async () => {
    const result = await cargarCodigosAprobacion(
      owner,
      "exam",
      "60001.12.abc.42 60002.14.def.42 60003.19.uv0.42 60004.20.123.42",
    );
    expect(result).toMatchObject({ updated: 3, unchanged: 1, failed: 0 });
    const rows = await saved();
    expect(rows.find((row) => row.studentId === "s1")).toMatchObject({
      score: 8,
      updatedAt: "original",
    });
    expect(rows.find((row) => row.studentId === "s2")).toMatchObject({ score: 7, status: "falla" });
    expect(rows.find((row) => row.studentId === "s3")).toMatchObject({
      score: 9.5,
      status: "presentado",
    });
    expect(rows.find((row) => row.studentId === "s4")).toMatchObject({ score: 10 });
  });

  it("usa el máximo de los duplicados y una segunda carga no cambia nada", async () => {
    const text = "60001.14.abc.42 60001.18.def.42 60001.16.uv0.42";
    expect(await cargarCodigosAprobacion(owner, "exam", text)).toMatchObject({
      updated: 1,
      duplicates: 2,
    });
    const before = await saved();
    expect(await cargarCodigosAprobacion(owner, "exam", text)).toMatchObject({
      updated: 0,
      unchanged: 1,
    });
    expect(await saved()).toEqual(before);
  });

  it("previsualiza sin escribir, informa ajenos e inválidos y respeta al docente", async () => {
    const before = await saved();
    expect(
      await cargarCodigosAprobacion(
        owner,
        "exam",
        "60001.20.abc.42 69999.12.uv0.42 60002.21.abc.42",
        true,
      ),
    ).toMatchObject({ updated: 0, unknown: 1, invalid: [{ legajo: "60002", reason: "score" }] });
    expect(await saved()).toEqual(before);
    expect(
      await cargarCodigosAprobacion(owner, "exam", "60001.20.abc.42 69999.12.uv0.42"),
    ).toMatchObject({ updated: 1, unknown: 1 });
    expect(await saved(other)).toMatchObject([{ score: 9, updatedAt: "original" }]);
  });

  it("rechaza un trabajo sin nota, un trabajo ajeno y texto sin códigos", async () => {
    const before = await saved();
    await expect(cargarCodigosAprobacion(owner, "work", "60001.20.abc.42")).rejects.toThrow(
      "lleve nota",
    );
    await expect(cargarCodigosAprobacion(owner, "other-exam", "60001.20.abc.42")).rejects.toThrow(
      "No existe",
    );
    await expect(cargarCodigosAprobacion(owner, "exam", "hola 60001")).rejects.toThrow(
      "No se encontraron",
    );
    expect(await saved()).toEqual(before);
  });

  it("ante cargas concurrentes conserva la mayor nota y una sola fila", async () => {
    await Promise.all(
      [6, 10, 7, 8, 10, 6].map((score) =>
        raiseAssessmentScore(owner, {
          assessmentId: "exam",
          legajo: "60004",
          score,
        }),
      ),
    );
    const rows = (await saved()).filter((row) => row.studentId === "s4");
    expect(rows).toHaveLength(1);
    expect(rows[0].score).toBe(10);
  });

  it("informa un error por alumno y continúa con los demás", async () => {
    if (!("exec" in db.$client)) throw new Error("Expected SQLite");
    db.$client.exec(
      `CREATE TRIGGER reject_grade BEFORE INSERT ON assessment_results WHEN NEW.student_id = 's2' BEGIN SELECT RAISE(ABORT, 'No se pudo escribir'); END;`,
    );
    expect(
      await cargarCodigosAprobacion(owner, "exam", "60002.18.abc.42 60003.18.uv0.42"),
    ).toMatchObject({
      updated: 1,
      failed: 1,
      results: [
        { legajo: "60002", status: "failed" },
        { legajo: "60003", status: "updated", savedScore: 9 },
      ],
    });
    expect((await saved()).find((row) => row.studentId === "s2")?.score).toBe(5);
  });

  it("verifica la lectura antes de informar éxito", async () => {
    if (!("exec" in db.$client)) throw new Error("Expected SQLite");
    db.$client.exec(
      `CREATE TRIGGER corrupt_grade AFTER INSERT ON assessment_results WHEN NEW.student_id = 's4' BEGIN UPDATE assessment_results SET score = NULL WHERE id = NEW.id; END;`,
    );
    expect(await cargarCodigosAprobacion(owner, "exam", "60004.20.abc.42")).toMatchObject({
      updated: 0,
      failed: 1,
      results: [{ error: "No se pudo verificar la nota guardada." }],
    });
  });

  it("rechaza más de 500 códigos y no modifica el padrón", async () => {
    const before = await saved();
    await expect(
      cargarCodigosAprobacion(
        owner,
        "exam",
        Array.from({ length: 501 }, (_, i) => `${70000 + i}.12.abc.42`).join("\n"),
      ),
    ).rejects.toThrow("500");
    expect(await saved()).toEqual(before);
  });

  it("exige autenticación en la acción y valida el texto", async () => {
    await expect(
      action.run(
        { assessmentId: "exam", text: "60001.20.abc.42", dryRun: false },
        { caller: "http" },
      ),
    ).rejects.toThrow("autenticado");
    await expect(
      action.run({ assessmentId: "exam", text: " " }, { caller: "http", userEmail: owner }),
    ).rejects.toThrow();
    await expect(
      action.run(
        { assessmentId: "exam", text: "a".repeat(100_001) },
        { caller: "http", userEmail: owner },
      ),
    ).rejects.toThrow();
    expect(
      await action.run(
        { assessmentId: "exam", text: "60001.20.abc.42", dryRun: true },
        { caller: "http", userEmail: owner },
      ),
    ).toMatchObject({ dryRun: true, updated: 0 });
  });
});
