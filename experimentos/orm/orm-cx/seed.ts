import { db, cliente } from './db.js';
import { clientes, actividades } from './schema.js';

const ejemplos = [
  { nombre: 'Lucía',    apellido: 'Gómez',      email: 'lucia.gomez@example.com',     telefono: '+54 381 555 0101' },
  { nombre: 'Martín',   apellido: 'López',      email: 'martin.lopez@example.com',    telefono: null },
  { nombre: 'Sofía',    apellido: 'Fernández',  email: 'sofia.fernandez@example.com', telefono: '+54 381 555 0103' },
  { nombre: 'Diego',    apellido: 'Rodríguez',  email: 'diego.rodriguez@example.com', telefono: null },
  { nombre: 'Valentina', apellido: 'Díaz',      email: 'valentina.diaz@example.com', telefono: '+54 381 555 0105' },
  { nombre: 'Pablo',    apellido: 'Martínez',   email: 'pablo.martinez@example.com',  telefono: '+54 381 555 0106' },
  { nombre: 'Camila',   apellido: 'Romero',     email: 'camila.romero@example.com',   telefono: null },
  { nombre: 'Nicolás',  apellido: 'Sosa',       email: 'nicolas.sosa@example.com',    telefono: '+54 381 555 0108' },
  { nombre: 'Carolina', apellido: 'Torres',     email: 'carolina.torres@example.com', telefono: null },
  { nombre: 'Javier',   apellido: 'Ruiz',       email: 'javier.ruiz@example.com',     telefono: '+54 381 555 0110' },
];

try {
  let creados = 0;

  await db.transaction(async (tx) => {
    for (const ejemplo of ejemplos) {
      const [nuevo] = await tx.insert(clientes).values(ejemplo)
        .onConflictDoNothing({ target: clientes.email }).returning();

      // Si el email ya existe, conservamos sus datos y actividades.
      if (!nuevo) continue;

      await tx.insert(actividades).values([
        {
          clienteId: nuevo.id,
          descripcion: 'Primera llamada para conocer sus necesidades',
          fecha: '2026-10-01',
          completadaEn: new Date('2026-10-01T14:00:00Z'),
        },
        {
          clienteId: nuevo.id,
          descripcion: 'Enviar propuesta comercial',
          fechaCompromiso: '2026-10-20',
        },
        {
          clienteId: nuevo.id,
          descripcion: 'Consultar su interés en una nueva reunión',
        },
      ]);

      creados++;
    }
  });

  console.log(`Semilla: ${creados} clientes y ${creados * 3} actividades agregados.`);
} finally {
  cliente.close();
}
