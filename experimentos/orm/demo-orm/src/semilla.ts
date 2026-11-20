import { eq } from 'drizzle-orm';
import { conexion, db } from './base.js';
import { Clientes } from './clientes.js';
import { actividades, clientes } from './esquema.js';
import { hoyTucuman } from './validacion.js';

const personas = [
  ['Lucía', 'Acosta'], ['Mateo', 'Benítez'], ['Valentina', 'Cabrera'], ['Joaquín', 'Díaz'],
  ['Martina', 'Ferreyra'], ['Santiago', 'Gómez'], ['Sofía', 'Herrera'], ['Benjamín', 'López'],
  ['Catalina', 'Medina'], ['Nicolás', 'Paz'],
];
const dia = (desplazamiento: number) => {
  const fecha = new Date(`${hoyTucuman()}T12:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + desplazamiento);
  return fecha.toISOString().slice(0, 10);
};

try {
  for (const [indice, [nombre, apellido]] of personas.entries()) {
    const email = `cliente${indice + 1}@example.com`;
    // El email único permite repetir la semilla sin modificar clientes existentes.
    if (await Clientes.buscarPorEmail(email)) continue;
    await db.transaction(async tx => {
      const [cliente] = await tx.insert(clientes).values({ nombre, apellido, email, telefono: '+5493815123456' }).onConflictDoNothing().returning();
      if (!cliente) return;
      await tx.insert(actividades).values([
        { clienteId: cliente.id, descripcion: 'Preparar propuesta de trabajo', fecha: dia(-3) },
        { clienteId: cliente.id, descripcion: 'Enviar presupuesto actualizado', fechaCompromiso: dia(-2) },
        { clienteId: cliente.id, descripcion: 'Confirmar próximos pasos', fechaCompromiso: dia(0) },
        { clienteId: cliente.id, descripcion: 'Reunión de seguimiento', fechaCompromiso: dia(7) },
        { clienteId: cliente.id, descripcion: 'Primer contacto y presentación', fecha: dia(-5), fechaFinalizacion: `${dia(-4)}T15:00:00.000Z` },
      ]);
    });
  }
  console.log(`Semilla lista: ${(await db.select().from(clientes)).length} clientes.`);
} finally {
  conexion.close();
}
