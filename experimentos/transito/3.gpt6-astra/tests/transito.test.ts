import assert from 'node:assert/strict'
import { test } from 'node:test'
import { alternarReloj, contar, flujoPorHora, formatearTiempo, nuevoConteo, recuperarConteo, tiempoObservado } from '../src/lib/transito.ts'

test('60 vehículos en 5 minutos equivalen a 720 v/h', () => {
  assert.equal(flujoPorHora(60, 300_000), 720)
  assert.equal(flujoPorHora(0, 300_000), 0)
  assert.equal(flujoPorHora(1, 0), null)
  assert.equal(flujoPorHora(1, 999), null)
})

test('pausar excluye el tiempo de pausa y continuar acumula solo observación', () => {
  let conteo = alternarReloj(nuevoConteo(), 10_000)
  conteo = alternarReloj(conteo, 70_000)
  assert.equal(tiempoObservado(conteo, 200_000), 60_000)
  conteo = alternarReloj(conteo, 200_000)
  assert.equal(tiempoObservado(conteo, 260_000), 120_000)
  assert.equal(conteo.inicio, 10_000)
})

test('no cuenta estando detenido y permite corregir sin cantidades negativas', () => {
  let conteo = nuevoConteo()
  assert.equal(contar(conteo, 'motos', 1).cantidades.motos, 0)
  conteo = alternarReloj(conteo, 1000)
  for (const categoria of ['motos', 'autos', 'camionetas'] as const) conteo = contar(conteo, categoria, 1)
  conteo = alternarReloj(conteo, 5000)
  conteo = contar(contar(conteo, 'motos', -1), 'motos', -1)
  assert.deepEqual(conteo.cantidades, { motos: 0, autos: 1, camionetas: 1 })
})

test('recupera el conteo en marcha y rechaza datos inválidos', () => {
  const conteo = contar(alternarReloj(nuevoConteo('Esquina de prueba'), 1000), 'autos', 1)
  const recuperado = recuperarConteo(JSON.stringify(conteo))
  assert.equal(tiempoObservado(recuperado, 61_000), 60_000)
  assert.equal(recuperado.cantidades.autos, 1)
  for (const texto of [null, 'null', '{}', 'incompleto', JSON.stringify({ ...conteo, acumuladoMs: -1 }), JSON.stringify({ ...conteo, cantidades: { motos: -1, autos: 0, camionetas: 0 } })]) {
    assert.deepEqual(recuperarConteo(texto), nuevoConteo())
  }
})

test('formatea horas y reinicia conservando el punto elegido', () => {
  assert.equal(formatearTiempo(3_661_999), '01:01:01')
  assert.equal(formatearTiempo(0), '00:00:00')
  assert.deepEqual(nuevoConteo('Punto A').cantidades, { motos: 0, autos: 0, camionetas: 0 })
  assert.equal(nuevoConteo('Punto A').punto, 'Punto A')
})
