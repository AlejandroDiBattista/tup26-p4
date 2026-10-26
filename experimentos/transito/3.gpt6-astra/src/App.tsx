import { Encabezado, Presentacion } from '@/components/transito/Encabezado'
import { Observacion } from '@/components/transito/Observacion'
import { Contadores } from '@/components/transito/Contadores'
import { ResumenTransito } from '@/components/transito/ResumenTransito'
import { ControlesSesion } from '@/components/transito/ControlesSesion'
import { useConteo } from '@/hooks/useConteo'
import { exportarConteo } from '@/lib/exportarConteo'
import './App.css'

function App() {
  const sesion = useConteo()
  const { conteo, activo, tiempo, total } = sesion

  return (
    <div className="app-shell">
      <Encabezado />
      <main>
        <Presentacion
          puedeExportar={tiempo >= 1000}
          onExportar={() => exportarConteo(conteo)}
        />
        <Observacion
          punto={conteo.punto}
          tiempo={tiempo}
          activo={activo}
          iniciado={conteo.inicio !== null}
          onCambiarPunto={sesion.cambiarPunto}
          onCambiarReloj={sesion.cambiarReloj}
        />
        <Contadores
          cantidades={conteo.cantidades}
          tiempo={tiempo}
          activo={activo}
          onSumar={sesion.sumar}
          onRestar={sesion.restar}
        />
        <ResumenTransito cantidades={conteo.cantidades} total={total} tiempo={tiempo} />
        <ControlesSesion
          errorGuardado={sesion.errorGuardado}
          puedeReiniciar={conteo.inicio !== null || total > 0}
          confirmar={sesion.confirmar}
          onSolicitarReinicio={sesion.solicitarReinicio}
          onCancelarReinicio={sesion.cancelarReinicio}
          onReiniciar={sesion.reiniciar}
        />
      </main>
    </div>
  )
}

export default App
