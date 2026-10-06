import { execFile } from "node:child_process";
import { mkdtemp, mkdir, copyFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeEach, expect, it } from "vitest";

const exec = promisify(execFile);
let root: string;
let script: string;
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "tp1-runner-"));
  script = path.join(root, "sistema/tools/probar-tp1.mjs");
  await mkdir(path.dirname(script), { recursive: true });
  await mkdir(path.join(root, "practicos"));
  await copyFile(path.resolve("tools/probar-tp1.js"), script);
});
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

async function program(legajo: string, code: string, pad = true) {
  const dir = path.join(root, "practicos", `${legajo} - Alumno Ejemplo`, "tp1");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "sortx.js"), `${pad ? "// entrega\n".repeat(50) : ""}${code}`);
}

async function check(legajo: string) {
  const { stdout } = await exec(process.execPath, [script, "--json", legajo]);
  return JSON.parse(stdout)[0].estado;
}

it("clasifica ausentes, plantillas, errores y resultados incorrectos", async () => {
  expect(await check("100")).toBe("pendiente");
  await program("100", "console.log('sortx');", false);
  expect(await check("100")).toBe("pendiente");
  await program("100", "throw new Error('falló');");
  expect(await check("100")).toBe("error");
  await program("100", "console.log('sortx');");
  expect(await check("100")).toBe("falla");
});

it("marca presentado al superar los seis casos y mantiene la salida de consola", async () => {
  await program("100", String.raw`
const fs = require('node:fs');
const args = process.argv.slice(2);
if (args[0] === '--help') { console.log('sortx'); process.exit(0); }
const [input, output] = args;
const delimiter = args.includes('-d') ? '\t' : ',';
const lines = fs.readFileSync(input, 'utf8').split('\n');
const header = args.includes('-nh') ? null : lines.shift();
const columns = header?.split(delimiter);
const criteria = args.flatMap((value, i) => ['-b', '--by'].includes(value) ? [args[i + 1].split(':')] : []);
lines.sort((a, b) => {
  for (const [field, kind, direction] of criteria) {
    const index = columns ? columns.indexOf(field) : Number(field);
    const av = a.split(delimiter)[index], bv = b.split(delimiter)[index];
    const compared = kind === 'num' ? Number(av) - Number(bv) : av.localeCompare(bv, 'es');
    if (compared) return direction === 'desc' ? -compared : compared;
  }
  return 0;
});
fs.writeFileSync(output, [...(header ? [header] : []), ...lines].join('\n'));
`);
  expect(await check("100")).toBe("presentado");
  const { stdout } = await exec(process.execPath, [script, "100"]);
  expect(stdout).toContain("100: 🟢 presentado");
});

it("limita el tiempo de un programa bloqueado", async () => {
  await program("100", "while (true) {}");
  expect(await check("100")).toBe("error");
});
