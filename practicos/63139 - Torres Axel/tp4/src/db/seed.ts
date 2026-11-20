import { eq } from 'drizzle-orm';
import { db, sqlite } from './index.js';
import { clientes } from './schema.js';
import { Clientes } from '../services/clientes.js';

const ejemplos = [
  ['Ana', 'García', 'ana.garcia', 'Yerba Buena'],
  ['Bruno', 'López', 'bruno.lopez', 'San Miguel de Tucumán'],
  ['Carla', 'Pérez', 'carla.perez', 'Tafí Viejo'],
  ['Diego', 'Ruiz', 'diego.ruiz', 'San Miguel de Tucumán'],
  ['Elena', 'Torres', 'elena.torres', 'Yerba Buena'],
  ['Federico', 'Díaz', 'federico.diaz', 'Banda del Río Salí'],
  ['Gabriela', 'Sosa', 'gabriela.sosa', 'Concepción'],
  ['Hugo', 'Medina', 'hugo.medina', 'Tafí Viejo'],
  ['Inés', 'Rojas', 'ines.rojas', 'San Miguel de Tucumán'],
  ['Julián', 'Vega', 'julian.vega', 'Monteros'],
];

function fechaRelativa(dias: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

let agregados = 0;
try {
  db.transaction(() => {
    ejemplos.forEach(([nombre, apellido, usuario, localidad], i) => {
      const email = `${usuario}@example.com`;
      if (db.select().from(clientes).where(eq(clientes.email, email)).get()) return;
      const cliente = Clientes.crear({ nombre, apellido, email, localidad,
        telefono: `381555${String(1000 + i)}`, domicilio: `San Martín ${450 + i * 100}` });
      Clientes.agregarActividad(cliente.id, { descripcion: 'Consultar nuevas necesidades' });
      Clientes.agregarActividad(cliente.id, { descripcion: 'Enviar presupuesto', fechaCompromiso: fechaRelativa(-2) });
      Clientes.agregarActividad(cliente.id, { descripcion: 'Llamar para seguimiento', fechaCompromiso: fechaRelativa(3) });
      const actividad = Clientes.agregarActividad(cliente.id, { descripcion: 'Enviar presentación' });
      Clientes.completarActividad(cliente.id, actividad.id);
      agregados++;
    });
  });
  console.log(`Datos de ejemplo listos: ${agregados} clientes agregados. No se duplicaron los existentes.`);
} finally {
  sqlite.close();
}
