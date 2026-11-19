// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/primitivas/maquetacion.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Primitivas de maquetación propias (sección 10.6):
// Apilar, Alinear, Grilla, Caja, Titulo y Texto.
// Así las páginas se arman con componentes semánticos sin etiquetas HTML sueltas.
import * as React from "react";
import { cn } from "@/lib/utils";

// Contenedor principal de cada página.
// Componente o función exportada 'Pagina'
export function Pagina({ className, children }: React.ComponentProps<"section">) {
  return <section className={cn("flex flex-col gap-6", className)}>{children}</section>;
}

// Apila elementos verticalmente (flex-col).
// Componente o función exportada 'Apilar'
export function Apilar({ className, children, ...props }: React.ComponentProps<"div">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {children}
    </div>
  );
}

// Alinea elementos horizontalmente (flex-row).
// Componente o función exportada 'Alinear'
export function Alinear({ className, children, ...props }: React.ComponentProps<"div">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)} {...props}>
      {children}
    </div>
  );
}

// Dispone elementos en grilla (CSS Grid).
// Componente o función exportada 'Grilla'
export function Grilla({ className, children, ...props }: React.ComponentProps<"div">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <div className={cn("grid gap-4", className)} {...props}>
      {children}
    </div>
  );
}

// Contenedor genérico con clases de Tailwind.
// Componente o función exportada 'Caja'
export function Caja({ className, children, ...props }: React.ComponentProps<"div">) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}

// Título con nivel configurable.
// Componente o función exportada 'Titulo'
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

// Texto con variantes de tono y tamaño.
// Componente o función exportada 'Texto'
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
  const clasesTono = {
    normal: "text-foreground",
    suave: "text-muted-foreground",
    peligro: "text-red-600",
    exito: "text-emerald-700",
  }[tono];

  const clasesTamano = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    "2xl": "text-2xl",
  }[tamano];

  // Renderizamos la interfaz visual de este componente:
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
