import { useState } from 'react'
import type { EstadoTarea, Tarea } from '../data/types'
import type { WorkspaceState } from './useWorkspace'
// Coordina los diálogos y las acciones sobre tareas.
export function useTaskActions(workspace: WorkspaceState) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Tarea | null>(null)
  const [deleting, setDeletingState] = useState<Tarea | null>(null)
  const [actionError, setActionError] = useState('')
  const [deletingPending, setDeletingPending] = useState(false)
  // Selecciona la tarea a eliminar y limpia el error anterior.
  function setDeleting(task: Tarea | null) {
    setActionError('')
    setDeletingState(task)
  }
  // Abre el formulario para crear una tarea.
  function newTask() {
    setEditing(null)
    setOpen(true)
  }
  // Abre el formulario con la tarea seleccionada.
  function editTask(task: Tarea) {
    setEditing(task)
    setOpen(true)
  }
  // Guarda el nuevo estado y comunica los errores.
  async function changeStatus(id: string, estado: EstadoTarea) {
    try {
      setActionError('')
      await workspace.updateTarea(id, { estado })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'No se pudo cambiar el estado.')
    }
  }
  // Guarda el responsable de una tarea.
  async function assignResponsible(id: string, responsable_id: string | null) {
    try {
      setActionError('')
      await workspace.updateTarea(id, { responsable_id })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'No se pudo asignar el responsable.')
    }
  }
  // Elimina la tarea confirmada y comunica el resultado.
  async function deleteTask() {
    if (!deleting || deletingPending) return
    setDeletingPending(true)
    try {
      setActionError('')
      await workspace.deleteTarea(deleting.id)
      setDeleting(null)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'No se pudo eliminar la tarea.')
    } finally {
      setDeletingPending(false)
    }
  }
  return {
    open,
    setOpen,
    editing,
    deleting,
    setDeleting,
    actionError,
    setActionError,
    deletingPending,
    newTask,
    editTask,
    changeStatus,
    assignResponsible,
    deleteTask,
  }
}
