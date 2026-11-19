// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/ui/card.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Componente Card de shadcn/ui.
import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("flex flex-col gap-1", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <h3
      data-slot="card-title"
      className={cn("text-base font-semibold leading-tight tracking-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <p data-slot="card-description" className={cn("text-xs text-muted-foreground", className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("flex flex-col gap-3", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center justify-end gap-2 pt-2", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
