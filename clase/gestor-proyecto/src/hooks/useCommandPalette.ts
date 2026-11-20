import { useEffect, useState } from 'react'
import { useCommandSearch, type CommandCategory } from './useCommandSearch'

// Abre y cierra la paleta con el atajo de teclado.
export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  const search = useCommandSearch()
  const { changeCategory } = search

  useEffect(() => {
    // Alterna la paleta si no hay otro diálogo abierto.
    function handleKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.altKey || event.shiftKey || event.isComposing || event.repeat) return
      if (
        !open &&
        document.querySelector(
          'dialog[open], [role="dialog"][data-state="open"], [role="dialog"][data-open]',
        )
      )
        return
      const key = event.key.toLowerCase()
      const categories: Record<string, CommandCategory> = {
        p: 'proyectos',
        t: 'tareas',
        r: 'responsables',
      }
      if (key !== 'k' && !categories[key]) return
      event.preventDefault()
      if (key === 'k') {
        if (!open) changeCategory(null)
        setOpen((current) => !current)
      } else {
        changeCategory(categories[key])
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, changeCategory])

  return { open, setOpen, search }
}
