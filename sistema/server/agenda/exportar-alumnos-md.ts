export interface AlumnoParaMarkdown {
  legajo: string;
  apellido: string;
  nombre: string;
  telefono: string | null;
  github: string | null;
}

export interface CursoParaMarkdown {
  name: string;
  students: AlumnoParaMarkdown[];
}

export const TITULO_ALUMNOS_MD = "TUP 2026 - Programación IV";

const HEADERS = ["Legajo", "Nombre y Apellido", "Teléfono", "GitHub"];
const MIN_WIDTHS = [6, 40, 14, 25];

function unaLinea(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function nombreSeccion(courseName: string): string {
  const name = unaLinea(courseName);
  const parts = name.split(/\s+-\s+/);
  const suffix = parts[parts.length - 1];
  return suffix && /^C\d+[\w-]*$/i.test(suffix) ? suffix : name;
}

function tablaAlumnos(students: AlumnoParaMarkdown[]): string {
  const rows = students.map((student) => [
    unaLinea(student.legajo),
    unaLinea(`${student.apellido}, ${student.nombre}`),
    student.telefono ? unaLinea(student.telefono) : "-",
    student.github ? unaLinea(student.github) : "-",
  ]);

  const widths = HEADERS.map((header, index) =>
    Math.max(
      MIN_WIDTHS[index],
      header.length,
      ...rows.map((row) => row[index].length),
    ),
  );
  const formatRow = (row: string[]) =>
    row
      .map((value, index) =>
        index === row.length - 1 ? value : value.padEnd(widths[index]),
      )
      .join("  ");

  return [
    formatRow(HEADERS),
    widths.map((width) => "-".repeat(width)).join("  "),
    ...rows.map(formatRow),
  ].join("\n");
}

export function exportar_alumnos_md(
  courses: CursoParaMarkdown[],
  title = TITULO_ALUMNOS_MD,
): string {
  const sections = courses.map(
    (course) =>
      `## ${nombreSeccion(course.name)}\n\`\`\`text\n${tablaAlumnos(course.students)}\n\`\`\``,
  );

  return [`# ${unaLinea(title)}`, ...sections].join("\n\n") + "\n";
}
