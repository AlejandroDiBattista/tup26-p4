// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/ui/select.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Componentes Select y Textarea estilizados al estilo shadcn/ui.
import * as React from "react";
import { cn } from "@/lib/utils";

function Select({ className, ...props }: React.ComponentProps<"select">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <select
      data-slot="select"
      className={cn(
        "h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-20 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function Separator({ className, ...props }: React.ComponentProps<"hr">) {
  return <hr className={cn("border-t border-border", className)} {...props} />;
}

export { Select, Textarea, Separator };
