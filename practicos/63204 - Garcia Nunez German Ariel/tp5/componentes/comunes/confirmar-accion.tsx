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
import { Button } from "@/componentes/ui/button";

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
  const [ejecutando, setEjecutando] = useState(false);

  async function manejarConfirmacion() {
    setEjecutando(true);
    try {
      await alConfirmar();
      alCambiarAbierto(false);
    } finally {
      setEjecutando(false);
    }
  }

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
