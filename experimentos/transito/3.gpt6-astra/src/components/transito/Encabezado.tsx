import { ArrowDownToLine, Route } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PresentacionProps = {
  puedeExportar: boolean
  onExportar: () => void
}

export function Encabezado() {
  return (
    <header className="topbar">
      <a className="brand" href="#">
        <Route aria-hidden="true" />
        <span>aforo<span className="brand-dot">.</span></span>
      </a>
      <span className="topbar-caption">OBSERVATORIO DE TRÁNSITO</span>
      <span className="local-tag">Registro local</span>
    </header>
  )
}

export function Presentacion({ puedeExportar, onExportar }: PresentacionProps) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">CONTEO VEHICULAR</p>
        <h1>El pulso de tu ciudad.</h1>
        <p className="intro">Elegí un punto, iniciá el reloj y registrá cada vehículo que pasa.</p>
      </div>
      <Button variant="outline" className="export-button" onClick={onExportar} disabled={!puedeExportar}>
        <ArrowDownToLine /> Exportar CSV
      </Button>
    </div>
  )
}
