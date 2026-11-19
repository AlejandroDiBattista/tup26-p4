// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Componente Badge de shadcn/ui.
// [Línea 2] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 3] Importa elementos desde 'class-variance-authority'.
import { cva, type VariantProps } from "class-variance-authority";
// [Línea 4] Importa elementos desde '@/lib/utils'.
import { cn } from "@/lib/utils";

// [Línea 6] Declara 'badgeVariants' y le asigna el valor resultante.
const badgeVariants = cva(
  // [Línea 7] Ejecuta o evalúa: "inline-flex items-center justify-center gap-1 rounded-md border px-2 py-0.5 tex
  "inline-flex items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0",
  // [Línea 8] Ejecuta o evalúa: {
  {
    // [Línea 9] Define o asigna el campo/parámetro 'variants'.
    variants: {
      // [Línea 10] Define o asigna el campo/parámetro 'variant'.
      variant: {
        // [Línea 11] Define o asigna el campo/parámetro 'default'.
        default: "border-transparent bg-primary text-primary-foreground",
        // [Línea 12] Define o asigna el campo/parámetro 'secondary'.
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        // [Línea 13] Define o asigna el campo/parámetro 'destructive'.
        destructive: "border-transparent bg-red-100 text-red-800 border-red-200",
        // [Línea 14] Define o asigna el campo/parámetro 'success'.
        success: "border-emerald-200 bg-emerald-50 text-emerald-800",
        // [Línea 15] Define o asigna el campo/parámetro 'warning'.
        warning: "border-amber-200 bg-amber-50 text-amber-800",
        // [Línea 16] Define o asigna el campo/parámetro 'outline'.
        outline: "border-border text-foreground bg-card",
      // [Línea 17] Cierra el bloque o estructura (},).
      },
    // [Línea 18] Cierra el bloque o estructura (},).
    },
    // [Línea 19] Define o asigna el campo/parámetro 'defaultVariants'.
    defaultVariants: {
      // [Línea 20] Define o asigna el campo/parámetro 'variant'.
      variant: "default",
    // [Línea 21] Cierra el bloque o estructura (},).
    },
  // [Línea 22] Cierra el bloque o estructura (},).
  },
// [Línea 23] Cierra el bloque o estructura ();).
);

// [Línea 25] Declara la función o componente 'Badge'.
function Badge({
  // [Línea 26] Ejecuta o evalúa: className,
  className,
  // [Línea 27] Ejecuta o evalúa: variant = "default",
  variant = "default",
  // [Línea 28] Ejecuta o evalúa: ...props
  ...props
// [Línea 29] Ejecuta o evalúa: }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  // [Línea 30] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} /> // [Línea 31] Abre o renderiza el componente visual <span>.
  // [Línea 32] Cierra el bloque o estructura ();).
  );
// [Línea 33] Cierra el bloque o estructura (}).
}

// [Línea 35] Ejecuta o evalúa: export { Badge, badgeVariants };
export { Badge, badgeVariants };
