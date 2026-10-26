// Pruebas del servicio sobre una base en memoria: npm test
import assert from 'node:assert/strict'

process.env.DB_FILE = ':memory:'
const { Clientes } = await import('./servicio/clientes.js')
const { sembrar } = await import('./seed.js')
const { ErrorNegocio } = await import('./servicio/errores.js')

const falla = (estado: number, fn: () => unknown) =>
  assert.throws(fn, (e) => e instanceof ErrorNegocio && e.estado === estado)

await sembrar()
assert.equal(Clientes.buscar().length, 10)

// búsqueda flexible: cualquier campo, sin acentos ni mayúsculas, o por un campo concreto
assert.equal(Clientes.buscar({ q: 'LUCIA' }).length, 1)
assert.equal(Clientes.buscar({ q: 'yerba' }).length, 2)
assert.equal(Clientes.buscar({ localidad: 'monteros' }).length, 1)
assert.equal(Clientes.buscar({ q: 'yerba', apellido: 'gomez' }).length, 1)
falla(400, () => Clientes.buscar({ inexistente: 'x' }))

// alta con normalización y validaciones
const ana = Clientes.crear({ nombre: '  ana maría ', apellido: 'PÉREZ', email: 'ANA@Test.com', telefono: '(381) 555-0111' })
assert.deepEqual([ana.nombre, ana.apellido, ana.email, ana.telefono], ['Ana María', 'Pérez', 'ana@test.com', '3815550111'])
falla(409, () => Clientes.crear({ nombre: 'a', apellido: 'b', email: 'ana@test.com' }))
falla(400, () => Clientes.crear({ nombre: 'a', apellido: 'b', email: 'no-es-email' }))
falla(400, () => Clientes.crear({ apellido: 'b', email: 'b@b.com' }))
assert.equal(Clientes.actualizar(ana.id, { localidad: 'Tafí Viejo' }).localidad, 'Tafí Viejo')
falla(404, () => Clientes.obtener(9999))

// actividades: las completadas no se editan ni se borran
const a = Clientes.crearActividad(ana.id, { descripcion: 'Llamar', fechaCompromiso: '2026-12-01' })
assert.equal(a.fechaFinalizacion, null)
assert.equal(Clientes.actualizarActividad(ana.id, a.id, { descripcion: 'Llamar hoy' }).descripcion, 'Llamar hoy')
falla(400, () => Clientes.crearActividad(ana.id, { descripcion: 'x', fechaCompromiso: '01/12/2026' }))
assert.ok(Clientes.completarActividad(ana.id, a.id).fechaFinalizacion)
falla(409, () => Clientes.completarActividad(ana.id, a.id))
falla(409, () => Clientes.actualizarActividad(ana.id, a.id, { descripcion: 'otra' }))
falla(409, () => Clientes.eliminarActividad(ana.id, a.id))
const b = Clientes.crearActividad(ana.id, { descripcion: 'Sin fecha' })
Clientes.eliminarActividad(ana.id, b.id)
falla(404, () => Clientes.eliminarActividad(ana.id, b.id))

// al borrar el cliente se borran sus actividades
Clientes.eliminar(ana.id)
falla(404, () => Clientes.obtener(ana.id))

console.log('Todas las pruebas pasaron')
