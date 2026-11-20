import assert from 'node:assert/strict';
import test from 'node:test';

process.env.DB_FILE = ':memory:';
const { Clientes, ErrorDeNegocio } = await import('./Clientes.js');

test('CRUD, búsqueda y bloqueo de actividades completadas', () => {
  const cliente = Clientes.crear({ nombre: 'Ana García', email: 'ana@example.com', telefono: '381 555', direccion: 'Yerbabuena' });
  assert.equal(Clientes.listar('Ana Gar').length, 1);
  assert.equal(Clientes.listar('ana@example.com').length, 1);
  assert.equal(Clientes.listar('381 555').length, 1);
  assert.equal(Clientes.listar('yerbabue').length, 1);
  assert.equal(Clientes.obtener(cliente.id).nombre, 'Ana García');

  const actividad = Clientes.crearActividad(cliente.id, { descripcion: 'Enviar presupuesto', fecha: '2026-10-25' });
  assert.equal(Clientes.listar('presupuesto').length, 1);
  assert.equal(Clientes.listar('2026-10-25').length, 1);
  assert.equal(Clientes.obtener(cliente.id).actividades.length, 1);
  assert.throws(() => Clientes.crearActividad(cliente.id, { descripcion: 'Fecha inválida', fecha: '2026-02-30' }),
    (error) => error instanceof ErrorDeNegocio && error.status === 400);
  const descartada = Clientes.crearActividad(cliente.id, { descripcion: 'Descartar' });
  Clientes.eliminarActividad(cliente.id, descartada.id);
  assert.equal(Clientes.actualizarActividad(cliente.id, actividad.id, { descripcion: 'Llamar', fecha: '' }).descripcion, 'Llamar');

  Clientes.completarActividad(cliente.id, actividad.id);
  assert.equal(Clientes.obtener(cliente.id).actividades[0].completada, true);
  assert.throws(() => Clientes.actualizarActividad(cliente.id, actividad.id, { descripcion: 'Cambiar' }),
    (error) => error instanceof ErrorDeNegocio && error.status === 409);
  assert.throws(() => Clientes.eliminarActividad(cliente.id, actividad.id),
    (error) => error instanceof ErrorDeNegocio && error.status === 409);

  Clientes.actualizar(cliente.id, { nombre: 'Ana G.', email: '', telefono: '', direccion: '' });
  assert.equal(Clientes.obtener(cliente.id).nombre, 'Ana G.');
  Clientes.eliminar(cliente.id);
  assert.equal(Clientes.listar().length, 0);
  assert.throws(() => Clientes.obtener(cliente.id),
    (error) => error instanceof ErrorDeNegocio && error.status === 404);
});
