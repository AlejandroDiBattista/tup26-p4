import { IconUser } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { studentPhotoUrl } from "@/lib/student-photo";

const PHOTO_SIZES = {
  sm: "size-11 rounded-lg",
  lg: "h-40 w-32 rounded-xl sm:h-48 sm:w-36",
} as const;

export function StudentPhoto({
  legajo,
  name,
  size = "sm",
  className,
}: {
  legajo: string;
  name?: string;
  size?: keyof typeof PHOTO_SIZES;
  className?: string;
}) {
  const src = studentPhotoUrl(legajo);
  const frameClassName = cn(
    "shrink-0 overflow-hidden border border-border bg-muted/60",
    PHOTO_SIZES[size],
    className,
  );

  if (!src) {
    return (
      <div
        className={cn(frameClassName, "grid place-items-center text-muted-foreground")}
        role={name ? "img" : undefined}
        aria-label={name ? `Sin foto de ${name}` : undefined}
      >
        <IconUser aria-hidden="true" className={size === "lg" ? "size-10" : "size-5"} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name ?? ""}
      loading="lazy"
      decoding="async"
      className={cn(frameClassName, "object-cover object-top")}
    />
  );
}
