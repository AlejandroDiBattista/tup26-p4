import { Button } from '../ui/button'
import { Kbd } from '../ui/kbd'
import { Empty } from '../ui/empty'
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxItem,
} from '../ui/combobox'
import { InputGroupAddon } from '../ui/input-group'
import {
  ArrowLeft,
  CheckSquare2,
  ChevronRight,
  FolderKanban,
  Plus,
  Search,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useRef } from 'react'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import type { Estado, Proyecto, Responsable, Tarea } from '../../data/types'
import { nombreCompleto } from '../../data/responsables'
import type { useCommandSearch, CommandCategory } from '../../hooks/useCommandSearch'
import { runPageCommand, type PageCommand } from '../../hooks/usePageCommand'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'
import { links } from './navigation'

const categoryLabels: Record<CommandCategory, string> = {
  proyectos: 'Proyectos',
  tareas: 'Tareas',
  responsables: 'Responsables',
}

type Opcion = {
  id: string
  texto: string
  busqueda: string
  detalle?: string
  icono?: LucideIcon
  atajo?: string
  seleccionar: () => void
}
type Grupo = { titulo: string; opciones: Opcion[] }

// Compara textos sin distinguir mayúsculas ni tildes.
function coincide(texto: string, consulta: string) {
  const normalizar = (valor: string) =>
    valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
  return normalizar(texto).includes(normalizar(consulta))
}

// Muestra una paleta de navegación con búsqueda por categoría.
export function CommandPalette({
  open,
  onOpenChange,
  proyectos,
  tareas,
  responsables,
  estados,
  modifier,
  search,
  loaded,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  proyectos: Proyecto[]
  tareas: Tarea[]
  responsables: Responsable[]
  estados: Estado[]
  modifier: string
  search: ReturnType<typeof useCommandSearch>
  loaded: boolean
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef<HTMLInputElement>(null)
  const nombreCategoria = search.category ? categoryLabels[search.category] : ''
  const projectId = matchPath('/proyectos/:id', location.pathname)?.params.id
  const proyectoValido = projectId ? proyectos.some((project) => project.id === projectId) : false
  const accion: { id: PageCommand; nombre: string } | null = !loaded
    ? null
    : location.pathname === '/proyectos'
      ? { id: 'crear-proyecto', nombre: 'Crear proyecto' }
      : location.pathname === '/responsables'
        ? { id: 'crear-responsable', nombre: 'Crear responsable' }
        : location.pathname === '/' || location.pathname === '/tareas' || proyectoValido
          ? { id: 'crear-tarea', nombre: 'Crear tarea' }
          : null
  const categoriaAccion: Record<PageCommand, CommandCategory> = {
    'crear-proyecto': 'proyectos',
    'crear-tarea': 'tareas',
    'crear-responsable': 'responsables',
  }

  // Cierra la paleta y abre el destino seleccionado.
  function abrirDestino(ruta: string) {
    onOpenChange(false)
    navigate(ruta)
  }
  // Ejecuta una acción de la pantalla desde la que se abrió la paleta.
  function ejecutarAccion(comando: PageCommand) {
    onOpenChange(false)
    runPageCommand(comando)
  }
  // Cambia la categoría y devuelve el foco a la búsqueda.
  function cambiarCategoria(categoria: CommandCategory | null) {
    search.changeCategory(categoria)
    inputRef.current?.focus()
  }
  // Abre una categoría o navega directamente a una sección.
  function elegirSeccion(ruta: string) {
    const categoria = ruta.slice(1)
    if (categoria === 'proyectos' || categoria === 'tareas' || categoria === 'responsables')
      cambiarCategoria(categoria)
    else abrirDestino(ruta)
  }

  const grupos: Grupo[] = []
  const opcionAccion: Opcion | null = accion
    ? {
        id: `accion:${accion.id}`,
        texto: accion.nombre,
        busqueda: accion.nombre,
        icono: Plus,
        seleccionar: () => ejecutarAccion(accion.id),
      }
    : null
  if (!search.category) {
    if (opcionAccion) grupos.push({ titulo: 'Acciones en esta pantalla', opciones: [opcionAccion] })
    grupos.push({
      titulo: 'Secciones',
      opciones: links.map(({ label, to, icon, shortcut }) => ({
        id: `seccion:${to}`,
        texto: label,
        busqueda: label,
        icono: icon,
        atajo: shortcut,
        seleccionar: () => elegirSeccion(to),
      })),
    })
  }
  if (search.category === 'proyectos')
    grupos.push({
      titulo: 'Proyectos',
      opciones: [
        ...proyectos.map((p) => ({
          id: `proyecto:${p.id}`,
          texto: p.nombre,
          busqueda: `proyecto ${p.id} ${p.nombre} ${p.descripcion}`,
          icono: FolderKanban,
          seleccionar: () => abrirDestino(`/proyectos/${encodeURIComponent(p.id)}`),
        })),
        ...(!search.query
          ? [
              {
                id: 'todos:proyectos',
                texto: 'Ver todos los proyectos',
                busqueda: 'ver todos los proyectos',
                seleccionar: () => abrirDestino('/proyectos'),
              },
            ]
          : []),
      ],
    })
  if (search.category === 'tareas')
    grupos.push({
      titulo: 'Tareas',
      opciones: [
        ...tareas.map((t) => {
          const proyecto =
            proyectos.find((p) => p.id === t.proyecto_id)?.nombre ?? 'Proyecto no disponible'
          const estado = estados.find((e) => e.id === t.estado)?.nombre ?? t.estado
          return {
            id: `tarea:${t.id}`,
            texto: t.titulo,
            detalle: `${proyecto} · ${estado}`,
            busqueda: `tarea ${t.id} ${t.titulo} ${proyecto} ${estado}`,
            icono: CheckSquare2,
            seleccionar: () => abrirDestino(`/tareas?tarea=${encodeURIComponent(t.id)}`),
          }
        }),
        ...(!search.query
          ? [
              {
                id: 'todos:tareas',
                texto: 'Ver todas las tareas',
                busqueda: 'ver todas las tareas',
                seleccionar: () => abrirDestino('/tareas'),
              },
            ]
          : []),
      ],
    })
  if (search.category === 'responsables')
    grupos.push({
      titulo: 'Responsables',
      opciones: [
        ...responsables.map((p) => ({
          id: `responsable:${p.id}`,
          texto: nombreCompleto(p),
          busqueda: `responsable ${p.id} ${nombreCompleto(p)} ${p.contacto}`,
          icono: Users,
          seleccionar: () => abrirDestino(`/responsables?responsable=${encodeURIComponent(p.id)}`),
        })),
        ...(!search.query
          ? [
              {
                id: 'todos:responsables',
                texto: 'Ver todos los responsables',
                busqueda: 'ver todos los responsables',
                seleccionar: () => abrirDestino('/responsables'),
              },
            ]
          : []),
      ],
    })
  if (accion && opcionAccion && search.category === categoriaAccion[accion.id])
    grupos.push({ titulo: 'Acciones en esta pantalla', opciones: [opcionAccion] })
  const opciones = grupos.flatMap((grupo) => grupo.opciones)
  const visibles = grupos
    .map((grupo) => ({
      ...grupo,
      opciones: grupo.opciones.filter((opcion) => coincide(opcion.busqueda, search.query)),
    }))
    .filter((grupo) => grupo.opciones.length > 0)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen && details.reason === 'escape-key' && search.category) {
          cambiarCategoria(null)
          return
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-[25rem] gap-0 rounded-2xl border-zinc-300 bg-white p-2 shadow-[0_16px_48px_-12px_rgb(24_24_27_/_0.24),0_4px_12px_-4px_rgb(24_24_27_/_0.12)] sm:max-w-[25rem]"
      >
        <DialogTitle className="sr-only">Buscar en Trama</DialogTitle>
        <DialogDescription className="sr-only">
          Elegí una categoría y buscá un elemento. Usá las flechas y Enter para abrirlo.
        </DialogDescription>
        {search.category && (
          <div className="flex items-center gap-2 px-1 pb-2 text-xs text-zinc-600">
            <Button
              variant="ghost"
              type="button"
              aria-label="Volver a las secciones"
              onClick={() => cambiarCategoria(null)}
              className="h-auto rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </Button>
            <span>Buscar en</span>
            <strong className="font-semibold text-zinc-900">{nombreCategoria}</strong>
          </div>
        )}
        <Combobox
          inline
          open
          autoHighlight
          items={opciones.map((opcion) => opcion.id)}
          filteredItems={visibles.flatMap((grupo) => grupo.opciones.map((opcion) => opcion.id))}
          value={null}
          inputValue={search.query}
          onInputValueChange={(value, details) => {
            if (!details.isItemPress) search.setQuery(value)
          }}
          onValueChange={(id) => {
            opciones.find((opcion) => opcion.id === id)?.seleccionar()
          }}
        >
          <div
            className="command-palette rounded-lg"
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && !search.query && search.category) {
                event.preventDefault()
                cambiarCategoria(null)
              }
              if (
                event.key === 'Enter' &&
                !event.nativeEvent.isComposing &&
                !inputRef.current?.getAttribute('aria-activedescendant') &&
                visibles[0]?.opciones[0]
              ) {
                event.preventDefault()
                visibles[0].opciones[0].seleccionar()
              }
            }}
          >
            <ComboboxInput
              ref={inputRef}
              autoFocus
              aria-label="Buscar en Trama"
              data-slot="command-input"
              showTrigger={false}
              placeholder={
                search.category
                  ? `Buscar ${nombreCategoria.toLocaleLowerCase('es')}...`
                  : 'Buscar una sección...'
              }
              className="h-10 w-full rounded-full border-zinc-100 bg-zinc-50 px-0 shadow-none [&>[data-align=inline-end]]:hidden"
            >
              <InputGroupAddon className="text-zinc-500">
                <Search size={16} aria-hidden="true" />
              </InputGroupAddon>
            </ComboboxInput>
            <ComboboxList className="command-palette-list max-h-[min(22rem,60vh)] scroll-py-1 overflow-y-auto p-0 pt-1">
              {visibles.map((grupo) => (
                <ComboboxGroup key={grupo.titulo} className="overflow-hidden p-1">
                  <ComboboxLabel className="px-2 py-1.5 text-xs font-medium text-zinc-500">
                    {grupo.titulo}
                  </ComboboxLabel>
                  {grupo.opciones.map((opcion) => {
                    const Icono = opcion.icono
                    return (
                      <ComboboxItem
                        key={opcion.id}
                        value={opcion.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm outline-none select-none data-[highlighted]:bg-zinc-100"
                      >
                        {Icono && (
                          <Icono size={16} className="shrink-0 text-zinc-500" aria-hidden="true" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{opcion.texto}</span>
                          {opcion.detalle && (
                            <span className="block truncate text-xs text-zinc-500">
                              {opcion.detalle}
                            </span>
                          )}
                        </span>
                        {opcion.atajo && (
                          <>
                            <Kbd className="h-auto min-w-0 rounded-none bg-transparent p-0 font-normal text-xs text-zinc-500">
                              {modifier} {opcion.atajo}
                            </Kbd>
                            <ChevronRight size={15} aria-hidden="true" />
                          </>
                        )}
                      </ComboboxItem>
                    )
                  })}
                </ComboboxGroup>
              ))}
              {visibles.length === 0 && (
                <Empty
                  role="status"
                  className="block rounded-none px-3 py-8 text-center text-sm text-zinc-600"
                >
                  No se encontraron resultados.
                </Empty>
              )}
            </ComboboxList>
          </div>
        </Combobox>
      </DialogContent>
    </Dialog>
  )
}
