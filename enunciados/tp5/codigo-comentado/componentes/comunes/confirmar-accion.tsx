// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/comunes/confirmar-accion.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Directiva 'use client': indica que este componente tiene interactividad en el navegador
"use client";
// Diálogo reutilizable para confirmar acciones irreversibles: dar de baja, desactivar (secciones 8 y 10.6).
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";

// Componente o función exportada 'ModalConfirmacion'
export function ModalConfirmacion({
  abierto,
  alCambiarAbierto,
  titulo,
  descripcion,
  textoConfirmar = "Confirmar",
  variante = "destructive",
  alConfirmar,
}: {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  titulo: string;
  descripcion: string;
  textoConfirmar?: string;
  variante?: "default" | "destructive";
  alConfirmar: () => Promise<void>;
}) {
  // Definimos una variable de estado React 'ejecutando' para controlar la interfaz
  const [ejecutando, setEjecutando] = useState(false);

  async function manejarConfirmacion() {
    setEjecutando(true);
    // Usamos un bloque try/catch para capturar cualquier error y evitar que la aplicación falle
    try {
      await alConfirmar();
      alCambiarAbierto(false);
    } finally {
      setEjecutando(false);
    }
  }

  // Renderizamos la interfaz visual de este componente:
  return (
    <Dialog open={abierto} onOpenChange={alCambiarAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => alCambiarAbierto(false)} disabled={ejecutando}>
            Cancelar
          </Button>
          <Button variant={variante} onClick={manejarConfirmacion} disabled={ejecutando}>
            {ejecutando ? "Procesando..." : textoConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
