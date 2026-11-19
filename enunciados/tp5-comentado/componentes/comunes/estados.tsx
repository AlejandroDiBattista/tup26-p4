// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// Componentes reutilizables para los estados de carga, vacío y error (secciones 8 y 10.6).
// [Línea 2] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 3] Importa elementos desde 'lucide-react'.
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
// [Línea 4] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Apilar, Alinear, Texto, Titulo } from "@/componentes/primitivas/maquetacion";
// [Línea 5] Importa elementos desde '@/componentes/ui/card'.
import { Card } from "@/componentes/ui/card";

// [Línea 7] Declara la función o componente 'EstadoVacio'.
export function EstadoVacio({
  // [Línea 8] Ejecuta o evalúa: titulo = "No hay registros para mostrar",
  titulo = "No hay registros para mostrar",
  // [Línea 9] Ejecuta o evalúa: descripcion,
  descripcion,
  // [Línea 10] Ejecuta o evalúa: accion,
  accion,
// [Línea 11] Ejecuta o evalúa: }: {
}: {
  // [Línea 12] Ejecuta o evalúa: titulo?: string;
  titulo?: string;
  // [Línea 13] Ejecuta o evalúa: descripcion?: string;
  descripcion?: string;
  // [Línea 14] Ejecuta o evalúa: accion?: React.ReactNode;
  accion?: React.ReactNode;
// [Línea 15] Ejecuta o evalúa: }) {
}) {
  // [Línea 16] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Card className="items-center justify-center py-12 text-center"> // [Línea 17] Abre o renderiza el componente visual <Card>.
      <Inbox className="size-10 text-muted-foreground/60" /> // [Línea 18] Abre o renderiza el componente visual <Inbox>.
      <Apilar className="gap-1 items-center"> // [Línea 19] Abre o renderiza el componente visual <Apilar>.
        <Titulo nivel={3}>{titulo}</Titulo> // [Línea 20] Abre o renderiza el componente visual <Titulo>.
        // [Línea 21] Ejecuta o evalúa: {descripcion && <Texto tono="suave">{descripcion}</Texto>}
        {descripcion && <Texto tono="suave">{descripcion}</Texto>}
      </Apilar> // [Línea 22] Cierra el componente visual </Apilar>.
      // [Línea 23] Ejecuta o evalúa: {accion}
      {accion}
    </Card> // [Línea 24] Cierra el componente visual </Card>.
  // [Línea 25] Cierra el bloque o estructura ();).
  );
// [Línea 26] Cierra el bloque o estructura (}).
}

// [Línea 28] Declara la función o componente 'EstadoError'.
export function EstadoError({
  // [Línea 29] Ejecuta o evalúa: mensaje = "No se pudo cargar la información.",
  mensaje = "No se pudo cargar la información.",
// [Línea 30] Ejecuta o evalúa: }: {
}: {
  // [Línea 31] Ejecuta o evalúa: mensaje?: string;
  mensaje?: string;
// [Línea 32] Ejecuta o evalúa: }) {
}) {
  // [Línea 33] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Card className="border-red-200 bg-red-50/70 p-4"> // [Línea 34] Abre o renderiza el componente visual <Card>.
      <Alinear className="gap-2.5"> // [Línea 35] Abre o renderiza el componente visual <Alinear>.
        <AlertCircle className="size-5 text-red-600" /> // [Línea 36] Abre o renderiza el componente visual <AlertCircle>.
        <Texto tono="peligro" negrita> // [Línea 37] Abre o renderiza el componente visual <Texto>.
          // [Línea 38] Ejecuta o evalúa: {mensaje}
          {mensaje}
        </Texto> // [Línea 39] Cierra el componente visual </Texto>.
      </Alinear> // [Línea 40] Cierra el componente visual </Alinear>.
    </Card> // [Línea 41] Cierra el componente visual </Card>.
  // [Línea 42] Cierra el bloque o estructura ();).
  );
// [Línea 43] Cierra el bloque o estructura (}).
}

// [Línea 45] Declara la función o componente 'EstadoCargando'.
export function EstadoCargando({ texto = "Cargando datos..." }: { texto?: string }) {
  // [Línea 46] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Card className="items-center justify-center py-12"> // [Línea 47] Abre o renderiza el componente visual <Card>.
      <Alinear className="gap-2"> // [Línea 48] Abre o renderiza el componente visual <Alinear>.
        <Loader2 className="size-5 animate-spin text-primary" /> // [Línea 49] Abre o renderiza el componente visual <Loader2>.
        <Texto tono="suave">{texto}</Texto> // [Línea 50] Abre o renderiza el componente visual <Texto>.
      </Alinear> // [Línea 51] Cierra el componente visual </Alinear>.
    </Card> // [Línea 52] Cierra el componente visual </Card>.
  // [Línea 53] Cierra el bloque o estructura ();).
  );
// [Línea 54] Cierra el bloque o estructura (}).
}
