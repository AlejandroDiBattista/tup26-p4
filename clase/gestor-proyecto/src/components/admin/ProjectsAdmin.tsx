import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Field, FieldLabel, FieldDescription } from '../ui/field'
import { DialogFooter } from '../ui/dialog'
import { useState } from 'react'
import { Pencil, Trash2, Plus, SearchX, FolderKanban } from 'lucide-react'
import type { FormEvent } from 'react'
import type { Estado, Proyecto, Tarea } from '../../data/types'
import { colorEstado } from '../../data/estados'
import { useAdminAction } from '../../hooks/useAdminAction'
import { useBusqueda } from '../../hooks/useBusqueda'
import { usePageCommand } from '../../hooks/usePageCommand'
import { AdminSearch } from './AdminSearch'
import { AdminEmpty } from './AdminEmpty'
import { ConfirmDialog } from './ConfirmDialog'
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Item, ItemContent, ItemActions, ItemGroup, ItemDescription } from '../ui/item'
import { AdminDialog, ErrorMessage } from './AdminDialog'

type ProjectData = Omit<Proyecto, 'id'>
type Props = {
  estados: Estado[]
  proyectos: Proyecto[]
  tareas: Tarea[]
  onCreate: (data: ProjectData) => Promise<unknown>
  onUpdate: (id: string, data: Partial<ProjectData>) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
  onOpen: (id: string) => void
}

// Representa la distribución de tareas y el porcentaje finalizado del proyecto.
function ProjectProgress({ estados, tareas }: { estados: Estado[]; tareas: Tarea[] }) {
  const total = tareas.length
  const distribucion = estados.map((estado, index) => {
    const cantidad = tareas.filter((tarea) => tarea.estado === estado.id).length
    return { estado, index, cantidad, porcentaje: total ? (cantidad / total) * 100 : 0 }
  })
  const finalizadas = distribucion.at(-1)?.cantidad ?? 0
  const avance = total ? Math.round((finalizadas / total) * 100) : 0
  const detalle = total
    ? distribucion
        .map(
          ({ estado, cantidad, porcentaje }) =>
            `${estado.nombre}: ${cantidad} ${cantidad === 1 ? 'tarea' : 'tareas'} (${Math.round(porcentaje)}%)`,
        )
        .join(' · ')
    : 'El proyecto no tiene tareas.'

  return (
    <div className="w-32">
      <div className="mb-1 flex justify-between text-xs text-zinc-600">
        <span>Avance</span>
        <strong>{avance}%</strong>
      </div>
      <div
        role="img"
        aria-label={`Distribución de tareas. ${detalle} Avance: ${avance}%.`}
        title={detalle}
        className="flex h-2.5 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-inset ring-zinc-200"
      >
        {distribucion.map(({ estado, index, cantidad, porcentaje }) =>
          cantidad ? (
            <span
              key={estado.id}
              className="h-full"
              style={{
                width: `${porcentaje}%`,
                backgroundColor: colorEstado(estado, index),
                filter: 'saturate(3) brightness(0.88)',
              }}
            />
          ) : null,
        )}
      </div>
    </div>
  )
}

// Administra los proyectos y muestra su avance.
export function ProjectsAdmin({
  estados,
  proyectos,
  tareas,
  onCreate,
  onUpdate,
  onDelete,
  onOpen,
}: Props) {
  const [editing, setEditing] = useState<Proyecto | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Proyecto | null>(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const { pending, error, clear, run } = useAdminAction()
  const busqueda = useBusqueda(
    proyectos,
    (proyecto) => `${proyecto.nombre} ${proyecto.descripcion}`,
  )
  // Prepara el formulario para crear o modificar un proyecto.
  function edit(project?: Proyecto) {
    clear()
    setEditing(project ?? null)
    setNombre(project?.nombre ?? '')
    setDescripcion(project?.descripcion ?? '')
    setFormOpen(true)
  }
  usePageCommand('crear-proyecto', () => edit())
  // Valida y guarda los datos del proyecto.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!nombre.trim()) return
    const data = { nombre: nombre.trim(), descripcion: descripcion.trim() }
    if (await run(() => (editing ? onUpdate(editing.id, data) : onCreate(data)))) setFormOpen(false)
  }
  // Elimina el proyecto seleccionado tras la confirmación.
  async function remove() {
    if (deleting && (await run(() => onDelete(deleting.id)))) setDeleting(null)
  }
  return (
    <>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Proyectos</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Administrá y seguí el avance de cada proyecto.
          </p>
        </div>
        <Button variant="default" onClick={() => edit()}>
          <Plus aria-hidden="true" /> Nuevo proyecto
        </Button>
      </div>
      <Card
        as="section"
        className="gap-0 overflow-hidden rounded-xl border border-zinc-200 bg-white py-0 shadow-none"
      >
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 [.border-b]:pb-4">
          <div>
            <CardTitle as="h2" className="leading-normal">
              Todos los proyectos
            </CardTitle>
            <CardDescription as="p" className="mt-1 text-xs text-zinc-500">
              {proyectos.length} proyectos en total
            </CardDescription>
          </div>
          <AdminSearch
            label="Buscar proyectos"
            value={busqueda.busqueda}
            onChange={busqueda.setBusqueda}
          />
        </CardHeader>
        {proyectos.length === 0 ? (
          <AdminEmpty
            icon={FolderKanban}
            title="No hay proyectos todavía"
            description="Creá el primero para comenzar."
            action={{ label: 'Nuevo proyecto', run: () => edit() }}
          />
        ) : busqueda.resultados.length === 0 ? (
          <AdminEmpty
            icon={SearchX}
            title="No se encontraron proyectos"
            description="Probá con otro nombre o descripción."
            action={{ label: 'Limpiar búsqueda', run: () => busqueda.setBusqueda('') }}
          />
        ) : (
          <ItemGroup render={<ul />} className="block gap-0 divide-y divide-zinc-100">
            {busqueda.resultados.map((project) => {
              const list = tareas.filter((t) => t.proyecto_id === project.id)
              const done = list.filter((t) => t.estado === estados.at(-1)?.id).length
              return (
                <Item
                  render={<li />}
                  key={project.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-none border-0 px-5 py-4"
                >
                  <ItemContent className="min-w-0 flex-1 gap-0">
                    <Button
                      variant="ghost"
                      className="h-auto justify-start whitespace-normal p-0 text-left font-semibold hover:bg-transparent hover:underline"
                      onClick={() => onOpen(project.id)}
                    >
                      {project.nombre}
                    </Button>
                    <ItemDescription className="mt-1 line-clamp-none text-sm text-zinc-500">
                      {project.descripcion || 'Sin descripción'}
                    </ItemDescription>
                    <ItemDescription className="mt-1 line-clamp-none text-xs leading-4 text-zinc-500">
                      {list.length} tareas · {done} en {estados.at(-1)?.nombre ?? 'estado final'}
                    </ItemDescription>
                  </ItemContent>
                  <ProjectProgress estados={estados} tareas={list} />
                  <ItemActions className="gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Editar proyecto ${project.nombre}`}
                      title="Editar proyecto"
                      onClick={() => edit(project)}
                    >
                      <Pencil size={16} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-zinc-600 hover:bg-red-50 hover:text-red-700"
                      aria-label={`Eliminar proyecto ${project.nombre}`}
                      title="Eliminar proyecto"
                      onClick={() => {
                        clear()
                        setDeleting(project)
                      }}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </ItemActions>
                </Item>
              )
            })}
          </ItemGroup>
        )}
      </Card>
      <AdminDialog
        open={formOpen}
        title={editing ? 'Editar proyecto' : 'Nuevo proyecto'}
        description="Completá los datos del proyecto."
        onClose={() => !pending && setFormOpen(false)}
      >
        <form onSubmit={submit} className="space-y-4">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="project-name" className="text-sm">
              Nombre *
            </FieldLabel>
            <Input
              id="project-name"
              className="bg-white"
              required
              maxLength={120}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="project-description" className="text-sm">
              Descripción
            </FieldLabel>
            <Textarea
              id="project-description"
              aria-describedby="project-description-hint"
              className="min-h-24 bg-white"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <FieldDescription id="project-description-hint" className="text-xs">
              Enter guarda · Mayús + Enter agrega una línea.
            </FieldDescription>
          </Field>
          <ErrorMessage message={error} />
          <DialogFooter className="flex-row justify-end gap-2">
            <Button
              variant="outline"
              type="button"

              disabled={pending}
              onClick={() => setFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="default" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </AdminDialog>
      <ConfirmDialog
        open={!!deleting}
        title="Eliminar proyecto"
        description={`¿Eliminar «${deleting?.nombre ?? ''}» y sus ${tareas.filter((t) => t.proyecto_id === deleting?.id).length} tareas?`}
        pending={pending}
        error={error}
        onClose={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  )
}
