import { Field, FieldLabel, FieldError, FieldDescription } from '../ui/field'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { DialogFooter } from '../ui/dialog'
import { Empty, EmptyDescription } from '../ui/empty'
import { useState } from 'react'
import { movimientoPermitido, responsableRequerido } from '../../data/estados'
import { nombreCompleto } from '../../data/responsables'
import type { FormEvent } from 'react'
import type { Proyecto, Responsable, Tarea, EstadoTarea, Estado } from '../../data/types'
import { useAdminAction } from '../../hooks/useAdminAction'
import { AdminDialog, ErrorMessage } from './AdminDialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type TaskData = Omit<Tarea, 'id'>
type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Tarea | null
  estados: Estado[]
  proyectos: Proyecto[]
  responsables: Responsable[]
  defaultProjectId?: string
  onCreate: (data: TaskData) => Promise<unknown>
  onUpdate: (id: string, data: Partial<TaskData>) => Promise<unknown>
}
// Monta el formulario de tarea cuando se abre el diálogo.
export function TaskFormDialog(props: Props) {
  return props.open ? <TaskFormContent key={props.task?.id ?? 'new'} {...props} /> : null
}
// Gestiona los campos de creación y edición de una tarea.
function TaskFormContent({
  open,
  onOpenChange,
  task,
  estados,
  proyectos,
  responsables,
  defaultProjectId,
  onCreate,
  onUpdate,
}: Props) {
  const [titulo, setTitulo] = useState(task?.titulo ?? '')
  const [descripcion, setDescripcion] = useState(task?.descripcion ?? '')
  const [proyectoId, setProyectoId] = useState(
    task?.proyecto_id ?? defaultProjectId ?? proyectos[0]?.id ?? '',
  )
  const [responsableId, setResponsableId] = useState(task?.responsable_id ?? '')
  const [estado, setEstado] = useState<EstadoTarea>(task?.estado ?? estados[0]?.id ?? '')
  const [errorResponsable, setErrorResponsable] = useState('')
  const { pending, error, run } = useAdminAction()
  // Valida y guarda la tarea con sus relaciones.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!titulo.trim() || !proyectoId) return
    if (responsableRequerido(estado, estados) && !responsableId) {
      setErrorResponsable('Asigná un responsable para que la tarea pueda estar en este estado.')
      return
    }
    setErrorResponsable('')
    const data: TaskData = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      proyecto_id: proyectoId,
      responsable_id: responsableId || null,
      estado,
    }
    if (await run(() => (task ? onUpdate(task.id, data) : onCreate(data)))) onOpenChange(false)
  }
  return (
    <AdminDialog
      open={open}
      title={task ? 'Editar tarea' : 'Nueva tarea'}
      description="Completá los datos de la tarea."
      onClose={() => !pending && onOpenChange(false)}
    >
      {proyectos.length === 0 ? (
        <Empty className="block space-y-4 rounded-none p-0 text-left">
          <EmptyDescription className="text-sm leading-5 text-zinc-600">
            Primero creá un proyecto para agregar tareas.
          </EmptyDescription>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </Empty>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="task-title" className="text-sm">
              Título *
            </FieldLabel>
            <Input
              id="task-title"
              className="bg-white"
              required
              maxLength={120}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="task-description" className="text-sm">
              Descripción
            </FieldLabel>
            <Textarea
              id="task-description"
              aria-describedby="task-description-hint"
              className="min-h-20 bg-white"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
            <FieldDescription id="task-description-hint" className="text-xs">
              Enter guarda · Mayús + Enter agrega una línea.
            </FieldDescription>
          </Field>
          {task ? (
            <dl className="space-y-1.5 text-sm">
              <dt className="font-medium">Proyecto</dt>
              <dd className="break-words text-zinc-600">
                {proyectos.find((project) => project.id === task.proyecto_id)?.nombre ??
                  'Proyecto no disponible'}
              </dd>
            </dl>
          ) : (
            <Field className="gap-1.5">
              <FieldLabel htmlFor="task-project" className="text-sm">
                Proyecto *
              </FieldLabel>
              <Select
                items={proyectos.map((p) => ({ value: `id:${p.id}`, label: p.nombre }))}
                value={proyectoId ? `id:${proyectoId}` : undefined}
                onValueChange={(value) => setProyectoId(value.slice(3))}
                required
              >
                <SelectTrigger id="task-project" className="w-full bg-white">
                  <SelectValue placeholder="Seleccioná un proyecto" />
                </SelectTrigger>
                <SelectContent insideDialog position="popper">
                  {proyectos.map((p) => (
                    <SelectItem key={p.id} value={`id:${p.id}`}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field className="gap-1.5">
            <FieldLabel htmlFor="task-responsible" className="text-sm">
              Responsable {responsableRequerido(estado, estados) && '*'}
            </FieldLabel>
            <Select
              items={[
                { value: 'unassigned', label: 'Sin asignar' },
                ...responsables.map((r) => ({ value: `id:${r.id}`, label: nombreCompleto(r) })),
              ]}
              value={responsableId ? `id:${responsableId}` : 'unassigned'}
              onValueChange={(value) => {
                setResponsableId(value === 'unassigned' ? '' : value.slice(3))
                setErrorResponsable('')
              }}
            >
              <SelectTrigger
                id="task-responsible"
                className="w-full bg-white"
                aria-invalid={Boolean(errorResponsable)}
                aria-describedby={errorResponsable ? 'task-responsible-error' : undefined}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent insideDialog position="popper">
                <SelectItem value="unassigned">Sin asignar</SelectItem>
                {responsables.map((r) => (
                  <SelectItem key={r.id} value={`id:${r.id}`}>
                    {nombreCompleto(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errorResponsable && (
              <FieldError id="task-responsible-error" className="text-xs text-red-700">
                {errorResponsable}
              </FieldError>
            )}
          </Field>
          {task && (
            <Field className="gap-1.5">
              <FieldLabel htmlFor="task-status" className="text-sm">
                Estado
              </FieldLabel>
              <Select
                items={estados.map((item) => ({ value: item.id, label: item.nombre }))}
                value={estado}
                onValueChange={(value) => {
                  setEstado(value)
                  setErrorResponsable('')
                }}
              >
                <SelectTrigger id="task-status" className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent insideDialog position="popper">
                  {estados.map((item) => (
                    <SelectItem
                      key={item.id}
                      value={item.id}
                      disabled={
                        !movimientoPermitido(task.estado, item.id, estados, responsableId || null)
                      }
                    >
                      {item.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <ErrorMessage message={error} />
          <DialogFooter className="flex-row justify-end gap-2">
            <Button
              variant="outline"
              type="button"

              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button variant="default" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      )}
    </AdminDialog>
  )
}
