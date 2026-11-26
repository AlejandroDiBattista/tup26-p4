import { db, sqlite } from './index';
import { actividades, clientes } from './schema';

/** Fecha ISO corta desplazada N días respecto de hoy. */
function fechaRelativa(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

interface Semilla {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  compromisos: { descripcion: string; fecha: string | null }[];
  completadas: { descripcion: string; fechaCompletada: string }[];
}

const semilla: Semilla[] = [
  {
    nombre: 'Ana García',
    email: 'ana.garcia@example.com',
    telefono: '381 555 0123',
    direccion: 'San Martín 450',
    ciudad: 'Yerba Buena',
    compromisos: [
      { descripcion: 'Consultar nuevas necesidades', fecha: null },
      { descripcion: 'Enviar presupuesto', fecha: fechaRelativa(-10) },
      { descripcion: 'Llamar para seguimiento', fecha: fechaRelativa(4) },
    ],
    completadas: [
      { descripcion: 'Enviar presentación', fechaCompletada: fechaRelativa(-15) },
      { descripcion: 'Primera reunión', fechaCompletada: fechaRelativa(-18) },
    ],
  },
  {
    nombre: 'Bruno López',
    email: 'bruno.lopez@example.com',
    telefono: '381 555 0144',
    direccion: 'Av. Aconquija 1200',
    ciudad: 'Yerba Buena',
    compromisos: [{ descripcion: 'Enviar catálogo actualizado', fecha: fechaRelativa(7) }],
    completadas: [],
  },
  {
    nombre: 'Carla Pérez',
    email: 'carla.perez@example.com',
    telefono: '381 555 0177',
    direccion: 'Junín 320',
    ciudad: 'San Miguel de Tucumán',
    compromisos: [{ descripcion: 'Coordinar visita técnica', fecha: fechaRelativa(-3) }],
    completadas: [{ descripcion: 'Reunión de diagnóstico', fechaCompletada: fechaRelativa(-25) }],
  },
  {
    nombre: 'Diego Ruiz',
    email: 'diego.ruiz@example.com',
    telefono: '381 555 0198',
    direccion: 'Rivadavia 88',
    ciudad: 'Tafí Viejo',
    compromisos: [],
    completadas: [{ descripcion: 'Alta de cuenta', fechaCompletada: fechaRelativa(-40) }],
  },
  {
    nombre: 'Elena Torres',
    email: 'elena.torres@example.com',
    telefono: '381 555 0210',
    direccion: 'Belgrano 745',
    ciudad: 'San Miguel de Tucumán',
    compromisos: [
      { descripcion: 'Reenviar contrato firmado', fecha: fechaRelativa(2) },
      { descripcion: 'Consultar forma de pago', fecha: null },
    ],
    completadas: [],
  },
  {
    nombre: 'Federico Díaz',
    email: 'federico.diaz@example.com',
    telefono: '381 555 0233',
    direccion: 'Las Heras 1010',
    ciudad: 'Yerba Buena',
    compromisos: [{ descripcion: 'Preparar propuesta comercial', fecha: fechaRelativa(9) }],
    completadas: [{ descripcion: 'Llamada inicial', fechaCompletada: fechaRelativa(-8) }],
  },
  {
    nombre: 'Gabriela Sosa',
    email: 'gabriela.sosa@example.com',
    telefono: '381 555 0265',
    direccion: 'Córdoba 455',
    ciudad: 'San Miguel de Tucumán',
    compromisos: [{ descripcion: 'Confirmar reunión mensual', fecha: fechaRelativa(12) }],
    completadas: [{ descripcion: 'Envío de documentación', fechaCompletada: fechaRelativa(-5) }],
  },
];

function sembrar(): void {
  const [{ total }] = sqlite
    .prepare('SELECT COUNT(*) AS total FROM clientes')
    .all() as { total: number }[];

  if (total > 0) {
    console.log('La base de datos ya tiene clientes. No se insertó la semilla.');
    return;
  }

  for (const item of semilla) {
    const cliente = db
      .insert(clientes)
      .values({
        nombre: item.nombre,
        email: item.email,
        telefono: item.telefono,
        direccion: item.direccion,
        ciudad: item.ciudad,
      })
      .returning()
      .get();

    for (const compromiso of item.compromisos) {
      db.insert(actividades)
        .values({
          clienteId: cliente.id,
          descripcion: compromiso.descripcion,
          fecha: compromiso.fecha,
          completada: false,
        })
        .run();
    }

    for (const completada of item.completadas) {
      db.insert(actividades)
        .values({
          clienteId: cliente.id,
          descripcion: completada.descripcion,
          fecha: null,
          completada: true,
          fechaCompletada: completada.fechaCompletada,
        })
        .run();
    }
  }

  console.log(`Semilla cargada: ${semilla.length} clientes de ejemplo.`);
}

sembrar();
