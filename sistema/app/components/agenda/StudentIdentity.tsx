import { useT } from "@agent-native/core/client/i18n";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { StudentPhoto } from "@/components/agenda/StudentPhoto";
import { cn } from "@/lib/utils";

export function StudentIdentity({
  legajo,
  name,
  href,
  photoSize = "sm",
  nameContent,
  details,
  className,
}: {
  legajo: string;
  name: string;
  href?: string;
  photoSize?: "sm" | "lg";
  nameContent?: ReactNode;
  details?: ReactNode;
  className?: string;
}) {
  const t = useT();
  const content = (
    <div
      className={cn(
        "flex min-w-0 gap-3",
        photoSize === "lg" ? "items-start" : "items-center",
        className,
      )}
    >
      <StudentPhoto legajo={legajo} name={name} size={photoSize} />
      <div className="min-w-0">
        {nameContent ?? (
          <span className="block truncate text-sm font-medium leading-5 group-hover:underline">
            {name}
          </span>
        )}
        <span className="mt-0.5 block truncate text-xs leading-4 text-muted-foreground">
          {t("agenda.legajo")} {legajo}
        </span>
        {details}
      </div>
    </div>
  );

  return href ? (
    <Link to={href} className="group block max-w-full">
      {content}
    </Link>
  ) : (
    content
  );
}
