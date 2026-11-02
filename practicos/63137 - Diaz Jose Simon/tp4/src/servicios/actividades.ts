import { eq } from 'drizzle-orm';
import { baseDeDatos } from '../db/conexion.ts';
import { actividades } from '../db/esquema.ts';
import { Clientes } from './clientes.ts';
import { ACTIVIDAD_COMPLETADA, ErrorDeNegocio, NO_ENCONTRADO } from './errores.ts';

type DatosActividad = { descripcion: string; fecha?: string };

export class Actividades {
  static async crear(clienteId: number, { descripcion, fecha }: DatosActividad) {
    await Clientes.obtener(clienteId);
    const [actividad] = await baseDeDatos
      .insert(actividades)
      .values({ clienteId, descripcion, fecha })
      .returning();
    return actividad;
  }

  static async actualizar(id: number, { descripcion, fecha }: DatosActividad) {
    await Actividades.verificarPendiente(id);
    const [actividad] = await baseDeDatos
      .update(actividades)
      .set({ descripcion, fecha })
      .where(eq(actividades.id, id))
      .returning();
    return actividad;
  }

  static async completar(id: number) {
    await Actividades.verificarPendiente(id);
    const [actividad] = await baseDeDatos
      .update(actividades)
      .set({ completada: true })
      .where(eq(actividades.id, id))
      .returning();
    return actividad;
  }

  static async eliminar(id: number) {
    await Actividades.verificarPendiente(id);
    await baseDeDatos.delete(actividades).where(eq(actividades.id, id));
  }

  private static async verificarPendiente(id: number) {
    const [actividad] = await baseDeDatos.select().from(actividades).where(eq(actividades.id, id));
    if (!actividad) throw new ErrorDeNegocio(NO_ENCONTRADO, 'La actividad no existe');
    if (actividad.completada) {
      throw new ErrorDeNegocio(ACTIVIDAD_COMPLETADA, 'Una actividad completada no se puede modificar');
    }
  }
}
