#!/usr/bin/env node
import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const practicos = fileURLToPath(new URL("../../practicos/", import.meta.url));
const ignorados = new Set([
  "node_modules", "dist", "build", "coverage", "vendor", "test", "tests", "__tests__",
]);

async function leerTexto(file) {
  const stat = await lstat(file);
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new Error("La entrega debe contener archivos regulares.");
  if (stat.size > 2 * 1024 * 1024) throw new Error("Un archivo de la entrega supera 2 MB.");
  const contenido = await readFile(file);
  if (contenido.includes(0)) throw new Error("La entrega debe contener archivos de texto.");
  return contenido.toString("utf8").trim();
}

async function buscarArchivos(directory) {
  const archivos = [];
  let visitados = 0;
  async function recorrer(current, depth) {
    if (depth > 8) throw new Error("La entrega supera el límite de subcarpetas.");
    if (!(await lstat(current)).isDirectory())
      throw new Error("La entrega debe estar en directorios regulares.");
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (++visitados > 5000) throw new Error("La entrega supera el límite de archivos.");
      const nombre = entry.name.toLowerCase();
      if (nombre.startsWith(".") || ignorados.has(nombre)) continue;
      const file = path.join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error("La entrega contiene un enlace simbólico.");
      if (entry.isDirectory()) await recorrer(file, depth + 1);
      else if (entry.isFile()) archivos.push(file);
    }
  }
  await recorrer(directory, 0);
  return archivos.sort();
}

/** Controla presencia de la entrega, sin ejecutar, compilar ni instalar paquetes. */
export async function comprobarAlumno(legajo, root = practicos) {
  if (!/^\d+$/.test(legajo)) throw new Error("El legajo debe contener solo dígitos.");
  const pendiente = (detalle) => ({ legajo, estado: "pendiente", detalle });
  const matches = (await readdir(root, { withFileTypes: true })).filter((entry) =>
    entry.name.startsWith(`${legajo} - `),
  );
  if (!matches.length) return pendiente("No existe la carpeta del alumno.");
  if (matches.length !== 1 || !matches[0].isDirectory())
    throw new Error("La carpeta del alumno es ambigua o no es un directorio regular.");
  const alumno = path.join(root, matches[0].name);
  const directory = path.join(alumno, "tp4");
  try {
    if (!(await lstat(directory)).isDirectory())
      throw new Error("tp4 no es un directorio regular.");
  } catch (error) {
    if (error.code === "ENOENT") return pendiente("No se encontró la carpeta tp4.");
    throw error;
  }

  const archivos = await buscarArchivos(directory);
  const paginas = archivos.filter((file) =>
    path.basename(file).toLowerCase() === "minicrm.html" &&
    path.basename(path.dirname(file)).toLowerCase() === "public",
  );
  const fuentes = archivos.filter((file) => {
    const nombre = path.basename(file);
    return /\.[cm]?ts$/i.test(nombre) &&
      !/(?:\.d|\.config|\.test|\.spec)\.[cm]?ts$/i.test(nombre) &&
      !path.relative(directory, file).split(path.sep).some((part) => part.toLowerCase() === "public");
  });
  const relativa = (file) => path.relative(alumno, file).split(path.sep).join("/");
  let detalle = "No se encontró public/MiniCRM.html dentro de tp4.";
  for (const pagina of paginas) {
    if (!(await leerTexto(pagina))) {
      detalle = `${relativa(pagina)} está vacío.`;
      continue;
    }
    const proyecto = path.dirname(path.dirname(pagina));
    const codigo = [];
    for (const fuente of fuentes) {
      // La página y el servidor deben pertenecer al mismo proyecto.
      if (!fuente.startsWith(proyecto + path.sep)) continue;
      if (await leerTexto(fuente)) codigo.push(relativa(fuente));
    }
    if (codigo.length) return {
      legajo,
      estado: "presentado",
      detalle: `Entrega detectada: ${relativa(pagina)} y ${codigo.length} archivo(s) TypeScript (${codigo.slice(0, 3).join(", ")}). Control de presencia; no verifica funcionamiento.`,
    };
    detalle = `Se encontró ${relativa(pagina)}, pero falta código TypeScript del servidor en ${relativa(proyecto)}. No cuentan configuraciones, declaraciones, pruebas ni dependencias.`;
  }
  return pendiente(detalle);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const result = await comprobarAlumno(args.find((arg) => arg !== "--json") ?? "");
  console.log(args.includes("--json")
    ? JSON.stringify([result])
    : `${result.legajo}: ${result.estado} — ${result.detalle}`);
}
