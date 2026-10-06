import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { useT } from "@agent-native/core/client/i18n";
import {
  IconCalendarCheck,
  IconChevronLeft,
  IconClipboardCheck,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

import { InlineEdit } from "@/components/agenda/InlineEdit";
import { StudentsTab } from "@/components/agenda/StudentsTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const WEEKDAYS = [
  "",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export function meta() {
  return [{ title: "Configurar comisión · Programación IV" }];
}

export default function CursoDetalle() {
  const { courseId = "" } = useParams();
  const t = useT();
  const { data, isLoading } = useActionQuery<{ courses: Course[] }>(
    "list-courses",
  );
  const course = data?.courses.find((item) => item.id === courseId);
  const updateCourse = useActionMutation("update-course");
  const [schedule, setSchedule] = useState<Schedule[]>([]);

  useEffect(() => {
    if (course) setSchedule(course.schedules.map((item) => ({ ...item })));
  }, [course]);

  function saveField(
    field: "name" | "term" | "commission" | "classroom",
    value: string,
  ) {
    updateCourse.mutate(
      { course: courseId, [field]: value },
      { onError: (error) => toast.error(error.message) },
    );
  }

  function updateScheduleRow(
    index: number,
    field: "startTime" | "endTime",
    value: string,
  ) {
    setSchedule((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function saveSchedule(event: React.FormEvent) {
    event.preventDefault();
    updateCourse.mutate(
      {
        course: courseId,
        schedule: schedule.map(({ weekday, startTime, endTime }) => ({
          weekday,
          startTime,
          endTime,
        })),
      },
      {
        onSuccess: () => toast.success(t("agenda.scheduleSaved")),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  if (isLoading || !course) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">{t("agenda.loading")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
      <Link
        to="/cursos"
        className="mb-5 inline-flex min-h-9 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <IconChevronLeft aria-hidden="true" className="size-4" />
        {t("agenda.backToCourses")}
      </Link>

      <header className="mb-8 border-b border-border pb-6">
        <p className="mb-1 text-sm font-medium text-primary">Programación IV</p>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-2xl font-semibold text-primary sm:text-3xl">
            <InlineEdit
              value={course.commission ?? ""}
              onSave={(value) => saveField("commission", value)}
              label={t("agenda.commission")}
              required
            />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            <InlineEdit
              value={course.name}
              onSave={(value) => saveField("name", value)}
              label={t("agenda.courseName")}
              required
            />
          </h1>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <IconMapPin aria-hidden="true" className="size-4" />
            {t("agenda.classroom")}
            <InlineEdit
              value={course.classroom ?? ""}
              onSave={(value) => saveField("classroom", value)}
              label={t("agenda.classroom")}
            />
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconUsers aria-hidden="true" className="size-4" />
            {t("agenda.studentCount", { count: course.studentCount })}
          </span>
          <InlineEdit
            value={course.term ?? ""}
            onSave={(value) => saveField("term", value)}
            label={t("agenda.courseTerm")}
          />
        </div>
      </header>

      <div className="mb-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <section aria-labelledby="schedule-heading">
          <h2 id="schedule-heading" className="text-lg font-semibold">
            {t("agenda.weeklySchedule")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("agenda.scheduleDescription")}
          </p>
          <form
            onSubmit={saveSchedule}
            className="mt-4 divide-y divide-border border-y border-border"
          >
            {schedule.map((item, index) => (
              <div
                key={item.id}
                className="grid gap-2 py-3 sm:grid-cols-[minmax(7rem,1fr)_8.5rem_1rem_8.5rem] sm:items-center"
              >
                <span className="text-sm font-medium">
                  {WEEKDAYS[item.weekday]}
                </span>
                <div className="grid grid-cols-[1fr_1rem_1fr] items-center gap-2 sm:contents">
                  <Input
                    type="time"
                    aria-label={`${t("agenda.startTime")} ${WEEKDAYS[item.weekday]}`}
                    value={item.startTime}
                    onChange={(event) =>
                      updateScheduleRow(index, "startTime", event.target.value)
                    }
                    required
                  />
                  <span className="text-center text-sm text-muted-foreground">
                    –
                  </span>
                  <Input
                    type="time"
                    aria-label={`${t("agenda.endTime")} ${WEEKDAYS[item.weekday]}`}
                    value={item.endTime}
                    onChange={(event) =>
                      updateScheduleRow(index, "endTime", event.target.value)
                    }
                    required
                  />
                </div>
              </div>
            ))}
            <div className="py-4">
              <Button type="submit" disabled={updateCourse.isPending}>
                {t("agenda.saveSchedule")}
              </Button>
            </div>
          </form>
        </section>

        <aside
          aria-label={t("agenda.quickAccess")}
          className="border-t border-border pt-5 lg:border-s lg:border-t-0 lg:ps-5 lg:pt-0"
        >
          <h2 className="mb-3 text-sm font-semibold">
            {t("agenda.quickAccess")}
          </h2>
          <div className="grid gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link to="/asistencia">
                <IconCalendarCheck aria-hidden="true" />
                {t("navigation.attendance")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link to="/trabajos">
                <IconClipboardCheck aria-hidden="true" />
                {t("navigation.works")}
              </Link>
            </Button>
          </div>
        </aside>
      </div>

      <section
        aria-labelledby="course-students-heading"
        className="border-t border-border pt-8"
      >
        <div className="mb-5">
          <h2 id="course-students-heading" className="text-lg font-semibold">
            {t("agenda.courseStudents")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("agenda.courseStudentsDescription")}
          </p>
        </div>
        <StudentsTab courseId={course.id} />
      </section>
    </div>
  );
}
