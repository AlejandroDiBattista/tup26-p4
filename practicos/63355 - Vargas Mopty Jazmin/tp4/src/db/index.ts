import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { fileURLToPath } from 'node:url';
import * as esquema from './esquema.js';

export const conexion = new Database(
  fileURLToPath(new URL('../../minicrm.sqlite', import.meta.url)),
);

conexion.pragma('foreign_keys = ON');
conexion.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    domicilio TEXT,
    localidad TEXT
  );

  CREATE TABLE IF NOT EXISTS actividades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    fecha_compromiso TEXT,
    fecha_finalizacion TEXT
  );
`);

export const db = drizzle(conexion, { schema: esquema });

export function sembrarBaseDeDatos() {
  db.transaction((tx) => {
    if (tx.select({ id: esquema.clientes.id }).from(esquema.clientes).get()) return;

    const proximaSemana = new Date();
    proximaSemana.setDate(proximaSemana.getDate() + 7);
    const fechaFutura = [
      proximaSemana.getFullYear(),
      String(proximaSemana.getMonth() + 1).padStart(2, '0'),
      String(proximaSemana.getDate()).padStart(2, '0'),
    ].join('-');

    const clientesIniciales = tx.insert(esquema.clientes).values([
      {
        nombre: 'Ana',
        apellido: 'García',
        email: 'ana.garcia@example.com',
        telefono: '381 555 0123',
        domicilio: 'San Martín 450',
        localidad: 'Yerba Buena',
      },
      { nombre: 'Bruno', apellido: 'López', email: 'bruno.lopez@example.com' },
      { nombre: 'Carla', apellido: 'Pérez', email: 'carla.perez@example.com' },
      { nombre: 'Diego', apellido: 'Ruiz', email: 'diego.ruiz@example.com' },
      { nombre: 'Elena', apellido: 'Torres', email: 'elena.torres@example.com' },
      { nombre: 'Federico', apellido: 'Díaz', email: 'federico.diaz@example.com' },
      { nombre: 'Gabriela', apellido: 'Sosa', email: 'gabriela.sosa@example.com' },
    ]).returning().all();

    for (const cliente of clientesIniciales) {
      if (cliente.email === 'ana.garcia@example.com') {
        tx.insert(esquema.actividades).values([
          { clienteId: cliente.id, descripcion: 'Consultar nuevas necesidades' },
          {
            clienteId: cliente.id,
            descripcion: 'Enviar presupuesto',
            fechaCompromiso: '2026-10-16',
          },
          {
            clienteId: cliente.id,
            descripcion: 'Llamar para seguimiento',
            fechaCompromiso: fechaFutura,
          },
          {
            clienteId: cliente.id,
            descripcion: 'Enviar presentación',
            fechaFinalizacion: '2026-10-15',
          },
          {
            clienteId: cliente.id,
            descripcion: 'Primera reunión',
            fechaFinalizacion: '2026-10-12',
          },
        ]).run();
        continue;
      }

      tx.insert(esquema.actividades).values([
        {
          clienteId: cliente.id,
          descripcion: 'Coordinar próxima reunión',
          fechaCompromiso: fechaFutura,
        },
        {
          clienteId: cliente.id,
          descripcion: 'Registrar consulta inicial',
          fechaFinalizacion: '2026-10-15',
        },
      ]).run();
    }
  });
}
