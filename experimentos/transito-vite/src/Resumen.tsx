import Dato from './Dato'

type ResumenProps = {
  cantidad: number
  segundos: number
}

function Resumen({ cantidad, segundos }: ResumenProps) {
  const flujoPromedio = segundos > 0 ? (cantidad / segundos) * 3600 : 0

  return (
    <section className="resumen" aria-label="Resumen de vehículos">
      <Dato etiqueta="Total de vehículos" valor={cantidad} />
      <Dato etiqueta="Flujo promedio" valor={`${Math.round(flujoPromedio)} v/h`} />
    </section>
  )
}

export default Resumen
