import { MapPin } from "lucide-react"

type LocationFieldProps = { value: string; onChange: (value: string) => void }

export function LocationField({ value, onChange }: LocationFieldProps) {
  return (
    <section className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <label htmlFor="observation-location" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <MapPin className="size-4 text-blue-600" /> Punto de observación
      </label>
      <input
        id="observation-location"
        className="mt-3 w-full border-0 border-b border-slate-200 bg-transparent py-2 text-lg outline-none transition placeholder:text-slate-300 focus:border-blue-500"
        placeholder="Ej.: Av. Aconquija y Camino del Perú"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  )
}
