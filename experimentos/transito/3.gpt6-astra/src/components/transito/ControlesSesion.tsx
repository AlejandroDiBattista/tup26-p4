import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { categorias } from '@/lib/categorias'

type ControlesSesionProps = {
  errorGuardado: boolean
  puedeReiniciar: boolean
  confirmar: boolean
  onSolicitarReinicio: () => void
  onCancelarReinicio: () => void
  onReiniciar: () => void
}

export function ControlesSesion({ errorGuardado, puedeReiniciar, confirmar, onSolicitarReinicio, onCancelarReinicio, onReiniciar }: ControlesSesionProps) {
  return (
    <>
      <footer className="session-footer">
        <p>
          {errorGuardado
            ? 'No se pudo guardar en este navegador. Exportá el registro para conservarlo.'
            : 'Guardado en este navegador. Podés recargar sin perder el conteo.'}
          <span>El reloj sigue al cambiar de pestaña. Pausalo cuando dejes de observar.</span>
        </p>
        <Button variant="ghost" onClick={onSolicitarReinicio} disabled={!puedeReiniciar}>
          <RotateCcw /> Nuevo conteo
        </Button>
      </footer>
      {confirmar && (
        <div className="reset-confirmation" role="alert">
          <p><strong>¿Empezar otro conteo?</strong> Se borrarán los números y el tiempo actuales. Podés exportarlos antes.</p>
          <div>
            <Button variant="outline" onClick={onCancelarReinicio}>Cancelar</Button>
            <Button variant="destructive" onClick={onReiniciar}>Borrar e iniciar de cero</Button>
          </div>
        </div>
      )}
      <p className="keyboard-hint">
        ATAJOS {categorias.map(({ id, tecla, nombre }) => (
          <Atajo key={id} tecla={tecla} nombre={nombre} />
        ))}
        <span>·</span> <Atajo tecla="Espacio" nombre="Iniciar / pausar" />
      </p>
    </>
  )
}

function Atajo({ tecla, nombre }: { tecla: string; nombre: string }) {
  return <><kbd>{tecla}</kbd> {nombre} </>
}
