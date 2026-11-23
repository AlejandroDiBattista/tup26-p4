"use client";
// Estado de error automático de Next.js cuando falla una pantalla (sección 8).
import Link from "next/link";
import { EstadoError } from "@/componentes/comunes/estados";
import { Button } from "@/componentes/ui/button";
import { Alinear, Apilar } from "@/componentes/primitivas/maquetacion";

export default function ErrorPagina({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const esErrorMinificado = error.message?.includes("Minified React error");
  const mensajeAmigable = esErrorMinificado
    ? "Ocurrió una excepción al procesar la solicitud en el servidor. Puede deberse a que el recurso solicitado no está disponible o a un reinicio de la instancia temporal."
    : error.message || "Ocurrió un problema al cargar la pantalla.";

  return (
    <Apilar className="gap-4 p-4 max-w-2xl">
      <EstadoError mensaje={mensajeAmigable} />
      <Alinear className="gap-2">
        <Button variant="default" onClick={reset}>
          Reintentar
        </Button>
        <Link href="/">
          <Button variant="outline">
            Volver al inicio
          </Button>
        </Link>
      </Alinear>
    </Apilar>
  );
}
