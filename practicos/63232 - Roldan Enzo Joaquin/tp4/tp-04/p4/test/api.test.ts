import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { crearApp } from '../src/app';
import { crearBaseDatos } from '../src/db';

let cerrarBaseDatos: () => void;
let servidor: ReturnType<ReturnType<typeof crearApp>['listen']>;
let baseUrl = '';

before(async () => {
  const baseDatos = crearBaseDatos(':memory:');
  cerrarBaseDatos = baseDatos.cerrar;
  servidor = crearApp(baseDatos.db).listen(0);
  await new Promise<void>((resolve, reject) => {
    servidor.once('listening', resolve);
    servidor.once('error', reject);
  });
  const direccion = servidor.address();
  if (!direccion || typeof direccion === 'string') throw new Error('No se pudo iniciar el servidor de prueba.');
  baseUrl = `http://127.0.0.1:${direccion.port}`;
});

async function solicitar(ruta: string, init?: RequestInit) {
  const respuesta = await fetch(`${baseUrl}${ruta}`, init);
  const cuerpo = respuesta.status === 204 ? null : await respuesta.json();
  return { respuesta, cuerpo };
}

after(async () => {
  await new Promise<void>((resolve, reject) => {
    servidor.close(error => error ? reject(error) : resolve());
  });
  cerrarBaseDatos();
});

test('gestiona clientes y protege las actividades completadas', async () => {
  const creado = await solicitar('/api/clientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Ada',
      apellido: 'Lovelace',
      email: 'ada@example.com',
      telefono: '555-0100',
      empresa: 'Analytical Engines',
      cargo: 'Ingeniera',
      notas: 'Contacto inicial',
    }),
  });
  assert.equal(creado.respuesta.status, 201);
  const clienteId = creado.cuerpo.id as number;

  const clienteActualizado = await solicitar(`/api/clientes/${clienteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Ada',
      apellido: 'Lovelace',
      email: 'ada@example.com',
      telefono: '555-0100',
      empresa: 'Analytical Engines',
      cargo: 'Matemática',
      notas: 'Contacto inicial',
    }),
  });
  assert.equal(clienteActualizado.respuesta.status, 200);
  assert.equal(clienteActualizado.cuerpo.cargo, 'Matemática');

  const fechaInvalida = await solicitar(`/api/clientes/${clienteId}/actividades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Fecha inválida',
      descripcion: '',
      fecha: '2026-02-31',
    }),
  });
  assert.equal(fechaInvalida.respuesta.status, 400);

  const actividad = await solicitar(`/api/clientes/${clienteId}/actividades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Enviar propuesta',
      descripcion: 'Seguimiento de demostración',
      fecha: '2026-10-25',
    }),
  });
  assert.equal(actividad.respuesta.status, 201);
  const actividadId = actividad.cuerpo.id as number;

  const busqueda = await solicitar('/api/clientes?q=demostración');
  assert.equal(busqueda.respuesta.status, 200);
  assert.deepEqual(busqueda.cuerpo.map((item: { id: number }) => item.id), [clienteId]);

  const editada = await solicitar(`/api/clientes/${clienteId}/actividades/${actividadId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Enviar propuesta revisada',
      descripcion: 'Versión final',
      fecha: '2026-10-26',
    }),
  });
  assert.equal(editada.respuesta.status, 200);

  const actividadPendiente = await solicitar(`/api/clientes/${clienteId}/actividades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Llamada de seguimiento',
      descripcion: '',
      fecha: '2026-10-28',
    }),
  });
  assert.equal(actividadPendiente.respuesta.status, 201);
  const actividadPendienteId = actividadPendiente.cuerpo.id as number;
  const actividadEliminada = await solicitar(
    `/api/clientes/${clienteId}/actividades/${actividadPendienteId}`,
    { method: 'DELETE' },
  );
  assert.equal(actividadEliminada.respuesta.status, 204);

  const completada = await solicitar(`/api/clientes/${clienteId}/actividades/${actividadId}/completar`, {
    method: 'PATCH',
  });
  assert.equal(completada.respuesta.status, 200);
  assert.equal(completada.cuerpo.completada, true);

  const edicionProhibida = await solicitar(`/api/clientes/${clienteId}/actividades/${actividadId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Cambio inválido',
      descripcion: '',
      fecha: '2026-10-27',
    }),
  });
  assert.equal(edicionProhibida.respuesta.status, 409);

  const borradoProhibido = await solicitar(`/api/clientes/${clienteId}/actividades/${actividadId}`, {
    method: 'DELETE',
  });
  assert.equal(borradoProhibido.respuesta.status, 409);

  const eliminado = await solicitar(`/api/clientes/${clienteId}`, { method: 'DELETE' });
  assert.equal(eliminado.respuesta.status, 204);

  const inexistente = await solicitar(`/api/clientes/${clienteId}`);
  assert.equal(inexistente.respuesta.status, 404);
});
