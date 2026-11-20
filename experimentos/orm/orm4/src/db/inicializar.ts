import { eq } from 'drizzle-orm';
import { actividades, clientes } from './schema.js';
import { db } from './index.js';

export async function cargarDatosIniciales() {
  await cargarDatosSemilla();
}

async function cargarDatosSemilla() {
  const datos = [
    {
      nombre: 'Ana', apellido: 'Pérez', telefono: '381-555-0101', email: 'ana.perez@example.com',
      actividades: ['Llamar para presentarse', 'Enviar catálogo', 'Coordinar reunión'],
    },
    {
      nombre: 'Bruno', apellido: 'López', telefono: '381-555-0102', email: 'bruno.lopez@example.com',
      actividades: ['Consultar necesidades', 'Preparar presupuesto', 'Enviar propuesta'],
    },
    {
      nombre: 'Carla', apellido: 'Gómez', telefono: '381-555-0103', email: 'carla.gomez@example.com',
      actividades: ['Responder consulta', 'Agendar demostración', 'Dar seguimiento'],
    },
    {
      nombre: 'Diego', apellido: 'Díaz', telefono: '381-555-0104', email: 'diego.diaz@example.com',
      actividades: ['Actualizar datos', 'Revisar contrato', 'Confirmar renovación'],
    },
    {
      nombre: 'Elena', apellido: 'Ruiz', telefono: '381-555-0105', email: 'elena.ruiz@example.com',
      actividades: ['Contactar por email', 'Compartir documentación', 'Programar seguimiento'],
    },
    {
      nombre: 'Facundo', apellido: 'Herrera', telefono: '381-555-0106', email: 'facundo.herrera@example.com',
      actividades: ['Presentar servicios', 'Enviar información', 'Agendar llamada'],
    },
    {
      nombre: 'Gabriela', apellido: 'Acosta', telefono: '381-555-0107', email: 'gabriela.acosta@example.com',
      actividades: ['Revisar consulta', 'Compartir presupuesto', 'Confirmar recepción'],
    },
    {
      nombre: 'Hernán', apellido: 'Medina', telefono: '381-555-0108', email: 'hernan.medina@example.com',
      actividades: ['Llamar por referencia', 'Enviar propuesta', 'Coordinar visita'],
    },
    {
      nombre: 'Inés', apellido: 'Castro', telefono: '381-555-0109', email: 'ines.castro@example.com',
      actividades: ['Responder correo', 'Compartir catálogo', 'Consultar disponibilidad'],
    },
    {
      nombre: 'Joaquín', apellido: 'Suárez', telefono: '381-555-0110', email: 'joaquin.suarez@example.com',
      actividades: ['Actualizar contacto', 'Enviar documentación', 'Programar reunión'],
    },
    {
      nombre: 'Karina', apellido: 'Navarro', telefono: '381-555-0111', email: 'karina.navarro@example.com',
      actividades: ['Consultar requerimientos', 'Preparar cotización', 'Dar seguimiento'],
    },
    {
      nombre: 'Leandro', apellido: 'Molina', telefono: '381-555-0112', email: 'leandro.molina@example.com',
      actividades: ['Presentar novedades', 'Enviar lista de precios', 'Confirmar pedido'],
    },
    {
      nombre: 'Mariana', apellido: 'Rojas', telefono: '381-555-0113', email: 'mariana.rojas@example.com',
      actividades: ['Agendar demostración', 'Compartir material', 'Consultar opinión'],
    },
    {
      nombre: 'Nicolás', apellido: 'Vega', telefono: '381-555-0114', email: 'nicolas.vega@example.com',
      actividades: ['Contactar por teléfono', 'Enviar resumen', 'Coordinar próximo paso'],
    },
    {
      nombre: 'Olivia', apellido: 'Sosa', telefono: '381-555-0115', email: 'olivia.sosa@example.com',
      actividades: ['Revisar necesidades', 'Armar propuesta', 'Agendar seguimiento'],
    },
    {
      nombre: 'Pablo', apellido: 'Ferreyra', telefono: '381-555-0116', email: 'pablo.ferreyra@example.com',
      actividades: ['Enviar presentación', 'Consultar decisión', 'Actualizar registro'],
    },
    {
      nombre: 'Romina', apellido: 'Benítez', telefono: '381-555-0117', email: 'romina.benitez@example.com',
      actividades: ['Responder solicitud', 'Compartir opciones', 'Confirmar reunión'],
    },
    {
      nombre: 'Santiago', apellido: 'Arias', telefono: '381-555-0118', email: 'santiago.arias@example.com',
      actividades: ['Presentar propuesta', 'Enviar condiciones', 'Llamar para consultar'],
    },
    {
      nombre: 'Tamara', apellido: 'Luna', telefono: '381-555-0119', email: 'tamara.luna@example.com',
      actividades: ['Verificar datos', 'Enviar contrato', 'Coordinar firma'],
    },
    {
      nombre: 'Ulises', apellido: 'Campos', telefono: '381-555-0120', email: 'ulises.campos@example.com',
      actividades: ['Contactar por email', 'Compartir presupuesto', 'Definir fecha de visita'],
    },
    {
      nombre: 'Valentina', apellido: 'Ortiz', telefono: '381-555-0121', email: 'valentina.ortiz@example.com',
      actividades: ['Agendar entrevista', 'Enviar agenda', 'Solicitar comentarios'],
    },
    {
      nombre: 'Walter', apellido: 'Quiroga', telefono: '381-555-0122', email: 'walter.quiroga@example.com',
      actividades: ['Revisar cuenta', 'Informar actualización', 'Programar llamada'],
    },
    {
      nombre: 'Ximena', apellido: 'Paz', telefono: '381-555-0123', email: 'ximena.paz@example.com',
      actividades: ['Responder consulta', 'Enviar alternativas', 'Confirmar interés'],
    },
    {
      nombre: 'Yamil', apellido: 'Cabrera', telefono: '381-555-0124', email: 'yamil.cabrera@example.com',
      actividades: ['Presentar catálogo', 'Preparar muestra', 'Coordinar entrega'],
    },
    {
      nombre: 'Zoe', apellido: 'Méndez', telefono: '381-555-0125', email: 'zoe.mendez@example.com',
      actividades: ['Llamar para saludar', 'Compartir novedades', 'Agendar próximo contacto'],
    },
  ];

  for (const datosCliente of datos) {
    const [clienteExistente] = await db
      .select({ id: clientes.id })
      .from(clientes)
      .where(eq(clientes.email, datosCliente.email))
      .limit(1);
    if (clienteExistente) continue;

    const { actividades: descripciones, ...datosClienteSinActividades } = datosCliente;
    const [cliente] = await db.insert(clientes).values(datosClienteSinActividades).returning();

    await db.insert(actividades).values(
      descripciones.map((descripcion) => ({ clienteId: cliente.id, descripcion })),
    );
  }
}
