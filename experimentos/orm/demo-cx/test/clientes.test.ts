import assert from 'node:assert/strict';
import { test } from 'node:test';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { Clientes, fechaHoy } from '../src/clientes.js';
import { connect } from '../src/db/connection.js';

async function preparar() {
  const connection = connect({ url: ':memory:' });
  await migrate(connection.db, { migrationsFolder: 'drizzle' });
  return connection;
}

const datos = { nombre: '  mARÍA   josÉ ', apellido: ' PÉREZ ', email: '  MARIA@EXAMPLE.COM ', telefono: '+54 (381) 555-0101' };

test('CRUD de clientes: normaliza altas y cambios, busca por cualquier campo y borra en cascada', async () => {
  const { db, close } = await preparar();
  try {
    const cliente = await Clientes.crear(db, datos);
    assert.equal(cliente.nombre, 'María José');
    assert.equal(cliente.apellido, 'Pérez');
    assert.equal(cliente.email, 'maria@example.com');
    assert.equal(cliente.telefono, '+543815550101');
    assert.equal(cliente.domicilio, null);
    assert.equal((await Clientes.buscar(db, 'MARIA JOSE')).length, 1);
    assert.equal((await Clientes.buscar(db, { nombre: 'maria', apellido: 'perez', domicilio: null })).length, 1);
    assert.equal((await Clientes.buscar(db, { id: cliente.id })).length, 1);
    assert.equal((await Clientes.buscar(db, { telefono: '381555' })).length, 1);
    assert.equal((await Clientes.buscar(db, { nombre: 'otra' })).length, 0);
    await assert.rejects(Clientes.crear(db, { ...datos, email: 'maria@example.com' }));

    const actualizado = await Clientes.actualizar(db, cliente.id, {
      nombre: '  anA  ', apellido: '  góMEZ ', email: ' NUEVO@EXAMPLE.COM ', telefono: ' (381) 555-9999 ',
      domicilio: '  San   Martín  20 ', localidad: '  Yerba   Buena ',
    });
    assert.equal(actualizado.nombre, 'Ana');
    assert.equal(actualizado.apellido, 'Gómez');
    assert.equal(actualizado.email, 'nuevo@example.com');
    assert.equal(actualizado.telefono, '3815559999');
    assert.equal(actualizado.domicilio, 'San Martín 20');
    for (const filtro of [{ email: 'NUEVO@' }, { domicilio: 'san martin' }, { localidad: 'yerba' }]) {
      assert.equal((await Clientes.buscar(db, filtro)).length, 1);
    }
    const completada = await Clientes.crearActividad(db, cliente.id, { descripcion: 'Completada', fechaFinalizacion: '2026-10-15' });
    assert.equal((await Clientes.obtener(db, cliente.id)).actividades[0].id, completada.id);
    await Clientes.eliminar(db, cliente.id);
    assert.equal((await Clientes.buscar(db)).length, 0);
    assert.equal((await db.query.actividades.findMany()).length, 0);
    await assert.rejects(Clientes.obtener(db, cliente.id), /inexistente/);
    await assert.rejects(Clientes.actualizar(db, cliente.id, { nombre: 'Ana' }), /inexistente/);
    await assert.rejects(Clientes.eliminar(db, cliente.id), /inexistente/);
  } finally { close(); }
});

test('actividades: fechas nulas, vencimiento antes de hoy y búsqueda flexible', async () => {
  const { db, close } = await preparar();
  try {
    const cliente = await Clientes.crear(db, datos);
    const hoy = '2026-10-16';
    for (const [descripcion, fechaCompromiso, fechaFinalizacion] of [
      [' Sin   fecha ', null, null],
      ['Vencida', '2026-10-15', null],
      ['Hoy', hoy, null],
      ['Futura', '2026-10-17', null],
      ['Completada', '2026-10-01', '2026-10-02'],
      ['Completada sin compromiso', null, '2026-10-02'],
    ]) {
      await Clientes.crearActividad(db, cliente.id, { descripcion: descripcion!, fechaCompromiso, fechaFinalizacion });
    }
    const actividades = await Clientes.buscarActividades(db, cliente.id, '', hoy);
    assert.deepEqual(actividades.map((a) => a.estado), ['pendiente', 'vencida', 'pendiente', 'pendiente', 'completada', 'completada']);
    assert.equal(actividades[0].descripcion, 'Sin fecha');
    for (const filtro of [
      { id: actividades[1].id }, { descripcion: 'VENCIDA' }, { fechaCompromiso: '2026-10-15' }, { estado: 'vencida' },
    ]) {
      assert.equal((await Clientes.buscarActividades(db, cliente.id, filtro, hoy)).length, 1);
    }
    assert.equal((await Clientes.buscarActividades(db, cliente.id, { clienteId: cliente.id, fechaCompromiso: null }, hoy)).length, 2);
    assert.equal((await Clientes.buscarActividades(db, cliente.id, { fechaFinalizacion: '2026-10-02' }, hoy)).length, 2);
    assert.equal((await Clientes.buscarActividades(db, cliente.id, 'SIN FECHA', hoy)).length, 1);
    assert.match(fechaHoy(), /^\d{4}-\d{2}-\d{2}$/);
  } finally { close(); }
});

test('completar bloquea edición y borrado individual; las operaciones respetan al cliente', async () => {
  const { db, close } = await preparar();
  try {
    const cliente = await Clientes.crear(db, datos);
    const otro = await Clientes.crear(db, { ...datos, email: 'otro@example.com' });
    const actividad = await Clientes.crearActividad(db, cliente.id, { descripcion: 'Llamar' });
    await assert.rejects(Clientes.obtenerActividad(db, otro.id, actividad.id), /inexistente/);
    await assert.rejects(Clientes.actualizarActividad(db, otro.id, actividad.id, { descripcion: 'Ajena' }));
    await assert.rejects(Clientes.eliminarActividad(db, otro.id, actividad.id));
    await Clientes.actualizarActividad(db, cliente.id, actividad.id, { descripcion: '  Llamar   mañana ', fechaCompromiso: '2026-10-17' });
    await Clientes.completarActividad(db, cliente.id, actividad.id, '2026-10-16');
    await assert.rejects(Clientes.actualizarActividad(db, cliente.id, actividad.id, { descripcion: 'Modificar' }), /completada/);
    await assert.rejects(Clientes.actualizarActividad(db, cliente.id, actividad.id, { fechaFinalizacion: null }), /completada/);
    await assert.rejects(Clientes.eliminarActividad(db, cliente.id, actividad.id), /completada/);
    await assert.rejects(Clientes.completarActividad(db, cliente.id, actividad.id), /completada/);
    assert.equal((await Clientes.obtenerActividad(db, cliente.id, actividad.id)).descripcion, 'Llamar mañana');
    const pendiente = await Clientes.crearActividad(db, cliente.id, { descripcion: 'Borrar' });
    await Clientes.eliminarActividad(db, cliente.id, pendiente.id);
    await assert.rejects(Clientes.obtenerActividad(db, cliente.id, pendiente.id), /inexistente/);
  } finally { close(); }
});

test('rechaza datos inválidos sin guardar cambios', async () => {
  const { db, close } = await preparar();
  try {
    await assert.rejects(Clientes.crear(db, { ...datos, nombre: ' ' }), /obligatorio/);
    await assert.rejects(Clientes.crear(db, { ...datos, email: 'inválido' }), /Email/);
    await assert.rejects(Clientes.crear(db, { ...datos, telefono: 'abc' }), /Teléfono/);
    const cliente = await Clientes.crear(db, datos);
    await assert.rejects(Clientes.actualizar(db, cliente.id, {}), /cambios/);
    await assert.rejects(Clientes.crearActividad(db, cliente.id, { descripcion: ' ' }), /obligatoria/);
    for (const fecha of ['', '2026-02-30', '2026-13-01', '16/10/2026']) {
      await assert.rejects(Clientes.crearActividad(db, cliente.id, { descripcion: 'Inválida', fechaCompromiso: fecha }), /fecha válida/);
    }
    await assert.rejects(Clientes.crearActividad(db, -1, { descripcion: 'Sin cliente' }));
    assert.equal((await Clientes.obtener(db, cliente.id)).actividades.length, 0);
    const actualizada = await Clientes.actualizar(db, cliente.id, { telefono: '', domicilio: ' ' });
    assert.equal(actualizada.telefono, null);
    assert.equal(actualizada.domicilio, null);
  } finally { close(); }
});
