import { db } from './base.js';
import { actividades, clientes } from './esquema.js';
import { eq } from 'drizzle-orm';

const muestras = [
  ['Ana', 'Pérez', 'ana.perez@example.com', '+54 381 555 0101'],
  ['Bruno', 'Gómez', 'bruno.gomez@example.com', '+54 381 555 0102'],
  ['Carla', 'Díaz', 'carla.diaz@example.com', '+54 381 555 0103'],
  ['Diego', 'Luna', 'diego.luna@example.com', '+54 381 555 0104'],
  ['Elena', 'Rojas', 'elena.rojas@example.com', '+54 381 555 0105'],
  ['Facundo', 'Ruiz', 'facundo.ruiz@example.com', '+54 381 555 0106'],
  ['Gisela', 'Vega', 'gisela.vega@example.com', '+54 381 555 0107'],
  ['Hugo', 'Molina', 'hugo.molina@example.com', '+54 381 555 0108'],
  ['Inés', 'Torres', 'ines.torres@example.com', '+54 381 555 0109'],
  ['Julián', 'Castro', 'julian.castro@example.com', '+54 381 555 0110'],
] as const;

const hoy = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Argentina/Tucuman',
}).format(new Date());
const dia = (desfase: number) => {
  const fecha = new Date(`${hoy}T12:00:00-03:00`);
  fecha.setDate(fecha.getDate() + desfase);
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Argentina/Tucuman',
  }).format(fecha);
};

for (const [i, [nombre, apellido, email, telefono]] of muestras.entries()) {
  let cliente = (
    await db.select().from(clientes).where(eq(clientes.email, email))
  )[0];
  if (!cliente)
    cliente = (
      await db
        .insert(clientes)
        .values({ nombre, apellido, email, telefono })
        .returning()
    )[0];
  if (
    (
      await db
        .select()
        .from(actividades)
        .where(eq(actividades.clienteId, cliente.id))
    ).length
  )
    continue;
  await db.insert(actividades).values([
    {
      clienteId: cliente.id,
      descripcion: 'Enviar propuesta de seguimiento',
      fecha: dia(-12),
      fechaCompromiso: dia(-2),
      fechaFinalizacion: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      clienteId: cliente.id,
      descripcion: 'Preparar próxima reunión',
      fecha: dia(-4),
      fechaCompromiso: i % 3 === 0 ? null : dia(i % 3 === 1 ? -1 : i % 3),
      fechaFinalizacion: null,
    },
    {
      clienteId: cliente.id,
      descripcion: 'Revisar necesidades del cliente',
      fecha: dia(-1),
      fechaCompromiso: null,
      fechaFinalizacion: null,
    },
  ]);
}
console.log('Semilla cargada sin duplicar clientes ni actividades.');
