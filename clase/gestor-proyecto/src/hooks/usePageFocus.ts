import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Enfoca el campo principal al entrar a una pantalla sin interrumpir diálogos.
export function usePageFocus() {
  const ref = useRef<HTMLInputElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!document.querySelector('dialog[open], [role="dialog"][data-state="open"]')) {
        ref.current?.focus({ preventScroll: true })
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return ref
}
