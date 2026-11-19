// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Campo con etiqueta y mensaje de error, y campo de importe en pesos (sección 10.6).
// [Línea 3] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 4] Importa elementos desde '@/componentes/ui/label'.
import { Label } from "@/componentes/ui/label";
// [Línea 5] Importa elementos desde '@/componentes/ui/input'.
import { Input } from "@/componentes/ui/input";
// [Línea 6] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Apilar, Caja, Texto } from "@/componentes/primitivas/maquetacion";

// [Línea 8] Declara la función o componente 'CampoFormulario'.
export function CampoFormulario({
  // [Línea 9] Ejecuta o evalúa: etiqueta,
  etiqueta,
  // [Línea 10] Ejecuta o evalúa: error,
  error,
  // [Línea 11] Ejecuta o evalúa: ayuda,
  ayuda,
  // [Línea 12] Ejecuta o evalúa: children,
  children,
// [Línea 13] Ejecuta o evalúa: }: {
}: {
  // [Línea 14] Define o asigna el campo/parámetro 'etiqueta'.
  etiqueta: string;
  // [Línea 15] Ejecuta o evalúa: error?: string;
  error?: string;
  // [Línea 16] Ejecuta o evalúa: ayuda?: string;
  ayuda?: string;
  // [Línea 17] Define o asigna el campo/parámetro 'children'.
  children: React.ReactNode;
// [Línea 18] Ejecuta o evalúa: }) {
}) {
  // [Línea 19] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Apilar className="gap-1.5"> // [Línea 20] Abre o renderiza el componente visual <Apilar>.
      <Label>{etiqueta}</Label> // [Línea 21] Abre o renderiza el componente visual <Label>.
      // [Línea 22] Ejecuta o evalúa: {children}
      {children}
      // [Línea 23] Ejecuta o evalúa: {ayuda && !error && (
      {ayuda && !error && (
        <Texto tamano="xs" tono="suave"> // [Línea 24] Abre o renderiza el componente visual <Texto>.
          // [Línea 25] Ejecuta o evalúa: {ayuda}
          {ayuda}
        </Texto> // [Línea 26] Cierra el componente visual </Texto>.
      // [Línea 27] Ejecuta o evalúa: )}
      )}
      // [Línea 28] Ejecuta o evalúa: {error && (
      {error && (
        <Texto tamano="xs" tono="peligro"> // [Línea 29] Abre o renderiza el componente visual <Texto>.
          // [Línea 30] Ejecuta o evalúa: {error}
          {error}
        </Texto> // [Línea 31] Cierra el componente visual </Texto>.
      // [Línea 32] Ejecuta o evalúa: )}
      )}
    </Apilar> // [Línea 33] Cierra el componente visual </Apilar>.
  // [Línea 34] Cierra el bloque o estructura ();).
  );
// [Línea 35] Cierra el bloque o estructura (}).
}

// Campo para escribir importes en pesos argentinos (ej. "12500,50").
// [Línea 38] Declara la función o componente 'CampoImporte'.
export function CampoImporte({
  // [Línea 39] Ejecuta o evalúa: etiqueta,
  etiqueta,
  // [Línea 40] Ejecuta o evalúa: valorTexto,
  valorTexto,
  // [Línea 41] Ejecuta o evalúa: alCambiar,
  alCambiar,
  // [Línea 42] Ejecuta o evalúa: error,
  error,
  // [Línea 43] Ejecuta o evalúa: ayuda,
  ayuda,
  // [Línea 44] Ejecuta o evalúa: placeholder = "0,00",
  placeholder = "0,00",
  // [Línea 45] Ejecuta o evalúa: disabled,
  disabled,
// [Línea 46] Ejecuta o evalúa: }: {
}: {
  // [Línea 47] Define o asigna el campo/parámetro 'etiqueta'.
  etiqueta: string;
  // [Línea 48] Define o asigna el campo/parámetro 'valorTexto'.
  valorTexto: string;
  // [Línea 49] Define o asigna el campo/parámetro 'alCambiar'.
  alCambiar: (nuevoTexto: string) => void;
  // [Línea 50] Ejecuta o evalúa: error?: string;
  error?: string;
  // [Línea 51] Ejecuta o evalúa: ayuda?: string;
  ayuda?: string;
  // [Línea 52] Ejecuta o evalúa: placeholder?: string;
  placeholder?: string;
  // [Línea 53] Ejecuta o evalúa: disabled?: boolean;
  disabled?: boolean;
// [Línea 54] Ejecuta o evalúa: }) {
}) {
  // [Línea 55] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <CampoFormulario etiqueta={etiqueta} error={error} ayuda={ayuda}> // [Línea 56] Abre o renderiza el componente visual <CampoFormulario>.
      <Caja className="relative"> // [Línea 57] Abre o renderiza el componente visual <Caja>.
        <Texto // [Línea 58] Abre o renderiza el componente visual <Texto>.
          // [Línea 59] Ejecuta o evalúa: tono="suave"
          tono="suave"
          // [Línea 60] Ejecuta o evalúa: className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 select-n
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 select-none"
        // [Línea 61] Ejecuta o evalúa: >
        >
          // [Línea 62] Ejecuta o evalúa: $
          $
        </Texto> // [Línea 63] Cierra el componente visual </Texto>.
        <Input // [Línea 64] Abre o renderiza el componente visual <Input>.
          // [Línea 65] Ejecuta o evalúa: value={valorTexto}
          value={valorTexto}
          // [Línea 66] Ejecuta o evalúa: onChange={(e) => alCambiar(e.target.value)}
          onChange={(e) => alCambiar(e.target.value)}
          // [Línea 67] Ejecuta o evalúa: placeholder={placeholder}
          placeholder={placeholder}
          // [Línea 68] Ejecuta o evalúa: disabled={disabled}
          disabled={disabled}
          // [Línea 69] Ejecuta o evalúa: aria-invalid={Boolean(error)}
          aria-invalid={Boolean(error)}
          // [Línea 70] Ejecuta o evalúa: className="pl-7 font-mono"
          className="pl-7 font-mono"
        // [Línea 71] Ejecuta o evalúa: />
        />
      </Caja> // [Línea 72] Cierra el componente visual </Caja>.
    </CampoFormulario> // [Línea 73] Cierra el componente visual </CampoFormulario>.
  // [Línea 74] Cierra el bloque o estructura ();).
  );
// [Línea 75] Cierra el bloque o estructura (}).
}
