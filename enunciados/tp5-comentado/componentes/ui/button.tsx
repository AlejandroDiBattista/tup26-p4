// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Componente Button de shadcn/ui.
// [Línea 2] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 3] Importa elementos desde 'class-variance-authority'.
import { cva, type VariantProps } from "class-variance-authority";
// [Línea 4] Importa elementos desde '@/lib/utils'.
import { cn } from "@/lib/utils";

// [Línea 6] Declara 'buttonVariants' y le asigna el valor resultante.
const buttonVariants = cva(
  // [Línea 7] Ejecuta o evalúa: "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0",
  // [Línea 8] Ejecuta o evalúa: {
  {
    // [Línea 9] Define o asigna el campo/parámetro 'variants'.
    variants: {
      // [Línea 10] Define o asigna el campo/parámetro 'variant'.
      variant: {
        // [Línea 11] Define o asigna el campo/parámetro 'default'.
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        // [Línea 12] Define o asigna el campo/parámetro 'destructive'.
        destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
        // [Línea 13] Define o asigna el campo/parámetro 'outline'.
        outline: "border border-input bg-card shadow-xs hover:bg-secondary hover:text-secondary-foreground",
        // [Línea 14] Define o asigna el campo/parámetro 'secondary'.
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // [Línea 15] Define o asigna el campo/parámetro 'ghost'.
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        // [Línea 16] Define o asigna el campo/parámetro 'link'.
        link: "text-primary underline-offset-4 hover:underline",
      // [Línea 17] Cierra el bloque o estructura (},).
      },
      // [Línea 18] Define o asigna el campo/parámetro 'size'.
      size: {
        // [Línea 19] Define o asigna el campo/parámetro 'default'.
        default: "h-9 px-4 py-2",
        // [Línea 20] Define o asigna el campo/parámetro 'xs'.
        xs: "h-7 rounded-md px-2.5 text-xs",
        // [Línea 21] Define o asigna el campo/parámetro 'sm'.
        sm: "h-8 rounded-md px-3 text-xs",
        // [Línea 22] Define o asigna el campo/parámetro 'lg'.
        lg: "h-10 rounded-lg px-6 text-base",
        // [Línea 23] Define o asigna el campo/parámetro 'icon'.
        icon: "size-9",
      // [Línea 24] Cierra el bloque o estructura (},).
      },
    // [Línea 25] Cierra el bloque o estructura (},).
    },
    // [Línea 26] Define o asigna el campo/parámetro 'defaultVariants'.
    defaultVariants: {
      // [Línea 27] Define o asigna el campo/parámetro 'variant'.
      variant: "default",
      // [Línea 28] Define o asigna el campo/parámetro 'size'.
      size: "default",
    // [Línea 29] Cierra el bloque o estructura (},).
    },
  // [Línea 30] Cierra el bloque o estructura (},).
  },
// [Línea 31] Cierra el bloque o estructura ();).
);

// [Línea 33] Declara la función o componente 'Button'.
function Button({
  // [Línea 34] Ejecuta o evalúa: className,
  className,
  // [Línea 35] Ejecuta o evalúa: variant = "default",
  variant = "default",
  // [Línea 36] Ejecuta o evalúa: size = "default",
  size = "default",
  // [Línea 37] Define el tipo de datos '' en TypeScript.
  type = "button",
  // [Línea 38] Ejecuta o evalúa: ...props
  ...props
// [Línea 39] Ejecuta o evalúa: }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  // [Línea 40] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <button // [Línea 41] Abre o renderiza el componente visual <button>.
      // [Línea 42] Ejecuta o evalúa: type={type}
      type={type}
      // [Línea 43] Ejecuta o evalúa: data-slot="button"
      data-slot="button"
      // [Línea 44] Ejecuta o evalúa: className={cn(buttonVariants({ variant, size, className }))}
      className={cn(buttonVariants({ variant, size, className }))}
      // [Línea 45] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 46] Ejecuta o evalúa: />
    />
  // [Línea 47] Cierra el bloque o estructura ();).
  );
// [Línea 48] Cierra el bloque o estructura (}).
}

// [Línea 50] Ejecuta o evalúa: export { Button, buttonVariants };
export { Button, buttonVariants };
