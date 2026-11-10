import { useEffect, useRef } from 'react'

export type PageCommand = 'crear-proyecto' | 'crear-tarea' | 'crear-responsable'
const eventName = 'trama:accion-pagina'

// Solicita que la pantalla activa ejecute una acción de la paleta.
export function runPageCommand(command: PageCommand) {
  window.dispatchEvent(new CustomEvent<PageCommand>(eventName, { detail: command }))
}

// Conecta una acción de la pantalla con la paleta de comandos.
export function usePageCommand(command: PageCommand, handler: () => void) {
  const currentHandler = useRef(handler)
  currentHandler.current = handler

  useEffect(() => {
    // Ejecuta únicamente la acción registrada por esta pantalla.
    function handleCommand(event: Event) {
      if ((event as CustomEvent<PageCommand>).detail === command) currentHandler.current()
    }

    window.addEventListener(eventName, handleCommand)
    return () => window.removeEventListener(eventName, handleCommand)
  }, [command])
}
