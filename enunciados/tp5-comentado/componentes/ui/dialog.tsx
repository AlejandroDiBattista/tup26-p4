// ============================================================================
// ARCHIVO COMENTADO LÍNEA POR LÍNEA PARA ESTUDIO Y DEFENSA DEL SEGUNDO PARCIAL
// ============================================================================
// [Línea 1] Directiva de Next.js: marca este archivo como Client Component (se ejecuta en el navegador con estado e interactividad).
"use client";
// Componente Dialog de shadcn/ui construido sobre @base-ui/react/dialog.
// [Línea 3] Importa elementos desde 'react'.
import * as React from "react";
// [Línea 4] Importa elementos desde '@base-ui/react/dialog'.
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
// [Línea 5] Importa elementos desde 'lucide-react'.
import { X } from "lucide-react";
// [Línea 6] Importa elementos desde '@/lib/utils'.
import { cn } from "@/lib/utils";

// [Línea 8] Declara 'Dialog' y le asigna el valor resultante.
const Dialog = DialogPrimitive.Root;
// [Línea 9] Declara 'DialogTrigger' y le asigna el valor resultante.
const DialogTrigger = DialogPrimitive.Trigger;
// [Línea 10] Declara 'DialogPortal' y le asigna el valor resultante.
const DialogPortal = DialogPrimitive.Portal;
// [Línea 11] Declara 'DialogClose' y le asigna el valor resultante.
const DialogClose = DialogPrimitive.Close;

// [Línea 13] Declara la función o componente 'DialogOverlay'.
function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  // [Línea 14] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <DialogPrimitive.Backdrop // [Línea 15] Abre o renderiza el componente visual <DialogPrimitive.Backdrop>.
      // [Línea 16] Ejecuta o evalúa: data-slot="dialog-overlay"
      data-slot="dialog-overlay"
      // [Línea 17] Ejecuta o evalúa: className={cn("fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[1px]", classNam
      className={cn("fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-[1px]", className)}
      // [Línea 18] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 19] Ejecuta o evalúa: />
    />
  // [Línea 20] Cierra el bloque o estructura ();).
  );
// [Línea 21] Cierra el bloque o estructura (}).
}

// [Línea 23] Declara la función o componente 'DialogContent'.
function DialogContent({
  // [Línea 24] Ejecuta o evalúa: className,
  className,
  // [Línea 25] Ejecuta o evalúa: children,
  children,
  // [Línea 26] Ejecuta o evalúa: showCloseButton = true,
  showCloseButton = true,
  // [Línea 27] Ejecuta o evalúa: ...props
  ...props
// [Línea 28] Ejecuta o evalúa: }: DialogPrimitive.Popup.Props & { showCloseButton?: boolean }) {
}: DialogPrimitive.Popup.Props & { showCloseButton?: boolean }) {
  // [Línea 29] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <DialogPortal> // [Línea 30] Abre o renderiza el componente visual <DialogPortal>.
      <DialogOverlay /> // [Línea 31] Abre o renderiza el componente visual <DialogOverlay>.
      <DialogPrimitive.Popup // [Línea 32] Abre o renderiza el componente visual <DialogPrimitive.Popup>.
        // [Línea 33] Ejecuta o evalúa: data-slot="dialog-content"
        data-slot="dialog-content"
        // [Línea 34] Ejecuta o evalúa: className={cn(
        className={cn(
          // [Línea 35] Ejecuta o evalúa: "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] max-h-[90vh] ov
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-6 shadow-xl outline-none sm:max-w-lg",
          // [Línea 36] Ejecuta o evalúa: className,
          className,
        // [Línea 37] Ejecuta o evalúa: )}
        )}
        // [Línea 38] Ejecuta o evalúa: {...props}
        {...props}
      // [Línea 39] Ejecuta o evalúa: >
      >
        // [Línea 40] Ejecuta o evalúa: {children}
        {children}
        // [Línea 41] Ejecuta o evalúa: {showCloseButton && (
        {showCloseButton && (
          <DialogPrimitive.Close // [Línea 42] Abre o renderiza el componente visual <DialogPrimitive.Close>.
            // [Línea 43] Ejecuta o evalúa: aria-label="Cerrar"
            aria-label="Cerrar"
            // [Línea 44] Ejecuta o evalúa: className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground hover:bg-
            className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
          // [Línea 45] Ejecuta o evalúa: >
          >
            <X className="size-4" /> // [Línea 46] Abre o renderiza el componente visual <X>.
          </DialogPrimitive.Close> // [Línea 47] Cierra el componente visual </DialogPrimitive.Close>.
        // [Línea 48] Ejecuta o evalúa: )}
        )}
      </DialogPrimitive.Popup> // [Línea 49] Cierra el componente visual </DialogPrimitive.Popup>.
    </DialogPortal> // [Línea 50] Cierra el componente visual </DialogPortal>.
  // [Línea 51] Cierra el bloque o estructura ();).
  );
// [Línea 52] Cierra el bloque o estructura (}).
}

// [Línea 54] Declara la función o componente 'DialogHeader'.
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  // [Línea 55] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <div data-slot="dialog-header" className={cn("flex flex-col gap-1.5", className)} {...props} /> // [Línea 56] Abre o renderiza el componente visual <div>.
  // [Línea 57] Cierra el bloque o estructura ();).
  );
// [Línea 58] Cierra el bloque o estructura (}).
}

// [Línea 60] Declara la función o componente 'DialogTitle'.
function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  // [Línea 61] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <DialogPrimitive.Title // [Línea 62] Abre o renderiza el componente visual <DialogPrimitive.Title>.
      // [Línea 63] Ejecuta o evalúa: data-slot="dialog-title"
      data-slot="dialog-title"
      // [Línea 64] Ejecuta o evalúa: className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      // [Línea 65] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 66] Ejecuta o evalúa: />
    />
  // [Línea 67] Cierra el bloque o estructura ();).
  );
// [Línea 68] Cierra el bloque o estructura (}).
}

// [Línea 70] Declara la función o componente 'DialogDescription'.
function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  // [Línea 71] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <DialogPrimitive.Description // [Línea 72] Abre o renderiza el componente visual <DialogPrimitive.Description>.
      // [Línea 73] Ejecuta o evalúa: data-slot="dialog-description"
      data-slot="dialog-description"
      // [Línea 74] Ejecuta o evalúa: className={cn("text-sm text-muted-foreground", className)}
      className={cn("text-sm text-muted-foreground", className)}
      // [Línea 75] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 76] Ejecuta o evalúa: />
    />
  // [Línea 77] Cierra el bloque o estructura ();).
  );
// [Línea 78] Cierra el bloque o estructura (}).
}

// [Línea 80] Declara la función o componente 'DialogFooter'.
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  // [Línea 81] Devuelve la interfaz JSX que renderiza este componente.
  return (
    <div // [Línea 82] Abre o renderiza el componente visual <div>.
      // [Línea 83] Ejecuta o evalúa: data-slot="dialog-footer"
      data-slot="dialog-footer"
      // [Línea 84] Ejecuta o evalúa: className={cn("flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end", cla
      className={cn("flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end", className)}
      // [Línea 85] Ejecuta o evalúa: {...props}
      {...props}
    // [Línea 86] Ejecuta o evalúa: />
    />
  // [Línea 87] Cierra el bloque o estructura ();).
  );
// [Línea 88] Cierra el bloque o estructura (}).
}

// [Línea 90] Ejecuta o evalúa: export {
export {
  // [Línea 91] Ejecuta o evalúa: Dialog,
  Dialog,
  // [Línea 92] Ejecuta o evalúa: DialogTrigger,
  DialogTrigger,
  // [Línea 93] Ejecuta o evalúa: DialogClose,
  DialogClose,
  // [Línea 94] Ejecuta o evalúa: DialogContent,
  DialogContent,
  // [Línea 95] Ejecuta o evalúa: DialogHeader,
  DialogHeader,
  // [Línea 96] Ejecuta o evalúa: DialogTitle,
  DialogTitle,
  // [Línea 97] Ejecuta o evalúa: DialogDescription,
  DialogDescription,
  // [Línea 98] Ejecuta o evalúa: DialogFooter,
  DialogFooter,
// [Línea 99] Cierra el bloque o estructura (};).
};
