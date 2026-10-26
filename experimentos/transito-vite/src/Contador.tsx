type ContadorProps = {
  texto: string
  emoji: string
  cuenta: number
  alIncrementar: () => void
  habilitado: boolean
  referencia: (elemento: HTMLButtonElement | null) => void
}

function Contador({ texto, emoji, cuenta, alIncrementar, habilitado, referencia }: ContadorProps) {
  return (
    <button ref={referencia} className="contador" type="button" onClick={alIncrementar} disabled={!habilitado}>
      <span className="identidad-contador">
        <span className="emoji-contador" aria-hidden="true">{emoji}</span>
        <span>{texto}</span>
      </span>
      <strong>{cuenta}</strong>
    </button>
  )
}

export default Contador
