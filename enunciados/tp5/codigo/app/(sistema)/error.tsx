"use client";
// Estado de error automático de Next.js cuando falla una pantalla (sección 8).
import { EstadoError } from "@/componentes/comunes/estados";
import { Button } from "@/componentes/ui/button";
import { Apilar } from "@/componentes/primitivas/maquetacion";

export default function ErrorPagina({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Apilar className="gap-4">
      <EstadoError mensaje={error.message || "Ocurrió un problema al cargar la pantalla."} />
      <Button variant="outline" onClick={reset} className="self-start">
        Reintentar
      </Button>
    </Apilar>
  );
}
