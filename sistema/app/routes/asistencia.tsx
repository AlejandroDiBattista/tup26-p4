import { useT } from "@agent-native/core/client/i18n";

import { AttendanceTab } from "@/components/agenda/AttendanceTab";

export function meta() {
  return [{ title: "Asistencia · Programación IV" }];
}

export default function Asistencia() {
  const t = useT();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Programación IV</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("agenda.attendanceTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("agenda.attendanceDescription")}
          </p>
        </div>
      </header>
      <AttendanceTab />
    </div>
  );
}
