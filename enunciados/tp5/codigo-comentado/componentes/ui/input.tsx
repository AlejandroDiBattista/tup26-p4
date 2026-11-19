// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Componente Input de shadcn/ui.
// [Línea 2] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 3] Importa elementos desde '@/lib/utils'.
import { cn } from "@/lib/utils";

// [Línea 5] Declara la función o componente 'Input'.
function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  // [Línea 6] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <input // [Línea 7] Abre o renderiza el componente visual <input>.
      // [Línea 8] Ejecuta o evalúa: type={type}
      type={type}
      // [Línea 9] Ejecuta o evalúa: data-slot="input"
      data-slot="input"
      // [Línea 10] Ejecuta o evalúa: className={cn(
      className={cn(
        // [Línea 11] Ejecuta o evalúa: "h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-1 text-sm sha
        "h-9 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        // [Línea 12] Ejecuta o evalúa: className,
        className,
      // [Línea 13] Ejecuta o evalúa: )}
      )}
      // [Línea 14] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 15] Ejecuta o evalúa: />
    />
  // [Línea 16] Cierra el bloque o estructura ();).
  );
// [Línea 17] Cierra el bloque o estructura (}).
}

// [Línea 19] Ejecuta o evalúa: export { Input };
export { Input };
