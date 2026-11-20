import { eq, like, or } from 'drizzle-orm';
import { db, clientes, actividades, type Cliente, type NuevoCliente, type Actividad, type NuevaActividad } from './db.js';

const hoy = () => new Date().toISOString().slice(0, 10);
const clean = (s?: string | null) => s?.trim() || null;

export class Clientes {
  static listar(q = ''): Cliente[] {
    const texto = q.trim();
    if (!texto) {
      return db.select().from(clientes).all();
    }
    const palabras = texto.split(/\s+/).filter(Boolean);
    const todos = db.select().from(clientes).all();
    return todos.filter((c) => {
      const campos = [c.nombre, c.apellido, c.email, c.domicilio, c.localidad, c.telefono]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return palabras.every((p) => campos.includes(p.toLowerCase()));
    });
  }

  static obtener(id: number): (Cliente & { actividades: (Actividad & { vencida: boolean })[] }) | null {
    const cliente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!cliente) return null;
    const acts = this.actividades(id);
    return { ...cliente, actividades: acts };
  }

  static crear(datos: NuevoCliente): Cliente {
    if (!datos.nombre?.trim() || !datos.apellido?.trim() || !datos.email?.trim()) {
      throw new Error('Nombre, apellido y email son requeridos');
    }
    return db
      .insert(clientes)
      .values({
        ...datos,
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        email: datos.email.trim().toLowerCase(),
        domicilio: clean(datos.domicilio),
        localidad: clean(datos.localidad),
        telefono: clean(datos.telefono),
      })
      .returning()
      .get();
  }

  static actualizar(id: number, datos: Partial<NuevoCliente>): Cliente {
    const existente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!existente) throw new Error('Cliente no encontrado');

    const updateData: Partial<NuevoCliente> = {};
    if (datos.nombre !== undefined) updateData.nombre = datos.nombre.trim();
    if (datos.apellido !== undefined) updateData.apellido = datos.apellido.trim();
    if (datos.email !== undefined) updateData.email = datos.email.trim().toLowerCase();
    if (datos.domicilio !== undefined) updateData.domicilio = clean(datos.domicilio);
    if (datos.localidad !== undefined) updateData.localidad = clean(datos.localidad);
    if (datos.telefono !== undefined) updateData.telefono = clean(datos.telefono);

    return db
      .update(clientes)
      .set(updateData)
      .where(eq(clientes.id, id))
      .returning()
      .get();
  }

  static eliminar(id: number): void {
    const existente = db.select().from(clientes).where(eq(clientes.id, id)).get();
    if (!existente) throw new Error('Cliente no encontrado');
    db.delete(clientes).where(eq(clientes.id, id)).run();
  }

  static actividades(clienteId: number): (Actividad & { vencida: boolean })[] {
    const lista = db.select().from(actividades).where(eq(actividades.clienteId, clienteId)).all();
    const hoyStr = hoy();
    return lista.map((a) => ({
      ...a,
      vencida: !a.fechaFinalizacion && !!a.fechaCompromiso && a.fechaCompromiso < hoyStr,
    }));
  }

  static crearActividad(clienteId: number, datos: { descripcion: string; fechaCompromiso?: string | null }): Actividad {
    if (!datos.descripcion?.trim()) throw new Error('La descripción de la actividad es requerida');
    const cliente = db.select().from(clientes).where(eq(clientes.id, clienteId)).get();
    if (!cliente) throw new Error('Cliente no encontrado');

    return db
      .insert(actividades)
      .values({
        clienteId,
        descripcion: datos.descripcion.trim(),
        fechaCompromiso: clean(datos.fechaCompromiso),
        fechaFinalizacion: null,
      })
      .returning()
      .get();
  }

  static editarActividad(id: number, datos: { descripcion?: string; fechaCompromiso?: string | null }): Actividad {
    const existente = db.select().from(actividades).where(eq(actividades.id, id)).get();
    if (!existente) throw new Error('Actividad no encontrada');
    if (existente.fechaFinalizacion) {
      throw new Error('La actividad completada no se puede editar');
    }

    const updateData: Partial<NuevaActividad> = {};
    if (datos.descripcion !== undefined) updateData.descripcion = datos.descripcion.trim();
    if (datos.fechaCompromiso !== undefined) updateData.fechaCompromiso = clean(datos.fechaCompromiso);

    return db
      .update(actividades)
      .set(updateData)
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

  static completarActividad(id: number): Actividad {
    const existente = db.select().from(actividades).where(eq(actividades.id, id)).get();
    if (!existente) throw new Error('Actividad no encontrada');
    if (existente.fechaFinalizacion) return existente;

    return db
      .update(actividades)
      .set({ fechaFinalizacion: hoy() })
      .where(eq(actividades.id, id))
      .returning()
      .get();
  }

  static eliminarActividad(id: number): void {
    const existente = db.select().from(actividades).where(eq(actividades.id, id)).get();
    if (!existente) throw new Error('Actividad no encontrada');
    if (existente.fechaFinalizacion) {
      throw new Error('La actividad completada no se puede borrar');
    }
    db.delete(actividades).where(eq(actividades.id, id)).run();
  }
}
