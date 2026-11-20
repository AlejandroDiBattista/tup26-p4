import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { comprobarAlumno } from "../../tools/probar-tp4.js";

let root: string;
let directory: string;
async function archivo(nombre: string, contenido: string | Buffer = "export const app = 1;\n") {
  const file = path.join(directory, nombre);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contenido);
}
beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "tp4-check-"));
  directory = path.join(root, "100 - Alumno", "tp4");
});
afterEach(async () => { await rm(root, { recursive: true, force: true }); });

describe("presencia de la entrega TP4", () => {
  it("deja pendiente si falta la carpeta del alumno, tp4 o solo está publicado el enunciado", async () => {
    expect(await comprobarAlumno("100", root)).toMatchObject({ estado: "pendiente" });
    await mkdir(path.dirname(directory));
    expect(await comprobarAlumno("100", root)).toMatchObject({ estado: "pendiente" });
    await archivo("enunciado.md", "# MiniCRM");
    await archivo("minicrm.jpg", Buffer.from([0, 1, 2]));
    expect(await comprobarAlumno("100", root)).toMatchObject({ estado: "pendiente" });
  });
  it("requiere la página y código del servidor, ambos con contenido", async () => {
    await archivo("src/server.ts");
    expect(await comprobarAlumno("100", root)).toMatchObject({ estado: "pendiente" });
    await archivo("public/MiniCRM.html", " \n");
    expect(await comprobarAlumno("100", root)).toMatchObject({ estado: "pendiente", detalle: expect.stringContaining("vacío") });
    await archivo("public/MiniCRM.html", "<html>MiniCRM</html>");
    await archivo("src/server.ts", " \n");
    expect(await comprobarAlumno("100", root)).toMatchObject({ estado: "pendiente", detalle: expect.stringContaining("TypeScript") });
    await archivo("src/server.ts", 'throw new Error("ESTE CÓDIGO NO DEBE EJECUTARSE");');
    expect(await comprobarAlumno("100", root)).toMatchObject({
      legajo: "100", estado: "presentado", detalle: expect.stringContaining("tp4/src/server.ts"),
    });
  });
  it("no confunde dependencias, compilados, configuraciones, declaraciones, pruebas ni código del navegador con el servidor", async () => {
    await archivo("public/MiniCRM.html", "<html>MiniCRM</html>");
    for (const nombre of [
      "node_modules/package/index.ts", "dist/server.ts", "build/server.ts", "coverage/server.ts",
      "tests/server.ts", "test/server.ts", "__tests__/server.ts", ".cache/server.ts",
      "drizzle.config.ts", "src/types.d.ts", "src/types.d.mts", "src/server.test.ts",
      "src/server.spec.ts", "public/client.ts",
    ]) await archivo(nombre);
    expect(await comprobarAlumno("100", root)).toMatchObject({ estado: "pendiente" });
  });
  it.each(["tp4", "tp-04/p4"])("reconoce el proyecto anidado en %s y detalla su ruta", async (subcarpeta) => {
    await archivo(`${subcarpeta}/public/MiniCRM.html`, "<html>MiniCRM</html>");
    await archivo(`${subcarpeta}/src/server.ts`);
    expect(await comprobarAlumno("100", root)).toMatchObject({
      estado: "presentado", detalle: expect.stringContaining(`tp4/${subcarpeta}/public/MiniCRM.html`),
    });
  });
  it("no combina una página con el servidor de un proyecto hermano", async () => {
    await archivo("proyecto-a/public/MiniCRM.html", "<html>MiniCRM</html>");
    await archivo("proyecto-b/src/server.ts");
    expect(await comprobarAlumno("100", root)).toMatchObject({ estado: "pendiente" });
  });
  it("no busca la entrega en otro práctico ni en la carpeta de otro alumno", async () => {
    await archivo("src/server.ts");
    await archivo("public/MiniCRM.html", "<html>MiniCRM</html>");
    await mkdir(path.join(root, "101 - Otro", "tp3"), { recursive: true });
    await writeFile(path.join(root, "101 - Otro", "tp3", "MiniCRM.html"), "<html>MiniCRM</html>");
    expect(await comprobarAlumno("101", root)).toMatchObject({ legajo: "101", estado: "pendiente" });
  });
  it("informa fallos técnicos ante archivos binarios o excesivos", async () => {
    await archivo("public/MiniCRM.html", Buffer.from([0, 1, 2]));
    await archivo("server.ts");
    await expect(comprobarAlumno("100", root)).rejects.toThrow("texto");
    await archivo("public/MiniCRM.html", "a".repeat(2 * 1024 * 1024 + 1));
    await expect(comprobarAlumno("100", root)).rejects.toThrow("2 MB");
  });
  it("rechaza enlaces en alumnos, tp4, subcarpetas y archivos", async () => {
    await symlink(root, path.join(root, "100 - Enlace"));
    await expect(comprobarAlumno("100", root)).rejects.toThrow("directorio regular");
    await rm(path.join(root, "100 - Enlace"));
    await mkdir(path.dirname(directory));
    await symlink(root, directory);
    await expect(comprobarAlumno("100", root)).rejects.toThrow("directorio regular");
    await rm(directory);
    await mkdir(directory);
    await symlink(root, path.join(directory, "src"));
    await expect(comprobarAlumno("100", root)).rejects.toThrow("enlace simbólico");
    await rm(path.join(directory, "src"));
    await archivo("src/server.ts");
    await mkdir(path.join(directory, "public"));
    await symlink(path.join(directory, "src/server.ts"), path.join(directory, "public/MiniCRM.html"));
    await expect(comprobarAlumno("100", root)).rejects.toThrow("enlace simbólico");
  });
  it("rechaza carpetas ambiguas y legajos inválidos", async () => {
    await mkdir(path.join(root, "100 - Uno"));
    await mkdir(path.join(root, "100 - Dos"));
    await expect(comprobarAlumno("100", root)).rejects.toThrow("ambigua");
    await expect(comprobarAlumno("../100", root)).rejects.toThrow("dígitos");
  });
});
