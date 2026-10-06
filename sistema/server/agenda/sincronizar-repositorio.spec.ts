import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeEach, expect, it } from "vitest";
import { sincronizarRepositorio } from "./sincronizar-repositorio";

const exec = promisify(execFile);
let root: string;
let remote: string;
let local: string;
const git = async (cwd: string, args: string[]) =>
  (await exec("git", ["-c", "user.name=Test", "-c", "user.email=test@example.test", "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", ...args], { cwd })).stdout.trim();
async function commit(cwd: string, file: string, content: string) {
  await writeFile(path.join(cwd, file), content);
  await git(cwd, ["add", "--", file]);
  await git(cwd, ["commit", "-m", "test"]);
}
beforeEach(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), "tup-sync-"));
  remote = path.join(root, "remote");
  local = path.join(root, "local");
  await git(root, ["init", "-b", "main", remote]);
  await commit(remote, "agenda.html", "plantilla\n");
  await commit(remote, "sistema.txt", "sistema\n");
  await git(root, ["clone", remote, local]);
});
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

it("descarga entregas y conserva cambios locales ajenos; luego verifica que está al día", async () => {
  await writeFile(path.join(local, "sistema.txt"), "cambio local sin commit\n");
  await commit(remote, "agenda.html", "entrega\n".repeat(100));
  const target = await git(remote, ["rev-parse", "HEAD"]);
  expect(await sincronizarRepositorio(local, "main", remote)).toMatchObject({ status: "updated", commit: target });
  expect(await readFile(path.join(local, "agenda.html"), "utf8")).toBe("entrega\n".repeat(100));
  expect(await readFile(path.join(local, "sistema.txt"), "utf8")).toBe("cambio local sin commit\n");
  expect(await sincronizarRepositorio(local, "main", remote)).toMatchObject({ status: "current", commit: target });
});

it("informa un conflicto sin sobrescribir la entrega local ni avanzar HEAD", async () => {
  const before = await git(local, ["rev-parse", "HEAD"]);
  await writeFile(path.join(local, "agenda.html"), "entrega local sin commit\n");
  await commit(remote, "agenda.html", "entrega remota\n");
  expect(await sincronizarRepositorio(local, "main", remote)).toMatchObject({ status: "failed" });
  expect(await git(local, ["rev-parse", "HEAD"])).toBe(before);
  expect(await readFile(path.join(local, "agenda.html"), "utf8")).toBe("entrega local sin commit\n");
});

it("no crea merges ni descarta commits cuando la rama local diverge", async () => {
  await commit(local, "sistema.txt", "commit local\n");
  const before = await git(local, ["rev-parse", "HEAD"]);
  await commit(remote, "agenda.html", "entrega remota\n");
  expect(await sincronizarRepositorio(local, "main", remote)).toMatchObject({ status: "failed" });
  expect(await git(local, ["rev-parse", "HEAD"])).toBe(before);
  expect(await readFile(path.join(local, "sistema.txt"), "utf8")).toBe("commit local\n");
});

it("no actualiza una rama distinta de la rama de entregas", async () => {
  await git(local, ["checkout", "-b", "codex/test"]);
  await commit(remote, "agenda.html", "entrega remota\n");
  expect(await sincronizarRepositorio(local, "main", remote)).toMatchObject({ status: "failed", detail: expect.stringContaining("codex/test") });
  expect(await readFile(path.join(local, "agenda.html"), "utf8")).toBe("plantilla\n");
});
