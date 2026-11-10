import { CheckSquare2, FolderKanban, LayoutDashboard, SlidersHorizontal, Users } from 'lucide-react'

// Elige la tecla modificadora que corresponde al dispositivo.
export function shortcutModifier() {
  if (typeof navigator === 'undefined') return 'Ctrl'
  const platform = navigator.platform || navigator.userAgent
  return /Mac|iPhone|iPad|iPod/i.test(platform) ? '⌘' : 'Ctrl'
}

// Centraliza las secciones y sus atajos para la navegación y la paleta.
export const links = [
  { to: '/', label: 'Panel general', icon: LayoutDashboard, end: true, shortcut: undefined },
  { to: '/proyectos', label: 'Proyectos', icon: FolderKanban, end: false, shortcut: 'P' },
  { to: '/tareas', label: 'Tareas', icon: CheckSquare2, end: false, shortcut: 'T' },
  { to: '/responsables', label: 'Responsables', icon: Users, end: false, shortcut: 'R' },
  { to: '/estados', label: 'Estados', icon: SlidersHorizontal, end: false, shortcut: undefined },
]
