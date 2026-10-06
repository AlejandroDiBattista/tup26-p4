import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string;
  /** Se llama sólo cuando el valor cambió de verdad. */
  onSave: (next: string) => void;
  /** Nombre del campo para lectores de pantalla, p. ej. "Nombre". */
  label: string;
  placeholder?: string;
  /** Texto que se muestra cuando el valor está vacío. */
  emptyText?: string;
  /** Si es true, no acepta guardar vacío. */
  required?: boolean;
  className?: string;
  /** Fuerza el modo edición desde afuera (tarjeta en modo edición). */
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  autoFocus?: boolean;
}

/**
 * Texto que se convierte en input al hacer clic o al recibir Enter.
 * Enter y perder el foco guardan; Escape descarta y deja el valor original.
 */
export function InlineEdit({
  value,
  onSave,
  label,
  placeholder,
  emptyText = "—",
  required = false,
  className,
  editing: controlledEditing,
  onEditingChange,
  autoFocus = false,
}: InlineEditProps) {
  const [uncontrolledEditing, setUncontrolledEditing] = useState(false);
  const editing = controlledEditing ?? uncontrolledEditing;
  const [draft, setDraft] = useState(value);
  // Escape no debe disparar el guardado que hace el blur del input.
  const cancelledRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Si el valor cambia por fuera (otra pestaña, el agente), refrescamos el
  // borrador salvo que el docente lo esté editando en este momento.
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function setEditing(next: boolean) {
    if (controlledEditing === undefined) setUncontrolledEditing(next);
    onEditingChange?.(next);
  }

  function commit() {
    if (cancelledRef.current) {
      cancelledRef.current = false;
      return;
    }
    const next = draft.trim();
    if (required && !next) {
      setDraft(value);
      setEditing(false);
      return;
    }
    if (next !== value) onSave(next);
    setEditing(false);
  }

  function cancel() {
    cancelledRef.current = true;
    setDraft(value);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`${label}: ${value || emptyText}`}
        className={cn(
          "-mx-1 rounded px-1 text-start hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !value && "text-muted-foreground",
          className,
        )}
      >
        {value || emptyText}
      </button>
    );
  }

  return (
    <input
      ref={inputRef}
      value={draft}
      aria-label={label}
      placeholder={placeholder}
      autoFocus={autoFocus || controlledEditing === undefined}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          // Guardar directo en vez de delegar en blur(): al salir del modo
          // edición el input se desmonta y el evento blur nunca llega.
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        }
      }}
      className={cn(
        "-mx-1 w-full rounded border border-input bg-transparent px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    />
  );
}
