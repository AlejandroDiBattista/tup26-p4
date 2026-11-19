// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Primitivas de maquetación propias (sección 10.6):
// Apilar, Alinear, Grilla, Caja, Titulo y Texto.
// Así las páginas se arman con componentes semánticos sin etiquetas HTML sueltas.
// [Línea 4] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 5] Importa elementos desde '@/lib/utils'.
import { cn } from "@/lib/utils";

// Contenedor principal de cada página.
// [Línea 8] Declara la función o componente 'Pagina'.
export function Pagina({ className, children }: React.ComponentProps<"section">) {
  // [Línea 9] Devuelve el valor: <section className={cn("flex flex-col gap-6", className)}>{children}</section>;
  return <section className={cn("flex flex-col gap-6", className)}>{children}</section>;
// [Línea 10] Cierra el bloque o estructura (}).
}

// Apila elementos verticalmente (flex-col).
// [Línea 13] Declara la función o componente 'Apilar'.
export function Apilar({ className, children, ...props }: React.ComponentProps<"div">) {
  // [Línea 14] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}> // [Línea 15] Abre o renderiza el componente visual <div>.
      // [Línea 16] Ejecuta o evalúa: {children}
      {children}
    </div> // [Línea 17] Cierra el componente visual </div>.
  // [Línea 18] Cierra el bloque o estructura ();).
  );
// [Línea 19] Cierra el bloque o estructura (}).
}

// Alinea elementos horizontalmente (flex-row).
// [Línea 22] Declara la función o componente 'Alinear'.
export function Alinear({ className, children, ...props }: React.ComponentProps<"div">) {
  // [Línea 23] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)} {...props}> // [Línea 24] Abre o renderiza el componente visual <div>.
      // [Línea 25] Ejecuta o evalúa: {children}
      {children}
    </div> // [Línea 26] Cierra el componente visual </div>.
  // [Línea 27] Cierra el bloque o estructura ();).
  );
// [Línea 28] Cierra el bloque o estructura (}).
}

// Dispone elementos en grilla (CSS Grid).
// [Línea 31] Declara la función o componente 'Grilla'.
export function Grilla({ className, children, ...props }: React.ComponentProps<"div">) {
  // [Línea 32] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <div className={cn("grid gap-4", className)} {...props}> // [Línea 33] Abre o renderiza el componente visual <div>.
      // [Línea 34] Ejecuta o evalúa: {children}
      {children}
    </div> // [Línea 35] Cierra el componente visual </div>.
  // [Línea 36] Cierra el bloque o estructura ();).
  );
// [Línea 37] Cierra el bloque o estructura (}).
}

// Contenedor genérico con clases de Tailwind.
// [Línea 40] Declara la función o componente 'Caja'.
export function Caja({ className, children, ...props }: React.ComponentProps<"div">) {
  // [Línea 41] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <div className={cn(className)} {...props}> // [Línea 42] Abre o renderiza el componente visual <div>.
      // [Línea 43] Ejecuta o evalúa: {children}
      {children}
    </div> // [Línea 44] Cierra el componente visual </div>.
  // [Línea 45] Cierra el bloque o estructura ();).
  );
// [Línea 46] Cierra el bloque o estructura (}).
}

// Título con nivel configurable.
// [Línea 49] Declara la función o componente 'Titulo'.
export function Titulo({
  // [Línea 50] Ejecuta o evalúa: nivel = 2,
  nivel = 2,
  // [Línea 51] Ejecuta o evalúa: className,
  className,
  // [Línea 52] Ejecuta o evalúa: children,
  children,
// [Línea 53] Ejecuta o evalúa: }: {
}: {
  // [Línea 54] Ejecuta o evalúa: nivel?: 1 | 2 | 3;
  nivel?: 1 | 2 | 3;
  // [Línea 55] Ejecuta o evalúa: className?: string;
  className?: string;
  // [Línea 56] Define o asigna el campo/parámetro 'children'.
  children: React.ReactNode;
// [Línea 57] Ejecuta o evalúa: }) {
}) {
  // [Línea 58] Verifica la condición: if (nivel === 1) {
  if (nivel === 1) {
    // [Línea 59] Devuelve el valor: <h1 className={cn("text-2xl font-bold tracking-tight text-foreground", className)}>{children}</h1>;
    return <h1 className={cn("text-2xl font-bold tracking-tight text-foreground", className)}>{children}</h1>;
  // [Línea 60] Cierra el bloque o estructura (}).
  }
  // [Línea 61] Verifica la condición: if (nivel === 3) {
  if (nivel === 3) {
    // [Línea 62] Devuelve el valor: <h3 className={cn("text-sm font-semibold text-foreground", className)}>{children}</h3>;
    return <h3 className={cn("text-sm font-semibold text-foreground", className)}>{children}</h3>;
  // [Línea 63] Cierra el bloque o estructura (}).
  }
  // [Línea 64] Devuelve el valor: <h2 className={cn("text-lg font-semibold tracking-tight text-foreground", className)}>{children}</h2>;
  return <h2 className={cn("text-lg font-semibold tracking-tight text-foreground", className)}>{children}</h2>;
// [Línea 65] Cierra el bloque o estructura (}).
}

// Texto con variantes de tono y tamaño.
// [Línea 68] Declara la función o componente 'Texto'.
export function Texto({
  // [Línea 69] Ejecuta o evalúa: tono = "normal",
  tono = "normal",
  // [Línea 70] Ejecuta o evalúa: tamano = "sm",
  tamano = "sm",
  // [Línea 71] Ejecuta o evalúa: negrita = false,
  negrita = false,
  // [Línea 72] Ejecuta o evalúa: mono = false,
  mono = false,
  // [Línea 73] Ejecuta o evalúa: className,
  className,
  // [Línea 74] Ejecuta o evalúa: children,
  children,
// [Línea 75] Ejecuta o evalúa: }: {
}: {
  // [Línea 76] Ejecuta o evalúa: tono?: "normal" | "suave" | "peligro" | "exito";
  tono?: "normal" | "suave" | "peligro" | "exito";
  // [Línea 77] Ejecuta o evalúa: tamano?: "xs" | "sm" | "base" | "lg" | "2xl";
  tamano?: "xs" | "sm" | "base" | "lg" | "2xl";
  // [Línea 78] Ejecuta o evalúa: negrita?: boolean;
  negrita?: boolean;
  // [Línea 79] Ejecuta o evalúa: mono?: boolean;
  mono?: boolean;
  // [Línea 80] Ejecuta o evalúa: className?: string;
  className?: string;
  // [Línea 81] Define o asigna el campo/parámetro 'children'.
  children: React.ReactNode;
// [Línea 82] Ejecuta o evalúa: }) {
}) {
  // [Línea 83] Declara 'clasesTono' y le asigna el valor resultante.
  const clasesTono = {
    // [Línea 84] Define o asigna el campo/parámetro 'normal'.
    normal: "text-foreground",
    // [Línea 85] Define o asigna el campo/parámetro 'suave'.
    suave: "text-muted-foreground",
    // [Línea 86] Define o asigna el campo/parámetro 'peligro'.
    peligro: "text-red-600",
    // [Línea 87] Define o asigna el campo/parámetro 'exito'.
    exito: "text-emerald-700",
  // [Línea 88] Ejecuta o evalúa: }[tono];
  }[tono];

  // [Línea 90] Declara 'clasesTamano' y le asigna el valor resultante.
  const clasesTamano = {
    // [Línea 91] Define o asigna el campo/parámetro 'xs'.
    xs: "text-xs",
    // [Línea 92] Define o asigna el campo/parámetro 'sm'.
    sm: "text-sm",
    // [Línea 93] Define o asigna el campo/parámetro 'base'.
    base: "text-base",
    // [Línea 94] Define o asigna el campo/parámetro 'lg'.
    lg: "text-lg",
    // [Línea 95] Ejecuta o evalúa: "2xl": "text-2xl",
    "2xl": "text-2xl",
  // [Línea 96] Ejecuta o evalúa: }[tamano];
  }[tamano];

  // [Línea 98] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <span // [Línea 99] Abre o renderiza el componente visual <span>.
      // [Línea 100] Ejecuta o evalúa: className={cn(
      className={cn(
        // [Línea 101] Ejecuta o evalúa: clasesTono,
        clasesTono,
        // [Línea 102] Ejecuta o evalúa: clasesTamano,
        clasesTamano,
        // [Línea 103] Ejecuta o evalúa: negrita && "font-semibold",
        negrita && "font-semibold",
        // [Línea 104] Ejecuta o evalúa: mono && "font-mono",
        mono && "font-mono",
        // [Línea 105] Ejecuta o evalúa: className,
        className,
      // [Línea 106] Ejecuta o evalúa: )}
      )}
    // [Línea 107] Ejecuta o evalúa: >
    >
      // [Línea 108] Ejecuta o evalúa: {children}
      {children}
    </span> // [Línea 109] Cierra el componente visual </span>.
  // [Línea 110] Cierra el bloque o estructura ();).
  );
// [Línea 111] Cierra el bloque o estructura (}).
}
