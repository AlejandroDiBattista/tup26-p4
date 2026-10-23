import { eq } from 'drizzle-orm';
import { db } from './conexion';
import { actividades, clientes } from './esquema';
import { hoy, sumarDias } from '../fechas';

// Las fechas se expresan en días relativos a hoy, para que siempre haya
// compromisos vencidos (negativos), de hoy (0) y futuros (positivos).
type ActividadSemilla = {
  descripcion: string;
  fecha?: number;
  compromiso?: number;
  finalizada?: number;
};

type ClienteSemilla = {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  actividades: ActividadSemilla[];
};

const datos: ClienteSemilla[] = [
  {
    nombre: 'Lucía', apellido: 'Fernández', email: 'lucia.fernandez@example.com', telefono: '+5493815123456',
    actividades: [
      { descripcion: 'Llamada de presentación', fecha: -20, finalizada: -20 },
      { descripcion: 'Enviar propuesta comercial', fecha: -10, compromiso: -3 },
      { descripcion: 'Reunión de seguimiento', fecha: -2, compromiso: 5 },
      { descripcion: 'Consultar necesidades de capacitación', fecha: -1 },
    ],
  },
  {
    nombre: 'Martín', apellido: 'Gómez', email: 'martin.gomez@example.com', telefono: '+5493814234567',
    actividades: [
      { descripcion: 'Visita a la planta', fecha: -15, compromiso: -12, finalizada: -12 },
      { descripcion: 'Enviar presupuesto de mantenimiento', fecha: -5, compromiso: 0 },
      { descripcion: 'Coordinar demostración del producto', fecha: -3 },
    ],
  },
  {
    nombre: 'Sofía', apellido: 'Paz', email: 'sofia.paz@example.com',
    actividades: [
      { descripcion: 'Primer contacto por correo', fecha: -30, finalizada: -29 },
      { descripcion: 'Confirmar datos de facturación', fecha: -8, compromiso: -6 },
      { descripcion: 'Renovación del contrato anual', fecha: -1, compromiso: 30 },
    ],
  },
  {
    nombre: 'Diego', apellido: 'Herrera', email: 'diego.herrera@example.com', telefono: '+543814301234',
    actividades: [
      { descripcion: 'Reunión inicial', fecha: -40, finalizada: -40 },
      { descripcion: 'Firma del acuerdo de servicio', fecha: -25, compromiso: -20, finalizada: -18 },
      { descripcion: 'Pedir referencias de otros clientes', fecha: -4 },
    ],
  },
  {
    nombre: 'Valentina', apellido: 'Ruiz', email: 'valentina.ruiz@example.com', telefono: '+5493816543210',
    actividades: [
      { descripcion: 'Llamar para agendar capacitación', fecha: -7, compromiso: -1 },
      { descripcion: 'Preparar informe trimestral', fecha: -2, compromiso: 10 },
      { descripcion: 'Enviar encuesta de satisfacción', fecha: -14, finalizada: -10 },
    ],
  },
  {
    nombre: 'Joaquín', apellido: 'Medina', email: 'joaquin.medina@example.com',
    actividades: [
      { descripcion: 'Presentar nueva línea de productos', fecha: -3, compromiso: 2 },
      { descripcion: 'Revisar reclamo de entrega', fecha: -9, compromiso: -5 },
    ],
  },
  {
    nombre: 'Camila', apellido: 'Sosa', email: 'camila.sosa@example.com', telefono: '+5493815987654',
    actividades: [
      { descripcion: 'Reunión por videollamada', fecha: -6, finalizada: -6 },
      { descripcion: 'Definir fecha de instalación', fecha: -1 },
      { descripcion: 'Enviar manual de usuario', fecha: 0, compromiso: 1 },
    ],
  },
  {
    nombre: 'Tomás', apellido: 'Acosta', email: 'tomas.acosta@example.com', telefono: '+543814456789',
    actividades: [
      { descripcion: 'Actualizar datos de contacto', fecha: -50, finalizada: -49 },
      { descripcion: 'Ofrecer plan de soporte extendido', fecha: -20, compromiso: -15 },
      { descripcion: 'Visita comercial', fecha: -1, compromiso: 14 },
    ],
  },
  {
    nombre: 'Florencia', apellido: 'Molina', email: 'florencia.molina@example.com',
    actividades: [
      { descripcion: 'Demostración en oficinas del cliente', fecha: -12, compromiso: -8, finalizada: -8 },
      { descripcion: 'Enviar cotización de licencias', fecha: -2, compromiso: 0 },
      { descripcion: 'Evaluar descuento por volumen', fecha: -2 },
    ],
  },
  {
    nombre: 'Nicolás', apellido: 'Romero', email: 'nicolas.romero@example.com', telefono: '+5493813210987',
    actividades: [
      { descripcion: 'Llamada de bienvenida', fecha: -5, finalizada: -5 },
      { descripcion: 'Agendar reunión con el área técnica', fecha: -4, compromiso: 7 },
      { descripcion: 'Confirmar cantidad de usuarios', fecha: -10, compromiso: -2 },
    ],
  },
];

function fechaRelativa(dias?: number) {
  return dias === undefined ? null : sumarDias(hoy(), dias);
}

function fechaHoraRelativa(dias?: number) {
  // Tucumán está siempre en UTC-3: se finaliza a las 12:30 de ese día.
  return dias === undefined ? null : new Date(`${sumarDias(hoy(), dias)}T12:30:00-03:00`);
}

async function cargarSemilla() {
  let agregados = 0;

  for (const { actividades: lista, ...cliente } of datos) {
    // Si el email ya existe, no se inserta el cliente ni sus actividades.
    const existentes = await db.select().from(clientes).where(eq(clientes.email, cliente.email));
    if (existentes.length) continue;

    await db.transaction(async (tx) => {
      const [nuevo] = await tx.insert(clientes).values(cliente).returning({ id: clientes.id });
      await tx.insert(actividades).values(
        lista.map((actividad) => ({
          clienteId: nuevo.id,
          descripcion: actividad.descripcion,
          fecha: fechaRelativa(actividad.fecha),
          compromiso: fechaRelativa(actividad.compromiso),
          finalizacion: fechaHoraRelativa(actividad.finalizada),
        })),
      );
      agregados++;
    });
  }

  console.log(`Semilla cargada: ${agregados} clientes nuevos, ${datos.length - agregados} ya existían.`);
}

await cargarSemilla();
