// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/ui/table.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Componentes Table de shadcn/ui.
import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <div className="relative w-full overflow-x-auto rounded-xl border border-border bg-card">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <thead
      data-slot="table-header"
      className={cn("border-b border-border bg-secondary/60", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border transition-colors hover:bg-secondary/40",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-3.5 text-left align-middle text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <td
      data-slot="table-cell"
      className={cn("px-3.5 py-2.5 align-middle", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
