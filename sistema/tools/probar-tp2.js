#!/usr/bin/env node
import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transformWithOxc } from "vite";

const practicos = fileURLToPath(new URL("../../practicos/", import.meta.url));

export async function comprobarArchivo(programa) {
  let contenido;
  try {
    const stat = await lstat(programa);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error("edit.jsx debe ser un archivo regular.");
    if (stat.size > 2 * 1024 * 1024) throw new Error("edit.jsx supera el límite de 2 MB.");
    contenido = await readFile(programa, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return { estado: "pendiente", lineas: 0, detalle: "No se encontró tp2/edit.jsx." };
    throw error; // Un fallo de lectura no debe cambiar el estado académico.
  }
  // Cuenta líneas físicas; el salto final no agrega una línea vacía ficticia.
  const lineas = contenido === "" ? 0 : contenido.replace(/(?:\r\n|\r|\n)$/, "").split(/\r\n|\r|\n/).length;
  if (lineas < 100) return { estado: "pendiente", lineas, detalle: `${lineas} líneas; se requieren al menos 100.` };
  try {
    // Compila en memoria. No carga configuraciones, instala paquetes ni ejecuta la entrega.
    await transformWithOxc(contenido, "edit.jsx", { lang: "jsx" });
    return { estado: "presentado", lineas, detalle: `${lineas} líneas. Compilación JSX correcta (sin prueba de ejecución).` };
  } catch (error) {
    return { estado: "error", lineas, detalle: `Error de compilación: ${String(error.message).slice(0, 1500)}` };
  }
}

export async function comprobarAlumno(legajo, root = practicos) {
  if (!/^\d+$/.test(legajo)) throw new Error("El legajo debe contener solo dígitos.");
  const matches = (await readdir(root, { withFileTypes: true })).filter(entry => entry.name.startsWith(`${legajo} - `));
  if (!matches.length) return { legajo, estado: "pendiente", lineas: 0, detalle: "No existe la carpeta del alumno." };
  if (matches.length !== 1 || !matches[0].isDirectory()) throw new Error("La carpeta del alumno es ambigua o no es un directorio regular.");
  const directory = path.join(root, matches[0].name, "tp2");
  try {
    if (!(await lstat(directory)).isDirectory()) throw new Error("tp2 no es un directorio regular.");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return { legajo, ...await comprobarArchivo(path.join(directory, "edit.jsx")) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const legajo = args.find(arg => arg !== "--json");
  const result = await comprobarAlumno(legajo ?? "");
  console.log(args.includes("--json") ? JSON.stringify([result]) : `${result.legajo}: ${result.estado} — ${result.detalle}`);
}
