import { useRef } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/button'
import { Alert } from '../ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'

type Props = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}
// Abre un diálogo modal con título, descripción y contenido.
export function AdminDialog({ open, title, description, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Guarda desde un campo multilínea; Mayús+Enter conserva el salto de línea.
  function submitFromTextarea(event: KeyboardEvent<HTMLDivElement>) {
    if (!(event.target instanceof HTMLTextAreaElement) || event.key !== 'Enter') return
    if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return
    if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return
    const form = event.target.form
    const submitButton = form?.querySelector<HTMLButtonElement>(
      'button[type="submit"], button:not([type])',
    )
    if (!form || !submitButton || submitButton.disabled) return
    event.preventDefault()
    form.requestSubmit(submitButton)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        if (!next && details.reason !== 'outside-press') onClose()
      }}
    >
      <DialogContent
        ref={ref}
        showCloseButton={false}
        initialFocus={() =>
          ref.current?.querySelector<HTMLElement>(
            'form input:not([type="hidden"]):not([disabled]):not([readonly]), form textarea:not([disabled]), form select:not([disabled]), form [role="combobox"]:not([aria-disabled="true"])',
          ) ?? null
        }
        onKeyDown={submitFromTextarea}
        className="block max-h-[90vh] w-[min(30rem,calc(100%-2rem))] max-w-none overflow-auto rounded-xl border-zinc-200 bg-white p-6 text-zinc-950 shadow-xl sm:max-w-none"
      >
        <DialogHeader className="mb-5 flex-row items-start justify-between gap-4 text-left">
          <div>
            <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
            {description && (
              <DialogDescription className="mt-1 text-sm text-zinc-500">
                {description}
              </DialogDescription>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-zinc-500 hover:bg-zinc-100"
          >
            <X size={16} />
          </Button>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
// Muestra un mensaje de error cuando existe.
export function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <Alert variant="destructive" className="rounded-md border-0 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </Alert>
  ) : null
}
