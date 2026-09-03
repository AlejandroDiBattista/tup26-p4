import { useT } from "@agent-native/core/client/i18n";
import { IconX } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

export type AttendanceStatus = "presente" | "ausente" | "justificada";

export const ATTENDANCE_STATUS_OPTIONS: Array<{
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

export function AttendanceStatusControl({
  value,
  onChange,
  ariaLabel,
  size = "md",
  className,
}: {
  value: AttendanceStatus | null;
  onChange: (status: AttendanceStatus | null) => void;
  ariaLabel?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const t = useT();
  const buttonSize = size === "sm" ? "min-h-8 px-2 text-xs" : "min-h-9 px-3 text-xs";

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1", className)}
      role="group"
      aria-label={ariaLabel ?? t("agenda.attendanceStatus")}
    >
      {ATTENDANCE_STATUS_OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md border font-medium outline-none transition-[background-color,border-color,color] focus-visible:ring-2 focus-visible:ring-ring",
              buttonSize,
              active
                ? option.activeClass
                : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground",
            )}
          >
            {t(option.labelKey)}
          </button>
        );
      })}
      {value ? (
        <button
          type="button"
          aria-label={t("agenda.clear")}
          title={t("agenda.clear")}
          onClick={() => onChange(null)}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <IconX aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
