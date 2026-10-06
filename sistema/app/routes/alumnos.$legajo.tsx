import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import { useT } from "@agent-native/core/client/i18n";
import {
  IconBrandGithub,
  IconCalendarCheck,
  IconChevronLeft,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

import {
  AttendanceStatusControl,
  type AttendanceStatus,
} from "@/components/agenda/AttendanceStatusControl";
import { InlineEdit } from "@/components/agenda/InlineEdit";
import { StudentIdentity } from "@/components/agenda/StudentIdentity";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type WorkStatus = "pendiente" | "error" | "falla" | "presentado";
type ClassStatus = "programada" | "cancelada" | "a_confirmar";

interface Course {
  id: string;
  name: string;
  commission: string | null;
  classroom: string | null;
  term: string | null;
}

interface StudentSummary {
  student: {
    legajo: string;
    apellido: string;
    nombre: string;
    telefono: string | null;
    github: string | null;
  };
  courses: Course[];
  course: Course | null;
  practicos?: Array<{
    id: string;
    title: string;
    date: string | null;
    graded: boolean;
    status: WorkStatus;
    score: number | null;
  }>;
  clases?: Array<{
    id: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    status: ClassStatus;
    cancellationReason: string | null;
    cancellationNote: string | null;
    attendanceStatus: AttendanceStatus | null;
  }>;
  totales?: {
    practicosPresentados: number;
    practicosConFalla: number;
    practicosTotales: number;
    promedio: number | null;
    clasesPresentes: number;
    clasesAusentes: number;
    clasesJustificadas: number;
    clasesMarcadas: number;
    asistenciaPorcentaje: number | null;
  };
}

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

const WORK_STATUSES: Array<{ value: WorkStatus; key: string }> = [
  { value: "pendiente", key: "agenda.pending" },
  { value: "error", key: "agenda.error" },
  { value: "falla", key: "agenda.failure" },
  { value: "presentado", key: "agenda.submitted" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${value}T12:00:00`));
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-s-2 border-primary px-3 py-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function meta() {
  return [{ title: "Ficha del alumno · Programación IV" }];
}

export default function AlumnoDetalle() {
  const { legajo = "" } = useParams();
  const t = useT();
  const { data, isLoading, error } = useActionQuery<StudentSummary>("student-summary", { legajo });
  const { data: courseData } = useActionQuery<{ courses: Course[] }>("list-courses");
  const upsert = useActionMutation("upsert-student");
  const setResult = useActionMutation("set-assessment-result");
  const setAttendance = useActionMutation("set-attendance");
  const [editingCourse, setEditingCourse] = useState(false);

  function saveField(field: "apellido" | "nombre" | "telefono" | "github", value: string) {
    upsert.mutate(
      { legajo, [field]: value },
      { onError: (mutationError) => toast.error(mutationError.message) },
    );
  }

  function changeCourse(course: string) {
    if (!course || course === data?.course?.id) {
      setEditingCourse(false);
      return;
    }
    setEditingCourse(false);
    upsert.mutate(
      { legajo, course },
      {
        onSuccess: () => toast.success(t("agenda.studentMoved")),
        onError: (mutationError) => toast.error(mutationError.message),
      },
    );
  }

  function updateWork(assessmentId: string, status: WorkStatus) {
    setResult.mutate(
      { assessmentId, legajo, status },
      { onError: (mutationError) => toast.error(mutationError.message) },
    );
  }

  function updateScore(assessmentId: string, status: WorkStatus, raw: string) {
    const value = raw.trim();
    if (!value) {
      setResult.mutate(
        { assessmentId, legajo, score: null },
        { onError: (mutationError) => toast.error(mutationError.message) },
      );
      return;
    }
    const score = Number(value.replace(",", "."));
    if (Number.isNaN(score) || score < 1 || score > 10) {
      toast.error(t("agenda.invalidScore"));
      return;
    }
    setResult.mutate(
      {
        assessmentId,
        legajo,
        status: status === "pendiente" ? "presentado" : status,
        score,
      },
      { onError: (mutationError) => toast.error(mutationError.message) },
    );
  }

  function updateAttendance(classId: string, status: AttendanceStatus | null) {
    setAttendance.mutate(
      { classId, entries: [{ legajo, status }] },
      { onError: (mutationError) => toast.error(mutationError.message) },
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">{t("agenda.loading")}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/alumnos" className="mb-4 inline-flex min-h-9 items-center gap-1 text-sm">
          <IconChevronLeft aria-hidden="true" className="size-4" />
          {t("agenda.backToStudents")}
        </Link>
        <p className="text-sm text-destructive">{error?.message ?? t("agenda.studentNotFound")}</p>
      </div>
    );
  }

  const { student, course, practicos = [], clases = [], totales } = data;
  const courses = courseData?.courses ?? data.courses;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
      <Link
        to="/alumnos"
        className="mb-5 inline-flex min-h-9 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <IconChevronLeft aria-hidden="true" className="size-4" />
        {t("agenda.backToStudents")}
      </Link>

      <header className="mb-7 border-b border-border pb-6">
        <StudentIdentity
          legajo={student.legajo}
          name={`${student.apellido}, ${student.nombre}`}
          photoSize="lg"
          className="flex-1"
          nameContent={
            <h1 className="flex flex-wrap items-baseline text-2xl font-semibold tracking-tight sm:text-3xl">
              <InlineEdit
                value={student.apellido}
                onSave={(value) => saveField("apellido", value)}
                label={t("agenda.apellido")}
                required
              />
              <span className="me-2 text-muted-foreground">,</span>
              <InlineEdit
                value={student.nombre}
                onSave={(value) => saveField("nombre", value)}
                label={t("agenda.nombre")}
                required
              />
            </h1>
          }
          details={
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">{t("agenda.telefono")}</p>
                <InlineEdit
                  value={student.telefono ?? ""}
                  onSave={(value) => saveField("telefono", value)}
                  label={t("agenda.telefono")}
                  emptyText={t("agenda.addPhone")}
                />
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">{t("agenda.github")}</p>
                <span className="inline-flex items-center gap-2">
                  <InlineEdit
                    value={student.github ?? ""}
                    onSave={(value) => saveField("github", value)}
                    label={t("agenda.github")}
                    emptyText={t("agenda.addGithub")}
                  />
                  {student.github ? (
                    <a
                      href={`https://github.com/${student.github}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`GitHub: ${student.github}`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <IconBrandGithub aria-hidden="true" className="size-4" />
                    </a>
                  ) : null}
                </span>
              </div>
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">
                  {t("agenda.course")}
                </Label>
                {editingCourse ? (
                  <select
                    id="student-course"
                    autoFocus
                    value={course?.id ?? ""}
                    onChange={(event) => changeCourse(event.target.value)}
                    onBlur={() => setEditingCourse(false)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") setEditingCourse(false);
                    }}
                    className={`${selectClass} w-full`}
                  >
                    {courses.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.commission ?? item.name} · {t("agenda.classroom")}{" "}
                        {item.classroom ?? "—"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingCourse(true)}
                    aria-label={`${t("agenda.course")}: ${course?.commission ?? course?.name ?? "—"}`}
                    className={cn(
                      "-mx-1 rounded px-1 text-start hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      !course && "text-muted-foreground",
                    )}
                  >
                    {course?.commission ?? course?.name ?? "—"}
                    {course ? (
                      <span className="ms-1 text-xs text-muted-foreground">
                        · {t("agenda.classroom")} {course.classroom ?? "—"}
                      </span>
                    ) : null}
                  </button>
                )}
              </div>
            </div>
          }
        />
      </header>

      {totales ? (
        <section aria-label={t("agenda.studentSummary")} className="mb-8 grid gap-4 sm:grid-cols-4">
          <Stat
            label={t("agenda.worksPresented")}
            value={`${totales.practicosPresentados}/${totales.practicosTotales}`}
          />
          <Stat label={t("agenda.worksWithFailure")} value={String(totales.practicosConFalla)} />
          <Stat
            label={t("agenda.average")}
            value={totales.promedio === null ? "—" : String(totales.promedio)}
          />
          <Stat
            label={t("agenda.attendancePercent")}
            value={totales.asistenciaPorcentaje === null ? "—" : `${totales.asistenciaPorcentaje}%`}
          />
        </section>
      ) : null}

      <div className="grid gap-10 xl:grid-cols-2">
        <section aria-labelledby="student-works-title">
          <div className="mb-3 flex items-center gap-2">
            <IconClipboardCheck aria-hidden="true" className="size-5 text-primary" />
            <h2 id="student-works-title" className="text-lg font-semibold">
              {t("navigation.works")}
            </h2>
          </div>
          {practicos.length === 0 ? (
            <p className="border-y border-dashed border-border py-8 text-sm text-muted-foreground">
              {t("agenda.noPracticos")}
            </p>
          ) : (
            <div className="divide-y divide-border border-y border-border">
              {practicos.map((work) => (
                <article key={work.id} className="py-4">
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <h3 className="font-medium">{work.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {work.date ?? t("agenda.noRequestedDate")}
                        {work.graded ? ` · ${t("agenda.withOptionalGrade")}` : ""}
                      </p>
                    </div>
                    {work.graded ? (
                      <Input
                        key={`${work.id}-${work.score ?? "empty"}`}
                        type="number"
                        min="1"
                        max="10"
                        step="0.5"
                        defaultValue={work.score ?? ""}
                        aria-label={`${t("agenda.grade")} ${work.title}`}
                        className="w-20"
                        onBlur={(event) => updateScore(work.id, work.status, event.target.value)}
                      />
                    ) : null}
                  </div>
                  <div
                    className="flex flex-wrap gap-1.5"
                    role="group"
                    aria-label={`${t("agenda.workStatusOf")} ${work.title}`}
                  >
                    {WORK_STATUSES.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={work.status === option.value}
                        onClick={() => updateWork(work.id, option.value)}
                        className={cn(
                          "min-h-8 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          work.status === option.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {t(option.key)}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="student-attendance-title">
          <div className="mb-3 flex items-center gap-2">
            <IconCalendarCheck aria-hidden="true" className="size-5 text-primary" />
            <h2 id="student-attendance-title" className="text-lg font-semibold">
              {t("navigation.attendance")}
            </h2>
          </div>
          <div className="max-h-[42rem] divide-y divide-border overflow-y-auto border-y border-border">
            {clases.map((classSession) => (
              <article
                key={classSession.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium capitalize">{formatDate(classSession.date)}</p>
                  <p className="text-xs text-muted-foreground">
                    {classSession.startTime}–{classSession.endTime}
                    {classSession.status === "cancelada"
                      ? ` · ${t("agenda.cancelled")}: ${classSession.cancellationNote ?? classSession.cancellationReason ?? ""}`
                      : classSession.status === "a_confirmar"
                        ? ` · ${t("agenda.toConfirm")}`
                        : ""}
                  </p>
                </div>
                {classSession.status === "programada" ? (
                  <AttendanceStatusControl
                    value={classSession.attendanceStatus}
                    onChange={(status) => updateAttendance(classSession.id, status)}
                    ariaLabel={`${t("agenda.attendanceOf")} ${classSession.date}`}
                    size="sm"
                  />
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
