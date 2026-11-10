import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Field } from '../ui/field'
import { useState, type DragEvent } from 'react'
import { ArrowDown, ArrowUp, GripVertical, ListChecks, Plus, Trash2 } from 'lucide-react'
import { colorEstado } from '../../data/estados'
import type { Estado, Tarea } from '../../data/types'
import { useEstadoSettings } from '../../hooks/useEstadoSettings'
import { usePageFocus } from '../../hooks/usePageFocus'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card'
import { Item, ItemGroup, ItemActions } from '../ui/item'
import { Badge } from '../ui/badge'
import { Alert } from '../ui/alert'

// Permite editar, ordenar y guardar los estados de las tareas.
export function EstadosAdmin({
  estados,
  tareas,
  onSave,
}: {
  estados: Estado[]
  tareas: Tarea[]
  onSave: (estados: Estado[]) => Promise<unknown>
}) {
  const settings = useEstadoSettings(estados, tareas, onSave)
  const newStateRef = usePageFocus()
  const [arrastrado, setArrastrado] = useState<string | null>(null)
  const [destino, setDestino] = useState<string | null>(null)
  const indiceArrastrado = settings.estados.findIndex((estado) => estado.id === arrastrado)

  // Usa toda la fila como imagen flotante al comenzar el arrastre.
  function iniciarArrastre(event: DragEvent<HTMLSpanElement>, estado: Estado) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', estado.id)
    const fila = event.currentTarget.closest('li')
    if (fila) {
      const rect = fila.getBoundingClientRect()
      event.dataTransfer.setDragImage(fila, event.clientX - rect.left, event.clientY - rect.top)
    }
    setArrastrado(estado.id)
  }
  return (
    <div className="max-w-3xl">
      <div className="mb-7">
        <h1 className="text-3xl font-semibold tracking-tight">Estados</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configurá las columnas y el recorrido de las tareas.
        </p>
      </div>
      <Card className="gap-0 rounded-xl border bg-white py-0 shadow-none">
        <CardHeader className="block border-b px-4 py-3 [.border-b]:pb-3">
          <CardTitle as="h2" className="leading-normal">
            Orden de los estados
          </CardTitle>
          <CardDescription as="p" className="mt-1 text-sm text-muted-foreground">
            Arrastrá la manija o usá las flechas para ordenar. El orden define el recorrido y el
            avance de los proyectos.
          </CardDescription>
        </CardHeader>
        <p className="sr-only" role="status">
          {arrastrado && destino && destino !== arrastrado
            ? `Soltá ${settings.estados[indiceArrastrado]?.nombre} ${indiceArrastrado < settings.estados.findIndex((estado) => estado.id === destino) ? 'después' : 'antes'} de ${settings.estados.find((estado) => estado.id === destino)?.nombre}.`
            : arrastrado
              ? `Arrastrando ${settings.estados[indiceArrastrado]?.nombre}.`
              : ''}
        </p>
        <ItemGroup render={<ol />} className="block gap-0 divide-y">
          {settings.estados.map((estado, index) => {
            const cantidad = tareas.filter((t) => t.estado === estado.id).length
            const destinoActivo = destino === estado.id && arrastrado !== estado.id
            const insertarDespues = indiceArrastrado < index
            return (
              <Item
                render={<li />}
                key={estado.id}
                onDragOver={(event) => {
                  if (arrastrado) {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                    setDestino(estado.id)
                  }
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                    setDestino(null)
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  if (arrastrado) settings.reordenar(arrastrado, estado.id)
                  setArrastrado(null)
                  setDestino(null)
                }}
                className={`relative grid w-full rounded-none border-0 grid-cols-[1.25rem_1.25rem_minmax(0,1fr)_3.5rem] items-center gap-2 px-4 py-2 sm:grid-cols-[1.25rem_1.25rem_minmax(0,1fr)_3.5rem_6.5rem] ${destinoActivo ? 'z-10' : ''} ${arrastrado === estado.id ? 'opacity-40' : ''}`}
                style={{ backgroundColor: colorEstado(estado, index) }}
              >
                {destinoActivo && (
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-3 z-10 h-1 rounded-full bg-emerald-500 ${insertarDespues ? 'bottom-0' : 'top-0'}`}
                  />
                )}
                <span
                  draggable
                  onDragStart={(event) => iniciarArrastre(event, estado)}
                  onDragEnd={() => {
                    setArrastrado(null)
                    setDestino(null)
                  }}
                  className="cursor-grab rounded text-zinc-500 active:cursor-grabbing"
                  title="Arrastrar para ordenar"
                  aria-hidden="true"
                >
                  <GripVertical size={18} />
                </span>
                <span className="w-5 text-sm text-muted-foreground">{index + 1}</span>
                <Field className="block w-auto min-w-0">
                  <Label className="sr-only" htmlFor={`estado-${estado.id}`}>
                    Nombre del estado {index + 1}
                  </Label>
                  <Input
                    id={`estado-${estado.id}`}
                    className="bg-white"
                    value={estado.nombre}
                    maxLength={80}
                    onChange={(e) => settings.renombrar(estado.id, e.target.value)}
                    onBlur={settings.guardarPendientes}
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter' &&
                        !event.nativeEvent.isComposing &&
                        event.nativeEvent.keyCode !== 229
                      ) {
                        event.preventDefault()
                        settings.guardarPendientes()
                      }
                    }}
                  />
                </Field>
                <Badge
                  variant="secondary"
                  role="img"
                  aria-label={`${cantidad} ${cantidad === 1 ? 'tarea' : 'tareas'} en ${estado.nombre}`}
                  title={`${cantidad} ${cantidad === 1 ? 'tarea' : 'tareas'} en ${estado.nombre}`}
                  className="flex h-8 min-w-0 items-center justify-center gap-1 rounded-md bg-white/70 px-1 text-xs font-medium tabular-nums text-zinc-600"
                >
                  <ListChecks size={14} className="shrink-0" aria-hidden="true" />
                  <span className="truncate">{cantidad}</span>
                </Badge>
                <ItemActions className="col-span-2 col-start-3 justify-end gap-1 sm:col-auto sm:col-start-auto">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => settings.mover(index, -1)}
                    aria-label={`Subir ${estado.nombre}`}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={index === settings.estados.length - 1}
                    onClick={() => settings.mover(index, 1)}
                    aria-label={`Bajar ${estado.nombre}`}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={cantidad > 0 || settings.estados.length <= 2}
                    onClick={() => settings.quitar(estado.id)}
                    aria-label={`Quitar ${estado.nombre}`}
                    title={cantidad ? 'Tiene tareas asignadas' : 'Quitar estado'}
                  >
                    <Trash2 />
                  </Button>
                </ItemActions>
              </Item>
            )
          })}
        </ItemGroup>
        <CardFooter className="flex-wrap items-stretch gap-2 border-t px-5 py-4 [.border-t]:pt-4">
          <Label className="sr-only" htmlFor="nuevo-estado">
            Nombre del nuevo estado
          </Label>
          <Input
            id="nuevo-estado"
            ref={newStateRef}
            className="min-w-40 flex-1 bg-white"
            maxLength={80}
            placeholder="Nombre del nuevo estado"
            value={settings.nuevo}
            onChange={(e) => settings.setNuevo(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.nativeEvent.isComposing &&
                e.nativeEvent.keyCode !== 229
              ) {
                e.preventDefault()
                settings.agregar()
              }
            }}
          />
          <Button type="button" variant="outline" onClick={settings.agregar}>
            <Plus /> Agregar
          </Button>
        </CardFooter>
      </Card>
      {settings.error && (
        <Alert className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border-0 bg-red-50 p-3 text-sm text-red-800">
          <span>{settings.error}</span>
          {settings.puedeReintentar && (
            <Button type="button" variant="outline" size="sm" onClick={settings.reintentar}>
              Reintentar
            </Button>
          )}
        </Alert>
      )}
      {(settings.guardando || settings.mensaje) && !settings.error && (
        <Alert
          role="status"
          className="mt-4 block rounded-md border-0 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {settings.guardando ? 'Guardando cambios…' : settings.mensaje}
        </Alert>
      )}
      <p className="mt-5 text-xs text-muted-foreground">
        Los cambios se guardan automáticamente. No se pueden quitar estados con tareas asignadas.
      </p>
    </div>
  )
}
