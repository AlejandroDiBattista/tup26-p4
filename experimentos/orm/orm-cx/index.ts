import { cliente } from './db.js';
import { Clientes } from './repositorios/clientes.js';

try {
  // Si el cliente ya existe, reutilizamos sus datos.
  const ana = await Clientes.buscarPorEmail('ana@example.com')
    ?? await Clientes.crear({
      nombre: 'Ana',
      apellido: 'Pérez',
      email: 'ana@example.com',
    });

  const actividad = await Clientes.crearActividad(ana.id, {
    descripcion: 'Llamar para presentar una propuesta',
    fechaCompromiso: '2026-10-20',
  });

  console.log('Actividad pendiente:');
  console.table([actividad]);

  await Clientes.completarActividad(ana.id, actividad.id);

  console.log('Actividades del cliente:');
  console.table(await Clientes.listarActividades(ana.id));
} finally {
  cliente.close();
}
