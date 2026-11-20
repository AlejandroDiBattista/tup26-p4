// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: app/(sistema)/error.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Directiva 'use client': indica que este componente tiene interactividad en el navegador
"use client";
// Estado de error automático de Next.js cuando falla una pantalla (sección 8).
// Acá importamos componentes visuales de la interfaz de usuario
import { EstadoError } from "@/componentes/comunes/estados";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";
// Acá importamos componentes visuales de la interfaz de usuario
import { Apilar } from "@/componentes/primitivas/maquetacion";

// Componente principal 'ErrorPagina'
export default function ErrorPagina({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <Apilar className="gap-4">
      <EstadoError mensaje={error.message || "Ocurrió un problema al cargar la pantalla."} />
      <Button variant="outline" onClick={reset} className="self-start">
        Reintentar
      </Button>
    </Apilar>
  );
}
