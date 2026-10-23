type DatoProps = {
  etiqueta: string
  valor: string | number
}

function Dato({ etiqueta, valor }: DatoProps) {
  const valorFormateado = typeof valor === 'number'
    ? new Intl.NumberFormat('es-AR').format(valor)
    : valor

  return (
    <div className="dato-resumen">
      <span>{etiqueta}</span>
      <strong>{valorFormateado}</strong>
    </div>
  )
}

export default Dato
