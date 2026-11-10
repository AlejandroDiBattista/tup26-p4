import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { Label } from '../ui/label'
import { Search } from 'lucide-react'
import { usePageFocus } from '../../hooks/usePageFocus'

// Muestra el campo de búsqueda de un listado administrativo.
export function AdminSearch({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const searchRef = usePageFocus()
  return (
    <Label className="block w-full sm:w-56">
      <span className="sr-only">{label}</span>
      <InputGroup className="h-9 rounded-full border-zinc-200 bg-white has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-zinc-400">
        <InputGroupAddon className="text-zinc-500">
          <Search size={16} aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          ref={searchRef}
          type="search"
          className="h-full pr-4 text-sm text-zinc-900 placeholder:text-zinc-500"
          placeholder={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </InputGroup>
    </Label>
  )
}
