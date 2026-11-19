// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Paginador que guarda "page" en la URL para que el listado se pueda recargar y compartir (sección 10.6).
// [Línea 3] Importa elementos desde 'next/navigation'.
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// [Línea 4] Importa elementos desde 'lucide-react'.
import { ChevronLeft, ChevronRight } from "lucide-react";
// [Línea 5] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 6] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 8] Declara la función o componente 'Paginador'.
export function Paginador({
  // [Línea 9] Ejecuta o evalúa: page,
  page,
  // [Línea 10] Ejecuta o evalúa: pageSize,
  pageSize,
  // [Línea 11] Ejecuta o evalúa: total,
  total,
// [Línea 12] Ejecuta o evalúa: }: {
}: {
  // [Línea 13] Define o asigna el campo/parámetro 'page'.
  page: number;
  // [Línea 14] Define o asigna el campo/parámetro 'pageSize'.
  pageSize: number;
  // [Línea 15] Define o asigna el campo/parámetro 'total'.
  total: number;
// [Línea 16] Ejecuta o evalúa: }) {
}) {
  // [Línea 17] Declara 'router' y le asigna el valor resultante.
  const router = useRouter();
  // [Línea 18] Declara 'pathname' y le asigna el valor resultante.
  const pathname = usePathname();
  // [Línea 19] Declara 'searchParams' y le asigna el valor resultante.
  const searchParams = useSearchParams();

  // [Línea 21] Declara 'totalPaginas' y le asigna el valor resultante.
  const totalPaginas = Math.max(1, Math.ceil(total / pageSize));
  // [Línea 22] Verifica la condición: if (total === 0) return null;
  if (total === 0) return null;

  // [Línea 24] Declara la función o componente 'irAPagina'.
  function irAPagina(nuevaPagina: number) {
    // [Línea 25] Declara 'params' y le asigna el valor resultante.
    const params = new URLSearchParams(searchParams.toString());
    // [Línea 26] Ejecuta o evalúa: params.set("page", String(nuevaPagina));
    params.set("page", String(nuevaPagina));
    // [Línea 27] Ejecuta o evalúa: router.push(`${pathname}?${params.toString()}`);
    router.push(`${pathname}?${params.toString()}`);
  // [Línea 28] Cierra el bloque o estructura (}).
  }

  // [Línea 30] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Alinear className="justify-between pt-2 no-imprimir"> // [Línea 31] Abre o renderiza el componente visual <Alinear>.
      <Texto tamano="xs" tono="suave"> // [Línea 32] Abre o renderiza el componente visual <Texto>.
        // [Línea 33] Ejecuta o evalúa: Mostrando página {page} de {totalPaginas} ({total} registros en total)
        Mostrando página {page} de {totalPaginas} ({total} registros en total)
      </Texto> // [Línea 34] Cierra el componente visual </Texto>.
      <Alinear className="gap-1.5"> // [Línea 35] Abre o renderiza el componente visual <Alinear>.
        <Button // [Línea 36] Abre o renderiza el componente visual <Button>.
          // [Línea 37] Ejecuta o evalúa: variant="outline"
          variant="outline"
          // [Línea 38] Ejecuta o evalúa: size="sm"
          size="sm"
          // [Línea 39] Ejecuta o evalúa: disabled={page <= 1}
          disabled={page <= 1}
          // [Línea 40] Ejecuta o evalúa: onClick={() => irAPagina(page - 1)}
          onClick={() => irAPagina(page - 1)}
        // [Línea 41] Ejecuta o evalúa: >
        >
          <ChevronLeft className="size-4" /> // [Línea 42] Abre o renderiza el componente visual <ChevronLeft>.
          // [Línea 43] Ejecuta o evalúa: Anterior
          Anterior
        </Button> // [Línea 44] Cierra el componente visual </Button>.
        <Button // [Línea 45] Abre o renderiza el componente visual <Button>.
          // [Línea 46] Ejecuta o evalúa: variant="outline"
          variant="outline"
          // [Línea 47] Ejecuta o evalúa: size="sm"
          size="sm"
          // [Línea 48] Ejecuta o evalúa: disabled={page >= totalPaginas}
          disabled={page >= totalPaginas}
          // [Línea 49] Ejecuta o evalúa: onClick={() => irAPagina(page + 1)}
          onClick={() => irAPagina(page + 1)}
        // [Línea 50] Ejecuta o evalúa: >
        >
          // [Línea 51] Ejecuta o evalúa: Siguiente
          Siguiente
          <ChevronRight className="size-4" /> // [Línea 52] Abre o renderiza el componente visual <ChevronRight>.
        </Button> // [Línea 53] Cierra el componente visual </Button>.
      </Alinear> // [Línea 54] Cierra el componente visual </Alinear>.
    </Alinear> // [Línea 55] Cierra el componente visual </Alinear>.
  // [Línea 56] Cierra el bloque o estructura ();).
  );
// [Línea 57] Cierra el bloque o estructura (}).
}
