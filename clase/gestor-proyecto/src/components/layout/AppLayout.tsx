import { Button } from '../ui/button'
import { Kbd } from '../ui/kbd'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '../ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb'
import { Sparkles, Search } from 'lucide-react'
import { NavLink, Outlet, useLocation, matchPath } from 'react-router-dom'
import type { Estado, Proyecto, Responsable, Tarea } from '../../data/types'
import { useCommandPalette } from '../../hooks/useCommandPalette'
import { CommandPalette } from './CommandPalette'
import { links, shortcutModifier } from './navigation'
import { FloatingAssistant } from '../assistant/FloatingAssistant'

// Muestra la navegación y el contenido de la ruta actual.
export function AppLayout({
  proyectos,
  tareas,
  responsables,
  estados,
  loaded,
  actualizar,
}: {
  proyectos: Proyecto[]
  tareas: Tarea[]
  responsables: Responsable[]
  estados: Estado[]
  loaded: boolean
  actualizar: () => Promise<unknown>
}) {
  const location = useLocation()
  const command = useCommandPalette()
  const modifier = shortcutModifier()
  const title = location.pathname.startsWith('/proyectos/')
    ? 'Detalle del proyecto'
    : (links.find((l) => l.to === location.pathname)?.label ?? 'Espacio de trabajo')
  return (
    <SidebarProvider
      enableShortcut={false}
      className="block min-h-screen lg:grid lg:grid-cols-[240px_minmax(0,1fr)]"
    >
      <Sidebar
        as="aside"
        collapsible="none"
        className="h-auto w-full block border-b border-border bg-white px-4 py-4 text-foreground lg:flex lg:min-h-screen lg:flex-col lg:border-r lg:border-b-0 lg:py-6"
      >
        <SidebarHeader className="flex-row items-center gap-2.5 px-2 py-0">
          <div className="grid size-9 place-items-center rounded-lg bg-zinc-900 text-white">
            <Sparkles size={19} />
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-tight">trama</div>
            <div className="text-[11px] text-muted-foreground">Gestión de proyectos</div>
          </div>
        </SidebarHeader>
        <Button
          variant="ghost"
          type="button"
          onClick={() => {
            command.search.changeCategory(null)
            command.setOpen(true)
          }}
          className="mt-5 flex w-full items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-50"
          aria-label="Abrir búsqueda de navegación"
        >
          <Search size={16} aria-hidden="true" />
          <span>Buscar</span>
          <Kbd className="ml-auto h-auto min-w-0 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-xs text-zinc-500">
            {modifier} K
          </Kbd>
        </Button>
        <SidebarGroupLabel
          render={<p />}
          className="mb-2 mt-8 hidden h-auto rounded-none px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 lg:block"
        >
          Espacio de trabajo
        </SidebarGroupLabel>
        <nav
          aria-label="Navegación principal"
          className="mt-4 flex gap-1 overflow-x-auto lg:mt-0 lg:flex-col"
        >
          <SidebarMenu className="w-auto flex-row gap-1 lg:w-full lg:flex-col">
            {links.map(({ to, label, icon: Icon, end, shortcut }) => {
              const active = Boolean(matchPath({ path: to, end }, location.pathname))
              return (
                <SidebarMenuItem key={to} className="shrink-0">
                  <SidebarMenuButton
                    render={<NavLink to={to} end={end} />}
                    isActive={active}
                    className={`h-auto w-full shrink-0 gap-3 px-3 py-2.5 text-sm font-medium [&_svg]:size-[17px] ${active ? 'bg-zinc-100 text-zinc-950 data-active:bg-zinc-100 data-active:text-zinc-950' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-600'}`}
                  >
                    <Icon size={17} />
                    {label}
                    {shortcut && (
                      <Kbd
                        className="ml-auto hidden h-auto min-w-0 whitespace-nowrap rounded-none bg-transparent p-0 text-[11px] font-normal text-zinc-500 lg:block"
                        aria-label={`${modifier === '⌘' ? 'Comando' : 'Control'} ${shortcut}`}
                      >
                        {modifier} {shortcut}
                      </Kbd>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </nav>
        <SidebarFooter className="mt-auto hidden border-t px-0 pb-0 pt-4 text-xs text-muted-foreground lg:block">
          Organizá tu trabajo en un solo lugar.
        </SidebarFooter>
      </Sidebar>
      <div className="min-w-0">
        <header className="hidden h-16 items-center border-b bg-white px-9 text-sm text-muted-foreground lg:flex">
          <Breadcrumb aria-label="Ubicación actual">
            <BreadcrumbList className="gap-0">
              <BreadcrumbItem>Espacio de trabajo</BreadcrumbItem>
              <BreadcrumbSeparator className="mx-3 text-zinc-300">/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-zinc-700">{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-7 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
      {command.open && (
        <CommandPalette
          open={command.open}
          onOpenChange={command.setOpen}
          proyectos={proyectos}
          tareas={tareas}
          responsables={responsables}
          estados={estados}
          modifier={modifier}
          search={command.search}
          loaded={loaded}
        />
      )}
      <FloatingAssistant actualizar={actualizar} />
    </SidebarProvider>
  )
}
