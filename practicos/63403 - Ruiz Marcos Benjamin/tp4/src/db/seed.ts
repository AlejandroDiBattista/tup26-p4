import { db } from './index';
import { clientes, actividades } from './schema';

// Fecha relativa a hoy en formato YYYY-MM-DD
const dia = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

type Semilla = {
  cliente: typeof clientes.$inferInsert;
  actividades: Omit<typeof actividades.$inferInsert, 'clienteId'>[];
};

const datos: Semilla[] = [
  {
    cliente: { nombre: 'Lucía', apellido: 'Fernández', email: 'lucia.fernandez@mail.com', telefono: '3814123456', domicilio: 'San Martín 450', localidad: 'San Miguel de Tucumán' },
    actividades: [
      { descripcion: 'Enviar presupuesto', fechaCompromiso: dia(-5), fechaFinalizacion: dia(-6) },
      { descripcion: 'Llamar para seguimiento', fechaCompromiso: dia(2) },
      { descripcion: 'Pedir referencias' },
    ],
  },
  {
    cliente: { nombre: 'Martín', apellido: 'Gómez', email: 'martin.gomez@mail.com', telefono: '3815234567', localidad: 'Yerba Buena' },
    actividades: [
      { descripcion: 'Reunión de presentación', fechaCompromiso: dia(-3) },
      { descripcion: 'Enviar catálogo', fechaCompromiso: dia(0) },
    ],
  },
  {
    cliente: { nombre: 'Sofía', apellido: 'Díaz', email: 'sofia.diaz@mail.com', telefono: '3816345678', domicilio: 'Av. Mate de Luna 1200', localidad: 'San Miguel de Tucumán' },
    actividades: [
      { descripcion: 'Firmar contrato', fechaCompromiso: dia(-10), fechaFinalizacion: dia(-9) },
      { descripcion: 'Capacitación inicial', fechaCompromiso: dia(7) },
    ],
  },
  {
    cliente: { nombre: 'Joaquín', apellido: 'Pérez', email: 'joaquin.perez@mail.com', localidad: 'Tafí Viejo' },
    actividades: [{ descripcion: 'Confirmar datos de facturación' }],
  },
  {
    cliente: { nombre: 'Valentina', apellido: 'López', email: 'valentina.lopez@mail.com', telefono: '3817456789', domicilio: 'Laprida 233', localidad: 'Banda del Río Salí' },
    actividades: [
      { descripcion: 'Visita técnica', fechaCompromiso: dia(-1) },
      { descripcion: 'Enviar factura', fechaCompromiso: dia(-15), fechaFinalizacion: dia(-14) },
      { descripcion: 'Encuesta de satisfacción', fechaCompromiso: dia(14) },
    ],
  },
  {
    cliente: { nombre: 'Tomás', apellido: 'Martínez', email: 'tomas.martinez@mail.com', telefono: '3818567890' },
    actividades: [
      { descripcion: 'Renovar suscripción', fechaCompromiso: dia(30) },
      { descripcion: 'Resolver reclamo', fechaCompromiso: dia(-2), fechaFinalizacion: dia(-2) },
    ],
  },
  {
    cliente: { nombre: 'Camila', apellido: 'Romero', email: 'camila.romero@mail.com', domicilio: 'Córdoba 870', localidad: 'San Miguel de Tucumán' },
    actividades: [
      { descripcion: 'Demo del producto', fechaCompromiso: dia(3) },
      { descripcion: 'Mandar propuesta comercial' },
    ],
  },
  {
    cliente: { nombre: 'Nicolás', apellido: 'Sosa', email: 'nicolas.sosa@mail.com', telefono: '3819678901', localidad: 'Lules' },
    actividades: [{ descripcion: 'Primer contacto', fechaCompromiso: dia(-20), fechaFinalizacion: dia(-20) }],
  },
  {
    cliente: { nombre: 'Agustina', apellido: 'Torres', email: 'agustina.torres@mail.com', telefono: '3814789012', domicilio: 'Junín 55', localidad: 'Famaillá' },
    actividades: [
      { descripcion: 'Coordinar entrega', fechaCompromiso: dia(-7) },
      { descripcion: 'Cobrar saldo pendiente', fechaCompromiso: dia(1) },
    ],
  },
  {
    cliente: { nombre: 'Facundo', apellido: 'Ruiz', email: 'facundo.ruiz@mail.com', localidad: 'Concepción' },
    actividades: [],
  },
];

let nuevos = 0;
for (const { cliente, actividades: lista } of datos) {
  // Si el email ya existe no se inserta (evita duplicar al repetir la carga)
  const [creado] = await db
    .insert(clientes)
    .values(cliente)
    .onConflictDoNothing({ target: clientes.email })
    .returning({ id: clientes.id });

  if (!creado) continue;
  nuevos++;
  if (lista.length) {
    await db.insert(actividades).values(lista.map(a => ({ ...a, clienteId: creado.id })));
  }
}

console.log(`Semilla: ${nuevos} clientes nuevos (${datos.length - nuevos} ya existían)`);
