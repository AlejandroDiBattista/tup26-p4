import { eq } from 'drizzle-orm';
import { baseDeDatos } from '../db/conexion.ts';
import { actividades } from '../db/esquema.ts';
import { ErrorDeNegocio } from './errores.ts';

type DatosActividad = { descripcion: string; fecha?: string };

export class Actividades {
  static async crear(clienteId: number, { descripcion, fecha }: DatosActividad) {
    const [actividad] = await baseDeDatos.insert(actividades).values({ clienteId, descripcion, fecha }).returning();
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
    if (actividad.completada) {
      throw new ErrorDeNegocio('Una actividad completada no se puede editar ni borrar');
    }
  }
}
