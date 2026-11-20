"use client";
// Modales de alta, edición y activación/desactivación de categorías (RF-P7).
import { useState } from "react";
import { Plus, Pencil, Power } from "lucide-react";
import { toast } from "sonner";
import { accionCrearCategoria, accionEditarCategoria } from "@/acciones/comercial";
import { esquemaCategoriaNueva } from "@/esquemas/productos";
import { usarFormulario } from "@/hooks/usar-formulario";
import { Button } from "@/componentes/ui/button";
import { Input } from "@/componentes/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";
import { CampoFormulario } from "@/componentes/comunes/campo-formulario";
import { ModalConfirmacion } from "@/componentes/comunes/confirmar-accion";
import { Alinear } from "@/componentes/primitivas/maquetacion";

export function BotonNuevaCategoria() {
  const [abierto, setAbierto] = useState(false);
  const [nombreCategoria, setNombreCategoria] = useState("");

  const { errores, enviando, enviar, limpiarErrores } = usarFormulario({
    esquema: esquemaCategoriaNueva,
    accion: (datos) => accionCrearCategoria(datos),
    mensajeExito: "Categoría creada con éxito",
    alTerminar: () => {
      setNombreCategoria("");
      setAbierto(false);
    },
  });

  function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviar({ nombre: nombreCategoria });
  }

  return (
    <>
      <Button
        onClick={() => {
          limpiarErrores();
          setNombreCategoria("");
          setAbierto(true);
        }}
      >
        <Plus className="size-4" />
        Nueva categoría
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva categoría</DialogTitle>
            <DialogDescription>
              Ingresá el nombre único para agrupar productos del catálogo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={manejarSubmit} className="flex flex-col gap-4">
            <CampoFormulario etiqueta="Nombre de la categoría" error={errores.nombre}>
              <Input
                value={nombreCategoria}
                onChange={(e) => setNombreCategoria(e.target.value)}
                placeholder="Ej. Iluminación"
                autoFocus
              />
            </CampoFormulario>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Guardando..." : "Guardar categoría"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AccionesFilaCategoria({
  categoria,
}: {
  categoria: { id: number; nombre: string; activa: boolean; cantidadProductos: number };
}) {
  const [modalEditar, setModalEditar] = useState(false);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [nombreCategoria, setNombreCategoria] = useState(categoria.nombre);

  const { errores, enviando, enviar } = usarFormulario({
    esquema: esquemaCategoriaNueva,
    accion: (datos) => accionEditarCategoria(categoria.id, datos),
    mensajeExito: "Categoría actualizada",
    alTerminar: () => setModalEditar(false),
  });

  async function cambiarEstadoActiva() {
    const res = await accionEditarCategoria(categoria.id, { activa: !categoria.activa });
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    toast.success(categoria.activa ? "Categoría desactivada" : "Categoría reactivada");
  }

  return (
    <Alinear className="justify-end gap-1.5">
      <Button
        variant="outline"
        size="xs"
        onClick={() => {
          setNombreCategoria(categoria.nombre);
          setModalEditar(true);
        }}
      >
        <Pencil className="size-3.5" />
        Editar
      </Button>
      <Button
        variant={categoria.activa ? "ghost" : "secondary"}
        size="xs"
        onClick={() => setModalConfirmar(true)}
      >
        <Power className="size-3.5" />
        {categoria.activa ? "Desactivar" : "Activar"}
      </Button>

      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar categoría</DialogTitle>
            <DialogDescription>Modificá el nombre de la categoría.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar({ nombre: nombreCategoria });
            }}
            className="flex flex-col gap-4"
          >
            <CampoFormulario etiqueta="Nombre" error={errores.nombre}>
              <Input
                value={nombreCategoria}
                onChange={(e) => setNombreCategoria(e.target.value)}
                autoFocus
              />
            </CampoFormulario>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalEditar(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ModalConfirmacion
        abierto={modalConfirmar}
        alCambiarAbierto={setModalConfirmar}
        titulo={categoria.activa ? "Desactivar categoría" : "Reactivar categoría"}
        descripcion={
          categoria.activa
            ? `¿Seguro que querés desactivar la categoría "${categoria.nombre}"? Solo se permite si no tiene productos activos.`
            : `¿Querés volver a activar la categoría "${categoria.nombre}"?`
        }
        textoConfirmar={categoria.activa ? "Desactivar" : "Activar"}
        variante={categoria.activa ? "destructive" : "default"}
        alConfirmar={cambiarEstadoActiva}
      />
    </Alinear>
  );
}
