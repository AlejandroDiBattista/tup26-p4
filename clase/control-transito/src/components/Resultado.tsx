import './Resultado.css'

type ResultadoProps = {
  etiqueta: string
  valor: string | number
}

function Resultado({ etiqueta, valor }: ResultadoProps) {
  return (
    <article className="resultado">
      <h2 className="resultado-etiqueta">{etiqueta}</h2>
      <p className="resultado-valor">{valor}</p>
    </article>
  )
}

export default Resultado
