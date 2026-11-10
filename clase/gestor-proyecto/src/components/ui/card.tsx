import * as React from 'react'
import { cn } from 'cn'

// Contiene el contenido de una tarjeta.
function Card({
  className,
  as = 'div',
  ...props
}: React.ComponentProps<'div'> & { as?: 'div' | 'article' | 'section' }) {
  const Elemento = as
  return (
    <Elemento
      data-slot="card"
      className={cn(
        'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

// Agrupa el encabezado de una tarjeta.
function CardHeader({
  className,
  as = 'div',
  ...props
}: React.ComponentProps<'div'> & { as?: 'div' | 'header' }) {
  const Elemento = as
  return (
    <Elemento
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

// Muestra el título de una tarjeta.
function CardTitle({
  className,
  as = 'div',
  ...props
}: React.ComponentProps<'div'> & { as?: 'div' | 'h2' | 'h3' }) {
  const Elemento = as
  return (
    <Elemento
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

// Muestra el texto descriptivo de una tarjeta.
function CardDescription({
  className,
  as = 'div',
  ...props
}: React.ComponentProps<'div'> & { as?: 'div' | 'p' }) {
  const Elemento = as
  return (
    <Elemento
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

// Ubica una acción en el encabezado de una tarjeta.
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

// Contiene el cuerpo de una tarjeta.
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-6', className)} {...props} />
}

// Agrupa el pie de una tarjeta.
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
