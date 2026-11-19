// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/comunes/filtros-url.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Directiva 'use client': indica que este componente tiene interactividad en el navegador
"use client";
// Barra de búsqueda y filtros que vive en la URL (sección 10.6),
// de modo que cualquier listado se pueda recargar o compartir con sus filtros.
import * as React from "react";
// Acá importamos funciones de navegación de Next.js (como redirect para cambiar de página)
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, RotateCcw } from "lucide-react";
// Acá importamos componentes visuales de la interfaz de usuario
import { Input } from "@/componentes/ui/input";
// Acá importamos componentes visuales de la interfaz de usuario
import { Select } from "@/componentes/ui/select";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";
// Acá importamos componentes visuales de la interfaz de usuario
import { Alinear, Caja } from "@/componentes/primitivas/maquetacion";

export type DefinicionFiltro = {
  nombre: string;
  etiqueta: string;
  tipo?: "select" | "fecha";
  opciones?: { valor: string; texto: string }[];
};

// Componente o función exportada 'BarraFiltrosUrl'
export function BarraFiltrosUrl({
  placeholderBusqueda = "Buscar...",
  mostrarBusqueda = true,
  filtros = [],
}: {
  placeholderBusqueda?: string;
  mostrarBusqueda?: boolean;
  filtros?: DefinicionFiltro[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [textoBusqueda, setTextoBusqueda] = React.useState(searchParams.get("q") ?? "");

  React.useEffect(() => {
    setTextoBusqueda(searchParams.get("q") ?? "");
  }, [searchParams]);

  function actualizarParametro(clave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor) {
      params.set(clave, valor);
    } else {
      params.delete(clave);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function enviarBusqueda(e: React.FormEvent) {
    e.preventDefault();
    actualizarParametro("q", textoBusqueda.trim());
  }

  function limpiarTodo() {
    setTextoBusqueda("");
    const pestana = searchParams.get("vista");
    router.push(pestana ? `${pathname}?vista=${pestana}` : pathname);
  }

  // Renderizamos la interfaz visual de este componente:
  return (
    <Alinear className="gap-2.5 rounded-xl border border-border bg-card p-3 no-imprimir">
      {mostrarBusqueda && (
        <form onSubmit={enviarBusqueda} className="flex flex-1 min-w-52 items-center gap-2">
          <Caja className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              placeholder={placeholderBusqueda}
              className="pl-9"
            />
          </Caja>
          <Button type="submit" variant="secondary" size="sm">
            Buscar
          </Button>
        </form>
      )}

      {filtros.map((filtro) => {
        const valorActual = searchParams.get(filtro.nombre) ?? "";
        if (filtro.tipo === "fecha") {
          // Renderizamos la interfaz visual de este componente:
          return (
            <Alinear key={filtro.nombre} className="gap-1.5">
              <Input
                type="date"
                aria-label={filtro.etiqueta}
                value={valorActual}
                onChange={(e) => actualizarParametro(filtro.nombre, e.target.value)}
                className="w-40"
              />
            </Alinear>
          );
        }
        // Renderizamos la interfaz visual de este componente:
        return (
          <Select
            key={filtro.nombre}
            aria-label={filtro.etiqueta}
            value={valorActual}
            onChange={(e) => actualizarParametro(filtro.nombre, e.target.value)}
            className="w-44"
          >
            <option value="">{filtro.etiqueta}</option>
            {filtro.opciones?.map((op) => (
              <option key={op.valor} value={op.valor}>
                {op.texto}
              </option>
            ))}
          </Select>
        );
      })}

      <Button variant="ghost" size="sm" onClick={limpiarTodo} title="Limpiar filtros">
        <RotateCcw className="size-4" />
        Limpiar
      </Button>
    </Alinear>
  );
}
