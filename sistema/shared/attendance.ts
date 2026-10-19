export const ATTENDANCE_STATUSES = ["presente", "tarde", "ausente", "justificada"] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

interface AttendanceEntry {
  legajo: string;
  date: string;
  arrivalMinutes: number | null;
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

export function parseAttendanceLegajos(text: string, fallbackDate = "") {
  const valid = new Set<string>();
  const invalid = new Set<string>();
  const dates = new Set<string>();
  const entries = new Map<string, AttendanceEntry>();
  let date = parseAttendanceHeader(text)?.date ?? fallbackDate;
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
