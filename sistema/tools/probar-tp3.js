#!/usr/bin/env node
import { execFile } from "node:child_process";
import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const practicos = fileURLToPath(new URL("../../practicos/", import.meta.url));
const enunciado = fileURLToPath(new URL("../../enunciados/tp3/agenda.html", import.meta.url));

async function archivoRegular(file) {
  const stat = await lstat(file);
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new Error("agenda.html debe ser un archivo regular.");
  if (stat.size > 2 * 1024 * 1024) throw new Error("agenda.html supera el límite de 2 MB.");
  if ((await readFile(file)).includes(0))
    throw new Error("agenda.html debe ser un archivo de texto.");
}

export async function comprobarArchivo(programa, original = enunciado) {
  // Un enunciado ausente o ilegible es un fallo técnico, no una falta del alumno.
  await archivoRegular(original);
  try {
    await archivoRegular(programa);
  } catch (error) {
    if (error.code === "ENOENT")
      return { estado: "pendiente", lineas: 0, detalle: "No se encontró tp3/agenda.html." };
    throw error;
  }

  let stdout;
  try {
    ({ stdout } = await exec(
      "git",
      [
        "diff",
        "--no-index",
        "--numstat",
        "--no-ext-diff",
        "--no-textconv",
        "--ignore-cr-at-eol",
        "--",
        path.resolve(original),
        path.resolve(programa),
      ],
      { timeout: 10_000, maxBuffer: 1024 * 1024, env: {} },
    ));
  } catch (error) {
    // git diff usa código 1 cuando encuentra diferencias, sin que sea un error.
    if (error.code !== 1 || typeof error.stdout !== "string") throw error;
    stdout = error.stdout;
  }
  const rows = stdout.trim().split("\n").filter(Boolean);
  if (rows.length > 1 || (rows.length && !/^\d+\t\d+\t/.test(rows[0])))
    throw new Error("No se pudieron contar las líneas agregadas a agenda.html.");
  const lineas = rows.length ? Number(rows[0].split("\t")[0]) : 0;
  return {
    estado: lineas >= 100 ? "presentado" : "pendiente",
    lineas,
    detalle: `${lineas} líneas agregadas en tp3/agenda.html respecto del enunciado original; se requieren al menos 100.`,
  };
}

export async function comprobarAlumno(legajo, root = practicos, original = enunciado) {
  if (!/^\d+$/.test(legajo)) throw new Error("El legajo debe contener solo dígitos.");
  const matches = (await readdir(root, { withFileTypes: true })).filter((entry) =>
    entry.name.startsWith(`${legajo} - `),
  );
  if (!matches.length)
    return { legajo, estado: "pendiente", lineas: 0, detalle: "No existe la carpeta del alumno." };
  if (matches.length !== 1 || !matches[0].isDirectory())
    throw new Error("La carpeta del alumno es ambigua o no es un directorio regular.");
  const directory = path.join(root, matches[0].name, "tp3");
  try {
    if (!(await lstat(directory)).isDirectory())
      throw new Error("tp3 no es un directorio regular.");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const principal = await comprobarArchivo(path.join(directory, "agenda.html"), original);
  // Algunos uploads de GitHub incluyen la carpeta tp3 dentro de la carpeta TP.
  // La entrega sigue perteneciendo al alumno; no confundir la plantilla exterior
  // sin modificaciones con la solución que quedó un nivel más adentro.
  const nested = path.join(directory, "tp3");
  let resultado = principal;
  try {
    const stat = await lstat(nested);
    if (!stat.isDirectory()) throw new Error("tp3/tp3 no es un directorio regular.");
    const alternativo = await comprobarArchivo(path.join(nested, "agenda.html"), original);
    if (alternativo.lineas > principal.lineas) {
      resultado = {
        ...alternativo,
        detalle: alternativo.detalle.replace("tp3/agenda.html", "tp3/tp3/agenda.html"),
      };
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return { legajo, ...resultado };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const result = await comprobarAlumno(args.find((arg) => arg !== "--json") ?? "");
  console.log(
    args.includes("--json")
      ? JSON.stringify([result])
      : `${result.legajo}: ${result.estado} — ${result.detalle}`,
  );
}
