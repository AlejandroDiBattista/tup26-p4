import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  genera_carpetas_alumnos,
  nombre_carpeta_alumno,
  normalizar_nombre_carpeta,
} from "./genera-carpetas-alumnos";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("genera_carpetas_alumnos", () => {
  it("normaliza el legajo y el nombre de la carpeta", () => {
    expect(normalizar_nombre_carpeta("  González Núñez  ")).toBe(
      "Gonzalez Nunez",
    );
    expect(
      nombre_carpeta_alumno({
        legajo: " 63204 ",
        apellido: "García Núñez",
        nombre: "Germán Ariel",
      }),
    ).toBe("63204 - Garcia Nunez German Ariel");
  });

  it("crea una carpeta por alumno y conserva las existentes", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "practicos-alumnos-"));
    temporaryDirectories.push(root);
    const practicos = path.join(root, "practicos");
    await mkdir(path.join(practicos, "54865 - Cequi Sofia"), {
      recursive: true,
    });

    const students = [
      { legajo: "54865", apellido: "Cequi", nombre: "Sofía" },
      { legajo: "61984", apellido: "Álvarez", nombre: "Martín" },
    ];

    const result = await genera_carpetas_alumnos(students, practicos);

    expect(result).toMatchObject({
      total: 2,
      created: 1,
      existing: 1,
      renamed: 0,
    });
    expect(await readdir(practicos)).toEqual([
      "54865 - Cequi Sofia",
      "61984 - Alvarez Martin",
    ]);

    const secondRun = await genera_carpetas_alumnos(students, practicos);
    expect(secondRun).toMatchObject({
      total: 2,
      created: 0,
      existing: 2,
      renamed: 0,
    });
  });

  it("renombra la carpeta del mismo legajo y conserva su contenido", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "practicos-alumnos-"));
    temporaryDirectories.push(root);
    const practicos = path.join(root, "practicos");
    const previousFolder = "61984 - alvarez nombre anterior";
    await mkdir(path.join(practicos, previousFolder), { recursive: true });
    await writeFile(
      path.join(practicos, previousFolder, "entrega.txt"),
      "contenido del alumno",
    );

    const result = await genera_carpetas_alumnos(
      [{ legajo: "61984", apellido: "Álvarez", nombre: "Martín" }],
      practicos,
    );

    expect(result).toMatchObject({
      total: 1,
      created: 0,
      existing: 0,
      renamed: 1,
      renames: [
        {
          from: "61984 - alvarez nombre anterior",
          to: "61984 - Alvarez Martin",
        },
      ],
    });
    expect(await readdir(practicos)).toEqual(["61984 - Alvarez Martin"]);
    expect(
      await readFile(
        path.join(practicos, "61984 - Alvarez Martin", "entrega.txt"),
        "utf8",
      ),
    ).toBe("contenido del alumno");
  });

  it("rechaza dos carpetas diferentes para un mismo legajo", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "practicos-alumnos-"));
    temporaryDirectories.push(root);
    const practicos = path.join(root, "practicos");
    await mkdir(path.join(practicos, "61984 - nombre uno"), {
      recursive: true,
    });
    await mkdir(path.join(practicos, "61984 - nombre dos"));

    await expect(
      genera_carpetas_alumnos(
        [{ legajo: "61984", apellido: "Álvarez", nombre: "Martín" }],
        practicos,
      ),
    ).rejects.toThrow("Hay más de una carpeta para el legajo 61984");
  });
});
