// Componentes reutilizables para los estados de carga, vacío y error (secciones 8 y 10.6).
import * as React from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { Apilar, Alinear, Texto, Titulo } from "@/componentes/primitivas/maquetacion";
import { Card } from "@/componentes/ui/card";

export function EstadoVacio({
  titulo = "No hay registros para mostrar",
  descripcion,
  accion,
}: {
  titulo?: string;
  descripcion?: string;
  accion?: React.ReactNode;
}) {
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

export function EstadoError({
  mensaje = "No se pudo cargar la información.",
}: {
  mensaje?: string;
}) {
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

export function EstadoCargando({ texto = "Cargando datos..." }: { texto?: string }) {
  return (
    <Card className="items-center justify-center py-12">
      <Alinear className="gap-2">
        <Loader2 className="size-5 animate-spin text-primary" />
        <Texto tono="suave">{texto}</Texto>
      </Alinear>
    </Card>
  );
}
