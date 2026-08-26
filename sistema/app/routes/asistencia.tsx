import { useActionQuery } from "@agent-native/core/client/hooks";
import { useT } from "@agent-native/core/client/i18n";
import { useEffect } from "react";
import { useSearchParams } from "react-router";

import { AttendanceTab } from "@/components/agenda/AttendanceTab";
import { Label } from "@/components/ui/label";

interface Course {
  id: string;
  name: string;
  commission: string | null;
  classroom: string | null;
}

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function meta() {
  return [{ title: "Asistencia · Programación IV" }];
}

export default function Asistencia() {
  const t = useT();
  const { data } = useActionQuery<{ courses: Course[] }>("list-courses");
  const courses = data?.courses ?? [];
  const [searchParams, setSearchParams] = useSearchParams();
  const courseId = searchParams.get("curso") ?? "";

  useEffect(() => {
    if (!courseId && courses[0]) {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("curso", courses[0].id);
          return next;
        },
        { replace: true },
      );
    }
  }, [courseId, courses, setSearchParams]);

  function selectCourse(nextCourseId: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("curso", nextCourseId);
      next.delete("clase");
      return next;
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">
            Programación IV
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("agenda.attendanceTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("agenda.attendanceDescription")}
          </p>
        </div>
        <div className="grid min-w-40 gap-1.5">
          <Label htmlFor="attendance-course">{t("agenda.course")}</Label>
          <select
            id="attendance-course"
            value={courseId}
            onChange={(event) => selectCourse(event.target.value)}
            className={selectClass}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.commission ?? course.name} · {t("agenda.classroom")}{" "}
                {course.classroom}
              </option>
            ))}
          </select>
        </div>
      </header>
      {courseId ? <AttendanceTab key={courseId} courseId={courseId} /> : null}
    </div>
  );
}
