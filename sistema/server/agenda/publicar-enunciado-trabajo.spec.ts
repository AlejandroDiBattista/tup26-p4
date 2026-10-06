import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  ErrorPublicacionEnunciado,
  normalizar_identificador_enunciado,
  publicar_enunciado_trabajo,
  resolver_carpeta_enunciado,
} from "./publicar-enunciado-trabajo";

const temporaryDirectories: string[] = [];

async function temporaryWorkspace() {
  const root = await mkdtemp(path.join(os.tmpdir(), "publicar-enunciado-"));
  temporaryDirectories.push(root);
  const enunciados = path.join(root, "enunciados");
  const practicos = path.join(root, "practicos");
  await mkdir(path.join(enunciados, "tp1", "recursos"), { recursive: true });
  await writeFile(path.join(enunciados, "tp1", "README.md"), "consigna");
  await writeFile(
    path.join(enunciados, "tp1", "recursos", "base.js"),
    "export const base = true;",
  );
  return { root, enunciados, practicos };
}

const students = [
  { legajo: "10", apellido: "Pérez", nombre: "Ana" },
  { legajo: "20", apellido: "Gómez", nombre: "Zoé" },
];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("publicar_enunciado_trabajo", () => {
  it("normaliza el título y encuentra una carpeta equivalente", async () => {
    const { enunciados } = await temporaryWorkspace();

    expect(normalizar_identificador_enunciado("  T.P. Nº 1  ")).toBe("tpn1");
    await expect(
      resolver_carpeta_enunciado("TP 1", enunciados),
    ).resolves.toEqual(expect.objectContaining({ folder: "tp1" }));
  });

  it("genera primero las carpetas de alumnos y copia todo el árbol", async () => {
    const { enunciados, practicos } = await temporaryWorkspace();

    const result = await publicar_enunciado_trabajo(
      students,
      "TP 1",
      enunciados,
      practicos,
    );

    expect(result).toMatchObject({
      title: "TP 1",
      source: "tp1",
      total: 2,
      copied: 2,
      existing: 0,
      skipped: 0,
      failed: 0,
      folders: { created: 2, total: 2 },
    });
    expect(await readdir(practicos)).toEqual([
      "10 - Perez Ana",
      "20 - Gomez Zoe",
    ]);
    expect(
      await readFile(
        path.join(practicos, "10 - Perez Ana", "tp1", "README.md"),
        "utf8",
      ),
    ).toBe("consigna");
    expect(
      await readFile(
        path.join(practicos, "20 - Gomez Zoe", "tp1", "recursos", "base.js"),
        "utf8",
      ),
    ).toBe("export const base = true;");
  });

  it("en un reintento omite las carpetas publicadas y preserva cambios", async () => {
    const { enunciados, practicos } = await temporaryWorkspace();
    await publicar_enunciado_trabajo(students, "TP 1", enunciados, practicos);
    const studentFile = path.join(
      practicos,
      "10 - Perez Ana",
      "tp1",
      "README.md",
    );
    await writeFile(studentFile, "respuesta de la alumna");
    await writeFile(
      path.join(enunciados, "tp1", "README.md"),
      "nueva consigna",
    );

    const result = await publicar_enunciado_trabajo(
      students,
      "TP 1",
      enunciados,
      practicos,
    );

    expect(result).toMatchObject({
      total: 2,
      copied: 0,
      existing: 2,
      skipped: 2,
      failed: 0,
      folders: { existing: 2 },
    });
    expect(await readFile(studentFile, "utf8")).toBe("respuesta de la alumna");
  });

  it("informa claramente cuando falta la carpeta fuente", async () => {
    const { enunciados, practicos } = await temporaryWorkspace();

    await expect(
      publicar_enunciado_trabajo(students, "TP 2", enunciados, practicos),
    ).rejects.toThrow(
      "No se encontró el enunciado para “TP 2”. Se esperaba una carpeta equivalente a “tp2”",
    );
    expect(await readdir(practicos)).toEqual([
      "10 - Perez Ana",
      "20 - Gomez Zoe",
    ]);
  });

  it("rechaza dos carpetas con la misma clave normalizada", async () => {
    const { enunciados } = await temporaryWorkspace();
    await mkdir(path.join(enunciados, "tp-1"));

    await expect(
      resolver_carpeta_enunciado("TP 1", enunciados),
    ).rejects.toThrow("Hay más de una carpeta de enunciado equivalente");
  });

  it("rechaza enlaces simbólicos dentro del enunciado", async () => {
    const { root, enunciados } = await temporaryWorkspace();
    const external = path.join(root, "externo.txt");
    await writeFile(external, "no copiar");
    await symlink(external, path.join(enunciados, "tp1", "externo.txt"));

    await expect(
      resolver_carpeta_enunciado("TP 1", enunciados),
    ).rejects.toThrow("El enunciado no puede contener enlaces simbólicos");
  });

  it("continúa con los demás alumnos e informa un error parcial", async () => {
    const { enunciados, practicos } = await temporaryWorkspace();
    const firstStudent = path.join(practicos, "10 - Perez Ana");
    await mkdir(firstStudent, { recursive: true });
    await writeFile(path.join(firstStudent, "tp1"), "destino inválido");

    let captured: unknown;
    try {
      await publicar_enunciado_trabajo(students, "TP 1", enunciados, practicos);
    } catch (error) {
      captured = error;
    }

    expect(captured).toBeInstanceOf(ErrorPublicacionEnunciado);
    expect((captured as ErrorPublicacionEnunciado).result).toMatchObject({
      total: 2,
      copied: 1,
      existing: 0,
      failed: 1,
      results: [
        { legajo: "10", status: "failed" },
        { legajo: "20", status: "copied" },
      ],
    });
    expect(
      await readFile(
        path.join(practicos, "20 - Gomez Zoe", "tp1", "README.md"),
        "utf8",
      ),
    ).toBe("consigna");
  });
});
