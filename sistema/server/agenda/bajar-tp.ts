import type { AlumnoParaCarpeta } from "./genera-carpetas-alumnos.js";
import type { ResultadoSincronizacion } from "./sincronizar-repositorio.js";

export interface PullRequest {
  number: number;
  title: string;
  html_url: string;
  state: string;
  changed_files: number;
  head: { sha: string };
  base: { ref: string; sha: string };
  user: { login: string } | null;
  draft: boolean;
  merged: boolean;
  merge_commit_sha: string | null;
}

export interface AlumnoParaEntrega extends AlumnoParaCarpeta {
  github?: string | null;
}

export interface PullRequestFile {
  filename: string;
  previous_filename?: string;
}

export interface GitHubParaBajarTp {
  listOpen(): Promise<Array<Pick<PullRequest, "number" | "title" | "html_url">>>;
  get(number: number): Promise<PullRequest>;
  files(number: number): Promise<PullRequestFile[]>;
  rename(number: number, title: string): Promise<void>;
  merge(number: number, sha: string, title: string): Promise<{ merged: boolean; sha: string }>;
}

export interface ResultadoPr {
  number: number;
  url: string;
  previousTitle: string;
  title?: string;
  status: "merged" | "skipped" | "failed" | "planned";
  renamed: boolean;
  mergeSha?: string;
  detail?: string;
}

export interface ResultadoBajarTp {
  sync?: ResultadoSincronizacion;
  total: number;
  renamed: number;
  merged: number;
  skipped: number;
  failed: number;
  planned: number;
  results: ResultadoPr[];
}

function carpetaEntrega(filename: string) {
  const parts = filename.split("/");
  if (
    parts.length < 4 ||
    parts.some((part) => !part || part === "." || part === "..") ||
    filename.includes("\\")
  )
    return null;
  if (parts[0] !== "practicos") return null;
  const student = parts[1].match(/^(\d+)(?:\s*-\s*.+)?$/u);
  const tp = parts[2].match(/^tp[\s_-]*(\d+)$/i);
  if (!student || !tp) return null;
  const number = Number(tp[1]);
  if (!Number.isSafeInteger(number) || number < 1) return null;
  return { folder: parts.slice(0, 3).join("/"), legajo: student[1], tp: number };
}

export function identificarTituloPr(
  files: PullRequestFile[],
  students: AlumnoParaCarpeta[],
): { title: string; legajo: string } | { detail: string } {
  if (!files.length) return { detail: "El PR no tiene archivos modificados." };
  let delivery: ReturnType<typeof carpetaEntrega> = null;
  for (const file of files) {
    // Los renombres también modifican la ruta anterior: no deben ocultar
    // cambios fuera de la entrega ni movimientos entre alumnos o trabajos.
    for (const filename of [
      file.filename,
      ...(file.previous_filename ? [file.previous_filename] : []),
    ]) {
      const current = carpetaEntrega(filename);
      if (!current)
        return {
          detail: "Hay archivos fuera de una carpeta de entrega practicos/Legajo - Nombre/tpN.",
        };
      if (delivery && current.folder !== delivery.folder)
        return { detail: "El PR modifica más de una carpeta de alumno o de trabajo práctico." };
      delivery = current;
    }
  }
  const matching = students.filter((student) => student.legajo === delivery!.legajo);
  if (matching.length !== 1)
    return { detail: `El legajo ${delivery!.legajo} no identifica un único alumno en el padrón.` };
  const student = matching[0];
  const apellido = student.apellido.trim().replace(/\s+/gu, " ");
  const nombre = student.nombre.trim().replace(/\s+/gu, " ");
  if (!apellido || !nombre)
    return { detail: `El alumno ${student.legajo} no tiene apellido y nombre completos.` };
  return {
    title: `TP ${String(delivery!.tp).padStart(2, "0")} - ${student.legajo} - ${apellido} ${nombre}`,
    legajo: student.legajo,
  };
}

function mismaEntrega(before: PullRequest, current: PullRequest): boolean {
  return (
    current.state === "open" &&
    !current.draft &&
    current.head.sha === before.head.sha &&
    current.base.ref === before.base.ref &&
    current.base.sha === before.base.sha &&
    current.changed_files === before.changed_files &&
    current.user?.login.toLowerCase() === before.user?.login.toLowerCase()
  );
}

/** Revisa todas las páginas de PR abiertos, sin depender del TP o filtro de la pantalla. */
export async function bajarTp(
  students: AlumnoParaEntrega[],
  github: GitHubParaBajarTp,
  dryRun = false,
): Promise<ResultadoBajarTp> {
  const pulls = await github.listOpen();
  const results: ResultadoPr[] = [];
  for (const pull of pulls) {
    const result: ResultadoPr = {
      number: pull.number,
      url: pull.html_url,
      previousTitle: pull.title,
      status: "skipped",
      renamed: false,
    };
    try {
      const before = await github.get(pull.number);
      result.previousTitle = before.title;
      if (before.state !== "open") {
        result.detail = "El PR ya no está abierto.";
      } else if (before.draft) {
        result.detail = "El PR es un borrador; el alumno debe marcarlo como listo para revisión.";
      } else if (before.changed_files > 3000) {
        result.detail = "GitHub no permite comprobar todos los archivos de este PR (más de 3000).";
      } else {
        const files = await github.files(pull.number);
        if (files.length !== before.changed_files) {
          result.detail = "No se pudo comprobar la lista completa de archivos del PR.";
        } else {
          const identified = identificarTituloPr(files, students);
          if ("detail" in identified) result.detail = identified.detail;
          else {
            result.title = identified.title;
            const student = students.find((student) => student.legajo === identified.legajo)!;
            if (
              !student.github?.trim() ||
              student.github.trim().toLowerCase() !== before.user?.login.toLowerCase()
            ) {
              result.detail =
                "El autor del PR no coincide con la cuenta GitHub del alumno dueño de la carpeta en el padrón.";
            } else {
              const current = await github.get(pull.number);
              if (!mismaEntrega(before, current) || current.title !== before.title) {
                result.detail = "El PR cambió durante la revisión. Volvé a ejecutar Bajar TP.";
              } else if (dryRun) result.status = "planned";
              else {
                if (before.title !== identified.title) {
                  await github.rename(pull.number, identified.title);
                  const renamed = await github.get(pull.number);
                  if (renamed.title !== identified.title)
                    throw new Error("No se pudo verificar el título guardado en GitHub.");
                  result.renamed = true;
                  if (!mismaEntrega(before, renamed)) {
                    result.detail =
                      "El PR cambió después de normalizar el título. Volvé a ejecutar Bajar TP.";
                    results.push(result);
                    continue;
                  }
                }
                // GitHub rechaza el merge si cambió el commit revisado o si
                // existen conflictos o reglas de protección que lo impidan.
                const merged = await github.merge(pull.number, before.head.sha, identified.title);
                if (!merged.merged) throw new Error("GitHub no completó el merge del PR.");
                const verified = await github.get(pull.number);
                if (
                  !verified.merged ||
                  verified.state !== "closed" ||
                  verified.merge_commit_sha !== merged.sha
                )
                  throw new Error("No se pudo verificar el merge guardado en GitHub.");
                if (verified.title !== identified.title)
                  throw new Error("No se pudo verificar el título guardado en GitHub.");
                result.status = "merged";
                result.mergeSha = merged.sha;
              }
            }
          }
        }
      }
    } catch (error) {
      result.status = "failed";
      result.detail = error instanceof Error ? error.message : "No se pudo procesar el PR.";
    }
    results.push(result);
  }
  const count = (status: ResultadoPr["status"]) =>
    results.filter((result) => result.status === status).length;
  return {
    total: results.length,
    renamed: results.filter((result) => result.renamed).length,
    merged: count("merged"),
    skipped: count("skipped"),
    failed: count("failed"),
    planned: count("planned"),
    results,
  };
}
