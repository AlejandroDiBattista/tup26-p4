// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/comunes/estados.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Componentes reutilizables para los estados de carga, vacío y error (secciones 8 y 10.6).
import * as React from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
// Acá importamos componentes visuales de la interfaz de usuario
import { Apilar, Alinear, Texto, Titulo } from "@/componentes/primitivas/maquetacion";
// Acá importamos componentes visuales de la interfaz de usuario
import { Card } from "@/componentes/ui/card";

// Componente o función exportada 'EstadoVacio'
export function EstadoVacio({
  titulo = "No hay registros para mostrar",
  descripcion,
  accion,
}: {
  titulo?: string;
  descripcion?: string;
  accion?: React.ReactNode;
}) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <Card className="items-center justify-center py-12 text-center">
      <Inbox className="size-10 text-muted-foreground/60" />
      <Apilar className="gap-1 items-center">
        <Titulo nivel={3}>{titulo}</Titulo>
        {descripcion && <Texto tono="suave">{descripcion}</Texto>}
      </Apilar>
      {accion}
    </Card>
  );
}

// Componente o función exportada 'EstadoError'
export function EstadoError({
  mensaje = "No se pudo cargar la información.",
}: {
  mensaje?: string;
}) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <Card className="border-red-200 bg-red-50/70 p-4">
      <Alinear className="gap-2.5">
        <AlertCircle className="size-5 text-red-600" />
        <Texto tono="peligro" negrita>
          {mensaje}
        </Texto>
      </Alinear>
    </Card>
  );
}

// Componente o función exportada 'EstadoCargando'
export function EstadoCargando({ texto = "Cargando datos..." }: { texto?: string }) {
  // Renderizamos la interfaz visual de este componente:
  return (
    <Card className="items-center justify-center py-12">
      <Alinear className="gap-2">
        <Loader2 className="size-5 animate-spin text-primary" />
        <Texto tono="suave">{texto}</Texto>
      </Alinear>
    </Card>
  );
}
