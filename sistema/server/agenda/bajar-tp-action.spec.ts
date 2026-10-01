import { beforeEach, expect, it, vi } from "vitest";
import action from "../../actions/bajar-tp";
import { conectarGitHubPr } from "./github-pr";

const mocks = vi.hoisted(() => ({ listOpen: vi.fn(), synchronize: vi.fn() }));
vi.mock("./store.js", () => ({ requireUserEmail: (email: string) => email, listStudents: vi.fn(async () => []) }));
vi.mock("./github-pr.js", () => ({ conectarGitHubPr: vi.fn(async () => ({ repository: "example/course", github: { listOpen: mocks.listOpen }, synchronize: mocks.synchronize })) }));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.listOpen.mockResolvedValue([]);
  mocks.synchronize.mockResolvedValue({ status: "updated", detail: "Entregas descargadas." });
});
it("descarga entregas ya fusionadas incluso si no hay PR abiertos, con el contexto del docente", async () => {
  const ctx = { userEmail: "teacher@example.test", orgId: "org", caller: "http" as const };
  const result = await action.run({ dryRun: false }, ctx);
  expect(conectarGitHubPr).toHaveBeenCalledExactlyOnceWith({ userEmail: ctx.userEmail, orgId: ctx.orgId });
  expect(mocks.synchronize).toHaveBeenCalledTimes(1);
  expect(result).toMatchObject({ total: 0, sync: { status: "updated" } });
});
it("la vista previa no descarga ni modifica el repositorio", async () => {
  const result = await action.run({ dryRun: true }, { userEmail: "teacher@example.test", caller: "http" });
  expect(mocks.synchronize).not.toHaveBeenCalled();
  expect(result).not.toHaveProperty("sync");
});
it("conserva el detalle de los PR si no puede actualizar la copia local", async () => {
  mocks.synchronize.mockResolvedValue({ status: "failed", detail: "Conflicto local." });
  expect(await action.run({ dryRun: false }, { userEmail: "teacher@example.test", caller: "http" })).toMatchObject({ total: 0, sync: { status: "failed", detail: "Conflicto local." } });
});
