import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);
let queue = Promise.resolve();

export interface ResultadoSincronizacion {
  status: "updated" | "current" | "failed";
  detail: string;
  commit?: string;
}

/** Git conserva los cambios locales: nunca usar reset, clean, stash ni merge forzado. */
export async function sincronizarRepositorio(
  root: string,
  branch: string,
  remote: string,
  fetchEnv: NodeJS.ProcessEnv = process.env,
): Promise<ResultadoSincronizacion> {
  // FETCH_HEAD e index son compartidos por todas las ejecuciones del sistema.
  const previous = queue;
  let release!: () => void;
  queue = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  const git = async (args: string[], env = process.env) =>
    (await exec("git", args, { cwd: root, env, timeout: 120_000, maxBuffer: 1024 * 1024 })).stdout.trim();
  try {
    await git(["check-ref-format", "--branch", branch]);
    const currentBranch = await git(["symbolic-ref", "--short", "HEAD"]);
    if (currentBranch !== branch)
      return {
        status: "failed",
        detail: `La copia local está en ${currentBranch}; cambiá a ${branch} antes de bajar las entregas.`,
      };
    const before = await git(["rev-parse", "HEAD"]);
    await git(["fetch", "--no-tags", "--", remote, `refs/heads/${branch}`], fetchEnv);
    const target = await git(["rev-parse", "FETCH_HEAD"]);
    await git(["-c", "core.hooksPath=/dev/null", "merge", "--ff-only", "--no-edit", target]);
    const commit = await git(["rev-parse", "HEAD"]);
    if (commit !== target) throw new Error("El commit local no coincide con el remoto.");
    return {
      status: before === commit ? "current" : "updated",
      detail: before === commit
        ? "La copia local ya contiene las entregas fusionadas en GitHub."
        : "Se descargaron las entregas fusionadas en GitHub conservando los cambios locales.",
      commit,
    };
  } catch {
    // Los errores de fetch pueden incluir información de autenticación.
    return {
      status: "failed",
      detail: "No se pudo actualizar la copia local. Revisá la conexión, los cambios locales en conflicto o si la rama tiene commits divergentes. Los cambios locales se conservan; el control de presentados sigue leyendo esta copia.",
    };
  } finally {
    release();
  }
}
