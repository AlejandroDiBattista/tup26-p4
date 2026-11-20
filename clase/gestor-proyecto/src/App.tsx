import { Plus, RefreshCw } from 'lucide-react'
import { Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useWorkspace, type WorkspaceState } from './hooks/useWorkspace'
import { useTaskActions } from './hooks/useTaskActions'
import { usePageCommand } from './hooks/usePageCommand'
import { AppLayout } from './components/layout/AppLayout'
import { TaskFormDialog } from './components/admin'
import { KanbanBoard } from './components/kanban/KanbanBoard'
import { Button } from './components/ui/button'
import { ConfirmDialog } from './components/admin/ConfirmDialog'
import { Card, CardTitle, CardDescription } from './components/ui/card'
import { Alert, AlertDescription } from './components/ui/alert'
import { ProjectsAdmin } from './components/admin/ProjectsAdmin'
import { ResponsiblesAdmin } from './components/admin/ResponsiblesAdmin'
import { EstadosAdmin } from './components/admin/EstadosAdmin'

// Muestra el título y la acción principal de una pantalla.
function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: () => void
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      {action && (
        <Button onClick={action}>
          <Plus size={16} /> Nueva tarea
        </Button>
      )}
    </div>
  )
}
// Presenta el tablero de tareas y sus diálogos.
function TaskPage({ workspace, scoped = false }: { workspace: WorkspaceState; scoped?: boolean }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const actions = useTaskActions(workspace)
  usePageCommand('crear-tarea', actions.newTask)
  const tareaSeleccionada = workspace.tareas.find((tarea) => tarea.id === searchParams.get('tarea'))
  const project = scoped ? workspace.proyectos.find((p) => p.id === id) : undefined
  if (scoped && !project)
    return (
      <div>
        <PageHeader
          title="Proyecto no encontrado"
          description="El proyecto no existe o fue eliminado."
        />
        <Button variant="outline" onClick={() => navigate('/proyectos')}>
          Volver a proyectos
        </Button>
      </div>
    )
  return (
    <>
      {scoped && (
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/proyectos')}>
            ← Volver a proyectos
          </Button>
        </div>
      )}
      <PageHeader
        title={project?.nombre ?? 'Panel de tareas'}
        description={
          project?.descripcion ||
          (scoped
            ? 'Tareas del proyecto'
            : 'Consultá y administrá las tareas de todos tus proyectos.')
        }
        action={actions.newTask}
      />
      {actions.actionError && (
        <Alert className="mb-4 block rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {actions.actionError}
        </Alert>
      )}
      <KanbanBoard
        estados={workspace.estados}
        tareas={workspace.tareas}
        proyectos={workspace.proyectos}
        responsables={workspace.responsables}
        proyectoId={project?.id}
        onCambiarEstado={actions.changeStatus}
        onAsignarResponsable={actions.assignResponsible}
        onEditar={actions.editTask}
        onEliminar={actions.setDeleting}
      />
      <TaskFormDialog
        estados={workspace.estados}
        open={actions.open || Boolean(tareaSeleccionada)}
        onOpenChange={(open) => {
          actions.setOpen(open)
          if (!open && searchParams.has('tarea')) {
            const next = new URLSearchParams(searchParams)
            next.delete('tarea')
            setSearchParams(next, { replace: true })
          }
        }}
        task={actions.open ? actions.editing : tareaSeleccionada}
        proyectos={workspace.proyectos}
        responsables={workspace.responsables}
        defaultProjectId={project?.id}
        onCreate={workspace.createTarea}
        onUpdate={workspace.updateTarea}
      />
      <ConfirmDialog
        open={!!actions.deleting}
        title="Eliminar tarea"
        description="¿Querés eliminar esta tarea?"
        pending={actions.deletingPending}
        error={actions.actionError}
        onClose={() => actions.setDeleting(null)}
        onConfirm={() => actions.deleteTask()}
      >
        {actions.deleting && (
          <Card className="block gap-0 rounded-lg border bg-zinc-50 px-4 py-3 shadow-none">
            <CardTitle className="break-words text-sm font-semibold leading-5 text-zinc-950">
              {actions.deleting.titulo}
            </CardTitle>
            <CardDescription as="p" className="mt-1 text-xs text-zinc-600">
              {workspace.proyectos.find((p) => p.id === actions.deleting?.proyecto_id)?.nombre ??
                'Proyecto no disponible'}
            </CardDescription>
          </Card>
        )}
      </ConfirmDialog>
    </>
  )
}
// Conecta la administración de proyectos con la navegación.
function ProjectsPage({ workspace }: { workspace: WorkspaceState }) {
  const navigate = useNavigate()
  return (
    <>
      <ProjectsAdmin
        estados={workspace.estados}
        proyectos={workspace.proyectos}
        tareas={workspace.tareas}
        onCreate={workspace.createProyecto}
        onUpdate={workspace.updateProyecto}
        onDelete={workspace.deleteProyecto}
        onOpen={(id) => navigate(`/proyectos/${encodeURIComponent(id)}`)}
      />
    </>
  )
}
// Conecta la administración de responsables con los datos.
function ResponsiblesPage({ workspace }: { workspace: WorkspaceState }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const seleccionado = workspace.responsables.find(
    (person) => person.id === searchParams.get('responsable'),
  )
  return (
    <>
      <ResponsiblesAdmin
        estados={workspace.estados}
        responsables={workspace.responsables}
        tareas={workspace.tareas}
        proyectos={workspace.proyectos}
        onCreate={workspace.createResponsable}
        onUpdate={workspace.updateResponsable}
        onDelete={workspace.deleteResponsable}
        seleccionado={seleccionado}
        onCloseSeleccionado={() => {
          const next = new URLSearchParams(searchParams)
          next.delete('responsable')
          setSearchParams(next, { replace: true })
        }}
      />
    </>
  )
}
// Carga los datos y organiza las rutas de la aplicación.
export default function App() {
  const workspace = useWorkspace()
  return (
    <Routes>
      <Route
        element={
          <AppLayout
            loaded={workspace.loaded}
            actualizar={workspace.refresh}
            proyectos={workspace.proyectos}
            tareas={workspace.tareas}
            responsables={workspace.responsables}
            estados={workspace.estados}
          />
        }
      >
        <Route
          path="*"
          element={
            workspace.loading ? (
              <p role="status" className="text-muted-foreground">
                Cargando proyectos y tareas…
              </p>
            ) : workspace.error && !workspace.loaded ? (
              <Alert className="block rounded-lg border bg-white p-6">
                <h1 className="font-semibold">No se pudieron cargar los datos</h1>
                <AlertDescription className="mt-2 text-sm text-wrap text-muted-foreground md:text-wrap">
                  {workspace.error} Comprobá que JSON Server esté en funcionamiento.
                </AlertDescription>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => void workspace.refresh().catch(() => {})}
                >
                  <RefreshCw size={16} /> Reintentar
                </Button>
              </Alert>
            ) : (
              <>
                {workspace.error && (
                  <Alert className="mb-5 block rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {workspace.error}
                  </Alert>
                )}
                {workspace.saving && (
                  <p role="status" className="mb-3 text-xs text-muted-foreground">
                    Guardando cambios…
                  </p>
                )}
                <Routes>
                  <Route path="/" element={<TaskPage workspace={workspace} />} />
                  <Route path="/tareas" element={<TaskPage workspace={workspace} />} />
                  <Route path="/proyectos" element={<ProjectsPage workspace={workspace} />} />
                  <Route
                    path="/proyectos/:id"
                    element={<TaskPage workspace={workspace} scoped />}
                  />
                  <Route
                    path="/responsables"
                    element={<ResponsiblesPage workspace={workspace} />}
                  />
                  <Route
                    path="/estados"
                    element={
                      <EstadosAdmin
                        estados={workspace.estados}
                        tareas={workspace.tareas}
                        onSave={workspace.guardarEstados}
                      />
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </>
            )
          }
        />
      </Route>
    </Routes>
  )
}
