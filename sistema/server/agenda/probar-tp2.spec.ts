import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { comprobarAlumno, comprobarArchivo } from "../../tools/probar-tp2.js";

let root: string;
let file: string;
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "tp2-check-"));
  file = path.join(root, "edit.jsx");
});
afterEach(async () => { await rm(root, { recursive: true, force: true }); });
const source = (count: number, last = "export default () => <div>Hola</div>;") => [...Array(count - 1).fill("// línea"), last].join("\n");

describe("compilación TP2", () => {
  it("detecta archivos y carpetas ausentes", async () => {
    expect(await comprobarArchivo(file)).toMatchObject({ estado: "pendiente", lineas: 0 });
    expect(await comprobarAlumno("100", root)).toMatchObject({ legajo: "100", estado: "pendiente" });
  });
  it("99 líneas con salto final no llegan a 100", async () => {
    await writeFile(file, source(99) + "\n");
    expect(await comprobarArchivo(file)).toMatchObject({ estado: "pendiente", lineas: 99 });
  });
  it("acepta exactamente 100 líneas con CRLF", async () => {
    await writeFile(file, source(100).replace(/\n/g, "\r\n") + "\r\n");
    expect(await comprobarArchivo(file)).toMatchObject({ estado: "presentado", lineas: 100 });
  });
  it("detecta errores JSX", async () => {
    await writeFile(file, source(100, "const vista = <div>;") );
    expect(await comprobarArchivo(file)).toMatchObject({ estado: "error", lineas: 100 });
  });
  it("no ejecuta código ni resuelve imports de la entrega", async () => {
    await writeFile(file, source(100, 'import x from "dependencia-no-instalada"; throw new Error("NO EJECUTAR");'));
    expect(await comprobarArchivo(file)).toMatchObject({ estado: "presentado" });
  });
  it("rechaza enlaces y carpetas ambiguas", async () => {
    await mkdir(path.join(root, "100 - Uno"));
    await symlink(root, path.join(root, "100 - Uno", "tp2"));
    await expect(comprobarAlumno("100", root)).rejects.toThrow("directorio regular");
    await mkdir(path.join(root, "100 - Dos"));
    await expect(comprobarAlumno("100", root)).rejects.toThrow("ambigua");
    await expect(comprobarAlumno("../100", root)).rejects.toThrow("dígitos");
  });
});
