import { useT } from "@agent-native/core/client/i18n";

import { StudentsTab } from "@/components/agenda/StudentsTab";

export function meta() {
  return [{ title: "Alumnos · Programación IV" }];
}

export default function AlumnosIndex() {
  const t = useT();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-7">
        <p className="mb-1 text-sm font-medium text-primary">Programación IV</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("agenda.studentsTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("agenda.studentsDescription")}
        </p>
      </header>
      <StudentsTab showExports />
    </div>
  );
}
