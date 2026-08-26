export interface AlumnoParaVCard {
  legajo: string;
  apellido: string;
  nombre: string;
  telefono: string | null;
  github: string | null;
}

export interface CursoParaVCard {
  name: string;
  students: AlumnoParaVCard[];
}

function unaLinea(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Escapa un valor de texto para una propiedad vCard 3.0. */
function escaparTexto(value: string): string {
  return value
    .trim()
    .replace(/\r\n?/g, "\n")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/[ \t]+/g, " ");
}

/** Convierte teléfonos argentinos locales al formato internacional de WhatsApp. */
export function normalizarTelefonoVCard(value: string | null): string | null {
  if (!value?.trim()) return null;
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  if (value.trim().startsWith("+")) return `+${digits}`;
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("54")) return `+${digits}`;
  return `+549${digits}`;
}

function tarjetaVCard(student: AlumnoParaVCard): string {
  const apellido = escaparTexto(student.apellido);
  const nombre = escaparTexto(student.nombre);
  const legajo = escaparTexto(student.legajo);
  const github = student.github
    ? `https://github.com/${unaLinea(student.github)}`
    : null;
  const telefono = normalizarTelefonoVCard(student.telefono);
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${apellido};${nombre};;;`,
    `FN:${apellido}\\, ${nombre}`,
    ...(telefono ? [`TEL;TYPE=CELL:${telefono}`] : []),
    ...(github ? [`URL:${github}`] : []),
    `NOTE:Legajo: ${legajo}`,
    "CATEGORIES:Alumnos",
    "END:VCARD",
  ];
  return lines.join("\r\n");
}

export function exportar_alumnos_vcard(courses: CursoParaVCard[]): string {
  const students = [
    ...new Map(
      courses
        .flatMap((course) => course.students)
        .map((student) => [student.legajo, student] as const),
    ).values(),
  ];
  return `${students.map(tarjetaVCard).join("\r\n")}\r\n`;
}
