import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { useT } from "@agent-native/core/client/i18n";
import {
  IconBrandGithub,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { InlineEdit } from "@/components/agenda/InlineEdit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Course {
  id: string;
  name: string;
  commission: string | null;
  classroom: string | null;
}

interface Student {
  id: string;
  legajo: string;
  apellido: string;
  nombre: string;
  telefono: string | null;
  github: string | null;
  clasesPresentes: number;
  course: Course;
}

const EMPTY = {
  legajo: "",
  apellido: "",
  nombre: "",
  telefono: "",
  github: "",
  course: "",
};

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function StudentsTab({ courseId }: { courseId?: string }) {
  const t = useT();
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState(courseId ?? "all");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data, isLoading } = useActionQuery<{ students: Student[] }>(
    "list-students",
    courseId ? { course: courseId } : {},
  );
  const { data: courseData } = useActionQuery<{ courses: Course[] }>(
    "list-courses",
  );
  const upsert = useActionMutation("upsert-student");
  const remove = useActionMutation("delete-student");

  const courses = courseData?.courses ?? [];
  const students = data?.students ?? [];
  const visibleStudents = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("es");
    return students.filter((student) => {
      const matchesCourse =
        courseFilter === "all" || student.course.id === courseFilter;
      if (!matchesCourse) return false;
      if (!needle) return true;
      return [
        student.legajo,
        student.apellido,
        student.nombre,
        student.telefono ?? "",
        student.github ?? "",
        student.course.commission ?? "",
      ].some((value) => value.toLocaleLowerCase("es").includes(needle));
    });
  }, [courseFilter, query, students]);

  function selectedCourseForCreate() {
    if (courseId) return courseId;
    if (form.course) return form.course;
    if (courseFilter !== "all") return courseFilter;
    return "";
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const selectedCourse = selectedCourseForCreate();
    if (
      !form.legajo.trim() ||
      !form.apellido.trim() ||
      !form.nombre.trim() ||
      !selectedCourse
    ) {
      toast.error(t("agenda.studentRequiredFieldsWithCourse"));
      return;
    }
    upsert.mutate(
      {
        legajo: form.legajo.trim(),
        apellido: form.apellido.trim(),
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim() || undefined,
        github: form.github.trim() || undefined,
        course: selectedCourse,
      },
      {
        onSuccess: () => {
          setForm(EMPTY);
          setShowForm(false);
          toast.success(t("agenda.studentSaved"));
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function saveField(
    student: Student,
    field: "apellido" | "nombre" | "telefono" | "github",
    value: string,
  ) {
    upsert.mutate(
      { legajo: student.legajo, [field]: value },
      { onError: (error) => toast.error(error.message) },
    );
  }

  function confirmDelete(student: Student) {
    remove.mutate(
      { legajo: student.legajo },
      {
        onSuccess: () => {
          setPendingDelete(null);
          toast.success(t("agenda.studentDeleted"));
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <section aria-labelledby="student-roster-heading">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[minmax(16rem,1fr)_12rem]">
          <div className="grid gap-1.5">
            <Label htmlFor="student-search">{t("agenda.searchStudents")}</Label>
            <div className="relative">
              <IconSearch
                aria-hidden="true"
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="student-search"
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("agenda.searchStudentsPlaceholder")}
                className="ps-9"
              />
            </div>
          </div>
          {!courseId ? (
            <div className="grid gap-1.5">
              <Label htmlFor="student-course-filter">
                {t("agenda.course")}
              </Label>
              <select
                id="student-course-filter"
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
                className={selectClass}
              >
                <option value="all">{t("agenda.allCourses")}</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.commission ?? course.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
        <Button onClick={() => setShowForm((open) => !open)}>
          {showForm ? (
            <IconX aria-hidden="true" />
          ) : (
            <IconPlus aria-hidden="true" />
          )}
          {showForm ? t("agenda.cancel") : t("agenda.addStudent")}
        </Button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="mb-6 grid gap-4 border-y border-border bg-muted/30 px-1 py-5 sm:grid-cols-2 xl:grid-cols-6"
        >
          {(
            [
              ["legajo", "agenda.legajo", "numeric", undefined],
              ["apellido", "agenda.apellido", undefined, "family-name"],
              ["nombre", "agenda.nombre", undefined, "given-name"],
              ["telefono", "agenda.telefono", "tel", "tel"],
              ["github", "agenda.github", undefined, "off"],
            ] as const
          ).map(([field, labelKey, inputMode, autoComplete]) => (
            <div key={field} className="grid gap-1.5">
              <Label htmlFor={`student-${field}`}>{t(labelKey)}</Label>
              <Input
                id={`student-${field}`}
                name={field}
                value={form[field]}
                inputMode={inputMode}
                autoComplete={autoComplete}
                required={
                  field === "legajo" ||
                  field === "apellido" ||
                  field === "nombre"
                }
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    [field]: event.target.value,
                  }))
                }
                autoFocus={field === "legajo"}
              />
            </div>
          ))}
          {!courseId ? (
            <div className="grid gap-1.5">
              <Label htmlFor="student-course">{t("agenda.course")}</Label>
              <select
                id="student-course"
                name="course"
                required
                value={selectedCourseForCreate()}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    course: event.target.value,
                  }))
                }
                className={selectClass}
              >
                <option value="">{t("agenda.selectCourse")}</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.commission ?? course.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="flex items-end sm:col-span-2 xl:col-span-6">
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? t("agenda.saving") : t("agenda.saveStudent")}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 id="student-roster-heading" className="text-base font-semibold">
          {t("agenda.studentsTitle")}
        </h2>
        <p
          className="text-sm tabular-nums text-muted-foreground"
          aria-live="polite"
        >
          {t("agenda.studentCount", { count: visibleStudents.length })}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-2" aria-label={t("agenda.loading")}>
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-11 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
      ) : visibleStudents.length === 0 ? (
        <div className="border-y border-dashed border-border py-14 text-center">
          <IconUsers
            aria-hidden="true"
            className="mx-auto mb-3 size-7 text-muted-foreground"
          />
          <p className="font-medium">{t("agenda.noStudentsFound")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query || courseFilter !== "all"
              ? t("agenda.adjustStudentFilters")
              : t("agenda.noStudentsHint")}
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border border-y border-border sm:hidden">
            {visibleStudents.map((student) => {
              const deleting = pendingDelete === student.legajo;
              const fullName = `${student.apellido}, ${student.nombre}`;
              return (
                <article key={student.id} className="py-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/alumnos/${student.legajo}`}
                        className="font-medium hover:underline"
                      >
                        {fullName}
                      </Link>
                      <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
                        {t("agenda.legajo")} {student.legajo}
                      </p>
                    </div>
                    <span className="rounded-full border border-border bg-muted/45 px-2.5 py-1 text-xs font-medium text-foreground">
                      {student.course.commission ?? student.course.name}
                    </span>
                  </div>
                  <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">
                      {t("agenda.classesAttended")}
                    </dt>
                    <dd className="tabular-nums">{student.clasesPresentes}</dd>
                    <dt className="text-muted-foreground">
                      {t("agenda.telefono")}
                    </dt>
                    <dd>
                      <InlineEdit
                        value={student.telefono ?? ""}
                        onSave={(value) =>
                          saveField(student, "telefono", value)
                        }
                        label={t("agenda.telefono")}
                        emptyText="—"
                      />
                    </dd>
                    <dt className="text-muted-foreground">
                      {t("agenda.github")}
                    </dt>
                    <dd>
                      <InlineEdit
                        value={student.github ?? ""}
                        onSave={(value) => saveField(student, "github", value)}
                        label={t("agenda.github")}
                        emptyText="—"
                      />
                    </dd>
                  </dl>
                  <div className="mt-3 flex justify-end gap-2">
                    {deleting ? (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPendingDelete(null)}
                        >
                          {t("agenda.cancel")}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={remove.isPending}
                          onClick={() => confirmDelete(student)}
                        >
                          {t("agenda.confirmDelete")}
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPendingDelete(student.legajo)}
                      >
                        <IconTrash aria-hidden="true" />
                        {t("agenda.delete")}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto border-y border-border sm:block">
            <table className="w-full min-w-[960px] text-sm">
              <caption className="sr-only">
                {t("agenda.studentsTableCaption")}
              </caption>
              <thead className="bg-muted/45 text-left">
                <tr>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    {t("agenda.legajo")}
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    {t("agenda.studentName")}
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    {t("agenda.telefono")}
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    {t("agenda.github")}
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    {t("agenda.course")}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-center font-medium"
                  >
                    {t("agenda.classesAttended")}
                  </th>
                  <th
                    scope="col"
                    className="w-36 px-3 py-2.5 text-end font-medium"
                  >
                    {t("agenda.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((student) => {
                  const deleting = pendingDelete === student.legajo;
                  return (
                    <tr
                      key={student.id}
                      className="border-t border-border align-middle hover:bg-accent/30"
                    >
                      <td className="px-3 py-2 font-mono text-xs tabular-nums text-muted-foreground">
                        {student.legajo}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex min-w-56 items-center gap-1">
                          <InlineEdit
                            value={student.apellido}
                            onSave={(value) =>
                              saveField(student, "apellido", value)
                            }
                            label={t("agenda.apellido")}
                            required
                            className="font-medium"
                          />
                          <span aria-hidden="true">,</span>
                          <InlineEdit
                            value={student.nombre}
                            onSave={(value) =>
                              saveField(student, "nombre", value)
                            }
                            label={t("agenda.nombre")}
                            required
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        <InlineEdit
                          value={student.telefono ?? ""}
                          onSave={(value) =>
                            saveField(student, "telefono", value)
                          }
                          label={t("agenda.telefono")}
                          emptyText="—"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          {student.github ? (
                            <IconBrandGithub
                              aria-hidden="true"
                              className="size-4"
                            />
                          ) : null}
                          <InlineEdit
                            value={student.github ?? ""}
                            onSave={(value) =>
                              saveField(student, "github", value)
                            }
                            label={t("agenda.github")}
                            emptyText="—"
                          />
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-medium">
                          {student.course.commission ?? student.course.name}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center tabular-nums">
                        {student.clasesPresentes}
                      </td>
                      <td className="px-3 py-2 text-end">
                        {deleting ? (
                          <span className="inline-flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setPendingDelete(null)}
                            >
                              {t("agenda.cancel")}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={remove.isPending}
                              onClick={() => confirmDelete(student)}
                            >
                              {t("agenda.confirmDelete")}
                            </Button>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Button asChild variant="ghost" size="sm">
                              <Link
                                to={`/alumnos/${student.legajo}`}
                                aria-label={t("agenda.openStudent", {
                                  name: `${student.apellido}, ${student.nombre}`,
                                })}
                              >
                                {t("agenda.openRecord")}
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setPendingDelete(student.legajo)}
                              aria-label={t("agenda.deleteStudent", {
                                name: `${student.apellido}, ${student.nombre}`,
                              })}
                            >
                              <IconTrash aria-hidden="true" />
                            </Button>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
