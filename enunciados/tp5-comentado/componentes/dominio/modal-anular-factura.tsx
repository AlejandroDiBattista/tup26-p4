// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Modal para anular una factura emitida (RF-V9, solo administrador, motivo obligatorio).
// Al confirmar revierte el stock de todos los renglones y acredita la cuenta corriente si corresponde.
// [Línea 4] Importa elementos desde 'react'.
import { useState } from "react";
// [Línea 5] Importa elementos desde 'lucide-react'.
import { Ban } from "lucide-react";
// [Línea 6] Importa elementos desde '@/acciones/comercial'.
import { accionAnularFactura } from "@/acciones/comercial";
// [Línea 7] Importa elementos desde '@/esquemas/facturas'.
import { esquemaAnulacion } from "@/esquemas/facturas";
// [Línea 8] Importa elementos desde '@/hooks/usar-formulario'.
import { usarFormulario } from "@/hooks/usar-formulario";
// [Línea 9] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 10] Importa elementos desde '@/componentes/ui/select'.
import { Textarea } from "@/componentes/ui/select";
// [Línea 11] Inicia un bloque de importación de dependencias.
import {
  // [Línea 12] Importa 'Dialog' desde el módulo.
  Dialog,
  // [Línea 13] Importa 'DialogContent' desde el módulo.
  DialogContent,
  // [Línea 14] Importa 'DialogDescription' desde el módulo.
  DialogDescription,
  // [Línea 15] Importa 'DialogFooter' desde el módulo.
  DialogFooter,
  // [Línea 16] Importa 'DialogHeader' desde el módulo.
  DialogHeader,
  // [Línea 17] Importa 'DialogTitle' desde el módulo.
  DialogTitle,
// [Línea 18] Cierra la lista de importaciones provenientes del módulo '@/componentes/ui/dialog'.
} from "@/componentes/ui/dialog";
// [Línea 19] Importa elementos desde '@/componentes/comunes/campo-formulario'.
import { CampoFormulario } from "@/componentes/comunes/campo-formulario";

// [Línea 21] Declara la función o componente 'BotonAnularFactura'.
export function BotonAnularFactura({
  // [Línea 22] Ejecuta o evalúa: idFactura,
  idFactura,
  // [Línea 23] Ejecuta o evalúa: numeroFormateado,
  numeroFormateado,
// [Línea 24] Ejecuta o evalúa: }: {
}: {
  // [Línea 25] Define o asigna el campo/parámetro 'idFactura'.
  idFactura: number;
  // [Línea 26] Define o asigna el campo/parámetro 'numeroFormateado'.
  numeroFormateado: string;
// [Línea 27] Ejecuta o evalúa: }) {
}) {
  // [Línea 28] Estado reactivo de React [abierto, setAbierto]: guarda el valor actual y la función para actualizarlo.
  const [abierto, setAbierto] = useState(false);
  // [Línea 29] Estado reactivo de React [motivoAnulacion, setMotivoAnulacion]: guarda el valor actual y la función para actualizarlo.
  const [motivoAnulacion, setMotivoAnulacion] = useState("");

  // [Línea 31] Declara '{ errores, enviando, enviar, limpiarErrores }' y le asigna el valor resultante.
  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    // [Línea 32] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaAnulacion,
    // [Línea 33] Define o asigna el campo/parámetro 'accion'.
    accion: (datos) => accionAnularFactura(idFactura, datos),
    // [Línea 34] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: `Factura ${numeroFormateado} anulada correctamente`,
    // [Línea 35] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: () => setAbierto(false),
  // [Línea 36] Cierra el bloque o estructura (});).
  });

  // [Línea 38] Declara la función o componente 'abrir'.
  function abrir() {
    // [Línea 39] Ejecuta o evalúa: limpiarErrores();
    limpiarErrores();
    // [Línea 40] Ejecuta o evalúa: setMotivoAnulacion("");
    setMotivoAnulacion("");
    // [Línea 41] Ejecuta o evalúa: setAbierto(true);
    setAbierto(true);
  // [Línea 42] Cierra el bloque o estructura (}).
  }

  // [Línea 44] Declara la función o componente 'manejarSubmit'.
  function manejarSubmit(e: React.FormEvent) {
    // [Línea 45] Ejecuta o evalúa: e.preventDefault();
    e.preventDefault();
    // [Línea 46] Ejecuta o evalúa: enviar({ motivo: motivoAnulacion });
    enviar({ motivo: motivoAnulacion });
  // [Línea 47] Cierra el bloque o estructura (}).
  }

  // [Línea 49] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <> // [Línea 50] Abre o renderiza el componente visual <elemento>.
      <Button variant="destructive" onClick={abrir} className="no-imprimir"> // [Línea 51] Abre o renderiza el componente visual <Button>.
        <Ban className="size-4" /> // [Línea 52] Abre o renderiza el componente visual <Ban>.
        // [Línea 53] Ejecuta o evalúa: Anular factura
        Anular factura
      </Button> // [Línea 54] Cierra el componente visual </Button>.

      <Dialog open={abierto} onOpenChange={setAbierto}> // [Línea 56] Abre o renderiza el componente visual <Dialog>.
        <DialogContent> // [Línea 57] Abre o renderiza el componente visual <DialogContent>.
          <DialogHeader> // [Línea 58] Abre o renderiza el componente visual <DialogHeader>.
            <DialogTitle>Anular factura {numeroFormateado}</DialogTitle> // [Línea 59] Abre o renderiza el componente visual <DialogTitle>.
            <DialogDescription> // [Línea 60] Abre o renderiza el componente visual <DialogDescription>.
              // [Línea 61] Ejecuta o evalúa: Esta acción es irreversible: reingresará las unidades al stock y, si fue en cuen
              Esta acción es irreversible: reingresará las unidades al stock y, si fue en cuenta
              // [Línea 62] Ejecuta o evalúa: corriente, acreditará el importe en el saldo del cliente. La factura quedará vis
              corriente, acreditará el importe en el saldo del cliente. La factura quedará visible
              // [Línea 63] Ejecuta o evalúa: con estado Anulada.
              con estado Anulada.
            </DialogDescription> // [Línea 64] Cierra el componente visual </DialogDescription>.
          </DialogHeader> // [Línea 65] Cierra el componente visual </DialogHeader>.

          <form onSubmit={manejarSubmit} className="flex flex-col gap-4"> // [Línea 67] Abre o renderiza el componente visual <form>.
            <CampoFormulario etiqueta="Motivo de anulación (obligatorio)" error={errores.motivo}> // [Línea 68] Abre o renderiza el componente visual <CampoFormulario>.
              <Textarea // [Línea 69] Abre o renderiza el componente visual <Textarea>.
                // [Línea 70] Ejecuta o evalúa: value={motivoAnulacion}
                value={motivoAnulacion}
                // [Línea 71] Ejecuta o evalúa: onChange={(e) => setMotivoAnulacion(e.target.value)}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                // [Línea 72] Ejecuta o evalúa: placeholder="Ej. Error en la carga de cantidades / Devolución en mostrador"
                placeholder="Ej. Error en la carga de cantidades / Devolución en mostrador"
                // [Línea 73] Ejecuta o evalúa: autoFocus
                autoFocus
              // [Línea 74] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 75] Cierra el componente visual </CampoFormulario>.

            <DialogFooter> // [Línea 77] Abre o renderiza el componente visual <DialogFooter>.
              <Button variant="outline" onClick={() => setAbierto(false)}> // [Línea 78] Abre o renderiza el componente visual <Button>.
                // [Línea 79] Ejecuta o evalúa: Cancelar
                Cancelar
              </Button> // [Línea 80] Cierra el componente visual </Button>.
              <Button type="submit" variant="destructive" disabled={enviando}> // [Línea 81] Abre o renderiza el componente visual <Button>.
                // [Línea 82] Ejecuta o evalúa: {enviando ? "Anulando..." : "Confirmar anulación"}
                {enviando ? "Anulando..." : "Confirmar anulación"}
              </Button> // [Línea 83] Cierra el componente visual </Button>.
            </DialogFooter> // [Línea 84] Cierra el componente visual </DialogFooter>.
          </form> // [Línea 85] Cierra el componente visual </form>.
        </DialogContent> // [Línea 86] Cierra el componente visual </DialogContent>.
      </Dialog> // [Línea 87] Cierra el componente visual </Dialog>.
    </> // [Línea 88] Cierra el componente visual </elemento>.
  // [Línea 89] Cierra el bloque o estructura ();).
  );
// [Línea 90] Cierra el bloque o estructura (}).
}
