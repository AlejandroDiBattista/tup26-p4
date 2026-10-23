import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  valor: string
  onCambiar: (valor: string) => void
}

export function PuntoObservacion({ valor, onCambiar }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor="punto" className="text-sm text-stone-700">
        <MapPin className="size-4" aria-hidden="true" /> Punto de observación
      </Label>
      <Input
        id="punto"
        placeholder="Ej. Av. Aconquija y Las Rosas"
        value={valor}
        onChange={(evento) => onCambiar(evento.target.value)}
        className="h-12 bg-white text-base"
      />
    </div>
  )
}
