/* ==========================================================================
   PRIMITIVAS VISUALES DE MAQUETACIÓN (COMPONENTES/PRIMITIVAS/MAQUETACION.TSX)
   ¿Por qué existen estos componentes?
   En lugar de llenar el código de cientos de etiquetas <div> y <span> con clases
   de Tailwind repetidas y confusas, construimos estos 6 componentes semánticos:
   1. Pagina: Contenedor vertical estándar para toda la pantalla.
   2. Apilar: Flexbox vertical (columna con espaciado uniforme).
   3. Alinear: Flexbox horizontal (fila con elementos centrados).
   4. Grilla: Cuadrícula CSS Grid para organizar tarjetas y columnas.
   5. Caja: Contenedor genérico para aplicar utilidades personalizadas.
   6. Titulo y Texto: Tipografía tipada con variantes de tamaño, color y fuente monoespaciada.
   ========================================================================== */

/* importamos React para tipos de propiedades y elementos JSX */
import * as React from "react";

/* importamos la utilidad cn() que combina clases condicionales con clsx y tailwind-merge */
import { cn } from "@/lib/utils";

/* ==========================================================================
   COMPONENTE: Pagina
   Envuelve toda la pantalla usando la etiqueta semántica <section> con flex-col y gap-6.
   ========================================================================== */
export function Pagina({ className, children }: React.ComponentProps<"section">) {
  return <section className={cn("flex flex-col gap-6", className)}>{children}</section>;
}

/* ==========================================================================
   COMPONENTE: Apilar
   Dispone sus hijos verticalmente uno debajo del otro (flex-direction: column) con separación gap-4.
   ========================================================================== */
export function Apilar({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}

/* ==========================================================================
   COMPONENTE: Alinear
   Dispone sus hijos horizontalmente en fila (flex-direction: row) centrados verticalmente (items-center).
   Permite que los elementos pasen a la línea siguiente si no entran (flex-wrap).
   ========================================================================== */
export function Alinear({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)} {...props}>
      {children}
    </div>
  );
}

/* ==========================================================================
   COMPONENTE: Grilla
   Organiza elementos en un sistema CSS Grid bidimensional con separación gap-4.
   ========================================================================== */
export function Grilla({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("grid gap-4", className)} {...props}>
      {children}
    </div>
  );
}

/* ==========================================================================
   COMPONENTE: Caja
   Contenedor neutro estilizable para aplicar clases puntuales de Tailwind sin perder semántica.
   ========================================================================== */
export function Caja({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

/* ==========================================================================
   COMPONENTE: Titulo
   Renderiza títulos h1, h2 o h3 según el parámetro 'nivel' con tipografía consistente:
   - nivel 1: <h1> grande para el encabezado principal de la página.
   - nivel 2: <h2> intermedio para secciones de tarjetas.
   - nivel 3: <h3> pequeño para subtítulos de módulos.
   ========================================================================== */
export function Titulo({
  nivel = 2,
  className,
  children,
}: {
  nivel?: 1 | 2 | 3;
  className?: string;
  children: React.ReactNode;
}) {
  if (nivel === 1) {
    return <h1 className={cn("text-2xl font-bold tracking-tight text-foreground", className)}>{children}</h1>;
  }
  if (nivel === 3) {
    return <h3 className={cn("text-sm font-semibold text-foreground", className)}>{children}</h3>;
  }
  return <h2 className={cn("text-lg font-semibold tracking-tight text-foreground", className)}>{children}</h2>;
}

/* ==========================================================================
   COMPONENTE: Texto
   Renderiza tipografía en un <span> con variantes declarativas:
   - tono: 'normal' (oscuro), 'suave' (grisáceo), 'peligro' (rojo) o 'exito' (verde)
   - tamano: 'xs' (12px), 'sm' (14px), 'base' (16px), 'lg' (18px) o '2xl' (24px)
   - negrita: aplica font-semibold si es true
   - mono: aplica font-mono (fuente de ancho fijo para importes y códigos numéricos)
   ========================================================================== */
export function Texto({
  tono = "normal",
  tamano = "sm",
  negrita = false,
  mono = false,
  className,
  children,
}: {
  tono?: "normal" | "suave" | "peligro" | "exito";
  tamano?: "xs" | "sm" | "base" | "lg" | "2xl";
  negrita?: boolean;
  mono?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  /* diccionario de colores según el tono deseado */
  const clasesTono = {
    normal: "text-foreground",
    suave: "text-muted-foreground",
    peligro: "text-red-600",
    exito: "text-emerald-700",
  }[tono];

  /* diccionario de tamaños de fuente */
  const clasesTamano = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    "2xl": "text-2xl",
  }[tamano];

  return (
    <span
      className={cn(
        clasesTono,
        clasesTamano,
        negrita && "font-semibold",
        mono && "font-mono",
        className,
      )}
    >
      {children}
    </span>
  );
}
