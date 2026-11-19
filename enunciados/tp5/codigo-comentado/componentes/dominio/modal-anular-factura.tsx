// ============================================================================
// GUÍA DE ESTUDIO - SEGUNDO PARCIAL: PROGRAMACIÓN IV
// Archivo: componentes/dominio/modal-anular-factura.tsx
// Código comentado con explicaciones sencillas y claras para la defensa oral.
// ============================================================================

// Directiva 'use client': indica que este componente tiene interactividad en el navegador
"use client";
// Modal para anular una factura emitida (RF-V9, solo administrador, motivo obligatorio).
// Al confirmar revierte el stock de todos los renglones y acredita la cuenta corriente si corresponde.
import { useState } from "react";
import { Ban } from "lucide-react";
import { accionAnularFactura } from "@/acciones/comercial";
// Acá importamos esquemas de validación
import { esquemaAnulacion } from "@/esquemas/facturas";
import { usarFormulario } from "@/hooks/usar-formulario";
// Acá importamos componentes visuales de la interfaz de usuario
import { Button } from "@/componentes/ui/button";
// Acá importamos componentes visuales de la interfaz de usuario
import { Textarea } from "@/componentes/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";
// Acá importamos componentes visuales de la interfaz de usuario
import { CampoFormulario } from "@/componentes/comunes/campo-formulario";

// Componente o función exportada 'BotonAnularFactura'
export function BotonAnularFactura({
  idFactura,
  numeroFormateado,
}: {
  idFactura: number;
  numeroFormateado: string;
}) {
  // Definimos una variable de estado React 'abierto' para controlar la interfaz
  const [abierto, setAbierto] = useState(false);
  // Definimos una variable de estado React 'motivoAnulacion' para controlar la interfaz
  const [motivoAnulacion, setMotivoAnulacion] = useState("");

  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    esquema: esquemaAnulacion,
    accion: (datos) => accionAnularFactura(idFactura, datos),
    mensajeExito: `Factura ${numeroFormateado} anulada correctamente`,
    alTerminar: () => setAbierto(false),
  });

  function abrir() {
    limpiarErrores();
    setMotivoAnulacion("");
    setAbierto(true);
  }

  function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviar({ motivo: motivoAnulacion });
  }

  // Renderizamos la interfaz visual de este componente:
  return (
    <>
      <Button variant="destructive" onClick={abrir} className="no-imprimir">
        <Ban className="size-4" />
        Anular factura
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anular factura {numeroFormateado}</DialogTitle>
            <DialogDescription>
              Esta acción es irreversible: reingresará las unidades al stock y, si fue en cuenta
              corriente, acreditará el importe en el saldo del cliente. La factura quedará visible
              con estado Anulada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
            <CampoFormulario etiqueta="Motivo de anulación (obligatorio)" error={errores.motivo}>
              <Textarea
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                placeholder="Ej. Error en la carga de cantidades / Devolución en mostrador"
                autoFocus
              />
            </CampoFormulario>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={enviando}>
                {enviando ? "Anulando..." : "Confirmar anulación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
