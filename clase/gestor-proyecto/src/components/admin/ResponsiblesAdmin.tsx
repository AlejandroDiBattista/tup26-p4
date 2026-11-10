import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Field, FieldLabel, FieldDescription } from '../ui/field'
import { DialogFooter } from '../ui/dialog'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pencil, Trash2, Plus, SearchX, Users } from 'lucide-react'
import type { FormEvent } from 'react'
import type { Estado, NuevoResponsable, Proyecto, Responsable, Tarea } from '../../data/types'
import { nombreCompleto, separarNombre } from '../../data/responsables'
import { useAdminAction } from '../../hooks/useAdminAction'
import { useBusqueda } from '../../hooks/useBusqueda'
import { usePageCommand } from '../../hooks/usePageCommand'
import { AdminSearch } from './AdminSearch'
import { AdminEmpty } from './AdminEmpty'
import { ConfirmDialog } from './ConfirmDialog'
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Empty } from '../ui/empty'
import { Item, ItemContent, ItemGroup, ItemTitle, ItemDescription } from '../ui/item'
import { AdminDialog, ErrorMessage } from './AdminDialog'

type PersonData = NuevoResponsable
type Props = {
  estados: Estado[]
  responsables: Responsable[]
  tareas: Tarea[]
  proyectos: Proyecto[]
  onCreate: (data: PersonData) => Promise<unknown>
  onUpdate: (id: string, data: Partial<PersonData>) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
  seleccionado?: Responsable
  onCloseSeleccionado: () => void
}
// Administra responsables y permite consultar sus tareas.
export function ResponsiblesAdmin({
  estados,
  responsables,
  tareas,
  proyectos,
  onCreate,
  onUpdate,
  onDelete,
  seleccionado,
  onCloseSeleccionado,
}: Props) {
  const [editing, setEditing] = useState<Responsable | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Responsable | null>(null)
  const [viewingLocal, setViewing] = useState<Responsable | null>(null)
  const viewing = seleccionado ?? viewingLocal
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [contacto, setContacto] = useState('')
  const { pending, error, clear, run } = useAdminAction()
  const busqueda = useBusqueda(
    responsables,
    (person) => `${nombreCompleto(person)} ${person.contacto}`,
  )
  const [params] = useSearchParams()
  const responsableDestacado = params.get('ver')
  const { setBusqueda } = busqueda
  // Asegura que la persona solicitada por el asistente no quede oculta por el filtro.
  useEffect(() => {
    if (responsableDestacado) queueMicrotask(() => setBusqueda(''))
  }, [responsableDestacado, setBusqueda])
  // Muestra la fila solicitada cuando está disponible en el listado.
  useEffect(() => {
    if (responsableDestacado) {
      document
        .getElementById(`persona-${responsableDestacado}`)
        ?.scrollIntoView({ block: 'nearest' })
    }
  }, [responsableDestacado, busqueda.resultados])
  // Prepara el formulario para crear o modificar un responsable.
  function edit(person?: Responsable) {
    clear()
    setEditing(person ?? null)
    const nombres = person ? separarNombre(person) : { nombre: '', apellido: '' }
    setNombre(nombres.nombre)
    setApellido(nombres.apellido)
    setContacto(person?.contacto ?? '')
    setFormOpen(true)
  }
  usePageCommand('crear-responsable', () => edit())
  // Valida y guarda los datos del responsable.
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!nombre.trim() || !apellido.trim()) return
    const data = { nombre: nombre.trim(), apellido: apellido.trim(), contacto: contacto.trim() }
    if (await run(() => (editing ? onUpdate(editing.id, data) : onCreate(data)))) setFormOpen(false)
  }
  // Elimina el responsable seleccionado tras la confirmación.
  async function remove() {
    if (deleting && (await run(() => onDelete(deleting.id)))) setDeleting(null)
  }
  // Cierra la consulta de tareas del responsable seleccionado.
  function cerrarConsulta() {
    setViewing(null)
    if (seleccionado) onCloseSeleccionado()
  }
  const assigned = viewing ? tareas.filter((t) => t.responsable_id === viewing.id) : []
  const deleteCount = tareas.filter((t) => t.responsable_id === deleting?.id).length
  return (
    <>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Responsables</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Personas a cargo de las tareas de tus proyectos.
          </p>
        </div>
        <Button variant="default" onClick={() => edit()}>
          <Plus aria-hidden="true" /> Nuevo responsable
        </Button>
      </div>
      <Card
        as="section"
        className="gap-0 overflow-hidden rounded-xl border border-zinc-200 bg-white py-0 shadow-none"
      >
        <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 [.border-b]:pb-4">
          <div>
            <CardTitle as="h2" className="leading-normal">
              Responsables
            </CardTitle>
            <CardDescription as="p" className="mt-1 text-xs text-zinc-500">
              {responsables.length} personas registradas
            </CardDescription>
          </div>
          <AdminSearch
            label="Buscar responsables"
            value={busqueda.busqueda}
            onChange={busqueda.setBusqueda}
          />
        </CardHeader>
        {!responsables.length ? (
          <AdminEmpty
            icon={Users}
            title="No hay responsables registrados"
            description="Agregá una persona para asignarle tareas."
            action={{ label: 'Nuevo responsable', run: () => edit() }}
          />
        ) : !busqueda.resultados.length ? (
          <AdminEmpty
            icon={SearchX}
            title="No se encontraron responsables"
            description="Probá con otro nombre, apellido o contacto."
            action={{ label: 'Limpiar búsqueda', run: () => busqueda.setBusqueda('') }}
          />
        ) : (
          <div
            role="region"
            aria-label="Listado de responsables"
            tabIndex={0}
            className="overflow-x-auto"
          >
            <Table className="w-full min-w-[640px] text-left text-sm">
              <TableHeader className="bg-zinc-50 text-xs text-zinc-500">
                <TableRow>
                  <TableHead className="px-5 py-3 font-medium">Nombre</TableHead>
                  <TableHead className="px-5 py-3 font-medium">Contacto</TableHead>
                  <TableHead className="px-5 py-3 font-medium">Tareas asignadas</TableHead>
                  <TableHead className="px-5 py-3">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-zinc-100">
                {busqueda.resultados.map((person) => (
                  <TableRow
                    key={person.id}
                    id={`persona-${person.id}`}
                    className={person.id === responsableDestacado ? 'bg-zinc-100' : undefined}
                  >
                    <TableHead scope="row" className="px-5 py-4 font-semibold">
                      {nombreCompleto(person)}
                    </TableHead>
                    <TableCell className="px-5 py-4 text-zinc-600">
                      {person.contacto || '—'}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Button
                        variant="outline"

                        onClick={() => setViewing(person)}
                      >
                        {tareas.filter((t) => t.responsable_id === person.id).length} tareas
                      </Button>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Editar responsable ${nombreCompleto(person)}`}
                          title="Editar responsable"
                          onClick={() => edit(person)}
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-zinc-600 hover:bg-red-50 hover:text-red-700"
                          aria-label={`Eliminar responsable ${nombreCompleto(person)}`}
                          title="Eliminar responsable"
                          onClick={() => {
                            clear()
                            setDeleting(person)
                          }}
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
      <AdminDialog
        open={formOpen}
        title={editing ? 'Editar responsable' : 'Nuevo responsable'}
        description="Completá los datos de contacto."
        onClose={() => !pending && setFormOpen(false)}
      >
        <form onSubmit={submit} className="space-y-4">
          <Field className="gap-1.5">
            <FieldLabel htmlFor="person-name" className="text-sm">
              Nombre *
            </FieldLabel>
            <Input
              id="person-name"
              className="bg-white"
              required
              maxLength={120}
              name="nombre"
              autoComplete="given-name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel htmlFor="person-surname" className="text-sm">
              Apellido *
            </FieldLabel>
            <Input
              id="person-surname"
              className="bg-white"
              required
              maxLength={120}
              name="apellido"
              autoComplete="family-name"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
          </Field>
          {editing && editing.apellido === undefined && (
            <FieldDescription className="text-xs leading-4 text-zinc-500">
              Revisá la separación del nombre y el apellido antes de guardar.
            </FieldDescription>
          )}
          <Field className="gap-1.5">
            <FieldLabel htmlFor="person-contact" className="text-sm">
              Contacto
            </FieldLabel>
            <Input
              id="person-contact"
              className="bg-white"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
            />
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
        title="Eliminar responsable"
        description={
          deleteCount
            ? `Tiene ${deleteCount} tareas asignadas. Reasignalas o dejalas sin responsable antes de eliminarlo.`
            : `¿Eliminar a ${deleting ? nombreCompleto(deleting) : ''}?`
        }
        pending={pending}
        error={error}
        onClose={() => setDeleting(null)}
        onConfirm={deleteCount ? undefined : remove}
      />
      <AdminDialog
        open={!!viewing}
        title={`Tareas de ${viewing ? nombreCompleto(viewing) : ''}`}
        description={`${assigned.length} tareas asignadas`}
        onClose={cerrarConsulta}
      >
        {assigned.length ? (
          <ItemGroup
            render={<ul />}
            className="block max-h-80 gap-0 divide-y divide-zinc-100 overflow-auto"
          >
            {assigned.map((t) => (
              <Item render={<li />} key={t.id} className="block rounded-none border-0 px-0 py-3">
                <ItemContent className="block gap-0">
                  <ItemTitle className="block w-auto line-clamp-none text-sm leading-5">
                    {t.titulo}
                  </ItemTitle>
                  <ItemDescription className="mt-1 line-clamp-none text-xs leading-4 text-zinc-500">
                    {proyectos.find((p) => p.id === t.proyecto_id)?.nombre ??
                      'Proyecto no disponible'}{' '}
                    · {estados.find((e) => e.id === t.estado)?.nombre ?? 'Estado no disponible'}
                  </ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        ) : (
          <Empty className="block rounded-none p-0 text-left text-sm text-zinc-500">
            No tiene tareas asignadas.
          </Empty>
        )}
        <DialogFooter className="mt-5 flex justify-end flex-row">
          <Button variant="outline" onClick={cerrarConsulta}>
            Cerrar
          </Button>
        </DialogFooter>
      </AdminDialog>
    </>
  )
}
