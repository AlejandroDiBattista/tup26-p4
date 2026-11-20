import { useEffect, type RefObject } from 'react'
import { shortcutModifier } from '../components/layout/navigation'

// Abre el asistente sin interrumpir la selección de texto en campos editables.
export function useAssistantShortcut(
  abrir: () => void,
  campo: RefObject<HTMLTextAreaElement | null>,
) {
  useEffect(() => {
    function manejarAtajo(event: KeyboardEvent) {
      const modificador = shortcutModifier() === '⌘' ? event.metaKey : event.ctrlKey
      if (!modificador || event.altKey || event.shiftKey || event.isComposing || event.repeat)
        return
      if (event.key.toLowerCase() !== 'a') return
      if (
        document.querySelector(
          'dialog[open], [role="dialog"][data-state="open"], [role="dialog"][data-open]',
        )
      )
        return

      const origen = event.target
      if (origen instanceof HTMLElement) {
        const editable = origen.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
        )
        const busquedaVacia =
          editable instanceof HTMLInputElement && editable.type === 'search' && !editable.value
        if (editable && !busquedaVacia) return
      }
      event.preventDefault()
      abrir()
      requestAnimationFrame(() => campo.current?.focus())
    }

    document.addEventListener('keydown', manejarAtajo)
    return () => document.removeEventListener('keydown', manejarAtajo)
  }, [abrir, campo])
}
