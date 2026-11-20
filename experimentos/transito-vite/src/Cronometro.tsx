type CronometroProps = {
  milisegundos: number
  activo: boolean
  alAlternar: () => void
  alReiniciarContadores: () => void
}

function Cronometro({ milisegundos, activo, alAlternar, alReiniciarContadores }: CronometroProps) {
  const segundos = milisegundos / 1000
  const minutosMostrados  = Math.floor(segundos / 60).toString().padStart(2, '0')
  const segundosMostrados = Math.floor(segundos % 60).toString().padStart(2, '0')

  return (
    <header className="encabezado-cronometro">
      <div className="tiempo-info">
        <span className="etiqueta-tiempo">Tiempo de observación</span>
        <h1 className="tiempo-cronometro">{minutosMostrados}:{segundosMostrados}</h1>
      </div>
      <div className="acciones-cronometro">
        <button className="boton-cronometro" type="button" onClick={alAlternar} aria-label={activo ? 'Detener cronómetro' : 'Iniciar cronómetro'}>
          {activo ? '⏹' : '▶'}
        </button>
        <button
          className="boton-reiniciar"
          type="button"
          onClick={alReiniciarContadores}
          aria-label="Reiniciar contadores"
          title="Reiniciar contadores"
        >
          ♻️
        </button>
      </div>
    </header>
  )
}

export default Cronometro
