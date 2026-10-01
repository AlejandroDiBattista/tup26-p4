import { beforeEach, expect, it, vi } from "vitest";
import { conectarGitHubPr, repositorioDeRemote } from "./github-pr";
import { sincronizarRepositorio } from "./sincronizar-repositorio";

const mocks = vi.hoisted(() => ({
  exec: vi.fn(),
  credential: vi.fn(),
  loopback: vi.fn(),
  paginate: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  merge: vi.fn(),
  repo: vi.fn(),
  octokit: vi.fn(),
  list: vi.fn(),
  files: vi.fn(),
  synchronize: vi.fn(),
}));
vi.mock("node:util", () => ({ promisify: () => mocks.exec }));
vi.mock("@agent-native/core/credentials", () => ({ resolveCredential: mocks.credential }));
vi.mock("./sincronizar-repositorio.js", () => ({ sincronizarRepositorio: mocks.synchronize }));
vi.mock("@agent-native/core/server/request-context", () => ({
  getRequestIsLoopback: mocks.loopback,
}));
vi.mock("octokit", () => ({
  Octokit: class {
    constructor(options: unknown) {
      mocks.octokit(options);
    }
    paginate = mocks.paginate;
    rest = {
      pulls: {
        list: mocks.list,
        listFiles: mocks.files,
        get: mocks.get,
        update: mocks.update,
        merge: mocks.merge,
      },
      repos: { get: mocks.repo },
    };
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
  mocks.exec.mockResolvedValue({ stdout: "git@github.com:example/course.git\n" });
  mocks.credential.mockResolvedValue("test-only-credential");
  mocks.repo.mockResolvedValue({ data: { allow_merge_commit: true } });
  mocks.merge.mockResolvedValue({ data: { merged: true, sha: "merge-commit" } });
});

it.each([
  "https://github.com/example/course.git",
  "git@github.com:example/course.git",
  "ssh://git@github.com/example/course.git",
  "https://github.com/example/course/",
])("resuelve el repositorio desde %s", (remote) => {
  expect(repositorioDeRemote(remote)).toEqual({ owner: "example", repo: "course" });
});

it.each([
  "https://github.com.evil.test/example/course",
  "https://other.test/example/course",
  "https://github.com/example/course/pulls",
  "https://credential@github.com/example/course.git",
])("rechaza remote inválido %s", (remote) => {
  expect(() => repositorioDeRemote(remote)).toThrow("origin");
});

it("usa el secreto del usuario y pagina todos los PR abiertos y sus archivos", async () => {
  const context = { userEmail: "teacher@example.test", orgId: "org" };
  const { github, repository } = await conectarGitHubPr(context);
  expect(mocks.credential).toHaveBeenCalledExactlyOnceWith("GITHUB_TOKEN", context);
  expect(repository).toBe("example/course");
  await github.listOpen();
  await github.files(3);
  expect(mocks.paginate).toHaveBeenNthCalledWith(1, mocks.list, {
    owner: "example",
    repo: "course",
    state: "open",
    per_page: 100,
  });
  expect(mocks.paginate).toHaveBeenNthCalledWith(2, mocks.files, {
    owner: "example",
    repo: "course",
    pull_number: 3,
    per_page: 100,
  });
  await github.rename(3, "TP 03 - 63717 - González Octavio");
  expect(mocks.update).toHaveBeenCalledExactlyOnceWith({
    owner: "example",
    repo: "course",
    pull_number: 3,
    title: "TP 03 - 63717 - González Octavio",
  });
  expect(mocks.exec).toHaveBeenCalledTimes(1);
});

it.each([
  ["production", true, "dev@local.test"],
  ["development", false, "dev@local.test"],
  ["development", true, "teacher@example.test"],
])(
  "no usa credenciales del CLI fuera de la sesión automática local: %s %s %s",
  async (env, loopback, userEmail) => {
    vi.stubEnv("NODE_ENV", env);
    mocks.loopback.mockReturnValue(loopback);
    mocks.credential.mockResolvedValue(undefined);
    await expect(conectarGitHubPr({ userEmail })).rejects.toThrow("GITHUB_TOKEN");
    expect(mocks.exec).toHaveBeenCalledTimes(1);
  },
);

it("la sesión automática local puede usar gh sin devolver el token", async () => {
  vi.stubEnv("NODE_ENV", "development");
  mocks.loopback.mockReturnValue(true);
  mocks.credential.mockResolvedValue(undefined);
  mocks.exec
    .mockResolvedValueOnce({ stdout: "git@github.com:example/course.git" })
    .mockResolvedValueOnce({ stdout: "test-only-credential\n" });
  const result = await conectarGitHubPr({ userEmail: "dev@local.test" });
  expect(mocks.exec).toHaveBeenNthCalledWith(
    2,
    "gh",
    ["auth", "token", "--hostname", "github.com"],
    expect.objectContaining({ timeout: 10_000 }),
  );
  expect(result).not.toHaveProperty("token");
});

it("los errores no exponen el request autenticado", async () => {
  const { github } = await conectarGitHubPr({ userEmail: "teacher@example.test" });
  mocks.paginate.mockRejectedValue({
    status: 403,
    message: "test-only-credential",
    request: { headers: { authorization: "test-only-credential" } },
  });
  await expect(github.listOpen()).rejects.toThrow("GitHub denegó");
  await expect(github.listOpen()).rejects.not.toThrow("test-only-credential");
});

it("la descarga usa la rama por defecto y la credencial del docente, sin helpers globales", async () => {
  mocks.repo.mockResolvedValue({ data: { default_branch: "main" } });
  mocks.synchronize.mockResolvedValue({ status: "updated", detail: "Descargado." });
  const connection = await conectarGitHubPr({ userEmail: "teacher@example.test" });
  expect(await connection.synchronize()).toMatchObject({ status: "updated" });
  expect(sincronizarRepositorio).toHaveBeenCalledExactlyOnceWith(
    expect.any(String), "main", "https://github.com/example/course.git",
    expect.objectContaining({
      GIT_TERMINAL_PROMPT: "0", GIT_CONFIG_COUNT: "4",
      GIT_CONFIG_KEY_0: "http.https://github.com/.extraheader",
      GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${Buffer.from("x-access-token:test-only-credential").toString("base64")}`,
      GIT_CONFIG_KEY_1: "credential.helper", GIT_CONFIG_VALUE_1: "",
      GIT_CONFIG_KEY_2: "core.askPass", GIT_CONFIG_VALUE_2: "",
      GIT_CONFIG_KEY_3: "http.followRedirects", GIT_CONFIG_VALUE_3: "false",
    }),
  );
  expect(connection).not.toHaveProperty("token");
});

it("informa el error de descarga sin exponer credenciales ni excepciones autenticadas", async () => {
  mocks.repo.mockRejectedValue({ status: 403, message: "test-only-credential" });
  const connection = await conectarGitHubPr({ userEmail: "teacher@example.test" });
  const result = await connection.synchronize();
  expect(result.status).toBe("failed");
  expect(JSON.stringify(result)).not.toContain("test-only-credential");
  expect(mocks.synchronize).not.toHaveBeenCalled();
});

it.each([
  [{ allow_merge_commit: true }, "merge"],
  [{ allow_merge_commit: false, allow_squash_merge: true }, "squash"],
  [{ allow_merge_commit: false, allow_squash_merge: false, allow_rebase_merge: true }, "rebase"],
])("hace merge del SHA revisado con un método permitido: %j", async (settings, method) => {
  mocks.repo.mockResolvedValue({ data: settings });
  const { github } = await conectarGitHubPr({ userEmail: "teacher@example.test" });
  const title = "TP 03 - 63717 - González Octavio";
  expect(await github.merge(3, "reviewed-head", title)).toEqual({
    merged: true,
    sha: "merge-commit",
  });
  expect(mocks.merge).toHaveBeenCalledExactlyOnceWith({
    owner: "example",
    repo: "course",
    pull_number: 3,
    sha: "reviewed-head",
    merge_method: method,
    request: { retries: 0 },
    ...(method === "rebase" ? {} : { commit_title: title }),
  });
});

it.each([405, 409, 422])(
  "reporta el rechazo de GitHub (%i) sin forzar ni reintentar el merge",
  async (status) => {
    mocks.merge.mockRejectedValue({ status });
    const { github } = await conectarGitHubPr({ userEmail: "teacher@example.test" });
    await expect(github.merge(3, "reviewed-head", "Título")).rejects.toThrow();
    expect(mocks.merge).toHaveBeenCalledTimes(1);
  },
);
