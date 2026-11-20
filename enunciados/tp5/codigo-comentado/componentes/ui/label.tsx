// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/ui/label.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Componente Label de shadcn/ui.
import * as React from "react";
import { cn } from "@/lib/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <label
      data-slot="label"
      className={cn("text-sm font-medium leading-none text-foreground select-none", className)}
      {...props}
    />
  );
}

export { Label };
