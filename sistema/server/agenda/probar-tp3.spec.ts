import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { comprobarAlumno, comprobarArchivo } from "../../tools/probar-tp3.js";

let root: string;
let file: string;
let original: string;
const template = "<!doctype html>\n<html>\n<body>Agenda</body>\n</html>\n";
const additions = (count: number) =>
  Array.from({ length: count }, (_, i) => `<!-- agregado ${i} -->\n`).join("");

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "tp3-check-"));
  file = path.join(root, "agenda.html");
  original = path.join(root, "original.html");
  await writeFile(original, template);
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("líneas agregadas en TP3", () => {
  it("marca como pendiente una entrega o carpeta ausente", async () => {
    expect(await comprobarArchivo(file, original)).toMatchObject({
      estado: "pendiente",
      lineas: 0,
    });
    expect(await comprobarAlumno("100", root, original)).toMatchObject({
      legajo: "100",
      estado: "pendiente",
      lineas: 0,
    });
    await mkdir(path.join(root, "100 - Uno"));
    expect(await comprobarAlumno("100", root, original)).toMatchObject({
      estado: "pendiente",
      lineas: 0,
    });
  });
  it("una copia de un enunciado de más de 100 líneas tiene cero agregadas", async () => {
    const longTemplate = template + additions(150);
    await writeFile(original, longTemplate);
    await writeFile(file, longTemplate);
    expect(await comprobarArchivo(file, original)).toMatchObject({
      estado: "pendiente",
      lineas: 0,
    });
  });
  it("99 líneas agregadas con salto final no llegan al mínimo", async () => {
    await writeFile(file, template + additions(99));
    expect(await comprobarArchivo(file, original)).toMatchObject({
      estado: "pendiente",
      lineas: 99,
    });
  });
  it("acepta exactamente 100 agregadas y no cuenta conversiones a CRLF", async () => {
    await writeFile(file, (template + additions(100)).replace(/\n/g, "\r\n"));
    expect(await comprobarArchivo(file, original)).toMatchObject({
      estado: "presentado",
      lineas: 100,
    });
    await writeFile(file, template.replace(/\n/g, "\r\n"));
    expect(await comprobarArchivo(file, original)).toMatchObject({
      estado: "pendiente",
      lineas: 0,
    });
  });
  it("las eliminaciones no suman líneas agregadas", async () => {
    await writeFile(original, template + additions(150));
    await writeFile(file, template);
    expect(await comprobarArchivo(file, original)).toMatchObject({
      estado: "pendiente",
      lineas: 0,
    });
  });
  it("cuenta la entrega del alumno sin ejecutar su contenido", async () => {
    const directory = path.join(root, "100 - Uno", "tp3");
    await mkdir(directory, { recursive: true });
    await writeFile(
      path.join(directory, "agenda.html"),
      template + additions(99) + '<script>throw new Error("NO EJECUTAR");</script>\n',
    );
    expect(await comprobarAlumno("100", root, original)).toMatchObject({
      legajo: "100",
      estado: "presentado",
      lineas: 100,
    });
  });
  it("un enunciado ausente y archivos binarios son fallos técnicos", async () => {
    await writeFile(file, Buffer.from([0, 1, 2]));
    await expect(comprobarArchivo(file, original)).rejects.toThrow("texto");
    await expect(comprobarArchivo(file, path.join(root, "inexistente.html"))).rejects.toThrow();
  });
  it("detecta la solución subida en tp3/tp3 aunque afuera siga la plantilla", async () => {
    const directory = path.join(root, "100 - Uno", "tp3");
    await mkdir(path.join(directory, "tp3"), { recursive: true });
    await writeFile(path.join(directory, "agenda.html"), template);
    await writeFile(path.join(directory, "tp3", "agenda.html"), template + additions(100));
    expect(await comprobarAlumno("100", root, original)).toMatchObject({
      legajo: "100",
      estado: "presentado",
      lineas: 100,
      detalle: expect.stringContaining("tp3/tp3/agenda.html"),
    });
    await rm(path.join(directory, "agenda.html"));
    expect(await comprobarAlumno("100", root, original)).toMatchObject({
      estado: "presentado",
      lineas: 100,
    });
  });
  it("rechaza enlaces en la carpeta anidada", async () => {
    const directory = path.join(root, "100 - Uno", "tp3");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "agenda.html"), template);
    await symlink(root, path.join(directory, "tp3"));
    await expect(comprobarAlumno("100", root, original)).rejects.toThrow("directorio regular");
  });
  it("rechaza enlaces de archivos y de carpetas, carpetas ambiguas y legajos inválidos", async () => {
    await symlink(original, file);
    await expect(comprobarArchivo(file, original)).rejects.toThrow("archivo regular");
    await symlink(root, path.join(root, "100 - Enlace"));
    await expect(comprobarAlumno("100", root, original)).rejects.toThrow("directorio regular");
    await mkdir(path.join(root, "101 - Uno"));
    await symlink(root, path.join(root, "101 - Uno", "tp3"));
    await expect(comprobarAlumno("101", root, original)).rejects.toThrow("directorio regular");
    await mkdir(path.join(root, "102 - Uno"));
    await mkdir(path.join(root, "102 - Dos"));
    await expect(comprobarAlumno("102", root, original)).rejects.toThrow("ambigua");
    await expect(comprobarAlumno("../100", root, original)).rejects.toThrow("dígitos");
  });
});
