// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Diálogo reutilizable para confirmar acciones irreversibles: dar de baja, desactivar (secciones 8 y 10.6).
// [Línea 3] Importa elementos desde 'react'.
import { useState } from "react";
// [Línea 4] Inicia un bloque de importación de dependencias.
import {
  // [Línea 5] Importa 'Dialog' desde el módulo.
  Dialog,
  // [Línea 6] Importa 'DialogContent' desde el módulo.
  DialogContent,
  // [Línea 7] Importa 'DialogDescription' desde el módulo.
  DialogDescription,
  // [Línea 8] Importa 'DialogFooter' desde el módulo.
  DialogFooter,
  // [Línea 9] Importa 'DialogHeader' desde el módulo.
  DialogHeader,
  // [Línea 10] Importa 'DialogTitle' desde el módulo.
  DialogTitle,
// [Línea 11] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/dialog'.
} from "@/componentes/ui/dialog";
// [Línea 12] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";

// [Línea 14] Declara la función o componente 'ModalConfirmacion'.
export function ModalConfirmacion({
  // [Línea 15] Ejecuta o evalúa: abierto,
  abierto,
  // [Línea 16] Ejecuta o evalúa: alCambiarAbierto,
  alCambiarAbierto,
  // [Línea 17] Ejecuta o evalúa: titulo,
  titulo,
  // [Línea 18] Ejecuta o evalúa: descripcion,
  descripcion,
  // [Línea 19] Ejecuta o evalúa: textoConfirmar = "Confirmar",
  textoConfirmar = "Confirmar",
  // [Línea 20] Ejecuta o evalúa: variante = "destructive",
  variante = "destructive",
  // [Línea 21] Ejecuta o evalúa: alConfirmar,
  alConfirmar,
// [Línea 22] Ejecuta o evalúa: }: {
}: {
  // [Línea 23] Define o asigna el campo/parámetro 'abierto'.
  abierto: boolean;
  // [Línea 24] Define o asigna el campo/parámetro 'alCambiarAbierto'.
  alCambiarAbierto: (abierto: boolean) => void;
  // [Línea 25] Define o asigna el campo/parámetro 'titulo'.
  titulo: string;
  // [Línea 26] Define o asigna el campo/parámetro 'descripcion'.
  descripcion: string;
  // [Línea 27] Ejecuta o evalúa: textoConfirmar?: string;
  textoConfirmar?: string;
  // [Línea 28] Ejecuta o evalúa: variante?: "default" | "destructive";
  variante?: "default" | "destructive";
  // [Línea 29] Define o asigna el campo/parámetro 'alConfirmar'.
  alConfirmar: () => Promise<void>;
// [Línea 30] Ejecuta o evalúa: }) {
}) {
  // [Línea 31] Estado reactivo de React [ejecutando, setEjecutando]: guarda el valor actual y la función para actualizarlo.
  const [ejecutando, setEjecutando] = useState(false);

  // [Línea 33] Declara la función asíncrona 'manejarConfirmacion'.
  async function manejarConfirmacion() {
    // [Línea 34] Ejecuta o evalúa: setEjecutando(true);
    setEjecutando(true);
    // [Línea 35] Inicia bloque try para capturar errores durante la operación.
    try {
      // [Línea 36] Espera a que se complete la operación asíncrona: await alConfirmar();
      await alConfirmar();
      // [Línea 37] Ejecuta o evalúa: alCambiarAbierto(false);
      alCambiarAbierto(false);
    // [Línea 38] Bloque finally: se ejecuta siempre al terminar el try/catch.
    } finally {
      // [Línea 39] Ejecuta o evalúa: setEjecutando(false);
      setEjecutando(false);
    // [Línea 40] Cierra el bloque o estructura (}).
    }
  // [Línea 41] Cierra el bloque o estructura (}).
  }

  // [Línea 43] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}> // [Línea 44] Abre o renderiza el componente visual <Dialog>.
      <DialogContent> // [Línea 45] Abre o renderiza el componente visual <DialogContent>.
        <DialogHeader> // [Línea 46] Abre o renderiza el componente visual <DialogHeader>.
          <DialogTitle>{titulo}</DialogTitle> // [Línea 47] Abre o renderiza el componente visual <DialogTitle>.
          <DialogDescription>{descripcion}</DialogDescription> // [Línea 48] Abre o renderiza el componente visual <DialogDescription>.
        </DialogHeader> // [Línea 49] Cierra el componente visual </DialogHeader>.
        <DialogFooter> // [Línea 50] Abre o renderiza el componente visual <DialogFooter>.
          <Button variant="outline" onClick={() => alCambiarAbierto(false)} disabled={ejecutando}> // [Línea 51] Abre o renderiza el componente visual <Button>.
            // [Línea 52] Ejecuta o evalúa: Cancelar
            Cancelar
          </Button> // [Línea 53] Cierra el componente visual </Button>.
          <Button variant={variante} onClick={manejarConfirmacion} disabled={ejecutando}> // [Línea 54] Abre o renderiza el componente visual <Button>.
            // [Línea 55] Ejecuta o evalúa: {ejecutando ? "Procesando..." : textoConfirmar}
            {ejecutando ? "Procesando..." : textoConfirmar}
          </Button> // [Línea 56] Cierra el componente visual </Button>.
        </DialogFooter> // [Línea 57] Cierra el componente visual </DialogFooter>.
      </DialogContent> // [Línea 58] Cierra el componente visual </DialogContent>.
    </Dialog> // [Línea 59] Cierra el componente visual </Dialog>.
  // [Línea 60] Cierra el bloque o estructura ();).
  );
// [Línea 61] Cierra el bloque o estructura (}).
}
