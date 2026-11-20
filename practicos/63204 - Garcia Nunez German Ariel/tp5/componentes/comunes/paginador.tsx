"use client";
// Paginador que guarda "page" en la URL para que el listado se pueda recargar y compartir (sección 10.6).
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/componentes/ui/button";
import { Alinear, Texto } from "@/componentes/primitivas/maquetacion";

export function Paginador({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPaginas = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  function irAPagina(nuevaPagina: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nuevaPagina));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Alinear className="justify-between pt-2 no-imprimir">
      <Texto tamano="xs" tono="suave">
        Mostrando página {page} de {totalPaginas} ({total} registros en total)
      </Texto>
      <Alinear className="gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => irAPagina(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPaginas}
          onClick={() => irAPagina(page + 1)}
        >
          Siguiente
          <ChevronRight className="size-4" />
        </Button>
      </Alinear>
    </Alinear>
  );
}
