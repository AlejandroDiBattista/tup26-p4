import * as React from 'react'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from 'cn'

// Controla el valor y la apertura del selector.
function Select({
  onValueChange,
  ...props
}: Omit<SelectPrimitive.Root.Props<string>, 'onValueChange'> & {
  onValueChange?: (value: string) => void
}) {
  return (
    <SelectPrimitive.Root
      {...props}
      onValueChange={(value) => {
        if (value !== null) onValueChange?.(value)
      }}
    />
  )
}

// Muestra la opción elegida.
function SelectValue(props: SelectPrimitive.Value.Props) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

// Abre el menú del selector.
function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: SelectPrimitive.Trigger.Props & { size?: 'sm' | 'default' }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        'flex w-fit items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

// Muestra las opciones en una capa flotante, incluso dentro de diálogos nativos.
function SelectContent({
  className,
  children,
  insideDialog = false,
  position,
  ...props
}: SelectPrimitive.Popup.Props & { insideDialog?: boolean; position?: 'popper' | 'item-aligned' }) {
  const [container, setContainer] = React.useState<HTMLElement | null>(null)
  React.useEffect(() => {
    if (insideDialog)
      setContainer(document.querySelector<HTMLElement>('[data-slot=dialog-content]'))
  }, [insideDialog])
  return (
    <SelectPrimitive.Portal container={container ?? undefined}>
      <SelectPrimitive.Positioner
        sideOffset={4}
        alignItemWithTrigger={position !== 'popper'}
        className="z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            'max-h-(--available-height) min-w-[max(8rem,var(--anchor-width))] overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
            className,
          )}
          {...props}
        >
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

// Representa una opción seleccionable.
function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center">
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
