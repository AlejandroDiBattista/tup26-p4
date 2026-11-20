export const ATTENDANCE_STATUSES = ["presente", "tarde", "ausente", "justificada"] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

interface AttendanceEntry {
  legajo: string;
  date: string;
  arrivalMinutes: number | null;
}

export function todayInArgentina(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function isRecentAttendanceDate(date: string, today = todayInArgentina()) {
  const age = (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86_400_000;
  return age >= 0 && age < 7;
}

function timeMinutes(time: string) {
  const match = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour < 24 && minute < 60 ? hour * 60 + minute : null;
}

function parseAttendanceHeader(text: string) {
  const dateFirst = text.match(/\[(\d{1,2}\/\d{1,2}\/\d{2,4})(?:,|\s)\s*([^\]]*)\]/);
  const timeFirst = text.match(/\[([^,\]]+),\s*(\d{1,2}\/\d{1,2}\/\d{2,4})\]/);
  const dateText = dateFirst?.[1] ?? timeFirst?.[2];
  if (!dateText) return null;
  const [day, month, rawYear] = dateText.split("/").map(Number);
  const year = rawYear < 100 ? rawYear + 2000 : rawYear;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;

  const timeText = dateFirst?.[2] ?? timeFirst?.[1] ?? "";
  const time = timeText.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*([ap])\.?\s*m\.?)?$/i);
  let arrivalMinutes: number | null = null;
  if (time) {
    let hour = Number(time[1]);
    const period = time[3]?.toLowerCase();
    if (!period || (hour >= 1 && hour <= 12)) {
      if (period) hour = (hour % 12) + (period === "p" ? 12 : 0);
      arrivalMinutes = timeMinutes(`${hour}:${time[2]}`);
    }
  }
  return { date: date.toISOString().slice(0, 10), arrivalMinutes };
}

export function recentAttendanceText(text: string, today = todayInArgentina()) {
  let date = "";
  return text
    .split(/\r?\n/)
    .filter((line) => {
      const header = parseAttendanceHeader(line);
      if (header) date = header.date;
      return isRecentAttendanceDate(date, today);
    })
    .join("\n");
}

export function parseAttendanceLegajos(text: string, fallbackDate = "") {
  const valid = new Set<string>();
  const invalid = new Set<string>();
  const dates = new Set<string>();
  const entries = new Map<string, AttendanceEntry>();
  let date = fallbackDate;
  let arrivalMinutes: number | null = null;

  for (const line of text.split(/\r?\n/)) {
    const header = parseAttendanceHeader(line);
    if (header) {
      date = header.date;
      arrivalMinutes = header.arrivalMinutes;
      dates.add(date);
    }
    for (const token of line.match(/\b\d{5}\b/g) ?? []) {
      const value = Number(token);
      if (value < 50000 || value > 65000) {
        invalid.add(token);
        continue;
      }
      valid.add(token);
      if (!date) continue;
      const key = `${date}:${token}`;
      const previous = entries.get(key);
      if (
        !previous ||
        (arrivalMinutes !== null &&
          (previous.arrivalMinutes === null || arrivalMinutes < previous.arrivalMinutes))
      ) {
        entries.set(key, { legajo: token, date, arrivalMinutes });
      }
    }
  }
  return {
    valid: Array.from(valid),
    invalid: Array.from(invalid),
    dates: Array.from(dates),
    entries: Array.from(entries.values()),
  };
}

/** Importa solo fechas explícitas recientes, sin depender de la fecha visible. */
export function prepareAttendanceImport(
  text: string,
  rows: Array<{ legajo: string; course: { id: string } }>,
  sessions: Array<{
    id: string;
    courseId: string;
    date: string;
    status: string;
    startTime: string | null;
  }>,
  today = todayInArgentina(),
) {
  const rowsByLegajo = new Map(rows.map((row) => [row.legajo, row]));
  const scheduled = new Map(
    sessions
      .filter((session) => session.status === "programada")
      .map((session) => [`${session.courseId}:${session.date}`, session]),
  );
  const groups = new Map<
    string,
    {
      classId: string;
      date: string;
      entries: Array<{ legajo: string; status: "presente" | "tarde" }>;
    }
  >();

  for (const entry of parseAttendanceLegajos(text).entries) {
    if (!isRecentAttendanceDate(entry.date, today)) continue;
    const row = rowsByLegajo.get(entry.legajo);
    const session = row ? scheduled.get(`${row.course.id}:${entry.date}`) : undefined;
    if (!session) continue;
    const group = groups.get(session.id) ?? {
      classId: session.id,
      date: session.date,
      entries: [],
    };
    group.entries.push({
      legajo: entry.legajo,
      status: attendanceStatusForArrival(entry.arrivalMinutes, session.startTime),
    });
    groups.set(session.id, group);
  }

  return Array.from(groups.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function attendanceStatusForArrival(
  arrivalMinutes: number | null,
  startTime: string | null,
): "presente" | "tarde" {
  const start = startTime ? timeMinutes(startTime) : null;
  return arrivalMinutes !== null && start !== null && arrivalMinutes >= start + 20
    ? "tarde"
    : "presente";
}

export function summarizeAttendance(statuses: Array<AttendanceStatus | null>) {
  const presentes = statuses.filter((status) => status === "presente").length;
  const tardes = statuses.filter((status) => status === "tarde").length;
  const ausentes = statuses.filter((status) => status === "ausente").length;
  const justificadas = statuses.filter((status) => status === "justificada").length;
  const asistencias = presentes + tardes / 2;
  const computables = presentes + tardes + ausentes;
  return {
    presentes,
    tardes,
    ausentes,
    justificadas,
    asistencias,
    marcadas: computables + justificadas,
    porcentaje: computables === 0 ? null : Math.round((asistencias / computables) * 100),
  };
}
