import Listar from './components/Listar'
import usePersistenciaLocalStorage from './hooks/usePersistenciaLocalStorage'
import './App.css'

function App() {
  usePersistenciaLocalStorage()

  return (
    <main className="contador-app">
      <header className="app-header">
        <p className="app-eyebrow">Observación de tránsito</p>
        <h1>Contadores de vehículos</h1>
        <p className="app-description">Registrá cada paso durante cinco minutos.</p>
      </header>
      <Listar />
    </main>
  )
}

export default App
