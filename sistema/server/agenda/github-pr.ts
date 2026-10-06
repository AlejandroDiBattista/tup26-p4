import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import { resolveCredential, type CredentialContext } from "@agent-native/core/credentials";
import { getRequestIsLoopback } from "@agent-native/core/server/request-context";
import { Octokit } from "octokit";

import type { GitHubParaBajarTp } from "./bajar-tp.js";
import { sincronizarRepositorio, type ResultadoSincronizacion } from "./sincronizar-repositorio.js";

const exec = promisify(execFile);

export function repositorioDeRemote(remote: string): { owner: string; repo: string } {
  const match = remote
    .trim()
    .match(
      /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([^/\s]+)\/([^/\s]+?)(?:\.git)?\/?$/i,
    );
  if (!match) throw new Error("El remote origin debe identificar un repositorio de github.com.");
  return { owner: match[1], repo: match[2] };
}

async function tokenGitHub(ctx: CredentialContext): Promise<string> {
  const saved = await resolveCredential("GITHUB_TOKEN", ctx);
  if (saved?.trim()) return saved.trim();

  // Solo la sesión automática local puede reutilizar la cuenta del CLI del
  // docente. En producción y para otros usuarios se exige su secreto propio.
  if (
    process.env.NODE_ENV === "development" &&
    getRequestIsLoopback() &&
    ["dev@local.test", "dev@local"].includes(ctx.userEmail)
  ) {
    try {
      const { stdout } = await exec("gh", ["auth", "token", "--hostname", "github.com"], {
        timeout: 10_000,
        maxBuffer: 16_384,
      });
      if (stdout.trim()) return stdout.trim();
    } catch {
      // No devolver errores del CLI: podrían contener datos de autenticación.
    }
  }
  throw new Error(
    "Configurá GITHUB_TOKEN en los secretos de tu usuario con permisos de lectura y escritura de Pull requests y Contents para este repositorio.",
  );
}

export async function conectarGitHubPr(
  ctx: CredentialContext,
): Promise<{ repository: string; github: GitHubParaBajarTp; synchronize: () => Promise<ResultadoSincronizacion> }> {
  let remote: string;
  try {
    const { stdout } = await exec("git", ["remote", "get-url", "origin"], {
      cwd: path.resolve(process.cwd(), ".."),
      timeout: 10_000,
    });
    remote = stdout;
  } catch {
    throw new Error("No se pudo identificar el repositorio Git del sistema (remote origin).");
  }
  const repository = repositorioDeRemote(remote);
  const token = await tokenGitHub(ctx);
  const client = new Octokit({ auth: token, request: { timeout: 30_000 } });
  // Evitar devolver errores de Octokit, que incluyen el request autenticado.
  async function request<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const status =
        typeof error === "object" && error && "status" in error ? Number(error.status) : null;
      if (status === 401) throw new Error("GitHub rechazó la credencial. Revisá GITHUB_TOKEN.");
      if (status === 403 || status === 429)
        throw new Error(
          "GitHub denegó la operación. Revisá los permisos del token o el límite de solicitudes.",
        );
      if (status === 404)
        throw new Error(
          "GitHub no encontró el repositorio o el PR, o la credencial no tiene acceso.",
        );
      if (status === 405)
        throw new Error(
          "GitHub no permite el merge: revisá conflictos, borradores o reglas de protección de la rama.",
        );
      if (status === 409)
        throw new Error(
          "El PR cambió o tiene conflictos. Volvé a ejecutar Bajar TP después de resolverlos.",
        );
      if (status === 422)
        throw new Error(
          "GitHub rechazó el merge. Revisá los requisitos del repositorio y el método de integración permitido.",
        );
      throw new Error(
        `No se pudo completar la operación en GitHub${status ? ` (HTTP ${status})` : ". Revisá la conexión"}.`,
      );
    }
  }
  return {
    repository: `${repository.owner}/${repository.repo}`,
    synchronize: async () => {
      try {
        const { data } = await request(() => client.rest.repos.get(repository));
        // HTTPS usa exclusivamente la credencial del mismo docente que revisó
        // los PR. No reutiliza cuentas SSH, helpers ni prompts del sistema.
        return await sincronizarRepositorio(
          path.resolve(process.cwd(), ".."),
          data.default_branch,
          `https://github.com/${repository.owner}/${repository.repo}.git`,
          {
            ...process.env,
            GIT_TERMINAL_PROMPT: "0",
            GIT_CONFIG_COUNT: "4",
            GIT_CONFIG_KEY_0: "http.https://github.com/.extraheader",
            GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${token}`).toString("base64")}`,
            GIT_CONFIG_KEY_1: "credential.helper",
            GIT_CONFIG_VALUE_1: "",
            GIT_CONFIG_KEY_2: "core.askPass",
            GIT_CONFIG_VALUE_2: "",
            GIT_CONFIG_KEY_3: "http.followRedirects",
            GIT_CONFIG_VALUE_3: "false",
          },
        );
      } catch {
        return { status: "failed", detail: "No se pudo descargar la rama del repositorio. Revisá la conexión y los permisos de GITHUB_TOKEN; los cambios locales se conservan." };
      }
    },
    github: {
      listOpen: () =>
        request(() =>
          client.paginate(client.rest.pulls.list, { ...repository, state: "open", per_page: 100 }),
        ),
      get: (number) =>
        request(async () => {
          const { data } = await client.rest.pulls.get({ ...repository, pull_number: number });
          return { ...data, draft: data.draft ?? false };
        }),
      files: (number) =>
        request(() =>
          client.paginate(client.rest.pulls.listFiles, {
            ...repository,
            pull_number: number,
            per_page: 100,
          }),
        ),
      rename: (number, title) =>
        request(async () => {
          await client.rest.pulls.update({ ...repository, pull_number: number, title });
        }),
      merge: (number, sha, title) =>
        request(async () => {
          const { data: settings } = await client.rest.repos.get(repository);
          const mergeMethod = settings.allow_merge_commit
            ? "merge"
            : settings.allow_squash_merge
              ? "squash"
              : settings.allow_rebase_merge
                ? "rebase"
                : null;
          if (!mergeMethod) throw new Error("El repositorio no permite ningún método de merge.");
          const { data } = await client.rest.pulls.merge({
            ...repository,
            pull_number: number,
            sha,
            merge_method: mergeMethod,
            request: { retries: 0 },
            ...(mergeMethod === "rebase" ? {} : { commit_title: title }),
          });
          return { merged: data.merged, sha: data.sha };
        }),
    },
  };
}
