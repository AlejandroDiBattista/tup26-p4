import { categorias } from './categorias'
import { flujoPorHora, tiempoObservado, type Conteo } from './transito'

export function exportarConteo(conteo: Conteo): void {
  const total = Object.values(conteo.cantidades).reduce((suma, cantidad) => suma + cantidad, 0)
  const duracion = tiempoObservado(conteo, Date.now())
  const celda = (valor: string | number) => `"${String(valor).replace(/"/g, '""')}"`
  const puntoSeguro = /^[=+\-@\t\r]/.test(conteo.punto) ? `'${conteo.punto}` : conteo.punto
  const filas = [
    ['Punto', 'Inicio', 'Categoría', 'Vehículos', 'Tiempo observado (s)', 'Flujo estimado (v/h)'],
    ...[...categorias.map(({ id, nombre }) => ({ nombre, cantidad: conteo.cantidades[id] })), { nombre: 'Total', cantidad: total }]
      .map(({ nombre, cantidad }) => [puntoSeguro, conteo.inicio === null ? '' : new Date(conteo.inicio).toISOString(), nombre, cantidad, (duracion / 1000).toFixed(3), flujoPorHora(cantidad, duracion)?.toFixed(2) ?? '']),
  ]
  const url = URL.createObjectURL(new Blob(['\uFEFF' + filas.map((fila) => fila.map(celda).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }))
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `aforo-${new Date().toISOString().slice(0, 10)}.csv`
  enlace.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
