import { randomUUID } from "node:crypto";
import { cp, lstat, readdir, realpath, rename, rm } from "node:fs/promises";
import path from "node:path";

import {
  genera_carpetas_alumnos,
  nombre_carpeta_alumno,
  type AlumnoParaCarpeta,
  type ResultadoCarpetasAlumnos,
} from "./genera-carpetas-alumnos.js";

export type EstadoPublicacionEnunciado = "copied" | "existing" | "failed";

export interface ResultadoAlumnoPublicacion {
  legajo: string;
  folder: string;
  status: EstadoPublicacionEnunciado;
  error?: string;
}

export interface ResultadoPublicacionEnunciado {
  title: string;
  source: string;
  total: number;
  copied: number;
  existing: number;
  skipped: number;
  failed: number;
  folders: ResultadoCarpetasAlumnos;
  results: ResultadoAlumnoPublicacion[];
}

export class ErrorPublicacionEnunciado extends Error {
  readonly result: ResultadoPublicacionEnunciado;

  constructor(result: ResultadoPublicacionEnunciado) {
    const details = result.results
      .filter((item) => item.status === "failed")
      .map((item) => `${item.legajo}: ${item.error}`)
      .join("; ");
    super(
      `El enunciado se publicó parcialmente: ${result.copied} copiados, ${result.existing} omitidos y ${result.failed} con error.${details ? ` ${details}` : ""}`,
    );
    this.name = "ErrorPublicacionEnunciado";
    this.result = result;
  }
}

/**
 * Genera la clave que relaciona el título del trabajo con su carpeta fuente.
 * Por ejemplo, `TP 1`, `tp-1` y `tp1` producen la clave `tp1`.
 */
export function normalizar_identificador_enunciado(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("es")
    .replace(/[ªº]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function isWithin(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return (
    relative !== "" &&
    !relative.startsWith(`..${path.sep}`) &&
    relative !== ".." &&
    !path.isAbsolute(relative)
  );
}

async function validar_arbol_sin_enlaces(directory: string): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(
        `El enunciado no puede contener enlaces simbólicos: ${entry.name}.`,
      );
    }
    if (entry.isDirectory()) await validar_arbol_sin_enlaces(entryPath);
  }
}

export async function resolver_carpeta_enunciado(
  title: string,
  enunciadosDirectory: string,
): Promise<{ directory: string; folder: string }> {
  const expected = normalizar_identificador_enunciado(title);
  if (!expected) {
    throw new Error(
      "El título del trabajo no permite identificar una carpeta de enunciado.",
    );
  }

  const configuredRoot = path.resolve(enunciadosDirectory);
  let root: string;
  try {
    root = await realpath(configuredRoot);
  } catch {
    throw new Error(`No existe la carpeta de enunciados: ${configuredRoot}.`);
  }

  const entries = await readdir(root, { withFileTypes: true });
  const candidates = entries.filter(
    (entry) => entry.isDirectory() || entry.isSymbolicLink(),
  );
  const matches = candidates.filter(
    (entry) => normalizar_identificador_enunciado(entry.name) === expected,
  );

  if (matches.length === 0) {
    const available = candidates.map((entry) => entry.name).sort();
    throw new Error(
      `No se encontró el enunciado para “${title}”. Se esperaba una carpeta equivalente a “${expected}” dentro de enunciados. Carpetas disponibles: ${available.length ? available.join(", ") : "ninguna"}.`,
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Hay más de una carpeta de enunciado equivalente a “${title}”: ${matches
        .map((entry) => entry.name)
        .sort()
        .join(", ")}.`,
    );
  }

  const match = matches[0];
  if (match.isSymbolicLink()) {
    throw new Error(
      `La carpeta de enunciado “${match.name}” no puede ser un enlace simbólico.`,
    );
  }

  const directory = await realpath(path.join(root, match.name));
  const stats = await lstat(directory);
  if (!stats.isDirectory() || !isWithin(root, directory)) {
    throw new Error(
      `La carpeta de enunciado “${match.name}” está fuera del directorio permitido.`,
    );
  }
  await validar_arbol_sin_enlaces(directory);
  return { directory, folder: match.name };
}

async function estadoDestino(
  destination: string,
): Promise<"missing" | "directory" | "invalid"> {
  try {
    const stats = await lstat(destination);
    return stats.isDirectory() && !stats.isSymbolicLink()
      ? "directory"
      : "invalid";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return "missing";
    throw error;
  }
}

/**
 * Publica el directorio completo del enunciado en la carpeta de cada alumno.
 * Primero genera/actualiza las carpetas del padrón. Nunca sobrescribe una
 * publicación existente, porque puede contener cambios realizados por el
 * alumno.
 */
export async function publicar_enunciado_trabajo(
  students: AlumnoParaCarpeta[],
  title: string,
  enunciadosDirectory: string,
  practicosDirectory: string,
): Promise<ResultadoPublicacionEnunciado> {
  const folders = await genera_carpetas_alumnos(students, practicosDirectory);
  const source = await resolver_carpeta_enunciado(title, enunciadosDirectory);
  const practicosRoot = await realpath(path.resolve(practicosDirectory));
  const results: ResultadoAlumnoPublicacion[] = [];

  for (const student of students) {
    const studentFolder = nombre_carpeta_alumno(student);
    let destination: string | undefined;
    let temporary: string | undefined;
    try {
      const studentDirectory = await realpath(
        path.join(practicosRoot, studentFolder),
      );
      if (!isWithin(practicosRoot, studentDirectory)) {
        throw new Error(
          "La carpeta del alumno está fuera del directorio permitido.",
        );
      }

      destination = path.join(studentDirectory, source.folder);
      const destinationState = await estadoDestino(destination);
      if (destinationState === "directory") {
        results.push({
          legajo: student.legajo,
          folder: studentFolder,
          status: "existing",
        });
        continue;
      }
      if (destinationState === "invalid") {
        throw new Error(
          `Ya existe “${source.folder}”, pero no es una carpeta segura.`,
        );
      }

      temporary = path.join(
        studentDirectory,
        `.${source.folder}.publicando-${randomUUID()}`,
      );
      await cp(source.directory, temporary, {
        recursive: true,
        force: false,
        errorOnExist: true,
        dereference: false,
      });
      await rename(temporary, destination);
      temporary = undefined;
      results.push({
        legajo: student.legajo,
        folder: studentFolder,
        status: "copied",
      });
    } catch (error) {
      if (temporary) {
        await rm(temporary, { recursive: true, force: true });
      }
      let destinationWasCreated = false;
      if (destination) {
        try {
          destinationWasCreated =
            (await estadoDestino(destination)) === "directory";
        } catch {
          // El error original contiene el contexto más útil para este alumno.
        }
      }
      if (destinationWasCreated) {
        results.push({
          legajo: student.legajo,
          folder: studentFolder,
          status: "existing",
        });
      } else {
        results.push({
          legajo: student.legajo,
          folder: studentFolder,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const copied = results.filter((item) => item.status === "copied").length;
  const existing = results.filter((item) => item.status === "existing").length;
  const failed = results.filter((item) => item.status === "failed").length;
  const result: ResultadoPublicacionEnunciado = {
    title,
    source: source.folder,
    total: students.length,
    copied,
    existing,
    skipped: existing,
    failed,
    folders,
    results,
  };

  if (failed > 0) throw new ErrorPublicacionEnunciado(result);
  return result;
}
