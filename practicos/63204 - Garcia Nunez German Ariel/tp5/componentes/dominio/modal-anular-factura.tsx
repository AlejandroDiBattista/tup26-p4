/* ==========================================================================
   MODAL PARA ANULAR UNA FACTURA EMITIDA
   Este componente cumple con el requerimiento RF-V9:
   - Solo los administradores pueden anular comprobantes emitidos.
   - Requiere ingresar un motivo de anulación obligatorio (mínimo 5 caracteres).
   - Al confirmar, ejecuta una transacción atómica que revierte el stock de los productos vendidos
     y acredita el saldo en la cuenta corriente del cliente si corresponde.
   ========================================================================== */

/* "use client" le indica a Next.js que este es un Componente de Cliente (Client Component).
   Es necesario porque maneja interactividad del navegador: estado local (useState), eventos de clic, 
   apertura/cierre de la ventana modal y envío de formularios */
"use client";

/* los import son declaraciones que traen recursos externos necesarios para el componente:
   - useState de React para controlar si el diálogo está abierto y el texto ingresado
   - el icono Ban de lucide-react para representar la acción de cancelar/prohibir
   - accionAnularFactura es una Server Action de Next.js que ejecuta la lógica en el servidor de forma segura
   - esquemaAnulacion es el validador de Zod que exige el motivo obligatorio
   - usarFormulario es un hook personalizado que gestiona el estado del formulario, validaciones y errores
   - componentes de interfaz visual (Button, Textarea, Dialog, CampoFormulario) */
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

/* exportamos el componente BotonAnularFactura que recibe dos propiedades:
   - idFactura: el identificador numérico único de la factura en la base de datos
   - numeroFormateado: el número legal de la factura (ej: '0001-00000123') para mostrarlo en títulos y mensajes */
export function BotonAnularFactura({
  idFactura,
  numeroFormateado,
}: {
  idFactura: number;
  numeroFormateado: string;
}) {
  /* variable de estado booleana para controlar la visibilidad del modal (true = visible, false = cerrado) */
  const [abierto, setAbierto] = useState(false);

  /* variable de estado de tipo string donde guardamos lo que el administrador escribe en el campo de texto del motivo */
  const [motivoAnulacion, setMotivoAnulacion] = useState("");

  /* hook usarFormulario: encapsula toda la complejidad de validación y envío de formularios.
     - esquema: le pasamos el esquema Zod para validar antes de enviar que el motivo no esté vacío
     - accion: la Server Action que se ejecuta en el servidor pasándole el id y los datos
     - mensajeExito: cartel que salta automáticamente mediante un toast si todo sale bien
     - alTerminar: función de retorno que se ejecuta al terminar con éxito para cerrar la ventana modal */
  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    esquema: esquemaAnulacion,
    accion: (datos) => accionAnularFactura(idFactura, datos),
    mensajeExito: `Factura ${numeroFormateado} anulada correctamente`,
    alTerminar: () => setAbierto(false),
  });

  /* función que se ejecuta al presionar el botón rojo de anular.
     limpia errores anteriores que hayan quedado, vacía el campo del motivo y abre la ventana modal */
  function abrir() {
    limpiarErrores();
    setMotivoAnulacion("");
    setAbierto(true);
  }

  /* función que captura el evento de envío del formulario.
     - e.preventDefault(): evita que el navegador recargue la página completa
     - enviar: ejecuta la validación con Zod y llama a la Server Action en el backend */
  function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviar({ motivo: motivoAnulacion });
  }

  return (
    <>
      {/* botón rojo que ve el administrador para iniciar la anulación.
          la clase "no-imprimir" asegura que si alguien imprime la pantalla o guarda como PDF, este botón no aparezca */}
      <Button variant="destructive" onClick={abrir} className="no-imprimir">
        <Ban className="size-4" />
        Anular factura
      </Button>

      {/* componente Dialog que contiene la ventana emergente flotante (modal) */}
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          {/* cabecera del diálogo con título informativo y advertencia clara */}
          <DialogHeader>
            <DialogTitle>Anular factura {numeroFormateado}</DialogTitle>
            <DialogDescription>
              Esta acción es irreversible: reingresará las unidades al stock y, si fue en cuenta
              corriente, acreditará el importe en el saldo del cliente. La factura quedará visible
              con estado Anulada.
            </DialogDescription>
          </DialogHeader>

          {/* formulario de captura del motivo con evento onSubmit ligado a manejarSubmit */}
          <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
            {/* campo visual que envuelve el textarea y muestra automáticamente el mensaje de error de Zod si falló */}
            <CampoFormulario etiqueta="Motivo de anulación (obligatorio)" error={errores.motivo}>
              <Textarea
                value={motivoAnulacion}
                onChange={(e) => setMotivoAnulacion(e.target.value)}
                placeholder="Ej. Error en la carga de cantidades / Devolución en mostrador"
                autoFocus
              />
            </CampoFormulario>

            {/* pie del diálogo con los botones de acción */}
            <DialogFooter>
              {/* botón secundario para cerrar el modal sin hacer cambios */}
              <Button variant="outline" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
              {/* botón de confirmación destructivo; se deshabilita mientras la solicitud se está procesando (enviando === true) */}
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
