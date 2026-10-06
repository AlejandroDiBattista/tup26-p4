import { mkdir, readdir, rename } from "node:fs/promises";
import path from "node:path";

export interface AlumnoParaCarpeta {
  legajo: string;
  apellido: string;
  nombre: string;
}

export interface ResultadoCarpetasAlumnos {
  directory: string;
  total: number;
  created: number;
  existing: number;
  renamed: number;
  folders: string[];
  renames: Array<{ from: string; to: string }>;
}

/**
 * Convierte nombres de personas a un formato seguro y estable para carpetas:
 * conserva mayúsculas y minúsculas, quita acentos y signos, y deja un único
 * espacio entre palabras.
 */
export function normalizar_nombre_carpeta(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function nombre_carpeta_alumno(student: AlumnoParaCarpeta): string {
  const legajo = normalizar_nombre_carpeta(student.legajo).replace(/\s+/g, "");
  const apellido = normalizar_nombre_carpeta(student.apellido);
  const nombre = normalizar_nombre_carpeta(student.nombre);

  if (!legajo || !apellido || !nombre) {
    throw new Error(
      "Cada alumno necesita legajo, apellido y nombre para generar su carpeta.",
    );
  }

  return `${legajo} - ${apellido} ${nombre}`;
}

function legajoDeCarpeta(folder: string): string | null {
  const match = folder.match(/^(.+?)\s+-\s+.+$/);
  if (!match) return null;
  const legajo = normalizar_nombre_carpeta(match[1])
    .replace(/\s+/g, "")
    .toLocaleLowerCase("es");
  return legajo || null;
}

function agregarCarpetaPorLegajo(
  foldersByLegajo: Map<string, string[]>,
  folder: string,
): void {
  const legajo = legajoDeCarpeta(folder);
  if (!legajo) return;
  const current = foldersByLegajo.get(legajo) ?? [];
  current.push(folder);
  foldersByLegajo.set(legajo, current);
}

/**
 * Crea dentro de `practicosDirectory` una carpeta por alumno. Si ya existe una
 * carpeta con el mismo legajo y otro nombre, la renombra conservando todo su
 * contenido. La operación es idempotente y nunca elimina archivos.
 */
export async function genera_carpetas_alumnos(
  students: AlumnoParaCarpeta[],
  practicosDirectory: string,
): Promise<ResultadoCarpetasAlumnos> {
  const directory = path.resolve(practicosDirectory);
  await mkdir(directory, { recursive: true });

  const folders = students.map(nombre_carpeta_alumno).sort();
  const expectedByLegajo = new Map<string, string>();
  for (const folder of folders) {
    const legajo = legajoDeCarpeta(folder);
    if (!legajo) throw new Error(`Nombre de carpeta inválido: ${folder}`);
    if (expectedByLegajo.has(legajo)) {
      throw new Error(`Hay más de un alumno con el legajo ${legajo}.`);
    }
    expectedByLegajo.set(legajo, folder);
  }

  const foldersByLegajo = new Map<string, string[]>();
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory())
      agregarCarpetaPorLegajo(foldersByLegajo, entry.name);
  }

  let created = 0;
  let existing = 0;
  let renamed = 0;
  const renames: Array<{ from: string; to: string }> = [];

  for (const [legajo, folder] of expectedByLegajo) {
    const target = path.join(directory, folder);
    const matchingFolders = foldersByLegajo.get(legajo) ?? [];
    const alternatives = matchingFolders.filter(
      (current) => current !== folder,
    );

    // Se compara con el nombre devuelto por readdir para distinguir cambios
    // solo de mayúsculas en sistemas de archivos que ignoran el casing.
    if (matchingFolders.includes(folder)) {
      if (alternatives.length > 0) {
        throw new Error(
          `Hay más de una carpeta para el legajo ${legajo}: ${[folder, ...alternatives].join(", ")}.`,
        );
      }
      existing += 1;
      continue;
    }

    if (alternatives.length > 1) {
      throw new Error(
        `Hay más de una carpeta para el legajo ${legajo}: ${alternatives.join(", ")}.`,
      );
    }

    if (alternatives.length === 1) {
      const previousFolder = alternatives[0];
      await rename(path.join(directory, previousFolder), target);
      renamed += 1;
      renames.push({ from: previousFolder, to: folder });
      foldersByLegajo.set(legajo, [folder]);
      continue;
    }

    await mkdir(target);
    created += 1;
    foldersByLegajo.set(legajo, [folder]);
  }

  return {
    directory,
    total: folders.length,
    created,
    existing,
    renamed,
    folders,
    renames,
  };
}
