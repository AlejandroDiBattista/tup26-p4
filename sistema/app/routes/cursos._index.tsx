import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import { useT } from "@agent-native/core/client/i18n";
import { IconCalendarTime, IconMapPin, IconPlus, IconUsers, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { InlineEdit } from "@/components/agenda/InlineEdit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Schedule {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
}

interface Course {
  id: string;
  name: string;
  commission: string | null;
  classroom: string | null;
  term: string | null;
  studentCount: number;
  schedules: Schedule[];
}

const WEEKDAYS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const EMPTY_COURSE = {
  name: "",
  commission: "",
  classroom: "",
  term: "2026 - 2.º cuatrimestre",
};

export function meta() {
  return [{ title: "Comisiones · Programación IV" }];
}

export default function CursosIndex() {
  const t = useT();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_COURSE);
  const { data, isLoading } = useActionQuery<{ courses: Course[] }>("list-courses");
  const createCourse = useActionMutation("create-course");
  const updateCourse = useActionMutation("update-course");
  const courses = data?.courses ?? [];

  function saveField(
    course: Course,
    field: "name" | "commission" | "classroom" | "term",
    value: string,
  ) {
    updateCourse.mutate(
      { course: course.id, [field]: value },
      { onError: (error) => toast.error(error.message) },
    );
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.commission.trim()) return;
    createCourse.mutate(
      {
        name: form.name.trim(),
        commission: form.commission.trim(),
        classroom: form.classroom.trim() || undefined,
        term: form.term.trim() || undefined,
      },
      {
        onSuccess: () => {
          setForm(EMPTY_COURSE);
          setShowForm(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Programación IV</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("agenda.coursesTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("agenda.coursesDescription")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowForm(true)} disabled={showForm}>
            <IconPlus aria-hidden="true" />
            {t("agenda.newCourse")}
          </Button>
        </div>
      </header>

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="mb-7 grid gap-4 border-y border-border bg-muted/25 py-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {(
            [
              ["name", "agenda.courseName"],
              ["commission", "agenda.commission"],
              ["classroom", "agenda.classroom"],
              ["term", "agenda.courseTerm"],
            ] as const
          ).map(([field, labelKey]) => (
            <div key={field} className="grid gap-1.5">
              <Label htmlFor={`course-${field}`}>{t(labelKey)}</Label>
              <Input
                id={`course-${field}`}
                name={field}
                value={form[field]}
                required={field === "name" || field === "commission"}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    [field]: event.target.value,
                  }))
                }
              />
            </div>
          ))}
          <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
            <Button type="submit" disabled={createCourse.isPending}>
              {t("agenda.create")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => {
                setForm(EMPTY_COURSE);
                setShowForm(false);
              }}
              aria-label={t("agenda.cancel")}
              title={t("agenda.cancel")}
            >
              <IconX aria-hidden="true" />
            </Button>
          </div>
        </form>
      ) : null}

      {isLoading ? (
        <div className="grid gap-3">
          <div className="h-44 animate-pulse rounded-md bg-muted" />
          <div className="h-44 animate-pulse rounded-md bg-muted" />
        </div>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {courses.map((course) => (
            <article key={course.id} className="py-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(16rem,1fr)_minmax(22rem,1.4fr)_auto] lg:items-start">
                <div>
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-lg font-semibold text-primary">
                      <InlineEdit
                        value={course.commission ?? ""}
                        onSave={(value) => saveField(course, "commission", value)}
                        label={t("agenda.commission")}
                        required
                      />
                    </span>
                    <h2 className="text-lg font-semibold">
                      <InlineEdit
                        value={course.name}
                        onSave={(value) => saveField(course, "name", value)}
                        label={t("agenda.courseName")}
                        required
                      />
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <InlineEdit
                      value={course.term ?? ""}
                      onSave={(value) => saveField(course, "term", value)}
                      label={t("agenda.courseTerm")}
                    />
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <IconMapPin aria-hidden="true" className="size-4" />
                      {t("agenda.classroom")}
                      <InlineEdit
                        value={course.classroom ?? ""}
                        onSave={(value) => saveField(course, "classroom", value)}
                        label={t("agenda.classroom")}
                      />
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <IconUsers aria-hidden="true" className="size-4" />
                      {t("agenda.studentCount", { count: course.studentCount })}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium">
                    <IconCalendarTime aria-hidden="true" className="size-4 text-primary" />
                    {t("agenda.weeklySchedule")}
                  </h3>
                  <dl className="grid gap-x-5 gap-y-1.5 text-sm sm:grid-cols-2">
                    {course.schedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex justify-between gap-3 border-b border-border/70 py-1"
                      >
                        <dt className="text-muted-foreground">{WEEKDAYS[schedule.weekday]}</dt>
                        <dd className="font-medium tabular-nums">
                          {schedule.startTime}–{schedule.endTime}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <Button asChild variant="outline" size="sm">
                  <Link to={`/cursos/${course.id}`}>{t("agenda.configure")}</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
