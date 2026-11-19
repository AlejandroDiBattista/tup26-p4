// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Encabezado reutilizable para todas las páginas (sección 10.6).
// [Línea 2] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 3] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear, Apilar, Titulo, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 5] Declara la función o componente 'EncabezadoPagina'.
export function EncabezadoPagina({
  // [Línea 6] Ejecuta o evalúa: titulo,
  titulo,
  // [Línea 7] Ejecuta o evalúa: subtitulo,
  subtitulo,
  // [Línea 8] Ejecuta o evalúa: acciones,
  acciones,
// [Línea 9] Ejecuta o evalúa: }: {
}: {
  // [Línea 10] Define o asigna el campo/parámetro 'titulo'.
  titulo: React.ReactNode;
  // [Línea 11] Ejecuta o evalúa: subtitulo?: React.ReactNode;
  subtitulo?: React.ReactNode;
  // [Línea 12] Ejecuta o evalúa: acciones?: React.ReactNode;
  acciones?: React.ReactNode;
// [Línea 13] Ejecuta o evalúa: }) {
}) {
  // [Línea 14] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Alinear className="justify-between border-b border-border pb-4 no-imprimir"> // [Línea 15] Abre o renderiza el componente visual <Alinear>.
      <Apilar className="gap-1"> // [Línea 16] Abre o renderiza el componente visual <Apilar>.
        <Titulo nivel={1}>{titulo}</Titulo> // [Línea 17] Abre o renderiza el componente visual <Titulo>.
        // [Línea 18] Ejecuta o evalúa: {subtitulo && <Texto tono="suave">{subtitulo}</Texto>}
        {subtitulo && <Texto tono="suave">{subtitulo}</Texto>}
      </Apilar> // [Línea 19] Cierra el componente visual </Apilar>.
      // [Línea 20] Ejecuta o evalúa: {acciones && <Alinear className="gap-2">{acciones}</Alinear>}
      {acciones && <Alinear className="gap-2">{acciones}</Alinear>}
    </Alinear> // [Línea 21] Cierra el componente visual </Alinear>.
  // [Línea 22] Cierra el bloque o estructura ();).
  );
// [Línea 23] Cierra el bloque o estructura (}).
}
