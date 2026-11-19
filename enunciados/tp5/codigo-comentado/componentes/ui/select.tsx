// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Componentes Select y Textarea estilizados al estilo shadcn/ui.
// [Línea 2] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 3] Importa elementos desde '@/lib/utils'.
import { cn } from "@/lib/utils";

// [Línea 5] Declara la función o componente 'Select'.
function Select({ className, ...props }: React.ComponentProps<"select">) {
  // [Línea 6] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <select // [Línea 7] Abre o renderiza el componente visual <select>.
      // [Línea 8] Ejecuta o evalúa: data-slot="select"
      data-slot="select"
      // [Línea 9] Ejecuta o evalúa: className={cn(
      className={cn(
        // [Línea 10] Ejecuta o evalúa: "h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs t
        "h-9 w-full rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
        // [Línea 11] Ejecuta o evalúa: className,
        className,
      // [Línea 12] Ejecuta o evalúa: )}
      )}
      // [Línea 13] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 14] Ejecuta o evalúa: />
    />
  // [Línea 15] Cierra el bloque o estructura ();).
  );
// [Línea 16] Cierra el bloque o estructura (}).
}

// [Línea 18] Declara la función o componente 'Textarea'.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  // [Línea 19] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <textarea // [Línea 20] Abre o renderiza el componente visual <textarea>.
      // [Línea 21] Ejecuta o evalúa: data-slot="textarea"
      data-slot="textarea"
      // [Línea 22] Ejecuta o evalúa: className={cn(
      className={cn(
        // [Línea 23] Ejecuta o evalúa: "min-h-20 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow
        "min-h-20 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
        // [Línea 24] Ejecuta o evalúa: className,
        className,
      // [Línea 25] Ejecuta o evalúa: )}
      )}
      // [Línea 26] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 27] Ejecuta o evalúa: />
    />
  // [Línea 28] Cierra el bloque o estructura ();).
  );
// [Línea 29] Cierra el bloque o estructura (}).
}

// [Línea 31] Declara la función o componente 'Separator'.
function Separator({ className, ...props }: React.ComponentProps<"hr">) {
  // [Línea 32] Devuelve el valor: <hr className={cn("border-t border-border", className)} {...props} />;
  return <hr className={cn("border-t border-border", className)} {...props} />;
// [Línea 33] Cierra el bloque o estructura (}).
}

// [Línea 35] Ejecuta o evalúa: export { Select, Textarea, Separator };
export { Select, Textarea, Separator };
