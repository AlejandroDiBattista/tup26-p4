import { db } from './index';
import { clientes, actividades } from './schema';
import { count } from 'drizzle-orm';

export async function sembrarDatos(forzar: boolean = false) {
  if (forzar) {
    console.log('Limpiando base de datos para sembrar nuevos datos al azar...');
    await db.delete(actividades);
    await db.delete(clientes);
  } else {
    const conteoResult = await db.select({ total: count() }).from(clientes);
    const total = conteoResult[0]?.total ?? 0;
    if (total > 0) {
      console.log('La base de datos ya contiene registros.');
      return;
    }
  }

  console.log('Sembrando contactos generados al azar...');

  const c1 = (
    await db
      .insert(clientes)
      .values({
        nombre: 'Sofía Benítez',
        email: 'sofia.benitez@inboxmail.net',
        telefono: '381 489 1234',
        direccion: 'Av. Sarmiento 840',
        ciudad: 'San Miguel de Tucumán',
      })
      .returning()
  )[0];

  const c2 = (
    await db
      .insert(clientes)
      .values({
        nombre: 'Joaquín Morales',
        email: 'j.morales@cloudwork.org',
        telefono: '381 512 8765',
        direccion: 'Chacabuco 312',
        ciudad: 'Yerba Buena',
      })
      .returning()
  )[0];

  const c3 = (
    await db
      .insert(clientes)
      .values({
        nombre: 'Valentina Rossi',
        email: 'valen.rossi@solucionesvr.com',
        telefono: '381 433 9901',
        direccion: 'Crisóstomo Álvarez 670',
        ciudad: 'San Miguel de Tucumán',
      })
      .returning()
  )[0];

  const otrosClientes = await db.insert(clientes).values([
    {
      nombre: 'Lucas Echeverría',
      email: 'lucas.echeverria@techandina.io',
      telefono: '381 601 4452',
      direccion: 'Av. Mate de Luna 2850',
      ciudad: 'San Miguel de Tucumán',
    },
    {
      nombre: 'Camila Navarro',
      email: 'c.navarro@greenlogistics.ar',
      telefono: '381 578 3319',
      direccion: 'Av. Solano Vera 1420',
      ciudad: 'Yerba Buena',
    },
    {
      nombre: 'Rodrigo Maidana',
      email: 'rodrigo.maidana@nortec.com',
      telefono: '381 490 6628',
      direccion: 'Laprida 890',
      ciudad: 'San Miguel de Tucumán',
    },
    {
      nombre: 'Florencia Ceballos',
      email: 'flor.ceballos@estudiojuridico.com',
      telefono: '381 523 1184',
      direccion: '24 de Septiembre 415',
      ciudad: 'San Miguel de Tucumán',
    },
    {
      nombre: 'Emiliano Paz',
      email: 'emiliano.paz@innovagroup.net',
      telefono: '381 644 7790',
      direccion: 'Las Rosas 180',
      ciudad: 'Yerba Buena',
    },
  ]).returning();

  // Actividades para Sofía Benítez
  await db.insert(actividades).values([
    {
      clienteId: c1.id,
      descripcion: 'Coordinar propuesta comercial para el nuevo ejercicio',
      fecha: null,
      completada: 0,
    },
    {
      clienteId: c1.id,
      descripcion: 'Enviar cotización de licencias anuales',
      fecha: '2026-10-18',
      completada: 0,
    },
    {
      clienteId: c1.id,
      descripcion: 'Videollamada de seguimiento de avances',
      fecha: '2026-10-29',
      completada: 0,
    },
    {
      clienteId: c1.id,
      descripcion: 'Envío de dossier corporativo y lista de precios',
      fecha: null,
      completada: 1,
      fechaCompletada: '2026-10-14',
    },
    {
      clienteId: c1.id,
      descripcion: 'Reunión inicial de relevamiento',
      fecha: null,
      completada: 1,
      fechaCompletada: '2026-10-10',
    },
  ]);

  // Actividades para Joaquín Morales
  await db.insert(actividades).values([
    {
      clienteId: c2.id,
      descripcion: 'Renovación de póliza de servicio técnico',
      fecha: '2026-11-04',
      completada: 0,
    },
    {
      clienteId: c2.id,
      descripcion: 'Demostración de plataforma en vivo',
      fecha: null,
      completada: 1,
      fechaCompletada: '2026-10-21',
    },
  ]);

  // Actividades para Valentina Rossi
  await db.insert(actividades).values([
    {
      clienteId: c3.id,
      descripcion: 'Presentar muestra de catálogo digital',
      fecha: '2026-10-20',
      completada: 0,
    },
  ]);

  // Actividades para Lucas Echeverría
  if (otrosClientes.length > 0) {
    await db.insert(actividades).values([
      {
        clienteId: otrosClientes[0].id,
        descripcion: 'Definir requerimientos de infraestructura',
        fecha: '2026-11-12',
        completada: 0,
      },
    ]);
  }

  console.log('Datos sembrados con éxito.');
}

if (require.main === module) {
  sembrarDatos(true).then(() => process.exit(0));
}
