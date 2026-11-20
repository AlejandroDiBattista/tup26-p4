import { Button } from '../ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { Alert } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Empty } from '../ui/empty'
import { Label } from '../ui/label'
import { Field, FieldLabel } from '../ui/field'
import { useEffect, useState, type DragEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useKanban } from '../../hooks/useKanban'
import { usePageFocus } from '../../hooks/usePageFocus'
import { colorEstado, movimientoPermitido, responsableRequerido } from '../../data/estados'
import { nombreCompleto } from '../../data/responsables'
import {
  ArrowLeft,
  ArrowRight,
  FolderKanban,
  GripVertical,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../ui/card'
import type { Estado } from '../../data/types'
import type { EstadoKanban, ProyectoKanban, ResponsableKanban, TareaKanban } from './types'

export type { EstadoKanban, ProyectoKanban, ResponsableKanban, TareaKanban } from './types'
export interface KanbanBoardProps {
  tareas: TareaKanban[]
  estados: Estado[]
  proyectos: ProyectoKanban[]
  responsables: ResponsableKanban[]
  onCambiarEstado: (id: string, estado: EstadoKanban) => void | Promise<void>
  onAsignarResponsable: (id: string, responsableId: string | null) => void | Promise<void>
  onEditar: (tarea: TareaKanban) => void
  onEliminar: (tarea: TareaKanban) => void
  proyectoId?: string
  mostrarFiltros?: boolean
}
const button =
  'inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground shadow-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40'

// Muestra una tarea y sus acciones dentro del tablero.
function TaskCard({
  tarea,
  proyecto,
  responsable,
  responsables,
  estados,
  showProject,
  onCambiarEstado,
  onAsignarResponsable,
  onEditar,
  onEliminar,
  onDragging,
  destacada,
}: {
  tarea: TareaKanban
  proyecto?: ProyectoKanban
  responsable?: ResponsableKanban
  responsables: ResponsableKanban[]
  estados: Estado[]
  showProject: boolean
  onCambiarEstado: KanbanBoardProps['onCambiarEstado']
  onAsignarResponsable: KanbanBoardProps['onAsignarResponsable']
  onEditar: KanbanBoardProps['onEditar']
  onEliminar: KanbanBoardProps['onEliminar']
  onDragging: (id: string | null) => void
  destacada: boolean
}) {
  const index = estados.findIndex((estado) => estado.id === tarea.estado)
  const estadoAnterior = !tarea.responsable_id && index > 0 ? estados[0] : estados[index - 1]
  // Inicia el arrastre de una tarea.
  function dragStart(event: DragEvent<HTMLElement>) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/x-trama-tarea', tarea.id)
    event.dataTransfer.setData('text/plain', tarea.id)
    onDragging(tarea.id)
  }
  return (
    <Card
      as="article"
      id={`tarea-${tarea.id}`}
      draggable
      onDragStart={dragStart}
      onDragEnd={() => onDragging(null)}
      className={`group task-card min-w-0 cursor-grab gap-0 rounded-xl border border-zinc-200/80 bg-card p-4 text-card-foreground active:cursor-grabbing ${destacada ? 'outline-2 outline-offset-2 outline-zinc-500' : ''}`}
    >
      <CardHeader className="mb-3 flex min-h-4 items-center justify-between gap-2 px-0">
        {showProject && (
          <CardDescription
            as="p"
            className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-zinc-600"
          >
            <FolderKanban size={13} strokeWidth={1.8} className="shrink-0" aria-hidden="true" />
            {proyecto?.nombre ?? 'Proyecto no disponible'}
          </CardDescription>
        )}
        <span
          className="ml-auto flex shrink-0 items-center gap-1 text-zinc-400 group-hover:text-zinc-700 group-focus-within:text-zinc-700 motion-safe:transition-colors"
          title="Arrastrá esta tarjeta para cambiar de estado"
          aria-hidden="true"
        >
          <GripVertical size={16} />
        </span>
      </CardHeader>
      <CardContent className="px-0">
        <div className="flex items-start justify-between gap-3">
          <CardTitle
            as="h3"
            className="min-w-0 break-words text-[15px] font-semibold leading-5 tracking-[-0.01em]"
          >
            {tarea.titulo}
          </CardTitle>
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              type="button"
              className={`${button} size-8 rounded-lg border-zinc-200 bg-zinc-50 px-0 text-zinc-700 hover:border-zinc-400 hover:bg-white`}
              disabled={index <= 0}
              aria-label={`Mover ${tarea.titulo} ${estadoAnterior ? `a ${estadoAnterior.nombre}` : 'al estado anterior'}`}
              title={estadoAnterior ? `Mover a ${estadoAnterior.nombre}` : 'Primer estado'}
              onClick={() => void onCambiarEstado(tarea.id, estadoAnterior.id)}
            >
              <ArrowLeft size={17} strokeWidth={2} aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              type="button"
              className={`${button} size-8 rounded-lg border-zinc-200 bg-zinc-50 px-0 text-zinc-700 hover:border-zinc-400 hover:bg-white`}
              disabled={index < 0 || index >= estados.length - 1}
              aria-label={`Mover ${tarea.titulo} al estado siguiente`}
              title={
                index >= 0 && index < estados.length - 1
                  ? `Mover a ${estados[index + 1].nombre}`
                  : 'Último estado'
              }
              onClick={() => void onCambiarEstado(tarea.id, estados[index + 1].id)}
            >
              <ArrowRight size={17} strokeWidth={2} aria-hidden="true" />
            </Button>
          </div>
        </div>
        <CardDescription as="p" className="mt-2 break-words text-[13px] leading-5 text-zinc-600">
          {tarea.descripcion || 'Sin descripción'}
        </CardDescription>
      </CardContent>
      <CardFooter className="mt-4 flex min-w-0 items-center gap-1.5 border-t border-zinc-100 px-0 pt-3 [.border-t]:pt-3">
        <Label htmlFor={`responsable-${tarea.id}`} className="sr-only">
          Responsable
        </Label>
        <Select
          items={[
            { value: 'unassigned', label: 'Sin asignar' },
            ...responsables.map((persona) => ({
              value: `id:${persona.id}`,
              label: nombreCompleto(persona),
            })),
          ]}
          value={responsable ? `id:${responsable.id}` : 'unassigned'}
          onValueChange={(value) =>
            void onAsignarResponsable(tarea.id, value === 'unassigned' ? null : value.slice(3))
          }
        >
          <SelectTrigger
            id={`responsable-${tarea.id}`}
            aria-label={`Responsable de ${tarea.titulo}`}
            className="h-9 w-0 min-w-0 flex-1 rounded-lg border-zinc-200 bg-zinc-50/70 text-zinc-700"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="unassigned" disabled={responsableRequerido(tarea.estado, estados)}>
              Sin asignar
            </SelectItem>
            {responsables.map((persona) => (
              <SelectItem key={persona.id} value={`id:${persona.id}`}>
                {nombreCompleto(persona)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          type="button"
          className={`${button} size-8 shrink-0 rounded-lg border-transparent bg-transparent px-0 text-zinc-600 shadow-none hover:bg-zinc-100 hover:text-zinc-950`}
          aria-label={`Editar ${tarea.titulo}`}
          title="Editar tarea"
          onClick={() => onEditar(tarea)}
        >
          <Pencil size={16} aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          type="button"
          className={`${button} size-8 shrink-0 rounded-lg border-transparent bg-transparent px-0 text-zinc-600 shadow-none hover:bg-red-50 hover:text-red-700`}
          aria-label={`Eliminar ${tarea.titulo}`}
          title="Eliminar tarea"
          onClick={() => onEliminar(tarea)}
        >
          <Trash2 size={16} aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// Organiza y filtra las tareas por estado.
export function KanbanBoard({
  tareas,
  estados,
  proyectos,
  responsables,
  onCambiarEstado,
  onAsignarResponsable,
  onEditar,
  onEliminar,
  proyectoId,
  mostrarFiltros = true,
}: KanbanBoardProps) {
  const filtros = useKanban(tareas, proyectos, responsables, proyectoId)
  const [params] = useSearchParams()
  const tareaDestacada = params.get('ver')
  const { setBusqueda, setProyecto, setResponsable } = filtros
  // Quita filtros que podrían ocultar una tarea abierta desde el asistente.
  useEffect(() => {
    if (!tareaDestacada) return
    queueMicrotask(() => {
      setBusqueda('')
      setProyecto('')
      setResponsable('')
    })
  }, [tareaDestacada, setBusqueda, setProyecto, setResponsable])
  // Desplaza el tablero hasta la tarea indicada cuando ya está visible.
  useEffect(() => {
    if (tareaDestacada) {
      document
        .getElementById(`tarea-${tareaDestacada}`)
        ?.scrollIntoView({ block: 'nearest', inline: 'center' })
    }
  }, [tareaDestacada, filtros.resultados])
  const searchRef = usePageFocus()
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<EstadoKanban | null>(null)
  const [error, setError] = useState('')
  const tareaArrastrada = tareas.find((tarea) => tarea.id === dragging)
  // Solicita un cambio de estado y muestra los errores.
  async function cambiarEstado(id: string, estado: EstadoKanban) {
    setError('')
    const tarea = tareas.find((item) => item.id === id)
    if (tarea && responsableRequerido(estado, estados) && !tarea.responsable_id) {
      setError(`Asigná un responsable a «${tarea.titulo}» antes de cambiar su estado.`)
      return
    }
    try {
      await onCambiarEstado(id, estado)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cambiar el estado de la tarea.')
    }
  }
  // Actualiza el responsable de una tarea.
  async function asignarResponsable(id: string, responsableId: string | null) {
    setError('')
    try {
      await onAsignarResponsable(id, responsableId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo asignar el responsable.')
    }
  }
  // Comprueba y aplica el movimiento de una tarea arrastrada.
  function onDrop(event: DragEvent<HTMLElement>, estado: EstadoKanban) {
    event.preventDefault()
    const id = event.dataTransfer.getData('application/x-trama-tarea')
    setOver(null)
    setDragging(null)
    const tarea = tareas.find((item) => item.id === id)
    if (!tarea || tarea.estado === estado) return
    if (!movimientoPermitido(tarea.estado, estado, estados, tarea.responsable_id)) {
      const origen = estados.find((item) => item.id === tarea.estado)?.nombre ?? tarea.estado
      const destino = estados.find((item) => item.id === estado)?.nombre ?? estado
      setError(
        `No se puede pasar de ${origen} a ${destino} directamente. Usá los estados intermedios.`,
      )
      return
    }
    void cambiarEstado(id, estado)
  }
  return (
    <div className="space-y-4">
      {error && (
        <Alert className="block rounded-md border-0 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </Alert>
      )}
      {mostrarFiltros && (
        <Card className="flex-row flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-none sm:p-4">
          <Field className="block w-auto min-w-0 flex-1 basis-full sm:basis-52">
            <FieldLabel
              className="mb-1.5 block text-xs font-medium text-zinc-600"
              htmlFor="kanban-busqueda"
            >
              Buscar tareas
            </FieldLabel>
            <InputGroup className="h-10 rounded-full border-zinc-200 bg-zinc-50/60 has-[[data-slot=input-group-control]:focus-visible]:ring-2">
              <InputGroupAddon className="text-zinc-500">
                <Search size={16} aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="kanban-busqueda"
                ref={searchRef}
                type="search"
                value={filtros.busqueda}
                onChange={(event) => filtros.setBusqueda(event.target.value)}
                placeholder="Buscar tareas..."
                className="h-full text-sm text-foreground"
              />
            </InputGroup>
          </Field>
          {!proyectoId && (
            <Field className="block w-auto min-w-0 flex-1 basis-40 sm:flex-none">
              <FieldLabel
                className="mb-1.5 block text-xs font-medium text-zinc-600"
                htmlFor="kanban-proyecto"
              >
                Filtrar por proyecto
              </FieldLabel>
              <Select
                items={[
                  { value: 'all', label: 'Todos los proyectos' },
                  ...proyectos.map((proyecto) => ({
                    value: `id:${proyecto.id}`,
                    label: proyecto.nombre,
                  })),
                ]}
                value={filtros.proyecto ? `id:${filtros.proyecto}` : 'all'}
                onValueChange={(value) =>
                  filtros.setProyecto(value === 'all' ? '' : value.slice(3))
                }
              >
                <SelectTrigger
                  id="kanban-proyecto"
                  className="w-full rounded-full border-zinc-200 bg-zinc-50/60 data-[size=default]:h-10 sm:w-[200px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {proyectos.map((proyecto) => (
                    <SelectItem key={proyecto.id} value={`id:${proyecto.id}`}>
                      {proyecto.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field className="block w-auto min-w-0 flex-1 basis-40 sm:flex-none">
            <FieldLabel
              className="mb-1.5 block text-xs font-medium text-zinc-600"
              htmlFor="kanban-responsable"
            >
              Filtrar por responsable
            </FieldLabel>
            <Select
              items={[
                { value: 'all', label: 'Todos los responsables' },
                { value: 'unassigned', label: 'Sin asignar' },
                ...responsables.map((persona) => ({
                  value: `id:${persona.id}`,
                  label: nombreCompleto(persona),
                })),
              ]}
              value={
                filtros.responsable === 'sin-asignar'
                  ? 'unassigned'
                  : filtros.responsable
                    ? `id:${filtros.responsable}`
                    : 'all'
              }
              onValueChange={(value) =>
                filtros.setResponsable(
                  value === 'all' ? '' : value === 'unassigned' ? 'sin-asignar' : value.slice(3),
                )
              }
            >
              <SelectTrigger
                id="kanban-responsable"
                className="w-full rounded-full border-zinc-200 bg-zinc-50/60 data-[size=default]:h-10 sm:w-[200px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">Todos los responsables</SelectItem>
                <SelectItem value="unassigned">Sin asignar</SelectItem>
                {responsables.map((responsable) => (
                  <SelectItem key={responsable.id} value={`id:${responsable.id}`}>
                    {nombreCompleto(responsable)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Card>
      )}
      <p className="px-1 text-xs text-zinc-600" role="status">
        {filtros.resultados.length}{' '}
        {filtros.resultados.length === 1 ? 'tarea encontrada' : 'tareas encontradas'} · Usá las
        flechas o arrastrá las tarjetas para cambiar su estado.
      </p>
      <div
        className="board-scroll overflow-x-auto p-1 pb-3"
        role="region"
        aria-label="Tablero de tareas"
        tabIndex={0}
      >
        <div
          className="grid w-full items-start gap-4"
          style={{
            gridTemplateColumns: `repeat(${estados.length}, minmax(280px, 1fr))`,
            minWidth: `${estados.length * 280 + Math.max(0, estados.length - 1) * 16}px`,
          }}
        >
          {estados.map((itemEstado, indexEstado) => {
            const estado = itemEstado.id
            const items = filtros.resultados.filter((tarea) => tarea.estado === estado)
            const origen = tareaArrastrada?.estado === estado
            const permitido = tareaArrastrada
              ? movimientoPermitido(
                  tareaArrastrada.estado,
                  estado,
                  estados,
                  tareaArrastrada.responsable_id,
                ) &&
                (!responsableRequerido(estado, estados) || Boolean(tareaArrastrada.responsable_id))
              : false
            const prohibido = Boolean(tareaArrastrada && !permitido)
            return (
              <Card
                as="section"
                key={estado}
                style={
                  !tareaArrastrada
                    ? { backgroundColor: colorEstado(itemEstado, indexEstado) }
                    : undefined
                }
                aria-label={itemEstado.nombre}
                onDragOver={(event) => {
                  if (dragging) {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                    setOver(estado)
                  }
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                    setOver(null)
                }}
                onDrop={(event) => onDrop(event, estado)}
                className={`block min-h-52 min-w-0 rounded-xl border bg-muted/60 p-3 shadow-none ${prohibido ? 'border-red-300 bg-red-50/80' : tareaArrastrada && !origen ? 'border-emerald-300 bg-emerald-50/70' : 'border-border'} ${over === estado ? (prohibido ? 'ring-2 ring-red-400' : 'ring-2 ring-emerald-500') : ''}`}
              >
                <CardHeader className="mb-4 flex min-h-8 items-center justify-between gap-3 px-1">
                  <CardTitle
                    as="h2"
                    className="flex min-w-0 items-center gap-2 text-sm font-semibold leading-5 tracking-[-0.01em] text-zinc-800"
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${colorEstado(itemEstado, indexEstado)} 22%, #374151)`,
                      }}
                      aria-hidden="true"
                    />
                    {itemEstado.nombre}
                  </CardTitle>
                  <Badge className="grid min-w-7 place-items-center rounded-md border-0 bg-white/80 px-2 py-1 text-xs font-semibold tabular-nums text-zinc-600">
                    {items.length}
                  </Badge>
                </CardHeader>
                <CardContent className="grid min-w-0 gap-3 px-0">
                  {items.length ? (
                    items.map((tarea) => (
                      <TaskCard
                        key={tarea.id}
                        tarea={tarea}
                        destacada={tarea.id === tareaDestacada}
                        proyecto={proyectos.find((item) => item.id === tarea.proyecto_id)}
                        responsable={responsables.find((item) => item.id === tarea.responsable_id)}
                        responsables={responsables}
                        estados={estados}
                        onAsignarResponsable={asignarResponsable}
                        showProject={!proyectoId}
                        onCambiarEstado={cambiarEstado}
                        onEditar={onEditar}
                        onEliminar={onEliminar}
                        onDragging={(id) => {
                          setDragging(id)
                          if (id) setError('')
                          else setOver(null)
                        }}
                      />
                    ))
                  ) : (
                    <Empty className="block rounded-lg border border-dashed border-zinc-300/80 bg-white/40 px-3 py-7 text-center text-xs leading-5 text-zinc-600">
                      No hay tareas en este estado.
                    </Empty>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
