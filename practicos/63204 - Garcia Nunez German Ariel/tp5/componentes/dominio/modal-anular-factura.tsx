"use client";
// Modal para anular una factura emitida (RF-V9, solo administrador, motivo obligatorio).
// Al confirmar revierte el stock de todos los renglones y acredita la cuenta corriente si corresponde.
import { useState } from "react";
import { Ban } from "lucide-react";
import { accionAnularFactura } from "@/acciones/comercial";
import { esquemaAnulacion } from "@/esquemas/facturas";
import { usarFormulario } from "@/hooks/usar-formulario";
import { Button } from "@/componentes/ui/button";
import { Textarea } from "@/componentes/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";
import { CampoFormulario } from "@/componentes/comunes/campo-formulario";

export function BotonAnularFactura({
  idFactura,
  numeroFormateado,
}: {
  idFactura: number;
  numeroFormateado: string;
}) {
  const [abierto, setAbierto] = useState(false);
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
