import type { ReactNode } from 'react'
import { Info, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { ErrorMessage } from './AdminDialog'

type Props = {
  open: boolean
  title: string
  description: string
  pending: boolean
  error: string
  onClose: () => void
  onConfirm?: () => void | Promise<void>
  children?: ReactNode
}

// Confirma eliminaciones y mantiene el diálogo abierto si el guardado falla.
export function ConfirmDialog({
  open,
  title,
  description,
  pending,
  error,
  onClose,
  onConfirm,
  children,
}: Props) {
  const Icon = onConfirm ? Trash2 : Info

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !pending) onClose()
      }}
    >
      <AlertDialogContent className="w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto shadow-xl">
        <AlertDialogHeader>
          <AlertDialogMedia className={onConfirm ? 'bg-red-50 text-red-700' : undefined}>
            <Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <ErrorMessage message={error} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {onConfirm ? 'Cancelar' : 'Entendido'}
          </AlertDialogCancel>
          {onConfirm && (
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={() => void onConfirm()}
            >
              {pending ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
