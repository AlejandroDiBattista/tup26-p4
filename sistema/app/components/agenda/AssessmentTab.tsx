import { useActionMutation, useActionQuery } from "@agent-native/core/client/hooks";
import { useT } from "@agent-native/core/client/i18n";
import {
  IconCalendarEvent,
  IconChecklist,
  IconFileUpload,
  IconPlus,
  IconSettings,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { StudentIdentity } from "@/components/agenda/StudentIdentity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type WorkStatus = "pendiente" | "error" | "falla" | "presentado";

interface Course {
  id: string;
  name: string;
  commission: string | null;
}

interface Work {
  id: string;
  title: string;
  date: string | null;
  graded: boolean;
}

interface WorkRow {
  legajo: string;
  apellido: string;
  nombre: string;
  course: Course;
  cells: Array<{
    assessmentId: string;
    status: WorkStatus;
    score: number | null;
  }>;
}

interface WorkGrid {
  assessments: Work[];
  rows: WorkRow[];
}

interface PublishStatementResult {
  copied: number;
  existing: number;
}

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

const WORK_OPTIONS: Array<{
  value: WorkStatus;
  labelKey: string;
  activeClass: string;
}> = [
  {
    value: "pendiente",
    labelKey: "agenda.pending",
    activeClass: "border-border bg-muted text-foreground",
  },
  {
    value: "error",
    labelKey: "agenda.error",
    activeClass:
      "border-amber-600 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-200",
  },
  {
    value: "falla",
    labelKey: "agenda.failure",
    activeClass:
      "border-rose-600 bg-rose-50 text-rose-800 dark:border-rose-500 dark:bg-rose-950/50 dark:text-rose-200",
  },
  {
    value: "presentado",
    labelKey: "agenda.submitted",
    activeClass:
      "border-sky-600 bg-sky-50 text-sky-800 dark:border-sky-500 dark:bg-sky-950/50 dark:text-sky-200",
  },
];

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export function AssessmentTab({ courseId }: { courseId?: string; kind?: "practico" | "parcial" }) {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedWorkId = searchParams.get("trabajo") ?? "";
  const courseFilter = courseId ?? searchParams.get("curso") ?? "all";
  const [showCreate, setShowCreate] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [graded, setGraded] = useState(false);
  const [statusFilter, setStatusFilter] = useState<WorkStatus | "todos">("todos");
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editGraded, setEditGraded] = useState(false);

  const { data, isLoading } = useActionQuery<WorkGrid>(
    "work-grid",
    courseId ? { course: courseId } : {},
  );
  const { data: courseData } = useActionQuery<{ courses: Course[] }>("list-courses");
  const createWork = useActionMutation("create-assessment");
  const updateWork = useActionMutation("update-assessment");
  const deleteWork = useActionMutation("delete-assessment");
  const publishStatement = useActionMutation("publicar-enunciado-trabajo");
  const setResult = useActionMutation("set-assessment-result");

  const works = data?.assessments ?? [];
  const rows = data?.rows ?? [];
  const courses = courseData?.courses ?? [];
  const selectedWork = works.find((work) => work.id === selectedWorkId) ?? null;
  const visibleRows = useMemo(
    () => rows.filter((row) => courseFilter === "all" || row.course.id === courseFilter),
    [courseFilter, rows],
  );

  useEffect(() => {
    if (!selectedWorkId && works[0]) {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("trabajo", works[0].id);
          return next;
        },
        { replace: true },
      );
    }
  }, [selectedWorkId, setSearchParams, works]);

  function selectWork(workId: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("trabajo", workId);
      return next;
    });
  }

  function selectCourseFilter(nextCourseId: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextCourseId === "all") next.delete("curso");
      else next.set("curso", nextCourseId);
      return next;
    });
  }

  useEffect(() => {
    if (!selectedWork) return;
    setEditTitle(selectedWork.title);
    setEditDate(selectedWork.date ?? "");
    setEditGraded(selectedWork.graded);
    setShowManage(false);
    setPendingDelete(false);
  }, [selectedWork]);

  useEffect(() => {
    setStatusFilter("todos");
  }, [selectedWorkId]);

  function cellFor(row: WorkRow) {
    return row.cells.find((cell) => cell.assessmentId === selectedWork?.id);
  }

  const summary = useMemo(() => {
    const counts: Record<WorkStatus, number> = {
      pendiente: 0,
      error: 0,
      falla: 0,
      presentado: 0,
    };
    for (const row of visibleRows) {
      const cell = row.cells.find((item) => item.assessmentId === selectedWork?.id);
      counts[cell?.status ?? "pendiente"] += 1;
    }
    return counts;
  }, [selectedWork, visibleRows]);

  const filteredRows = useMemo(() => {
    if (statusFilter === "todos") return visibleRows;
    return visibleRows.filter((row) => {
      const status = row.cells.find((cell) => cell.assessmentId === selectedWork?.id)?.status;
      return (status ?? "pendiente") === statusFilter;
    });
  }, [selectedWork, statusFilter, visibleRows]);

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    createWork.mutate(
      {
        title: title.trim(),
        date: date || undefined,
        graded,
      },
      {
        onSuccess: (result) => {
          const created = result as { id?: string };
          setTitle("");
          setDate("");
          setGraded(false);
          setShowCreate(false);
          if (created.id) selectWork(created.id);
          toast.success(t("agenda.workCreated"));
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleUpdate(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedWork || !editTitle.trim()) return;
    updateWork.mutate(
      {
        assessmentId: selectedWork.id,
        title: editTitle.trim(),
        date: editDate || null,
        graded: editGraded,
      },
      {
        onSuccess: () => {
          setShowManage(false);
          toast.success(t("agenda.workUpdated"));
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleDelete() {
    if (!selectedWork) return;
    deleteWork.mutate(
      { assessmentId: selectedWork.id },
      {
        onSuccess: () => {
          setPendingDelete(false);
          setShowManage(false);
          setSearchParams((current) => {
            const next = new URLSearchParams(current);
            next.delete("trabajo");
            return next;
          });
          toast.success(t("agenda.workDeleted"));
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handlePublishStatement() {
    if (!selectedWork) return;
    publishStatement.mutate(
      { assessmentId: selectedWork.id },
      {
        onSuccess: (value) => {
          const result = value as PublishStatementResult;
          toast.success(
            t("agenda.workStatementPublished", {
              copied: result.copied,
              existing: result.existing,
            }),
          );
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function setStatus(row: WorkRow, status: WorkStatus) {
    if (!selectedWork) return;
    setResult.mutate(
      { assessmentId: selectedWork.id, legajo: row.legajo, status },
      { onError: (error) => toast.error(error.message) },
    );
  }

  function saveScore(row: WorkRow, raw: string) {
    if (!selectedWork) return;
    const trimmed = raw.trim();
    if (!trimmed) {
      setResult.mutate(
        { assessmentId: selectedWork.id, legajo: row.legajo, score: null },
        { onError: (error) => toast.error(error.message) },
      );
      return;
    }
    const score = Number(trimmed.replace(",", "."));
    if (Number.isNaN(score) || score < 1 || score > 10) {
      toast.error(t("agenda.invalidScore"));
      return;
    }
    const current = cellFor(row)?.status ?? "pendiente";
    setResult.mutate(
      {
        assessmentId: selectedWork.id,
        legajo: row.legajo,
        status: current === "pendiente" ? "presentado" : current,
        score,
      },
      { onError: (error) => toast.error(error.message) },
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

  return (
    <section aria-labelledby="work-roster-title">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[minmax(15rem,1fr)_11rem]">
          <div className="grid gap-1.5">
            <Label htmlFor="work-selector">{t("agenda.work")}</Label>
            <select
              id="work-selector"
              value={selectedWork?.id ?? ""}
              onChange={(event) => selectWork(event.target.value)}
              className={selectClass}
              disabled={works.length === 0}
            >
              {works.length === 0 ? <option value="">{t("agenda.noPracticos")}</option> : null}
              {works.map((work) => (
                <option key={work.id} value={work.id}>
                  {work.title}
                </option>
              ))}
            </select>
          </div>
          {!courseId ? (
            <div className="grid gap-1.5">
              <Label htmlFor="work-course-filter">{t("agenda.course")}</Label>
              <select
                id="work-course-filter"
                value={courseFilter}
                onChange={(event) => selectCourseFilter(event.target.value)}
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
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePublishStatement}
            disabled={!selectedWork || publishStatement.isPending}
          >
            <IconFileUpload aria-hidden="true" />
            {publishStatement.isPending
              ? t("agenda.publishingWorkStatement")
              : t("agenda.publishWorkStatement")}
          </Button>
          {selectedWork ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowManage(true)}
              disabled={showManage}
            >
              <IconSettings aria-hidden="true" />
              {t("agenda.manageWork")}
            </Button>
          ) : null}
          <Button onClick={() => setShowCreate(true)} disabled={showCreate}>
            <IconPlus aria-hidden="true" />
            {t("agenda.newPractico")}
          </Button>
        </div>
      </div>

      {showCreate ? (
        <form
          onSubmit={handleCreate}
          className="mb-6 grid gap-4 border-y border-border bg-muted/25 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="work-title">{t("agenda.title")}</Label>
            <Input
              id="work-title"
              name="title"
              value={title}
              required
              onChange={(event) => setTitle(event.target.value)}
              placeholder="TP 2"
              autoFocus
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="work-date">{t("agenda.requestedDate")}</Label>
            <Input
              id="work-date"
              name="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-sm focus-within:ring-2 focus-within:ring-ring">
            <input
              type="checkbox"
              name="graded"
              checked={graded}
              onChange={(event) => setGraded(event.target.checked)}
              className="size-4 accent-primary"
            />
            {t("agenda.gradedWork")}
          </label>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={createWork.isPending}>
              {t("agenda.create")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setShowCreate(false)}
              aria-label={t("agenda.cancel")}
              title={t("agenda.cancel")}
            >
              <IconX aria-hidden="true" />
            </Button>
          </div>
        </form>
      ) : null}

      {selectedWork && showManage ? (
        <form
          onSubmit={handleUpdate}
          className="mb-6 grid gap-4 border-y border-border bg-muted/25 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="edit-work-title">{t("agenda.title")}</Label>
            <Input
              id="edit-work-title"
              value={editTitle}
              required
              onChange={(event) => setEditTitle(event.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="edit-work-date">{t("agenda.requestedDate")}</Label>
            <Input
              id="edit-work-date"
              type="date"
              value={editDate}
              onChange={(event) => setEditDate(event.target.value)}
            />
          </div>
          <label className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-sm focus-within:ring-2 focus-within:ring-ring">
            <input
              type="checkbox"
              checked={editGraded}
              onChange={(event) => setEditGraded(event.target.checked)}
              className="size-4 accent-primary"
            />
            {t("agenda.gradedWork")}
          </label>
          <div className="flex items-center justify-end gap-2">
            {pendingDelete ? (
              <>
                <Button type="button" variant="ghost" onClick={() => setPendingDelete(false)}>
                  {t("agenda.cancel")}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteWork.isPending}
                >
                  <IconTrash aria-hidden="true" />
                  {t("agenda.confirmDelete")}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="ghost" onClick={() => setPendingDelete(true)}>
                  <IconTrash aria-hidden="true" />
                  {t("agenda.delete")}
                </Button>
                <Button type="submit" disabled={updateWork.isPending}>
                  {t("agenda.save")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => setShowManage(false)}
                  aria-label={t("agenda.cancel")}
                  title={t("agenda.cancel")}
                >
                  <IconX aria-hidden="true" />
                </Button>
              </>
            )}
          </div>
        </form>
      ) : null}

      {selectedWork ? (
        <>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="work-roster-title" className="text-lg font-semibold">
                {selectedWork.title}
              </h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {selectedWork.date ? (
                  <span className="inline-flex items-center gap-1.5">
                    <IconCalendarEvent aria-hidden="true" className="size-4" />
                    {t("agenda.requestedOn", {
                      date: formatDate(selectedWork.date),
                    })}
                  </span>
                ) : null}
                <span>
                  {selectedWork.graded ? t("agenda.withOptionalGrade") : t("agenda.withoutGrade")}
                </span>
              </p>
            </div>
            <div
              className="flex flex-wrap items-center justify-end gap-1.5"
              role="group"
              aria-label={t("agenda.workStatusFilters")}
            >
              <button
                type="button"
                aria-pressed={statusFilter === "todos"}
                onClick={() => setStatusFilter("todos")}
                className={cn(
                  "inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  statusFilter === "todos"
                    ? "border-border bg-muted text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
                )}
              >
                {t("agenda.allStatuses")}
                <span className="font-mono tabular-nums">{visibleRows.length}</span>
              </button>
              {WORK_OPTIONS.map((option) => {
                const active = statusFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStatusFilter(option.value)}
                    className={cn(
                      "inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active
                        ? option.activeClass
                        : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {t(option.labelKey)}
                    <span className="font-mono tabular-nums">{summary[option.value]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {filteredRows.length === 0 ? (
            <p className="border-y border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              {t("agenda.noStudentsInWorkStatus")}
            </p>
          ) : (
            <>
              <div className="divide-y divide-border border-y border-border sm:hidden">
                {filteredRows.map((row) => {
                  const cell = cellFor(row);
                  const current = cell?.status ?? "pendiente";
                  const fullName = `${row.apellido}, ${row.nombre}`;
                  return (
                    <article key={row.legajo} className="py-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <StudentIdentity
                          legajo={row.legajo}
                          name={fullName}
                          href={`/alumnos/${row.legajo}`}
                          className="min-w-0"
                          details={
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {row.course.commission ?? row.course.name}
                            </span>
                          }
                        />
                        {selectedWork.graded ? (
                          <Input
                            key={`${selectedWork.id}:${row.legajo}:${cell?.score ?? ""}:mobile`}
                            type="text"
                            inputMode="decimal"
                            defaultValue={cell?.score ?? ""}
                            aria-label={t("agenda.scoreOf", { name: fullName })}
                            onBlur={(event) => saveScore(row, event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") event.currentTarget.blur();
                            }}
                            className="h-9 w-16 text-center tabular-nums"
                          />
                        ) : null}
                      </div>
                      <div
                        className="grid grid-cols-2 gap-1"
                        role="group"
                        aria-label={t("agenda.workStatusOf", { name: fullName })}
                      >
                        {WORK_OPTIONS.map((option) => {
                          const active = current === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setStatus(row, option.value)}
                              className={cn(
                                "min-h-10 rounded-md border px-2 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
                    </article>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto border-y border-border sm:block">
                <table className="w-full min-w-[840px] text-sm">
                  <caption className="sr-only">{t("agenda.workTableCaption")}</caption>
                  <thead className="bg-muted/45 text-left">
                    <tr>
                      <th scope="col" className="px-3 py-2.5 font-medium">
                        {t("agenda.alumno")}
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-medium">
                        {t("agenda.course")}
                      </th>
                      <th scope="col" className="px-3 py-2.5 font-medium">
                        {t("agenda.workStatus")}
                      </th>
                      {selectedWork.graded ? (
                        <th scope="col" className="w-28 px-3 py-2.5 text-center font-medium">
                          {t("agenda.grade")}
                        </th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const cell = cellFor(row);
                      const current = cell?.status ?? "pendiente";
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
                          <td className="px-3 py-2 text-muted-foreground">
                            {row.course.commission ?? row.course.name}
                          </td>
                          <td className="px-3 py-2">
                            <fieldset>
                              <legend className="sr-only">
                                {t("agenda.workStatusOf", { name: fullName })}
                              </legend>
                              <div className="inline-flex flex-wrap gap-1">
                                {WORK_OPTIONS.map((option) => {
                                  const active = current === option.value;
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      aria-pressed={active}
                                      onClick={() => setStatus(row, option.value)}
                                      className={cn(
                                        "min-h-9 rounded-md border px-2.5 text-xs font-medium outline-none transition-[background-color,border-color,color] focus-visible:ring-2 focus-visible:ring-ring",
                                        active
                                          ? option.activeClass
                                          : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
                                      )}
                                    >
                                      {t(option.labelKey)}
                                    </button>
                                  );
                                })}
                              </div>
                            </fieldset>
                          </td>
                          {selectedWork.graded ? (
                            <td className="px-3 py-2 text-center">
                              <Input
                                key={`${selectedWork.id}:${row.legajo}:${cell?.score ?? ""}`}
                                type="text"
                                inputMode="decimal"
                                defaultValue={cell?.score ?? ""}
                                aria-label={t("agenda.scoreOf", { name: fullName })}
                                onBlur={(event) => saveScore(row, event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") event.currentTarget.blur();
                                }}
                                className="mx-auto h-8 w-16 text-center tabular-nums"
                              />
                            </td>
                          ) : null}
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
        <div className="border-y border-dashed border-border py-14 text-center">
          <IconChecklist className="mx-auto mb-3 size-7 text-muted-foreground" />
          <p className="font-medium">{t("agenda.noPracticos")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("agenda.createFirstWork")}</p>
        </div>
      )}
    </section>
  );
}
