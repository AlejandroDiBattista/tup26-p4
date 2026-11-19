// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Barra de búsqueda y filtros que vive en la URL (sección 10.6),
// de modo que cualquier listado se pueda recargar o compartir con sus filtros.
// [Línea 4] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 5] Importa elementos desde 'next/navigation'.
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// [Línea 6] Importa elementos desde 'lucide-react'.
import { Search, RotateCcw } from "lucide-react";
// [Línea 7] Importa elementos desde '@/componentes/ui/input'.
import { Input } from "@/componentes/ui/input";
// [Línea 8] Importa elementos desde '@/componentes/ui/select'.
import { Select } from "@/componentes/ui/select";
// [Línea 9] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 10] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Caja } from "@/componentes/primitivas/maquetacion";

// [Línea 12] Define el tipo de datos 'DefinicionFiltro' en TypeScript.
export type DefinicionFiltro = {
  // [Línea 13] Define o asigna el campo/parámetro 'nombre'.
  nombre: string;
  // [Línea 14] Define o asigna el campo/parámetro 'etiqueta'.
  etiqueta: string;
  // [Línea 15] Ejecuta o evalúa: tipo?: "select" | "fecha";
  tipo?: "select" | "fecha";
  // [Línea 16] Ejecuta o evalúa: opciones?: { valor: string; texto: string }[];
  opciones?: { valor: string; texto: string }[];
// [Línea 17] Cierra el bloque o estructura (};).
};

// [Línea 19] Declara la función o componente 'BarraFiltrosUrl'.
export function BarraFiltrosUrl({
  // [Línea 20] Ejecuta o evalúa: placeholderBusqueda = "Buscar...",
  placeholderBusqueda = "Buscar...",
  // [Línea 21] Ejecuta o evalúa: mostrarBusqueda = true,
  mostrarBusqueda = true,
  // [Línea 22] Ejecuta o evalúa: filtros = [],
  filtros = [],
// [Línea 23] Ejecuta o evalúa: }: {
}: {
  // [Línea 24] Ejecuta o evalúa: placeholderBusqueda?: string;
  placeholderBusqueda?: string;
  // [Línea 25] Ejecuta o evalúa: mostrarBusqueda?: boolean;
  mostrarBusqueda?: boolean;
  // [Línea 26] Ejecuta o evalúa: filtros?: DefinicionFiltro[];
  filtros?: DefinicionFiltro[];
// [Línea 27] Ejecuta o evalúa: }) {
}) {
  // [Línea 28] Declara 'router' y le asigna el valor resultante.
  const router = useRouter();
  // [Línea 29] Declara 'pathname' y le asigna el valor resultante.
  const pathname = usePathname();
  // [Línea 30] Declara 'searchParams' y le asigna el valor resultante.
  const searchParams = useSearchParams();

  // [Línea 32] Estado reactivo de React [textoBusqueda, setTextoBusqueda]: guarda el valor actual y la función para actualizarlo.
  const [textoBusqueda, setTextoBusqueda] = React.useState(searchParams.get("q") ?? "");

  // [Línea 34] Ejecuta o evalúa: React.useEffect(() => {
  React.useEffect(() => {
    // [Línea 35] Ejecuta o evalúa: setTextoBusqueda(searchParams.get("q") ?? "");
    setTextoBusqueda(searchParams.get("q") ?? "");
  // [Línea 36] Ejecuta o evalúa: }, [searchParams]);
  }, [searchParams]);

  // [Línea 38] Declara la función o componente 'actualizarParametro'.
  function actualizarParametro(clave: string, valor: string) {
    // [Línea 39] Declara 'params' y le asigna el valor resultante.
    const params = new URLSearchParams(searchParams.toString());
    // [Línea 40] Verifica la condición: if (valor) {
    if (valor) {
      // [Línea 41] Ejecuta o evalúa: params.set(clave, valor);
      params.set(clave, valor);
    // [Línea 42] Rama else: se ejecuta si no se cumplió la condición anterior.
    } else {
      // [Línea 43] Ejecuta o evalúa: params.delete(clave);
      params.delete(clave);
    // [Línea 44] Cierra el bloque o estructura (}).
    }
    // [Línea 45] Ejecuta o evalúa: params.delete("page");
    params.delete("page");
    // [Línea 46] Ejecuta o evalúa: router.push(`${pathname}?${params.toString()}`);
    router.push(`${pathname}?${params.toString()}`);
  // [Línea 47] Cierra el bloque o estructura (}).
  }

  // [Línea 49] Declara la función o componente 'enviarBusqueda'.
  function enviarBusqueda(e: React.FormEvent) {
    // [Línea 50] Ejecuta o evalúa: e.preventDefault();
    e.preventDefault();
    // [Línea 51] Ejecuta o evalúa: actualizarParametro("q", textoBusqueda.trim());
    actualizarParametro("q", textoBusqueda.trim());
  // [Línea 52] Cierra el bloque o estructura (}).
  }

  // [Línea 54] Declara la función o componente 'limpiarTodo'.
  function limpiarTodo() {
    // [Línea 55] Ejecuta o evalúa: setTextoBusqueda("");
    setTextoBusqueda("");
    // [Línea 56] Declara 'pestana' y le asigna el valor resultante.
    const pestana = searchParams.get("vista");
    // [Línea 57] Ejecuta o evalúa: router.push(pestana ? `${pathname}?vista=${pestana}` : pathname);
    router.push(pestana ? `${pathname}?vista=${pestana}` : pathname);
  // [Línea 58] Cierra el bloque o estructura (}).
  }

  // [Línea 60] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Alinear className="gap-2.5 rounded-xl border border-border bg-card p-3 no-imprimir"> // [Línea 61] Abre o renderiza el componente visual <Alinear>.
      // [Línea 62] Ejecuta o evalúa: {mostrarBusqueda && (
      {mostrarBusqueda && (
        <form onSubmit={enviarBusqueda} className="flex flex-1 min-w-52 items-center gap-2"> // [Línea 63] Abre o renderiza el componente visual <form>.
          <Caja className="relative flex-1"> // [Línea 64] Abre o renderiza el componente visual <Caja>.
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /> // [Línea 65] Abre o renderiza el componente visual <Search>.
            <Input // [Línea 66] Abre o renderiza el componente visual <Input>.
              // [Línea 67] Ejecuta o evalúa: value={textoBusqueda}
              value={textoBusqueda}
              // [Línea 68] Ejecuta o evalúa: onChange={(e) => setTextoBusqueda(e.target.value)}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              // [Línea 69] Ejecuta o evalúa: placeholder={placeholderBusqueda}
              placeholder={placeholderBusqueda}
              // [Línea 70] Ejecuta o evalúa: className="pl-9"
              className="pl-9"
            // [Línea 71] Ejecuta o evalúa: />
            />
          </Caja> // [Línea 72] Cierra el componente visual </Caja>.
          <Button type="submit" variant="secondary" size="sm"> // [Línea 73] Abre o renderiza el componente visual <Button>.
            // [Línea 74] Ejecuta o evalúa: Buscar
            Buscar
          </Button> // [Línea 75] Cierra el componente visual </Button>.
        </form> // [Línea 76] Cierra el componente visual </form>.
      // [Línea 77] Ejecuta o evalúa: )}
      )}

      // [Línea 79] Ejecuta o evalúa: {filtros.map((filtro) => {
      {filtros.map((filtro) => {
        // [Línea 80] Declara 'valorActual' y le asigna el valor resultante.
        const valorActual = searchParams.get(filtro.nombre) ?? "";
        // [Línea 81] Verifica la condición: if (filtro.tipo === "fecha") {
        if (filtro.tipo === "fecha") {
          // [Línea 82] Devuelve la interfaz JSX que renderiza este componente.
          return (
            <Alinear key={filtro.nombre} className="gap-1.5"> // [Línea 83] Abre o renderiza el componente visual <Alinear>.
              <Input // [Línea 84] Abre o renderiza el componente visual <Input>.
                // [Línea 85] Ejecuta o evalúa: type="date"
                type="date"
                // [Línea 86] Ejecuta o evalúa: aria-label={filtro.etiqueta}
                aria-label={filtro.etiqueta}
                // [Línea 87] Ejecuta o evalúa: value={valorActual}
                value={valorActual}
                // [Línea 88] Ejecuta o evalúa: onChange={(e) => actualizarParametro(filtro.nombre, e.target.value)}
                onChange={(e) => actualizarParametro(filtro.nombre, e.target.value)}
                // [Línea 89] Ejecuta o evalúa: className="w-40"
                className="w-40"
              // [Línea 90] Ejecuta o evalúa: />
              />
            </Alinear> // [Línea 91] Cierra el componente visual </Alinear>.
          // [Línea 92] Cierra el bloque o estructura ();).
          );
        // [Línea 93] Cierra el bloque o estructura (}).
        }
        // [Línea 94] Devuelve la interfaz JSX que renderiza este componente.
        return (
          <Select // [Línea 95] Abre o renderiza el componente visual <Select>.
            // [Línea 96] Ejecuta o evalúa: key={filtro.nombre}
            key={filtro.nombre}
            // [Línea 97] Ejecuta o evalúa: aria-label={filtro.etiqueta}
            aria-label={filtro.etiqueta}
            // [Línea 98] Ejecuta o evalúa: value={valorActual}
            value={valorActual}
            // [Línea 99] Ejecuta o evalúa: onChange={(e) => actualizarParametro(filtro.nombre, e.target.value)}
            onChange={(e) => actualizarParametro(filtro.nombre, e.target.value)}
            // [Línea 100] Ejecuta o evalúa: className="w-44"
            className="w-44"
          // [Línea 101] Ejecuta o evalúa: >
          >
            <option value="">{filtro.etiqueta}</option> // [Línea 102] Abre o renderiza el componente visual <option>.
            // [Línea 103] Ejecuta o evalúa: {filtro.opciones?.map((op) => (
            {filtro.opciones?.map((op) => (
              <option key={op.valor} value={op.valor}> // [Línea 104] Abre o renderiza el componente visual <option>.
                // [Línea 105] Ejecuta o evalúa: {op.texto}
                {op.texto}
              </option> // [Línea 106] Cierra el componente visual </option>.
            // [Línea 107] Ejecuta o evalúa: ))}
            ))}
          </Select> // [Línea 108] Cierra el componente visual </Select>.
        // [Línea 109] Cierra el bloque o estructura ();).
        );
      // [Línea 110] Ejecuta o evalúa: })}
      })}

      <Button variant="ghost" size="sm" onClick={limpiarTodo} title="Limpiar filtros"> // [Línea 112] Abre o renderiza el componente visual <Button>.
        <RotateCcw className="size-4" /> // [Línea 113] Abre o renderiza el componente visual <RotateCcw>.
        // [Línea 114] Ejecuta o evalúa: Limpiar
        Limpiar
      </Button> // [Línea 115] Cierra el componente visual </Button>.
    </Alinear> // [Línea 116] Cierra el componente visual </Alinear>.
  // [Línea 117] Cierra el bloque o estructura ();).
  );
// [Línea 118] Cierra el bloque o estructura (}).
}
