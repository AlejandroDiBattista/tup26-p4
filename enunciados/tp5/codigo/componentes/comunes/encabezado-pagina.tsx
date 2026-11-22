// Encabezado reutilizable para todas las páginas (sección 10.6).
import * as React from "react";
import { Alinear, Apilar, Titulo, Texto } from "@/componentes/primitivas/maquetacion";

export function EncabezadoPagina({
  titulo,
  subtitulo,
  acciones,
}: {
  titulo: React.ReactNode;
  subtitulo?: React.ReactNode;
  acciones?: React.ReactNode;
}) {
  return (
    <Alinear className="justify-between border-b border-border pb-4 no-imprimir">
      <Apilar className="gap-1">
        <Titulo nivel={1}>{titulo}</Titulo>
        {subtitulo && <Texto tono="suave">{subtitulo}</Texto>}
      </Apilar>
      {acciones && <Alinear className="gap-2">{acciones}</Alinear>}
    </Alinear>
  );
}
