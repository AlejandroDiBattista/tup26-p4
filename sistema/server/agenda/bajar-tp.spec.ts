import { describe, expect, it, vi } from "vitest";
import { identificarTituloPr, bajarTp, type GitHubParaBajarTp, type PullRequest } from "./bajar-tp";

const students = [
  { legajo: "63717", apellido: "González", nombre: "Octavio", github: "octavio" },
  { legajo: "63200", apellido: "Rojas", nombre: "Gael Mauricio", github: "gael" },
];
const folder = "practicos/63717 - Nombre desactualizado/tp3";
const title = "TP 03 - 63717 - González Octavio";

describe("identificación por archivos", () => {
  it("usa TP y legajo de la carpeta, nombre del padrón y conserva acentos", () => {
    expect(
      identificarTituloPr(
        [{ filename: `${folder}/agenda.html` }, { filename: `${folder}/src/styles.css` }],
        students,
      ),
    ).toMatchObject({ title });
    expect(
      identificarTituloPr([{ filename: "practicos/63717/tp01/index.js" }], students),
    ).toMatchObject({
      title: "TP 01 - 63717 - González Octavio",
    });
  });

  it.each([
    [],
    [`${folder}/agenda.html`, "README.md"],
    [`${folder}/agenda.html`, "practicos/63200 - Rojas Gael Mauricio/tp3/agenda.html"],
    [`${folder}/agenda.html`, "practicos/63717 - Nombre desactualizado/tp2/index.js"],
    [`${folder}/agenda.html`, "practicos/63717 - Otra carpeta/tp3/agenda.html"],
    ["practicos/99999 - Alumno desconocido/tp1/index.js"],
    ["practicos/63717 - Alumno/tp0/index.js"],
    ["practicos/63717 - Alumno/tp1"],
    ["practicos/63717 - Alumno/tp1/../tp2/index.js"],
    ["practicos/63717 - Alumno/tp1//index.js"],
    ["enunciados/tp1/index.js"],
  ])("omite archivos ambiguos o no correspondientes a una entrega: %j", (...filenames) => {
    expect(
      identificarTituloPr(
        filenames.map((filename) => ({ filename })),
        students,
      ),
    ).toHaveProperty("detail");
  });

  it("comprueba también el origen de los archivos renombrados", () => {
    expect(
      identificarTituloPr(
        [{ filename: `${folder}/nuevo.html`, previous_filename: `${folder}/viejo.html` }],
        students,
      ),
    ).toMatchObject({ title });
    expect(
      identificarTituloPr(
        [{ filename: `${folder}/nuevo.html`, previous_filename: "README.md" }],
        students,
      ),
    ).toHaveProperty("detail");
    expect(
      identificarTituloPr(
        [
          {
            filename: `${folder}/nuevo.html`,
            previous_filename: "practicos/63200 - Rojas/tp3/viejo.html",
          },
        ],
        students,
      ),
    ).toHaveProperty("detail");
  });

  it("omite alumnos sin datos completos o con legajos repetidos", () => {
    const files = [{ filename: `${folder}/agenda.html` }];
    expect(identificarTituloPr(files, [...students, students[0]])).toHaveProperty("detail");
    expect(identificarTituloPr(files, [{ ...students[0], nombre: " " }])).toHaveProperty("detail");
  });
});

function fakeGitHub() {
  let pull: PullRequest = {
    number: 1,
    title: "Entrega",
    html_url: "https://github.com/example/course/pull/1",
    state: "open",
    changed_files: 1,
    head: { sha: "initial" },
    base: { ref: "main", sha: "base" },
    user: { login: "Octavio" },
    draft: false,
    merged: false,
    merge_commit_sha: null,
  };
  const github = {
    listOpen: vi.fn(async () => (pull.state === "open" ? [pull] : [])),
    get: vi.fn(async () => pull),
    files: vi.fn(async () => [{ filename: `${folder}/agenda.html` }]),
    rename: vi.fn(async (_number: number, newTitle: string) => {
      pull = { ...pull, title: newTitle };
    }),
    merge: vi.fn(async () => {
      pull = { ...pull, state: "closed", merged: true, merge_commit_sha: "merge-commit" };
      return { merged: true, sha: "merge-commit" };
    }),
  } satisfies GitHubParaBajarTp;
  return { github, pull };
}

describe("Bajar TP", () => {
  it("normaliza, hace merge del SHA revisado, verifica y no repite la incorporación", async () => {
    const { github } = fakeGitHub();
    expect(await bajarTp(students, github)).toMatchObject({
      total: 1,
      renamed: 1,
      merged: 1,
      failed: 0,
      results: [
        {
          previousTitle: "Entrega",
          title,
          status: "merged",
          renamed: true,
          mergeSha: "merge-commit",
        },
      ],
    });
    expect(github.rename).toHaveBeenCalledExactlyOnceWith(1, title);
    expect(github.merge).toHaveBeenCalledExactlyOnceWith(1, "initial", title);
    expect(github.rename.mock.invocationCallOrder[0]).toBeLessThan(
      github.merge.mock.invocationCallOrder[0],
    );
    expect(github.get).toHaveBeenCalledTimes(4);
    expect(await bajarTp(students, github)).toMatchObject({ total: 0, merged: 0, renamed: 0 });
    expect(github.merge).toHaveBeenCalledTimes(1);
  });

  it("incorpora también PR con el título correcto", async () => {
    const { github, pull } = fakeGitHub();
    github.get
      .mockResolvedValueOnce({ ...pull, title })
      .mockResolvedValueOnce({ ...pull, title })
      .mockResolvedValueOnce({
        ...pull,
        title,
        merged: true,
        state: "closed",
        merge_commit_sha: "merge-commit",
      });
    expect(await bajarTp(students, github)).toMatchObject({ merged: 1, renamed: 0 });
    expect(github.rename).not.toHaveBeenCalled();
    expect(github.merge).toHaveBeenCalledExactlyOnceWith(1, "initial", title);
  });

  it("la vista previa no renombra ni hace merge", async () => {
    const { github } = fakeGitHub();
    expect(await bajarTp(students, github, true)).toMatchObject({
      planned: 1,
      merged: 0,
      renamed: 0,
      results: [{ title, status: "planned" }],
    });
    expect(github.rename).not.toHaveBeenCalled();
    expect(github.merge).not.toHaveBeenCalled();
  });

  it.each([3001, 2])("omite listas de archivos incompletas (%i)", async (changed_files) => {
    const { github, pull } = fakeGitHub();
    github.get.mockResolvedValue({ ...pull, changed_files });
    expect(await bajarTp(students, github)).toMatchObject({ skipped: 1, merged: 0 });
    expect(github.rename).not.toHaveBeenCalled();
    expect(github.merge).not.toHaveBeenCalled();
  });

  it.each([
    { state: "closed" },
    { head: { sha: "updated" } },
    { changed_files: 2 },
    { title: "Editado por otro usuario" },
    { base: { ref: "other", sha: "base" } },
    { base: { ref: "main", sha: "advanced" } },
    { draft: true },
    { user: { login: "gael" } },
  ])("omite cambios concurrentes antes de modificar el PR: %j", async (patch) => {
    const { github, pull } = fakeGitHub();
    github.get.mockResolvedValueOnce(pull).mockResolvedValue({ ...pull, ...patch });
    expect(await bajarTp(students, github)).toMatchObject({ skipped: 1 });
    expect(github.rename).not.toHaveBeenCalled();
    expect(github.merge).not.toHaveBeenCalled();
  });

  it("no hace merge si el PR cambia después de renombrar", async () => {
    const { github, pull } = fakeGitHub();
    github.get
      .mockResolvedValueOnce(pull)
      .mockResolvedValueOnce(pull)
      .mockResolvedValueOnce({ ...pull, title, head: { sha: "new-commit" } });
    expect(await bajarTp(students, github)).toMatchObject({ skipped: 1, merged: 0, renamed: 1 });
    expect(github.merge).not.toHaveBeenCalled();
  });

  it.each([{ state: "closed" }, { draft: true }])(
    "omite cerrados y borradores: %j",
    async (patch) => {
      const { github, pull } = fakeGitHub();
      github.get.mockResolvedValue({ ...pull, ...patch });
      expect(await bajarTp(students, github)).toMatchObject({ skipped: 1 });
      expect(github.files).not.toHaveBeenCalled();
      expect(github.merge).not.toHaveBeenCalled();
    },
  );

  it.each(["gael", "", null])(
    "no modifica una carpeta ajena o sin GitHub registrado: %s",
    async (githubAccount) => {
      const { github } = fakeGitHub();
      const roster = [{ ...students[0], github: githubAccount }];
      expect(await bajarTp(roster, github)).toMatchObject({
        skipped: 1,
        results: [{ detail: expect.stringContaining("autor") }],
      });
      expect(github.rename).not.toHaveBeenCalled();
      expect(github.merge).not.toHaveBeenCalled();
    },
  );

  it("no incorpora cambios fuera de la carpeta propia", async () => {
    const { github } = fakeGitHub();
    github.files.mockResolvedValue([{ filename: "README.md" }]);
    expect(await bajarTp(students, github)).toMatchObject({ skipped: 1 });
    expect(github.rename).not.toHaveBeenCalled();
    expect(github.merge).not.toHaveBeenCalled();
  });

  it("continúa con otros PR tras un error", async () => {
    const { github, pull } = fakeGitHub();
    github.listOpen.mockResolvedValue([{ ...pull, number: 2 }, pull]);
    github.get.mockRejectedValueOnce(new Error("GitHub denegó la operación."));
    expect(await bajarTp(students, github)).toMatchObject({ total: 2, failed: 1, merged: 1 });
  });

  it("no hace merge si no se guarda el título", async () => {
    const { github } = fakeGitHub();
    github.rename.mockImplementation(async () => {});
    expect(await bajarTp(students, github)).toMatchObject({ failed: 1, renamed: 0, merged: 0 });
    expect(github.merge).not.toHaveBeenCalled();
  });

  it("muestra el renombre aunque GitHub rechace el merge por conflicto o protección", async () => {
    const { github } = fakeGitHub();
    github.merge.mockRejectedValueOnce(new Error("La rama está protegida."));
    expect(await bajarTp(students, github)).toMatchObject({
      failed: 1,
      renamed: 1,
      merged: 0,
      results: [{ detail: "La rama está protegida.", renamed: true }],
    });
  });

  it.each([
    { merged: false, state: "open", merge_commit_sha: null },
    { merged: true, state: "closed", merge_commit_sha: "different-commit" },
  ])("no reporta incorporado sin verificar el merge: %j", async (patch) => {
    const { github, pull } = fakeGitHub();
    github.get
      .mockResolvedValueOnce(pull)
      .mockResolvedValueOnce(pull)
      .mockResolvedValueOnce({ ...pull, title })
      .mockResolvedValueOnce({ ...pull, title, ...patch });
    expect(await bajarTp(students, github)).toMatchObject({ failed: 1, merged: 0 });
  });

  it("reporta la respuesta merged=false como error", async () => {
    const { github } = fakeGitHub();
    github.merge.mockResolvedValueOnce({ merged: false, sha: "" });
    expect(await bajarTp(students, github)).toMatchObject({ failed: 1, merged: 0 });
  });

  it("devuelve cero cuando no hay PR abiertos", async () => {
    const { github } = fakeGitHub();
    github.listOpen.mockResolvedValue([]);
    expect(await bajarTp(students, github)).toMatchObject({
      total: 0,
      renamed: 0,
      merged: 0,
      skipped: 0,
      failed: 0,
    });
  });
});
