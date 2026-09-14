import { createDb } from "@agent-native/core/db";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { findStudentByLegajo, upsertStudent } from "./store";

let db: Awaited<ReturnType<typeof createDb>>;
vi.mock("../db/index.js", () => ({ getDb: () => db }));

beforeEach(async () => {
  db = await createDb({ driver: "sqlite", filename: ":memory:" });
  if (!("exec" in db.$client)) throw new Error("Expected SQLite test database");
  db.$client.exec(`
    CREATE TABLE students (
      id TEXT PRIMARY KEY, legajo TEXT NOT NULL, apellido TEXT NOT NULL,
      nombre TEXT NOT NULL, telefono TEXT, github TEXT, es_colaborador INTEGER,
      owner_email TEXT NOT NULL, created_at TEXT, updated_at TEXT
    );
    INSERT INTO students VALUES
      ('a', '100', 'Apellido', 'Nombre', NULL, 'example-user', 1,
       'teacher@example.test', '', ''),
      ('b', '100', 'Otro', 'Alumno', NULL, 'another-user', 1,
       'other@example.test', '', '');
  `);
});

afterEach(() => {
  if (db && "close" in db.$client) db.$client.close();
});

describe("estado de colaboración", () => {
  it("persiste ambos estados y respeta el docente del alumno", async () => {
    await upsertStudent("teacher@example.test", { legajo: "100", esColaborador: false });
    expect(await findStudentByLegajo("teacher@example.test", "100")).toMatchObject({
      esColaborador: false, github: "example-user", apellido: "Apellido",
    });
    expect(await findStudentByLegajo("other@example.test", "100")).toMatchObject({
      esColaborador: true,
    });
    await upsertStudent("teacher@example.test", { legajo: "100", esColaborador: true });
    expect(await findStudentByLegajo("teacher@example.test", "100")).toMatchObject({
      esColaborador: true, github: "example-user", apellido: "Apellido",
    });
  });

  it("conserva colaboración si se omite el campo y la reinicia al cambiar GitHub", async () => {
    await upsertStudent("teacher@example.test", { legajo: "100", nombre: "Nuevo" });
    expect(await findStudentByLegajo("teacher@example.test", "100")).toMatchObject({ esColaborador: true });
    await upsertStudent("teacher@example.test", { legajo: "100", github: "new-user" });
    expect(await findStudentByLegajo("teacher@example.test", "100")).toMatchObject({ esColaborador: false });
  });

  it("rechaza marcar colaborador sin cuenta de GitHub", async () => {
    await expect(upsertStudent("teacher@example.test", {
      legajo: "100", github: "", esColaborador: true,
    })).rejects.toThrow("hace falta una cuenta de GitHub");
    expect(await findStudentByLegajo("teacher@example.test", "100")).toMatchObject({
      github: "example-user", esColaborador: true,
    });
  });
});
