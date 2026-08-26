import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { useT } from "@agent-native/core/client/i18n";
import {
  IconCalendarEvent,
  IconCheck,
  IconCircleDashed,
  IconClock,
  IconMapPin,
  IconSettings,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type AttendanceStatus = "presente" | "ausente" | "justificada";
type ClassStatus = "programada" | "cancelada" | "a_confirmar";
type CancellationReason = "feriado" | "asueto" | "examen" | "paro" | "otro";

interface ClassSession {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  status: ClassStatus;
  cancellationReason: CancellationReason | null;
  cancellationNote: string | null;
  topic: string | null;
}

interface AttendanceRow {
  legajo: string;
  apellido: string;
  nombre: string;
  cells: Array<{ sessionId: string; status: AttendanceStatus | null }>;
}

interface AttendanceGrid {
  course: {
    id: string;
    name: string;
    commission: string | null;
    classroom: string | null;
  };
  sessions: ClassSession[];
  rows: AttendanceRow[];
}

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

const ATTENDANCE_OPTIONS: Array<{
  value: AttendanceStatus;
  labelKey: string;
  activeClass: string;
}> = [
  {
    value: "presente",
    labelKey: "agenda.present",
    activeClass:
      "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-200",
  },
  {
    value: "ausente",
    labelKey: "agenda.absent",
    activeClass:
      "border-rose-600 bg-rose-50 text-rose-800 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-200",
  },
  {
    value: "justificada",
    labelKey: "agenda.justified",
    activeClass:
      "border-amber-600 bg-amber-50 text-amber-900 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-200",
  },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${value}T12:00:00`));
}

function sessionLabel(session: ClassSession) {
  const marker =
    session.status === "cancelada"
      ? " · Cancelada"
      : session.status === "a_confirmar"
        ? " · A confirmar"
        : "";
  return `${formatDate(session.date)}${marker}`;
}

function initialSession(sessions: ClassSession[]) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    sessions.find((session) => session.date === today) ??
    sessions.find(
      (session) => session.date > today && session.status === "programada",
    ) ??
    [...sessions]
      .reverse()
      .find((session) => session.status === "programada") ??
    sessions[0]
  );
}

export function AttendanceTab({ courseId }: { courseId: string }) {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSessionId = searchParams.get("clase") ?? "";
  const [editingClass, setEditingClass] = useState(false);
  const [classStatus, setClassStatus] = useState<ClassStatus>("programada");
  const [reason, setReason] = useState<CancellationReason>("feriado");
  const [note, setNote] = useState("");

  const { data, isLoading } = useActionQuery<AttendanceGrid>("course-grid", {
    course: courseId,
    kind: "asistencia",
  });
  const setAttendance = useActionMutation("set-attendance");
  const updateClass = useActionMutation("update-class");

  const sessions = data?.sessions ?? [];
  const rows = data?.rows ?? [];
  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) ?? null;

  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      const nextId = initialSession(sessions)?.id;
      if (!nextId) return;
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("clase", nextId);
          return next;
        },
        { replace: true },
      );
    }
  }, [selectedSessionId, sessions, setSearchParams]);

  function selectSession(sessionId: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("clase", sessionId);
      return next;
    });
  }

  useEffect(() => {
    if (!selectedSession) return;
    setClassStatus(selectedSession.status);
    setReason(selectedSession.cancellationReason ?? "feriado");
    setNote(selectedSession.cancellationNote ?? "");
    setEditingClass(false);
  }, [selectedSession]);

  const markedCount = useMemo(() => {
    if (!selectedSession) return 0;
    return rows.filter((row) =>
      row.cells.some(
        (cell) => cell.sessionId === selectedSession.id && cell.status !== null,
      ),
    ).length;
  }, [rows, selectedSession]);

  function statusFor(row: AttendanceRow) {
    if (!selectedSession) return null;
    return (
      row.cells.find((cell) => cell.sessionId === selectedSession.id)?.status ??
      null
    );
  }

  function mark(legajo: string, status: AttendanceStatus | null) {
    if (!selectedSession) return;
    setAttendance.mutate(
      { classId: selectedSession.id, entries: [{ legajo, status }] },
      { onError: (error) => toast.error(error.message) },
    );
  }

  function markAllPresent() {
    if (!selectedSession || rows.length === 0) return;
    setAttendance.mutate(
      {
        classId: selectedSession.id,
        entries: rows.map((row) => ({
          legajo: row.legajo,
          status: "presente",
        })),
      },
      {
        onSuccess: () => toast.success(t("agenda.allMarkedPresent")),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function saveClassStatus(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedSession) return;
    updateClass.mutate(
      {
        classId: selectedSession.id,
        status: classStatus,
        cancellationReason: classStatus === "programada" ? null : reason,
        cancellationNote:
          classStatus === "programada" ? null : note.trim() || null,
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

  if (sessions.length === 0) {
    return (
      <div className="border-y border-dashed border-border py-14 text-center">
        <IconCalendarEvent className="mx-auto mb-3 size-7 text-muted-foreground" />
        <p className="font-medium">{t("agenda.noClasses")}</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="attendance-roster-title">
      <div className="mb-5 grid gap-4 border-y border-border bg-muted/25 py-4 lg:grid-cols-[minmax(18rem,1fr)_auto] lg:items-end">
        <div className="grid gap-1.5">
          <Label htmlFor="attendance-session">{t("agenda.classDate")}</Label>
          <select
            id="attendance-session"
            value={selectedSession?.id ?? ""}
            onChange={(event) => selectSession(event.target.value)}
            className={`${selectClass} w-full lg:max-w-xl`}
          >
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {sessionLabel(session)}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditingClass((open) => !open)}
        >
          {editingClass ? (
            <IconX aria-hidden="true" />
          ) : (
            <IconSettings aria-hidden="true" />
          )}
          {editingClass ? t("agenda.close") : t("agenda.manageClass")}
        </Button>
      </div>

      {selectedSession ? (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1.5 font-medium capitalize">
                  <IconCalendarEvent
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                  {formatDate(selectedSession.date)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <IconClock aria-hidden="true" className="size-4" />
                  {selectedSession.startTime}–{selectedSession.endTime}
                </span>
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <IconMapPin aria-hidden="true" className="size-4" />
                  {t("agenda.classroom")} {data?.course.classroom ?? "—"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedSession.status === "cancelada"
                  ? `${t("agenda.cancelledClass")}: ${selectedSession.cancellationNote ?? selectedSession.cancellationReason}`
                  : selectedSession.status === "a_confirmar"
                    ? `${t("agenda.classToConfirm")}: ${selectedSession.cancellationNote ?? ""}`
                    : t("agenda.markedStudents", {
                        marked: markedCount,
                        total: rows.length,
                      })}
              </p>
            </div>
            {selectedSession.status === "programada" ? (
              <Button
                type="button"
                variant="outline"
                onClick={markAllPresent}
                disabled={setAttendance.isPending}
              >
                <IconCheck aria-hidden="true" />
                {t("agenda.allPresent")}
              </Button>
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
                  onChange={(event) =>
                    setClassStatus(event.target.value as ClassStatus)
                  }
                  className={selectClass}
                >
                  <option value="programada">{t("agenda.scheduled")}</option>
                  <option value="cancelada">{t("agenda.cancelled")}</option>
                  <option value="a_confirmar">{t("agenda.toConfirm")}</option>
                </select>
              </div>
              {classStatus !== "programada" ? (
                <div className="grid gap-1.5">
                  <Label htmlFor="cancellation-reason">
                    {t("agenda.reason")}
                  </Label>
                  <select
                    id="cancellation-reason"
                    value={reason}
                    onChange={(event) =>
                      setReason(event.target.value as CancellationReason)
                    }
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
                  <Label htmlFor="cancellation-note">
                    {t("agenda.observation")}
                  </Label>
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
              <Button type="submit" disabled={updateClass.isPending}>
                {t("agenda.save")}
              </Button>
            </form>
          ) : null}

          {selectedSession.status !== "programada" ? (
            <div className="border-y border-dashed border-border py-12 text-center">
              <IconCircleDashed className="mx-auto mb-3 size-7 text-muted-foreground" />
              <p className="font-medium">
                {selectedSession.status === "cancelada"
                  ? t("agenda.noAttendanceCancelled")
                  : t("agenda.noAttendanceToConfirm")}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border border-y border-border sm:hidden">
                {rows.map((row) => {
                  const current = statusFor(row);
                  const fullName = `${row.apellido}, ${row.nombre}`;
                  return (
                    <article key={row.legajo} className="py-3">
                      <div className="mb-2 flex items-baseline justify-between gap-3">
                        <Link
                          to={`/alumnos/${row.legajo}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {fullName}
                        </Link>
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {row.legajo}
                        </span>
                      </div>
                      <div
                        className="grid grid-cols-3 gap-1"
                        role="group"
                        aria-label={t("agenda.attendanceOf", {
                          name: fullName,
                        })}
                      >
                        {ATTENDANCE_OPTIONS.map((option) => {
                          const active = current === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              aria-pressed={active}
                              onClick={() => mark(row.legajo, option.value)}
                              className={cn(
                                "min-h-10 rounded-md border px-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                active
                                  ? option.activeClass
                                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                              )}
                            >
                              {t(option.labelKey)}
                            </button>
                          );
                        })}
                      </div>
                      {current ? (
                        <button
                          type="button"
                          onClick={() => mark(row.legajo, null)}
                          className="mt-1 min-h-8 text-xs text-muted-foreground underline-offset-4 hover:underline"
                        >
                          {t("agenda.clear")}
                        </button>
                      ) : null}
                    </article>
                  );
                })}
              </div>
              <div className="hidden overflow-x-auto border-y border-border sm:block">
                <table className="w-full min-w-[720px] text-sm">
                  <caption className="sr-only">
                    {t("agenda.attendanceTableCaption")}
                  </caption>
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
                    {rows.map((row) => {
                      const current = statusFor(row);
                      const fullName = `${row.apellido}, ${row.nombre}`;
                      return (
                        <tr
                          key={row.legajo}
                          className="border-t border-border hover:bg-accent/25"
                        >
                          <th
                            scope="row"
                            className="px-3 py-2 text-left font-normal"
                          >
                            <Link
                              to={`/alumnos/${row.legajo}`}
                              className="font-medium hover:underline"
                            >
                              {fullName}
                            </Link>
                            <span className="ms-2 font-mono text-xs tabular-nums text-muted-foreground">
                              {row.legajo}
                            </span>
                          </th>
                          <td className="px-3 py-2">
                            <fieldset>
                              <legend className="sr-only">
                                {t("agenda.attendanceOf", { name: fullName })}
                              </legend>
                              <div className="inline-flex flex-wrap gap-1">
                                {ATTENDANCE_OPTIONS.map((option) => {
                                  const active = current === option.value;
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      aria-pressed={active}
                                      onClick={() =>
                                        mark(row.legajo, option.value)
                                      }
                                      className={cn(
                                        "min-h-9 rounded-md border px-3 text-xs font-medium outline-none transition-[background-color,border-color,color] focus-visible:ring-2 focus-visible:ring-ring",
                                        active
                                          ? option.activeClass
                                          : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
                                      )}
                                    >
                                      {t(option.labelKey)}
                                    </button>
                                  );
                                })}
                                {current ? (
                                  <button
                                    type="button"
                                    onClick={() => mark(row.legajo, null)}
                                    className="min-h-9 rounded-md px-2 text-xs text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                  >
                                    {t("agenda.clear")}
                                  </button>
                                ) : null}
                              </div>
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
      ) : null}
    </section>
  );
}
