import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import { useT } from "@agent-native/core/client/i18n";
import {
  IconCalendarEvent,
  IconCircleDashed,
  IconClock,
  IconMapPin,
  IconSettings,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import {
  ATTENDANCE_STATUS_OPTIONS,
  AttendanceStatusControl,
  type AttendanceStatus,
} from "@/components/agenda/AttendanceStatusControl";
import { StudentIdentity } from "@/components/agenda/StudentIdentity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AttendanceFilter = AttendanceStatus | "todos";
type ClassStatus = "programada" | "cancelada" | "a_confirmar";
type CancellationReason = "feriado" | "asueto" | "examen" | "paro" | "otro";

interface ClassSession {
  id: string;
  courseId: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  status: ClassStatus;
  cancellationReason: CancellationReason | null;
  cancellationNote: string | null;
  topic: string | null;
}

interface Course {
  id: string;
  name: string;
  commission: string | null;
  classroom: string | null;
}

interface AttendanceRow {
  legajo: string;
  apellido: string;
  nombre: string;
  course: Course;
  cells: Array<{ sessionId: string; status: AttendanceStatus | null }>;
}

interface AttendanceGrid {
  course: Course | null;
  courses: Course[];
  sessions: ClassSession[];
  rows: AttendanceRow[];
}

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${value}T12:00:00`));
}

function todayInArgentina() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function initialDate(sessions: ClassSession[]) {
  const today = todayInArgentina();
  const available = sessions.filter((session) => session.date <= today);
  return (
    available.find((session) => session.date === today)?.date ??
    available[available.length - 1]?.date ??
    ""
  );
}

const ALL_COURSES = "todas";

const attendanceDatePattern = /\[(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:,|\s)/;

function parseAttendanceDate(text: string) {
  const match = text.match(attendanceDatePattern);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]) + (match[3].length === 2 ? 2000 : 0);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
}

export function parseAttendanceLegajos(text: string, fallbackDate = "") {
  const valid = new Set<string>();
  const invalid = new Set<string>();
  const dates = new Set<string>();
  const entries = new Map<string, { legajo: string; date: string }>();
  const textDate = parseAttendanceDate(text);

  for (const line of text.split(/\r?\n/)) {
    const lineDate = parseAttendanceDate(line);
    const date = lineDate ?? textDate ?? fallbackDate;
    if (lineDate) dates.add(lineDate);

    for (const token of line.match(/\b\d{5}\b/g) ?? []) {
      const value = Number(token);
      if (value < 50000 || value > 65000) {
        invalid.add(token);
        continue;
      }

      valid.add(token);
      if (date) entries.set(`${date}:${token}`, { legajo: token, date });
    }
  }

  return {
    valid: Array.from(valid),
    invalid: Array.from(invalid),
    dates: Array.from(dates),
    entries: Array.from(entries.values()),
  };
}

export function AttendanceTab() {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCourseId = searchParams.get("curso") ?? ALL_COURSES;
  const requestedDate = searchParams.get("fecha") ?? "";
  const legacySessionId = searchParams.get("clase") ?? "";
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>("todos");
  const [editingClass, setEditingClass] = useState(false);
  const [classStatus, setClassStatus] = useState<ClassStatus>("programada");
  const [reason, setReason] = useState<CancellationReason>("feriado");
  const [note, setNote] = useState("");
  const [bulkAttendanceOpen, setBulkAttendanceOpen] = useState(false);
  const [bulkAttendanceText, setBulkAttendanceText] = useState("");
  const [loadingBulkAttendance, setLoadingBulkAttendance] = useState(false);

  const { data, isLoading } = useActionQuery<AttendanceGrid>("course-grid", {
    kind: "asistencia",
  });
  const setAttendance = useActionMutation("set-attendance");
  const updateClass = useActionMutation("update-class");

  const sessions = data?.sessions ?? [];
  const rows = data?.rows ?? [];
  const courses = data?.courses ?? [];
  const selectedCourseId =
    requestedCourseId === ALL_COURSES || courses.some((course) => course.id === requestedCourseId)
      ? requestedCourseId
      : ALL_COURSES;
  const today = todayInArgentina();
  const sessionsForCourse =
    selectedCourseId === ALL_COURSES
      ? sessions
      : sessions.filter((session) => session.courseId === selectedCourseId);
  const availableSessions = sessionsForCourse.filter((session) => session.date <= today);
  const allAvailableSessions = sessions.filter((session) => session.date <= today);
  const selectedDate =
    requestedDate || sessions.find((session) => session.id === legacySessionId)?.date || "";
  const selectedSessions = sessions.filter(
    (session) =>
      session.date === selectedDate &&
      session.date <= today &&
      (selectedCourseId === ALL_COURSES || session.courseId === selectedCourseId),
  );
  const selectedSession = selectedSessions.length === 1 ? selectedSessions[0] : null;
  const displayedRows = rows.filter(
    (row) => selectedCourseId === ALL_COURSES || row.course.id === selectedCourseId,
  );
  const attendanceRows = displayedRows.filter((row) => {
    const session = selectedSessions.find((item) => item.courseId === row.course.id);
    return session?.status === "programada";
  });
  const dateOptions = Array.from(new Set(allAvailableSessions.map((session) => session.date)));
  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;

  useEffect(() => {
    const legacySession = sessions.find((session) => session.id === legacySessionId);
    const legacyDate = legacySession && legacySession.date <= today ? legacySession.date : "";
    const nextDate =
      requestedDate && allAvailableSessions.some((session) => session.date === requestedDate)
        ? requestedDate
        : legacyDate || initialDate(availableSessions);
    if (!nextDate || (nextDate === requestedDate && !legacySessionId)) return;

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("fecha", nextDate);
        next.delete("clase");
        return next;
      },
      { replace: true },
    );
  }, [
    allAvailableSessions,
    availableSessions,
    legacySessionId,
    requestedDate,
    sessions,
    setSearchParams,
    today,
  ]);

  function selectCourse(courseId: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("curso", courseId);
      if (selectedDate) next.set("fecha", selectedDate);
      next.delete("clase");
      return next;
    });
  }

  function selectDate(date: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("fecha", date);
      next.delete("clase");
      return next;
    });
  }

  useEffect(() => {
    if (!selectedSession) {
      setEditingClass(false);
      return;
    }
    setClassStatus(selectedSession.status);
    setReason(selectedSession.cancellationReason ?? "feriado");
    setNote(selectedSession.cancellationNote ?? "");
    setEditingClass(false);
  }, [selectedSession]);

  const markedCount = useMemo(() => {
    return attendanceRows.filter((row) => {
      const session = selectedSessions.find((item) => item.courseId === row.course.id);
      return row.cells.some((cell) => cell.sessionId === session?.id && cell.status !== null);
    }).length;
  }, [attendanceRows, selectedSessions]);

  function statusFor(row: AttendanceRow) {
    const session = selectedSessions.find((item) => item.courseId === row.course.id);
    return row.cells.find((cell) => cell.sessionId === session?.id)?.status ?? null;
  }

  const attendanceSummary = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = {
      presente: 0,
      ausente: 0,
      justificada: 0,
    };
    for (const row of attendanceRows) {
      const status = statusFor(row);
      if (status) counts[status] += 1;
    }
    return counts;
  }, [attendanceRows, selectedSessions]);

  const parsedAttendance = useMemo(
    () => parseAttendanceLegajos(bulkAttendanceText, selectedDate),
    [bulkAttendanceText, selectedDate],
  );

  const bulkAttendanceGroups = useMemo(() => {
    const rowsByLegajo = new Map(displayedRows.map((row) => [row.legajo, row]));
    const groups = new Map<
      string,
      { classId: string; entries: Array<{ legajo: string; status: "presente" }> }
    >();

    for (const entry of parsedAttendance.entries) {
      const row = rowsByLegajo.get(entry.legajo);
      const session = row
        ? sessions.find(
            (item) =>
              item.date === entry.date &&
              item.date <= today &&
              item.status === "programada" &&
              item.courseId === row.course.id,
          )
        : null;
      if (!row || !session) continue;

      const group = groups.get(session.id) ?? { classId: session.id, entries: [] };
      group.entries.push({ legajo: entry.legajo, status: "presente" });
      groups.set(session.id, group);
    }

    return Array.from(groups.values());
  }, [displayedRows, parsedAttendance.entries, sessions, today]);

  const bulkAttendanceImportableCount = bulkAttendanceGroups.reduce(
    (total, group) => total + group.entries.length,
    0,
  );
  const bulkAttendanceUnknownCount = Math.max(
    parsedAttendance.entries.length - bulkAttendanceImportableCount,
    0,
  );

  const filteredRows = useMemo(() => {
    if (attendanceFilter === "todos") return attendanceRows;
    return attendanceRows.filter((row) => statusFor(row) === attendanceFilter);
  }, [attendanceFilter, attendanceRows, selectedSessions]);

  useEffect(() => {
    setAttendanceFilter("todos");
  }, [selectedDate]);

  useEffect(() => {
    setBulkAttendanceOpen(false);
    setBulkAttendanceText("");
  }, [selectedCourseId, selectedDate]);

  function mark(legajo: string, status: AttendanceStatus | null) {
    const row = rows.find((item) => item.legajo === legajo);
    const session = row ? selectedSessions.find((item) => item.courseId === row.course.id) : null;
    if (!session) return;
    setAttendance.mutate(
      { classId: session.id, entries: [{ legajo, status }] },
      { onError: (error) => toast.error(error.message) },
    );
  }

  async function loadBulkAttendance(event: React.FormEvent) {
    event.preventDefault();
    if (bulkAttendanceGroups.length === 0) {
      toast.error(t("agenda.attendanceNothingDetected"));
      return;
    }

    setLoadingBulkAttendance(true);
    try {
      for (const group of bulkAttendanceGroups) {
        await setAttendance.mutateAsync({ classId: group.classId, entries: group.entries });
      }
      toast.success(t("agenda.attendanceLoaded", { count: bulkAttendanceImportableCount }));
      setBulkAttendanceOpen(false);
      setBulkAttendanceText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingBulkAttendance(false);
    }
  }

  function saveClassStatus(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSession) return;
    updateClass.mutate(
      {
        classId: selectedSession.id,
        status: classStatus,
        cancellationReason: classStatus === "programada" ? null : reason,
        cancellationNote: classStatus === "programada" ? null : note.trim() || null,
      },
      {
        onSuccess: () => {
          setEditingClass(false);
          toast.success(t("agenda.classUpdated"));
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-2" aria-label={t("agenda.loading")}>
        <div className="h-20 animate-pulse rounded-md bg-muted" />
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (availableSessions.length === 0) {
    return (
      <div className="border-y border-dashed border-border py-14 text-center">
        <IconCalendarEvent className="mx-auto mb-3 size-7 text-muted-foreground" />
        <p className="font-medium">{t("agenda.noClasses")}</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="attendance-roster-title">
      <div className="mb-5 grid gap-4 border-y border-border bg-muted/25 py-4 lg:grid-cols-[minmax(14rem,1fr)_minmax(14rem,1fr)_auto] lg:items-end">
        <div className="grid gap-1.5">
          <Label htmlFor="attendance-course">{t("agenda.course")}</Label>
          <select
            id="attendance-course"
            value={selectedCourseId}
            onChange={(event) => selectCourse(event.target.value)}
            className={selectClass}
          >
            <option value={ALL_COURSES}>{t("agenda.allCourses")}</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.commission ?? course.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="attendance-date">{t("agenda.classDate")}</Label>
          <select
            id="attendance-date"
            value={dateOptions.includes(selectedDate) ? selectedDate : ""}
            onChange={(event) => selectDate(event.target.value)}
            className={`${selectClass} w-full lg:max-w-xl`}
            disabled={dateOptions.length === 0}
          >
            {dateOptions.length === 0 ? (
              <option value="">—</option>
            ) : (
              dateOptions.map((date) => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {attendanceRows.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkAttendanceOpen(true)}
              disabled={bulkAttendanceOpen || editingClass}
            >
              {t("agenda.loadAttendance")}
            </Button>
          ) : null}
          {selectedCourseId !== ALL_COURSES && selectedSession ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingClass(true)}
              disabled={editingClass || bulkAttendanceOpen}
            >
              <IconSettings aria-hidden="true" />
              {t("agenda.manageClass")}
            </Button>
          ) : null}
        </div>
      </div>

      {selectedSessions.length > 0 ? (
        <>
          {bulkAttendanceOpen ? (
            <form
              onSubmit={loadBulkAttendance}
              className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-y border-border bg-muted/25 py-4"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="bulk-attendance-text">{t("agenda.loadAttendance")}</Label>
                <textarea
                  id="bulk-attendance-text"
                  rows={5}
                  value={bulkAttendanceText}
                  onChange={(event) => setBulkAttendanceText(event.target.value)}
                  placeholder={t("agenda.loadAttendancePlaceholder")}
                  className="min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-xs text-muted-foreground">{t("agenda.loadAttendanceHint")}</p>
                <div className="grid gap-0.5 text-xs" aria-live="polite">
                  {parsedAttendance.dates.length > 0 ? (
                    <span>
                      {t("agenda.attendanceDatesDetected", {
                        dates: parsedAttendance.dates.map(formatDate).join(", "),
                      })}
                    </span>
                  ) : null}
                  <span>
                    {t("agenda.attendanceDetected", {
                      count: parsedAttendance.valid.length,
                    })}
                  </span>
                  {parsedAttendance.invalid.length > 0 ? (
                    <span className="text-amber-700 dark:text-amber-300">
                      {t("agenda.attendanceInvalid", {
                        count: parsedAttendance.invalid.length,
                      })}
                    </span>
                  ) : null}
                  {bulkAttendanceUnknownCount > 0 ? (
                    <span className="text-amber-700 dark:text-amber-300">
                      {t("agenda.attendanceUnknown", {
                        count: bulkAttendanceUnknownCount,
                      })}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="submit"
                  disabled={loadingBulkAttendance || bulkAttendanceImportableCount === 0}
                >
                  {loadingBulkAttendance ? t("agenda.loadingAttendance") : t("agenda.save")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    setBulkAttendanceOpen(false);
                    setBulkAttendanceText("");
                  }}
                  disabled={loadingBulkAttendance}
                  aria-label={t("agenda.cancel")}
                  title={t("agenda.cancel")}
                >
                  <IconX aria-hidden="true" />
                </Button>
              </div>
            </form>
          ) : null}

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium capitalize">
                  <IconCalendarEvent aria-hidden="true" className="size-4 text-primary" />
                  {formatDate(selectedDate)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <IconClock aria-hidden="true" className="size-4" />
                  {selectedSession
                    ? `${selectedSession.startTime}–${selectedSession.endTime}`
                    : "—"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <IconMapPin aria-hidden="true" className="size-4" />
                  {t("agenda.classroom")} {selectedCourse?.classroom ?? "—"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedSessions.length === 1 && selectedSession?.status === "cancelada"
                  ? `${t("agenda.cancelledClass")}: ${selectedSession.cancellationNote ?? selectedSession.cancellationReason}`
                  : selectedSessions.length === 1 && selectedSession?.status === "a_confirmar"
                    ? `${t("agenda.classToConfirm")}: ${selectedSession.cancellationNote ?? ""}`
                    : selectedSessions.every((session) => session.status !== "programada")
                      ? selectedSessions.every((session) => session.status === "cancelada")
                        ? t("agenda.noAttendanceCancelled")
                        : t("agenda.noAttendanceToConfirm")
                      : t("agenda.markedStudents", {
                          marked: markedCount,
                          total: attendanceRows.length,
                        })}
              </p>
            </div>
            {attendanceRows.length > 0 ? (
              <div
                className="flex flex-wrap items-center justify-end gap-1.5"
                role="group"
                aria-label={t("agenda.attendanceFilters")}
              >
                <button
                  type="button"
                  aria-pressed={attendanceFilter === "todos"}
                  onClick={() => setAttendanceFilter("todos")}
                  className={cn(
                    "inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    attendanceFilter === "todos"
                      ? "border-border bg-muted text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
                  )}
                >
                  {t("agenda.allStatuses")}
                  <span className="font-mono tabular-nums">{attendanceRows.length}</span>
                </button>
                {ATTENDANCE_STATUS_OPTIONS.map((option) => {
                  const active = attendanceFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setAttendanceFilter(option.value)}
                      className={cn(
                        "inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? option.activeClass
                          : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
                      )}
                    >
                      {t(option.labelKey)}
                      <span className="font-mono tabular-nums">
                        {attendanceSummary[option.value]}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {editingClass ? (
            <form
              onSubmit={saveClassStatus}
              className="mb-6 grid gap-4 border-y border-border bg-muted/25 py-4 sm:grid-cols-[12rem_12rem_1fr_auto] sm:items-end"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="class-status">{t("agenda.classStatus")}</Label>
                <select
                  id="class-status"
                  value={classStatus}
                  onChange={(event) => setClassStatus(event.target.value as ClassStatus)}
                  className={selectClass}
                >
                  <option value="programada">{t("agenda.scheduled")}</option>
                  <option value="cancelada">{t("agenda.cancelled")}</option>
                  <option value="a_confirmar">{t("agenda.toConfirm")}</option>
                </select>
              </div>
              {classStatus !== "programada" ? (
                <div className="grid gap-1.5">
                  <Label htmlFor="cancellation-reason">{t("agenda.reason")}</Label>
                  <select
                    id="cancellation-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value as CancellationReason)}
                    className={selectClass}
                  >
                    <option value="feriado">{t("agenda.reasonHoliday")}</option>
                    <option value="asueto">{t("agenda.reasonRecess")}</option>
                    <option value="examen">{t("agenda.reasonExam")}</option>
                    <option value="paro">{t("agenda.reasonStrike")}</option>
                    <option value="otro">{t("agenda.reasonOther")}</option>
                  </select>
                </div>
              ) : null}
              {classStatus !== "programada" ? (
                <div className="grid gap-1.5">
                  <Label htmlFor="cancellation-note">{t("agenda.observation")}</Label>
                  <Input
                    id="cancellation-note"
                    name="note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </div>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={updateClass.isPending}>
                  {t("agenda.save")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => setEditingClass(false)}
                  aria-label={t("agenda.cancel")}
                  title={t("agenda.cancel")}
                >
                  <IconX aria-hidden="true" />
                </Button>
              </div>
            </form>
          ) : null}

          {selectedSessions.every((session) => session.status !== "programada") ? (
            <div className="border-y border-dashed border-border py-12 text-center">
              <IconCircleDashed className="mx-auto mb-3 size-7 text-muted-foreground" />
              <p className="font-medium">
                {selectedSessions.every((session) => session.status === "cancelada")
                  ? t("agenda.noAttendanceCancelled")
                  : t("agenda.noAttendanceToConfirm")}
              </p>
            </div>
          ) : filteredRows.length === 0 ? (
            <p className="border-y border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              {t("agenda.noStudentsInAttendanceStatus")}
            </p>
          ) : (
            <>
              <div className="divide-y divide-border border-y border-border sm:hidden">
                {filteredRows.map((row) => {
                  const current = statusFor(row);
                  const fullName = `${row.apellido}, ${row.nombre}`;
                  return (
                    <article key={row.legajo} className="py-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <StudentIdentity
                          legajo={row.legajo}
                          name={fullName}
                          href={`/alumnos/${row.legajo}`}
                          className="min-w-0"
                        />
                      </div>
                      <AttendanceStatusControl
                        value={current}
                        onChange={(status) => mark(row.legajo, status)}
                        ariaLabel={t("agenda.attendanceOf", { name: fullName })}
                        size="sm"
                        className="grid grid-cols-3 gap-1"
                      />
                    </article>
                  );
                })}
              </div>
              <div className="hidden overflow-x-auto border-y border-border sm:block">
                <table className="w-full min-w-[720px] text-sm">
                  <caption className="sr-only">{t("agenda.attendanceTableCaption")}</caption>
                  <thead className="bg-muted/45 text-left">
                    <tr>
                      <th scope="col" className="px-3 py-2.5 font-medium">
                        {t("agenda.alumno")}
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-medium">
                        {t("agenda.attendanceStatus")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const current = statusFor(row);
                      const fullName = `${row.apellido}, ${row.nombre}`;
                      return (
                        <tr key={row.legajo} className="border-t border-border hover:bg-accent/25">
                          <th scope="row" className="px-3 py-2 text-left font-normal">
                            <StudentIdentity
                              legajo={row.legajo}
                              name={fullName}
                              href={`/alumnos/${row.legajo}`}
                              className="min-w-64"
                            />
                          </th>
                          <td className="px-3 py-2">
                            <fieldset>
                              <legend className="sr-only">
                                {t("agenda.attendanceOf", { name: fullName })}
                              </legend>
                              <AttendanceStatusControl
                                value={current}
                                onChange={(status) => mark(row.legajo, status)}
                                ariaLabel={t("agenda.attendanceOf", { name: fullName })}
                              />
                            </fieldset>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="border-y border-dashed border-border py-12 text-center">
          <IconCalendarEvent className="mx-auto mb-3 size-7 text-muted-foreground" />
          <p className="font-medium">{t("agenda.noClassOnDate")}</p>
        </div>
      )}
    </section>
  );
}
