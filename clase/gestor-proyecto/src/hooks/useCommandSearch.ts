import { useCallback, useState } from 'react'

export type CommandCategory = 'proyectos' | 'tareas' | 'responsables'

// Controla el nivel y el texto de búsqueda de la paleta.
export function useCommandSearch() {
  const [category, setCategory] = useState<CommandCategory | null>(null)
  const [query, setQuery] = useState('')

  // Cambia de nivel y limpia la búsqueda anterior.
  const changeCategory = useCallback((next: CommandCategory | null) => {
    setQuery('')
    setCategory(next)
  }, [])

  return { category, query, setQuery, changeCategory }
}
