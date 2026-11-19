// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Modales de alta, edición y activación/desactivación de categorías (RF-P7).
// [Línea 3] Importa elementos desde 'react'.
import { useState } from "react";
// [Línea 4] Importa elementos desde 'lucide-react'.
import { Plus, Pencil, Power } from "lucide-react";
// [Línea 5] Importa elementos desde 'sonner'.
import { toast } from "sonner";
// [Línea 6] Importa elementos desde '@/acciones/comercial'.
import { accionCrearCategoria, accionEditarCategoria } from "@/acciones/comercial";
// [Línea 7] Importa elementos desde '@/esquemas/productos'.
import { esquemaCategoriaNueva } from "@/esquemas/productos";
// [Línea 8] Importa elementos desde '@/hooks/usar-formulario'.
import { usarFormulario } from "@/hooks/usar-formulario";
// [Línea 9] Importa elementos desde '@/componentes/ui/button'.
import { Button } from "@/componentes/ui/button";
// [Línea 10] Importa elementos desde '@/componentes/ui/input'.
import { Input } from "@/componentes/ui/input";
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
// [Línea 20] Importa elementos desde '@/componentes/comunes/confirmar-accion'.
import { ModalConfirmacion } from "@/componentes/comunes/confirmar-accion";
// [Línea 21] Importa elementos desde '@/componentes/primitivas/maquetacion'.
import { Alinear } from "@/componentes/primitivas/maquetacion";

// [Línea 23] Declara la función o componente 'BotonNuevaCategoria'.
export function BotonNuevaCategoria() {
  // [Línea 24] Estado reactivo de React [abierto, setAbierto]: guarda el valor actual y la función para actualizarlo.
  const [abierto, setAbierto] = useState(false);
  // [Línea 25] Estado reactivo de React [nombreCategoria, setNombreCategoria]: guarda el valor actual y la función para actualizarlo.
  const [nombreCategoria, setNombreCategoria] = useState("");

  // [Línea 27] Declara '{ errores, enviando, enviar, limpiarErrores }' y le asigna el valor resultante.
  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    // [Línea 28] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaCategoriaNueva,
    // [Línea 29] Define o asigna el campo/parámetro 'accion'.
    accion: (datos) => accionCrearCategoria(datos),
    // [Línea 30] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: "Categoría creada con éxito",
    // [Línea 31] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: () => {
      // [Línea 32] Ejecuta o evalúa: setNombreCategoria("");
      setNombreCategoria("");
      // [Línea 33] Ejecuta o evalúa: setAbierto(false);
      setAbierto(false);
    // [Línea 34] Cierra el bloque o estructura (},).
    },
  // [Línea 35] Cierra el bloque o estructura (});).
  });

  // [Línea 37] Declara la función o componente 'manejarSubmit'.
  function manejarSubmit(e: React.FormEvent) {
    // [Línea 38] Ejecuta o evalúa: e.preventDefault();
    e.preventDefault();
    // [Línea 39] Ejecuta o evalúa: enviar({ nombre: nombreCategoria });
    enviar({ nombre: nombreCategoria });
  // [Línea 40] Cierra el bloque o estructura (}).
  }

  // [Línea 42] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <> // [Línea 43] Abre o renderiza el componente visual <elemento>.
      <Button // [Línea 44] Abre o renderiza el componente visual <Button>.
        // [Línea 45] Ejecuta o evalúa: onClick={() => {
        onClick={() => {
          // [Línea 46] Ejecuta o evalúa: limpiarErrores();
          limpiarErrores();
          // [Línea 47] Ejecuta o evalúa: setNombreCategoria("");
          setNombreCategoria("");
          // [Línea 48] Ejecuta o evalúa: setAbierto(true);
          setAbierto(true);
        // [Línea 49] Ejecuta o evalúa: }}
        }}
      // [Línea 50] Ejecuta o evalúa: >
      >
        <Plus className="size-4" /> // [Línea 51] Abre o renderiza el componente visual <Plus>.
        // [Línea 52] Ejecuta o evalúa: Nueva categoría
        Nueva categoría
      </Button> // [Línea 53] Cierra el componente visual </Button>.

      <Dialog open={abierto} onOpenChange={setAbierto}> // [Línea 55] Abre o renderiza el componente visual <Dialog>.
        <DialogContent> // [Línea 56] Abre o renderiza el componente visual <DialogContent>.
          <DialogHeader> // [Línea 57] Abre o renderiza el componente visual <DialogHeader>.
            <DialogTitle>Nueva categoría</DialogTitle> // [Línea 58] Abre o renderiza el componente visual <DialogTitle>.
            <DialogDescription> // [Línea 59] Abre o renderiza el componente visual <DialogDescription>.
              // [Línea 60] Ejecuta o evalúa: Ingresá el nombre único para agrupar productos del catálogo.
              Ingresá el nombre único para agrupar productos del catálogo.
            </DialogDescription> // [Línea 61] Cierra el componente visual </DialogDescription>.
          </DialogHeader> // [Línea 62] Cierra el componente visual </DialogHeader>.
          <form onSubmit={manejarSubmit} className="flex flex-col gap-4"> // [Línea 63] Abre o renderiza el componente visual <form>.
            <CampoFormulario etiqueta="Nombre de la categoría" error={errores.nombre}> // [Línea 64] Abre o renderiza el componente visual <CampoFormulario>.
              <Input // [Línea 65] Abre o renderiza el componente visual <Input>.
                // [Línea 66] Ejecuta o evalúa: value={nombreCategoria}
                value={nombreCategoria}
                // [Línea 67] Ejecuta o evalúa: onChange={(e) => setNombreCategoria(e.target.value)}
                onChange={(e) => setNombreCategoria(e.target.value)}
                // [Línea 68] Ejecuta o evalúa: placeholder="Ej. Iluminación"
                placeholder="Ej. Iluminación"
                // [Línea 69] Ejecuta o evalúa: autoFocus
                autoFocus
              // [Línea 70] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 71] Cierra el componente visual </CampoFormulario>.
            <DialogFooter> // [Línea 72] Abre o renderiza el componente visual <DialogFooter>.
              <Button variant="outline" onClick={() => setAbierto(false)}> // [Línea 73] Abre o renderiza el componente visual <Button>.
                // [Línea 74] Ejecuta o evalúa: Cancelar
                Cancelar
              </Button> // [Línea 75] Cierra el componente visual </Button>.
              <Button type="submit" disabled={enviando}> // [Línea 76] Abre o renderiza el componente visual <Button>.
                // [Línea 77] Ejecuta o evalúa: {enviando ? "Guardando..." : "Guardar categoría"}
                {enviando ? "Guardando..." : "Guardar categoría"}
              </Button> // [Línea 78] Cierra el componente visual </Button>.
            </DialogFooter> // [Línea 79] Cierra el componente visual </DialogFooter>.
          </form> // [Línea 80] Cierra el componente visual </form>.
        </DialogContent> // [Línea 81] Cierra el componente visual </DialogContent>.
      </Dialog> // [Línea 82] Cierra el componente visual </Dialog>.
    </> // [Línea 83] Cierra el componente visual </elemento>.
  // [Línea 84] Cierra el bloque o estructura ();).
  );
// [Línea 85] Cierra el bloque o estructura (}).
}

// [Línea 87] Declara la función o componente 'AccionesFilaCategoria'.
export function AccionesFilaCategoria({
  // [Línea 88] Ejecuta o evalúa: categoria,
  categoria,
// [Línea 89] Ejecuta o evalúa: }: {
}: {
  // [Línea 90] Define o asigna el campo/parámetro 'categoria'.
  categoria: { id: number; nombre: string; activa: boolean; cantidadProductos: number };
// [Línea 91] Ejecuta o evalúa: }) {
}) {
  // [Línea 92] Estado reactivo de React [modalEditar, setModalEditar]: guarda el valor actual y la función para actualizarlo.
  const [modalEditar, setModalEditar] = useState(false);
  // [Línea 93] Estado reactivo de React [modalConfirmar, setModalConfirmar]: guarda el valor actual y la función para actualizarlo.
  const [modalConfirmar, setModalConfirmar] = useState(false);
  // [Línea 94] Estado reactivo de React [nombreCategoria, setNombreCategoria]: guarda el valor actual y la función para actualizarlo.
  const [nombreCategoria, setNombreCategoria] = useState(categoria.nombre);

  // [Línea 96] Declara '{ errores, enviando, enviar }' y le asigna el valor resultante.
  const { errores, enviando, enviar } = usarFormulario({
    // [Línea 97] Define o asigna el campo/parámetro 'esquema'.
    esquema: esquemaCategoriaNueva,
    // [Línea 98] Define o asigna el campo/parámetro 'accion'.
    accion: (datos) => accionEditarCategoria(categoria.id, datos),
    // [Línea 99] Define o asigna el campo/parámetro 'mensajeExito'.
    mensajeExito: "Categoría actualizada",
    // [Línea 100] Define o asigna el campo/parámetro 'alTerminar'.
    alTerminar: () => setModalEditar(false),
  // [Línea 101] Cierra el bloque o estructura (});).
  });

  // [Línea 103] Declara la función asíncrona 'cambiarEstadoActiva'.
  async function cambiarEstadoActiva() {
    // [Línea 104] Espera el resultado de la consulta/operación asíncrona y lo asigna a 'res'.
    const res = await accionEditarCategoria(categoria.id, { activa: !categoria.activa });
    // [Línea 105] Verifica la condición: if (!res.ok) {
    if (!res.ok) {
      // [Línea 106] Muestra un aviso emergente en pantalla: toast.error(res.error.message);
      toast.error(res.error.message);
      // [Línea 107] Ejecuta o evalúa: return;
      return;
    // [Línea 108] Cierra el bloque o estructura (}).
    }
    // [Línea 109] Muestra un aviso emergente en pantalla: toast.success(categoria.activa ? "Categoría desactivada" : "Categoría reactivada");
    toast.success(categoria.activa ? "Categoría desactivada" : "Categoría reactivada");
  // [Línea 110] Cierra el bloque o estructura (}).
  }

  // [Línea 112] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <Alinear className="justify-end gap-1.5"> // [Línea 113] Abre o renderiza el componente visual <Alinear>.
      <Button // [Línea 114] Abre o renderiza el componente visual <Button>.
        // [Línea 115] Ejecuta o evalúa: variant="outline"
        variant="outline"
        // [Línea 116] Ejecuta o evalúa: size="xs"
        size="xs"
        // [Línea 117] Ejecuta o evalúa: onClick={() => {
        onClick={() => {
          // [Línea 118] Ejecuta o evalúa: setNombreCategoria(categoria.nombre);
          setNombreCategoria(categoria.nombre);
          // [Línea 119] Ejecuta o evalúa: setModalEditar(true);
          setModalEditar(true);
        // [Línea 120] Ejecuta o evalúa: }}
        }}
      // [Línea 121] Ejecuta o evalúa: >
      >
        <Pencil className="size-3.5" /> // [Línea 122] Abre o renderiza el componente visual <Pencil>.
        // [Línea 123] Ejecuta o evalúa: Editar
        Editar
      </Button> // [Línea 124] Cierra el componente visual </Button>.
      <Button // [Línea 125] Abre o renderiza el componente visual <Button>.
        // [Línea 126] Ejecuta o evalúa: variant={categoria.activa ? "ghost" : "secondary"}
        variant={categoria.activa ? "ghost" : "secondary"}
        // [Línea 127] Ejecuta o evalúa: size="xs"
        size="xs"
        // [Línea 128] Ejecuta o evalúa: onClick={() => setModalConfirmar(true)}
        onClick={() => setModalConfirmar(true)}
      // [Línea 129] Ejecuta o evalúa: >
      >
        <Power className="size-3.5" /> // [Línea 130] Abre o renderiza el componente visual <Power>.
        // [Línea 131] Ejecuta o evalúa: {categoria.activa ? "Desactivar" : "Activar"}
        {categoria.activa ? "Desactivar" : "Activar"}
      </Button> // [Línea 132] Cierra el componente visual </Button>.

      <Dialog open={modalEditar} onOpenChange={setModalEditar}> // [Línea 134] Abre o renderiza el componente visual <Dialog>.
        <DialogContent> // [Línea 135] Abre o renderiza el componente visual <DialogContent>.
          <DialogHeader> // [Línea 136] Abre o renderiza el componente visual <DialogHeader>.
            <DialogTitle>Editar categoría</DialogTitle> // [Línea 137] Abre o renderiza el componente visual <DialogTitle>.
            <DialogDescription>Modificá el nombre de la categoría.</DialogDescription> // [Línea 138] Abre o renderiza el componente visual <DialogDescription>.
          </DialogHeader> // [Línea 139] Cierra el componente visual </DialogHeader>.
          <form // [Línea 140] Abre o renderiza el componente visual <form>.
            // [Línea 141] Ejecuta o evalúa: onSubmit={(e) => {
            onSubmit={(e) => {
              // [Línea 142] Ejecuta o evalúa: e.preventDefault();
              e.preventDefault();
              // [Línea 143] Ejecuta o evalúa: enviar({ nombre: nombreCategoria });
              enviar({ nombre: nombreCategoria });
            // [Línea 144] Ejecuta o evalúa: }}
            }}
            // [Línea 145] Ejecuta o evalúa: className="flex flex-col gap-4"
            className="flex flex-col gap-4"
          // [Línea 146] Ejecuta o evalúa: >
          >
            <CampoFormulario etiqueta="Nombre" error={errores.nombre}> // [Línea 147] Abre o renderiza el componente visual <CampoFormulario>.
              <Input // [Línea 148] Abre o renderiza el componente visual <Input>.
                // [Línea 149] Ejecuta o evalúa: value={nombreCategoria}
                value={nombreCategoria}
                // [Línea 150] Ejecuta o evalúa: onChange={(e) => setNombreCategoria(e.target.value)}
                onChange={(e) => setNombreCategoria(e.target.value)}
                // [Línea 151] Ejecuta o evalúa: autoFocus
                autoFocus
              // [Línea 152] Ejecuta o evalúa: />
              />
            </CampoFormulario> // [Línea 153] Cierra el componente visual </CampoFormulario>.
            <DialogFooter> // [Línea 154] Abre o renderiza el componente visual <DialogFooter>.
              <Button variant="outline" onClick={() => setModalEditar(false)}> // [Línea 155] Abre o renderiza el componente visual <Button>.
                // [Línea 156] Ejecuta o evalúa: Cancelar
                Cancelar
              </Button> // [Línea 157] Cierra el componente visual </Button>.
              <Button type="submit" disabled={enviando}> // [Línea 158] Abre o renderiza el componente visual <Button>.
                // [Línea 159] Ejecuta o evalúa: {enviando ? "Guardando..." : "Guardar cambios"}
                {enviando ? "Guardando..." : "Guardar cambios"}
              </Button> // [Línea 160] Cierra el componente visual </Button>.
            </DialogFooter> // [Línea 161] Cierra el componente visual </DialogFooter>.
          </form> // [Línea 162] Cierra el componente visual </form>.
        </DialogContent> // [Línea 163] Cierra el componente visual </DialogContent>.
      </Dialog> // [Línea 164] Cierra el componente visual </Dialog>.

      <ModalConfirmacion // [Línea 166] Abre o renderiza el componente visual <ModalConfirmacion>.
        // [Línea 167] Ejecuta o evalúa: abierto={modalConfirmar}
        abierto={modalConfirmar}
        // [Línea 168] Ejecuta o evalúa: alCambiarAbierto={setModalConfirmar}
        alCambiarAbierto={setModalConfirmar}
        // [Línea 169] Ejecuta o evalúa: titulo={categoria.activa ? "Desactivar categoría" : "Reactivar categoría"}
        titulo={categoria.activa ? "Desactivar categoría" : "Reactivar categoría"}
        // [Línea 170] Ejecuta o evalúa: descripcion={
        descripcion={
          // [Línea 171] Ejecuta o evalúa: categoria.activa
          categoria.activa
            // [Línea 172] Ejecuta o evalúa: ? `¿Seguro que querés desactivar la categoría "${categoria.nombre}"? Solo se per
            ? `¿Seguro que querés desactivar la categoría "${categoria.nombre}"? Solo se permite si no tiene productos activos.`
            // [Línea 173] Ejecuta o evalúa: : `¿Querés volver a activar la categoría "${categoria.nombre}"?`
            : `¿Querés volver a activar la categoría "${categoria.nombre}"?`
        // [Línea 174] Cierra el bloque o estructura (}).
        }
        // [Línea 175] Ejecuta o evalúa: textoConfirmar={categoria.activa ? "Desactivar" : "Activar"}
        textoConfirmar={categoria.activa ? "Desactivar" : "Activar"}
        // [Línea 176] Ejecuta o evalúa: variante={categoria.activa ? "destructive" : "default"}
        variante={categoria.activa ? "destructive" : "default"}
        // [Línea 177] Ejecuta o evalúa: alConfirmar={cambiarEstadoActiva}
        alConfirmar={cambiarEstadoActiva}
      // [Línea 178] Ejecuta o evalúa: />
      />
    </Alinear> // [Línea 179] Cierra el componente visual </Alinear>.
  // [Línea 180] Cierra el bloque o estructura ();).
  );
// [Línea 181] Cierra el bloque o estructura (}).
}
