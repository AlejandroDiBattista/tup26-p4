// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Componente Card de shadcn/ui.
// [Línea 2] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 3] Importa elementos desde '@/lib/utils'.
import { cn } from "@/lib/utils";

// [Línea 5] Declara la función o componente 'Card'.
function Card({ className, ...props }: React.ComponentProps<"div">) {
  // [Línea 6] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <div // [Línea 7] Abre o renderiza el componente visual <div>.
      // [Línea 8] Ejecuta o evalúa: data-slot="card"
      data-slot="card"
      // [Línea 9] Ejecuta o evalúa: className={cn(
      className={cn(
        // [Línea 10] Ejecuta o evalúa: "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreg
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-xs",
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

// [Línea 18] Declara la función o componente 'CardHeader'.
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  // [Línea 19] Devuelve el valor: <div data-slot="card-header" className={cn("flex flex-col gap-1", className)} {...props} />;
  return <div data-slot="card-header" className={cn("flex flex-col gap-1", className)} {...props} />;
// [Línea 20] Cierra el bloque o estructura (}).
}

// [Línea 22] Declara la función o componente 'CardTitle'.
function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  // [Línea 23] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <h3 // [Línea 24] Abre o renderiza el componente visual <h3>.
      // [Línea 25] Ejecuta o evalúa: data-slot="card-title"
      data-slot="card-title"
      // [Línea 26] Ejecuta o evalúa: className={cn("text-base font-semibold leading-tight tracking-tight", className)
      className={cn("text-base font-semibold leading-tight tracking-tight", className)}
      // [Línea 27] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 28] Ejecuta o evalúa: />
    />
  // [Línea 29] Cierra el bloque o estructura ();).
  );
// [Línea 30] Cierra el bloque o estructura (}).
}

// [Línea 32] Declara la función o componente 'CardDescription'.
function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  // [Línea 33] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <p data-slot="card-description" className={cn("text-xs text-muted-foreground", className)} {...props} /> // [Línea 34] Abre o renderiza el componente visual <p>.
  // [Línea 35] Cierra el bloque o estructura ();).
  );
// [Línea 36] Cierra el bloque o estructura (}).
}

// [Línea 38] Declara la función o componente 'CardContent'.
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  // [Línea 39] Devuelve el valor: <div data-slot="card-content" className={cn("flex flex-col gap-3", className)} {...props} />;
  return <div data-slot="card-content" className={cn("flex flex-col gap-3", className)} {...props} />;
// [Línea 40] Cierra el bloque o estructura (}).
}

// [Línea 42] Declara la función o componente 'CardFooter'.
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  // [Línea 43] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <div // [Línea 44] Abre o renderiza el componente visual <div>.
      // [Línea 45] Ejecuta o evalúa: data-slot="card-footer"
      data-slot="card-footer"
      // [Línea 46] Ejecuta o evalúa: className={cn("flex items-center justify-end gap-2 pt-2", className)}
      className={cn("flex items-center justify-end gap-2 pt-2", className)}
      // [Línea 47] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 48] Ejecuta o evalúa: />
    />
  // [Línea 49] Cierra el bloque o estructura ();).
  );
// [Línea 50] Cierra el bloque o estructura (}).
}

// [Línea 52] Ejecuta o evalúa: export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
