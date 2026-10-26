type Categoria = {
  nombre: string
  emoji: string
}

type DistribucionProps = {
  categorias: Categoria[]
  cantidades: number[]
}

const colores = ['#2563eb', '#f97316', '#16a34a', '#a855f7', '#0891b2', '#e11d48', '#ca8a04', '#64748b']

function Distribucion({ categorias, cantidades }: DistribucionProps) {
  const total = cantidades.reduce((suma, cantidad) => suma + cantidad, 0)

  return (
    <section className="distribucion" aria-label="Porcentaje por categoría">
      <h2>Distribución por categoría</h2>
      <div className="barra-distribucion" role="img" aria-label={`Distribución de ${total} vehículos`}>
        {total > 0 && categorias.map((categoria, indice) => {
          const porcentaje = (cantidades[indice] / total) * 100
          if (porcentaje === 0) return null

          return (
            <span
              key={categoria.nombre}
              className="segmento-distribucion"
              style={{ width: `${porcentaje}%`, backgroundColor: colores[indice % colores.length] }}
              title={`${categoria.nombre}: ${porcentaje.toFixed(1)}%`}
            />
          )
        })}
      </div>
      <ul className="leyenda-distribucion">
        {categorias.map((categoria, indice) => {
          const porcentaje = total > 0 ? (cantidades[indice] / total) * 100 : 0

          return (
            <li key={categoria.nombre}>
              <span className="muestra-color" style={{ backgroundColor: colores[indice % colores.length] }} />
              <span>{categoria.emoji} {categoria.nombre}</span>
              <strong>{porcentaje.toFixed(1)}%</strong>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default Distribucion
