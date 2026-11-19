// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Componentes Table de shadcn/ui.
// [Línea 2] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 3] Importa elementos desde '@/lib/utils'.
import { cn } from "@/lib/utils";

// [Línea 5] Declara la función o componente 'Table'.
function Table({ className, ...props }: React.ComponentProps<"table">) {
  // [Línea 6] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <div className="relative w-full overflow-x-auto rounded-xl border border-border bg-card"> // [Línea 7] Abre o renderiza el componente visual <div>.
      <table // [Línea 8] Abre o renderiza el componente visual <table>.
        // [Línea 9] Ejecuta o evalúa: data-slot="table"
        data-slot="table"
        // [Línea 10] Ejecuta o evalúa: className={cn("w-full caption-bottom text-sm", className)}
        className={cn("w-full caption-bottom text-sm", className)}
        // [Línea 11] Ejecuta o evalúa: {...props}
        {...props}
      // [Línea 12] Ejecuta o evalúa: />
      />
    </div> // [Línea 13] Cierra el componente visual </div>.
  // [Línea 14] Cierra el bloque o estructura ();).
  );
// [Línea 15] Cierra el bloque o estructura (}).
}

// [Línea 17] Declara la función o componente 'TableHeader'.
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  // [Línea 18] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <thead // [Línea 19] Abre o renderiza el componente visual <thead>.
      // [Línea 20] Ejecuta o evalúa: data-slot="table-header"
      data-slot="table-header"
      // [Línea 21] Ejecuta o evalúa: className={cn("border-b border-border bg-secondary/60", className)}
      className={cn("border-b border-border bg-secondary/60", className)}
      // [Línea 22] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 23] Ejecuta o evalúa: />
    />
  // [Línea 24] Cierra el bloque o estructura ();).
  );
// [Línea 25] Cierra el bloque o estructura (}).
}

// [Línea 27] Declara la función o componente 'TableBody'.
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  // [Línea 28] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <tbody // [Línea 29] Abre o renderiza el componente visual <tbody>.
      // [Línea 30] Ejecuta o evalúa: data-slot="table-body"
      data-slot="table-body"
      // [Línea 31] Ejecuta o evalúa: className={cn("[&_tr:last-child]:border-0", className)}
      className={cn("[&_tr:last-child]:border-0", className)}
      // [Línea 32] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 33] Ejecuta o evalúa: />
    />
  // [Línea 34] Cierra el bloque o estructura ();).
  );
// [Línea 35] Cierra el bloque o estructura (}).
}

// [Línea 37] Declara la función o componente 'TableRow'.
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  // [Línea 38] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <tr // [Línea 39] Abre o renderiza el componente visual <tr>.
      // [Línea 40] Ejecuta o evalúa: data-slot="table-row"
      data-slot="table-row"
      // [Línea 41] Ejecuta o evalúa: className={cn(
      className={cn(
        // [Línea 42] Ejecuta o evalúa: "border-b border-border transition-colors hover:bg-secondary/40",
        "border-b border-border transition-colors hover:bg-secondary/40",
        // [Línea 43] Ejecuta o evalúa: className,
        className,
      // [Línea 44] Ejecuta o evalúa: )}
      )}
      // [Línea 45] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 46] Ejecuta o evalúa: />
    />
  // [Línea 47] Cierra el bloque o estructura ();).
  );
// [Línea 48] Cierra el bloque o estructura (}).
}

// [Línea 50] Declara la función o componente 'TableHead'.
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  // [Línea 51] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <th // [Línea 52] Abre o renderiza el componente visual <th>.
      // [Línea 53] Ejecuta o evalúa: data-slot="table-head"
      data-slot="table-head"
      // [Línea 54] Ejecuta o evalúa: className={cn(
      className={cn(
        // [Línea 55] Ejecuta o evalúa: "h-10 px-3.5 text-left align-middle text-xs font-semibold uppercase tracking-wid
        "h-10 px-3.5 text-left align-middle text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap",
        // [Línea 56] Ejecuta o evalúa: className,
        className,
      // [Línea 57] Ejecuta o evalúa: )}
      )}
      // [Línea 58] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 59] Ejecuta o evalúa: />
    />
  // [Línea 60] Cierra el bloque o estructura ();).
  );
// [Línea 61] Cierra el bloque o estructura (}).
}

// [Línea 63] Declara la función o componente 'TableCell'.
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  // [Línea 64] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <td // [Línea 65] Abre o renderiza el componente visual <td>.
      // [Línea 66] Ejecuta o evalúa: data-slot="table-cell"
      data-slot="table-cell"
      // [Línea 67] Ejecuta o evalúa: className={cn("px-3.5 py-2.5 align-middle", className)}
      className={cn("px-3.5 py-2.5 align-middle", className)}
      // [Línea 68] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 69] Ejecuta o evalúa: />
    />
  // [Línea 70] Cierra el bloque o estructura ();).
  );
// [Línea 71] Cierra el bloque o estructura (}).
}

// [Línea 73] Ejecuta o evalúa: export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
